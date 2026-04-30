import { GoogleGenAI, Modality } from '@google/genai';
import { apiError, aiQuotaErrorResponse } from '@/lib/api';
import { MENTORS, type MentorKey } from '@/lib/mentors';
import { getTeacherSystemPrompt } from '@/lib/kazakh-rules';
import { assertQuota } from '@/lib/ai-quota';
import { logGeneration, approxTokens } from '@/lib/ai-log';
import { getUserFromRequest } from '@/lib/auth';

const apiKey = process.env.GEMINI_API_KEY || '';

// LifeCompass использует это же имя модели — она поддерживает kk-KZ через native-audio.
const MODEL = 'gemini-2.5-flash-native-audio-preview-12-2025';

export async function POST(request: Request) {
  if (!apiKey) return apiError(500, 'GEMINI_API_KEY not set');

  try {
    // Live API — самый дорогой по квоте Gemini-сервис: одна сессия может тратить
    // десятки минут аудио. Гард строго до выпуска ephemeral-токена.
    await assertQuota(MODEL);
    const user = await getUserFromRequest(request);
    const body = await request.json().catch(() => ({}));
    const mentorKey = (body.mentor as MentorKey) in MENTORS ? (body.mentor as MentorKey) : 'abai';
    const level: string = typeof body.level === 'string' ? body.level : 'B1';
    const topic: string | undefined = typeof body.topic === 'string' ? body.topic : undefined;

    const mentor = MENTORS[mentorKey];
    const systemPrompt =
      getTeacherSystemPrompt(level, '', mentorKey) +
      `\n\nДАУЫСТЫ ДИАЛОГ РЕЖИМІ:
1. Тек қазақ тілінде сөйле.
2. Қысқа әрі табиғи сөйлемдермен жауап бер — дауыс режимінде.
3. Оқушы қате жіберсе, сыпайы түрде дұрыс нұсқасын айт.
${topic ? `4. Тақырыбы: ${topic}.` : ''}`;

    const client = new GoogleGenAI({ apiKey });

    // Ephemeral token: токен живёт 30 минут, сессия до 1 минуты чтобы успеть подключиться,
    // после чего сессия может работать до token expireTime. uses:1 — один connect.
    const expireTime = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    const newSessionExpireTime = new Date(Date.now() + 60 * 1000).toISOString();

    const token = await client.authTokens.create({
      config: {
        uses: 1,
        expireTime,
        newSessionExpireTime,
        liveConnectConstraints: {
          model: MODEL,
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: mentor.ttsVoice },
              },
            },
            inputAudioTranscription: {},
            outputAudioTranscription: {},
            systemInstruction: {
              parts: [{ text: systemPrompt }],
            },
          },
        },
        httpOptions: { apiVersion: 'v1alpha' },
      },
    });

    // Логируем сам факт выдачи токена. Реальные токены сессии (аудио in/out)
    // мы из бэкенда не видим, поэтому ставим оценку для system-prompt; это
    // даёт верхнюю оценку RPD/RPM (одна сессия = одна запись).
    await logGeneration({
      provider: 'gemini',
      model: MODEL,
      purpose: 'live-token',
      promptTokens: approxTokens(systemPrompt),
      completionTokens: 0,
      durationMs: 0,
      userId: user?.id ?? null,
    });

    return Response.json({
      token: token.name,
      model: MODEL,
      mentor: {
        key: mentor.key,
        name_kk: mentor.name_kk,
        name_ru: mentor.name_ru,
        role_kk: mentor.role_kk,
        role_ru: mentor.role_ru,
        image: mentor.image,
        voice: mentor.ttsVoice,
      },
    });
  } catch (err) {
    const quota = aiQuotaErrorResponse(err);
    if (quota) return quota;
    console.error('[live-token] failed', err);
    return apiError(500, 'Failed to create live token', String(err));
  }
}
