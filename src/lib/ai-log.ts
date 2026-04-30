/**
 * Логирование AI-вызовов в ai_generations. Ставится ПОСЛЕ каждого вызова
 * Gemini, в паре с assertQuota() ДО. Стоимость считается по PRICING-таблице
 * (для free-tier — $0; для paid-моделей — реальные цены 2026-04 за 1M токенов).
 */
import { db } from './db';

export interface LogParams {
  provider: 'gemini' | 'openrouter' | 'claude';
  model: string;
  purpose: string;
  promptTokens?: number;
  completionTokens?: number;
  durationMs?: number;
  userId?: string | null;
}

/**
 * Цена за 1М токенов (USD) для PAID-tier. Для free-tier любая запись будет с
 * cost = 0, но карта остаётся на случай если кто-то добавит ключ paid project —
 * тогда `getSpendSnapshot()` сразу покажет реальный расход и поднимет алерт.
 *
 * audioOutput=true: completionTokens содержит PCM samples (24kHz mono), не
 * text-tokens. Нельзя умножать на output text-pricing — будет ×48 завышение.
 * Считаем как audio-seconds × audioOutputPerSec ($/sec).
 *
 * Pricing на 2026-04 (https://ai.google.dev/pricing):
 *   - Gemini 3.1 Flash TTS: ~$30/1M chars input, audio output ~$0.005/sec
 *   - Gemini 2.5 Live native-audio: $0.50/1M tokens input, $0.005/sec audio out
 */
const AUDIO_SAMPLE_RATE_HZ = 24_000; // Gemini PCM-output sample rate
const PRICING_PAID: Record<string, {
  input: number;
  output: number;
  audioOutput?: boolean;
  audioOutputPerSec?: number;
}> = {
  'gemini-2.5-flash': { input: 0.30, output: 2.50 },
  'gemini-2.5-flash-lite': { input: 0.10, output: 0.40 },
  'gemini-2.5-pro': { input: 1.25, output: 10.00 },
  'gemini-2.0-flash': { input: 0.10, output: 0.40 },
  'gemini-3.1-flash-tts-preview': {
    input: 0.50, output: 0, audioOutput: true, audioOutputPerSec: 0.005,
  },
  'gemini-2.5-flash-native-audio-preview-12-2025': {
    input: 0.50, output: 0, audioOutput: true, audioOutputPerSec: 0.005,
  },
};

/**
 * Считаем cost при условии что проект на PAID-tier. Используем для прогноза.
 *
 * Для audio-моделей: completionTokens = PCM samples → seconds = samples / 24000;
 * cost = seconds × audioOutputPerSec. Для text-моделей: обычное text-pricing.
 */
function estimateCostUsd(model: string, promptTok: number, complTok: number): number {
  const p = PRICING_PAID[model];
  if (!p) return 0;
  const inputCost = (promptTok * p.input) / 1_000_000;
  let outputCost = 0;
  if (p.audioOutput && p.audioOutputPerSec) {
    const audioSeconds = complTok / AUDIO_SAMPLE_RATE_HZ;
    outputCost = audioSeconds * p.audioOutputPerSec;
  } else {
    outputCost = (complTok * p.output) / 1_000_000;
  }
  return inputCost + outputCost;
}

export async function logGeneration(params: LogParams): Promise<void> {
  const promptTokens = Math.max(0, Math.floor(params.promptTokens ?? 0));
  const completionTokens = Math.max(0, Math.floor(params.completionTokens ?? 0));
  const durationMs = Math.max(0, Math.floor(params.durationMs ?? 0));
  const costUsd = estimateCostUsd(params.model, promptTokens, completionTokens);

  try {
    await db.insert('ai_generations', {
      provider: params.provider,
      model: params.model,
      purpose: params.purpose,
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      cost_usd: costUsd,
      duration_ms: durationMs,
      user_id: params.userId ?? null,
    });
  } catch (err) {
    // Логирование не должно ломать основной поток — если БД недоступна,
    // просто пишем warning. Гард при следующем запросе увидит меньше записей,
    // но in-process burst-cap всё равно сработает.
    console.warn('[ai-log] insert failed:', err);
  }
}

/**
 * Грубая оценка числа токенов из текста, когда модель не вернула usage.
 * Gemini ≈ 4 символа на токен в смешанной кириллице/латинице.
 * Для assertQuota важно, чтобы оценка была не сильно меньше реальной.
 */
export function approxTokens(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}
