/**
 * Kazakh TTS via Gemini (gemini-3.1-flash-tts-preview — supports 70+ langs incl. kk-KZ).
 * Google Cloud TTS has no kk-KZ voice, so Gemini is the right pick here.
 */

import { createHash } from 'node:crypto';
import { assertQuota, assertUserQuota } from './ai-quota';
import { approxTokens, logGeneration } from './ai-log';
import { db } from './db';

const apiKey = process.env.GEMINI_API_KEY || '';
const TTS_MODEL = process.env.GEMINI_TTS_MODEL || 'gemini-3.1-flash-tts-preview';
const PRONUNCIATION_MODEL = 'gemini-2.5-flash';
const ENDPOINT = (model: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

export interface TTSResult {
  audioBase64: string;
  mimeType: string;
}

interface CallContext {
  userId?: string | null;
  /**
   * userKey для per-user-квоты. Если задан — assertUserQuota вызывается ТОЛЬКО
   * при cache-miss, чтобы кеш-хиты не «жрали» дневной лимит юзера.
   */
  userKey?: string;
}

// In-memory hot-cache (mirror of persistent layer для уменьшения round-trip к БД).
const memCache = new Map<string, TTSResult>();
const MEM_CACHE_MAX = 200;

function ttsCacheKey(model: string, voice: string, text: string): string {
  return createHash('sha256').update(`${model}::${voice}::${text}`).digest('hex');
}

async function lookupTtsCache(key: string): Promise<TTSResult | null> {
  const hit = memCache.get(key);
  if (hit) return hit;
  try {
    if (db.isPostgres) {
      const rows = await db.raw<{ audio_base64: string; mime_type: string }>(
        `UPDATE tts_cache SET hits = hits + 1, last_hit_at = NOW()
         WHERE cache_key = $1
         RETURNING audio_base64, mime_type`,
        [key],
      );
      if (rows[0]) {
        const result = { audioBase64: rows[0].audio_base64, mimeType: rows[0].mime_type };
        memCache.set(key, result);
        return result;
      }
    } else {
      const rows = await db.query('tts_cache', { cache_key: key });
      const row = rows[0] as { audio_base64?: string; mime_type?: string } | undefined;
      if (row?.audio_base64) {
        const result = { audioBase64: row.audio_base64, mimeType: row.mime_type || 'audio/wav' };
        memCache.set(key, result);
        return result;
      }
    }
  } catch (err) {
    console.warn('[tts] cache lookup failed:', err);
  }
  return null;
}

async function storeTtsCache(
  key: string, model: string, voice: string, text: string, result: TTSResult,
): Promise<void> {
  if (memCache.size >= MEM_CACHE_MAX) memCache.clear();
  memCache.set(key, result);
  try {
    await db.insert('tts_cache', {
      cache_key: key,
      model,
      voice,
      text_preview: text.slice(0, 160),
      audio_base64: result.audioBase64,
      mime_type: result.mimeType,
    });
  } catch (err) {
    // Уникальный конфликт (race condition при параллельном генерировании одной фразы)
    // и недоступность БД — некритично; in-memory кеш уже отработал.
    if (!String(err).includes('duplicate key')) {
      console.warn('[tts] cache insert failed:', err);
    }
  }
}

// Minimal 16-bit PCM → WAV wrapper
function pcmToWav(pcm: Buffer, sampleRate = 24000, channels = 1, bitsPerSample = 16): Buffer {
  const byteRate = (sampleRate * channels * bitsPerSample) / 8;
  const blockAlign = (channels * bitsPerSample) / 8;
  const dataSize = pcm.length;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(channels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);
  pcm.copy(buffer, 44);
  return buffer;
}

function parseSampleRate(mime: string, fallback = 24000) {
  const m = /rate=(\d+)/i.exec(mime);
  return m ? Number(m[1]) : fallback;
}

export async function generateSpeech(text: string, voice = 'Aoede', ctx: CallContext = {}): Promise<TTSResult | null> {
  if (!apiKey || !text?.trim()) return null;
  const key = ttsCacheKey(TTS_MODEL, voice, text);

  // 1) Persistent + memory cache — нет сетевого вызова, нет квоты, нет лога.
  const cached = await lookupTtsCache(key);
  if (cached) return cached;

  // 2) Только при cache miss — гард квоты (per-user → global) и реальный вызов Gemini.
  if (ctx.userKey) await assertUserQuota(ctx.userKey);
  await assertQuota(TTS_MODEL);
  const startedAt = Date.now();

  try {
    const res = await fetch(ENDPOINT(TTS_MODEL), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text }] }],
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } },
          },
        },
      }),
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error('[tts] gemini error', res.status, errText);
      return null;
    }
    const data = await res.json();
    const part = data?.candidates?.[0]?.content?.parts?.[0]?.inlineData;
    if (!part?.data) return null;

    const mime = part.mimeType || 'audio/L16;rate=24000';
    const pcm = Buffer.from(part.data, 'base64');
    // Gemini returns raw PCM — wrap as WAV for browser playback
    const wav = pcmToWav(pcm, parseSampleRate(mime));
    const result: TTSResult = { audioBase64: wav.toString('base64'), mimeType: 'audio/wav' };
    await storeTtsCache(key, TTS_MODEL, voice, text, result);

    // TTS-биллинг считается по входным символам и длительности аудио. Используем
    // approxTokens(text) для prompt и длину PCM как proxy для completion (примерно
    // 24kHz × 16-bit, ≈ 1 секунда = 48kb = 12k «токенов»).
    const completionApprox = Math.ceil(pcm.length / 4);
    await logGeneration({
      provider: 'gemini',
      model: TTS_MODEL,
      purpose: 'tts',
      promptTokens: approxTokens(text),
      completionTokens: completionApprox,
      durationMs: Date.now() - startedAt,
      userId: ctx.userId ?? null,
    });

    return result;
  } catch (err) {
    console.error('[tts] failed:', err);
    return null;
  }
}

export async function getPronunciationGuide(text: string, locale: 'kk' | 'ru' = 'kk', ctx: CallContext = {}): Promise<string> {
  if (!apiKey) return `[${text}] — Дұрыс айтылуы: әр буынды анық айтыңыз.`;
  try {
    if (ctx.userKey) await assertUserQuota(ctx.userKey);
    await assertQuota(PRONUNCIATION_MODEL);
    const prompt = locale === 'ru'
      ? `Ты — преподаватель казахской фонетики. Объясни произношение фразы "${text}" для русскоязычного ученика, СТРОГО НА РУССКОМ.

Структура ответа (markdown):
**1. Деление на слоги:** разбей по слогам с дефисами.
**2. Ударение:** в казахском ударение почти всегда на последнем слоге — укажи его заглавными.
**3. Специфические звуки:** для каждого казахского звука в фразе (ә, і, ң, ғ, қ, ө, ұ, ү, һ) — дай:
   • МФА-транскрипцию в квадратных скобках (например, қ [q], ң [ŋ], ғ [ʁ])
   • сравнение с русским / английским / немецким звуком ("как русское К, но язык глубже в горле, как при покашливании", "как английское ng в sing", "как немецкое ö в schön")
4. **Частые ошибки русскоязычных:** 2–3 типичные ошибки (например, замена қ на к, ы на и).

Без казахского текста в объяснениях, только в цитатах примеров.`
      : `Қазақ тілі маманы ретінде "${text}" сөзінің дұрыс айтылуын қысқа түсіндір: буын бөлу, екпін, ерекше дыбыстар (МФА қос: қ [q], ң [ŋ], ғ [ʁ]), жиі кететін қателер.`;
    const startedAt = Date.now();
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${PRONUNCIATION_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      },
    );
    const data = await res.json();
    const reply: string = data?.candidates?.[0]?.content?.parts?.[0]?.text || `[${text}]`;
    const usage = data?.usageMetadata;

    await logGeneration({
      provider: 'gemini',
      model: PRONUNCIATION_MODEL,
      purpose: 'pronunciation',
      promptTokens: usage?.promptTokenCount ?? approxTokens(prompt),
      completionTokens: usage?.candidatesTokenCount ?? approxTokens(reply),
      durationMs: Date.now() - startedAt,
      userId: ctx.userId ?? null,
    });

    return reply;
  } catch {
    return `[${text}]`;
  }
}
