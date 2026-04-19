/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Kazakh TTS via Gemini (gemini-3.1-flash-tts-preview — supports 70+ langs incl. kk-KZ).
 * Google Cloud TTS has no kk-KZ voice, so Gemini is the right pick here.
 */

const apiKey = process.env.GEMINI_API_KEY || '';
const TTS_MODEL = process.env.GEMINI_TTS_MODEL || 'gemini-3.1-flash-tts-preview';
const ENDPOINT = (model: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

export interface TTSResult {
  audioBase64: string;
  mimeType: string;
}

const cache = new Map<string, TTSResult>();

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

export async function generateSpeech(text: string, voice = 'Aoede'): Promise<TTSResult | null> {
  if (!apiKey || !text?.trim()) return null;
  const key = `${voice}::${text}`;
  if (cache.has(key)) return cache.get(key)!;

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
    if (cache.size > 200) cache.clear();
    cache.set(key, result);
    return result;
  } catch (err) {
    console.error('[tts] failed:', err);
    return null;
  }
}

export async function getPronunciationGuide(text: string): Promise<string> {
  if (!apiKey) return `[${text}] — Дұрыс айтылуы: әр буынды анық айтыңыз.`;
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Қазақ тілі маманы ретінде "${text}" сөзінің дұрыс айтылуын қысқа түсіндір: буын бөлу, екпін, жиі кететін қателер.`,
            }],
          }],
        }),
      },
    );
    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || `[${text}]`;
  } catch {
    return `[${text}]`;
  }
}
