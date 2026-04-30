/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * AI Quota Guard — гарантирует, что Tіл-құрал НИКОГДА не выходит в платный тариф
 * Gemini API даже при наличии биллинга на проекте.
 *
 * Логика:
 *   1. Перед каждым вызовом assertQuota(model) читает ai_generations за 60с и 24ч.
 *   2. Сравнивает с FREE_TIER лимитами × SAFETY_RATIO. Если лимит достигнут —
 *      бросает QuotaExceededError → API возвращает 429.
 *   3. Внутрипроцессный rpmBucket защищает от бурстов до того, как они попадают в БД.
 *   4. Для НЕИЗВЕСТНЫХ моделей применяются самые жёсткие лимиты (fail-safe).
 */
import { db } from './db';

/**
 * Free-tier лимиты Gemini API на 2026-04 (см. https://ai.google.dev/pricing).
 * Если модели нет в карте — UNKNOWN_MODEL_LIMITS (fail-safe).
 */
export const FREE_TIER = {
  // Текстовые модели
  'gemini-2.5-flash': { rpm: 10, rpd: 250, tpm: 250_000 },
  'gemini-2.5-flash-lite': { rpm: 15, rpd: 1000, tpm: 250_000 },
  'gemini-2.5-pro': { rpm: 5, rpd: 100, tpm: 250_000 },
  'gemini-2.0-flash': { rpm: 15, rpd: 200, tpm: 1_000_000 },
  // TTS — отдельный квотный pool у Google. Точных публичных RPD нет — берём
  // консервативно, т.к. TTS-вызов «дорогой» и пользователь нажимает на каждом уроке.
  'gemini-3.1-flash-tts-preview': { rpm: 8, rpd: 150, tpm: 250_000 },
  // Live API — стриминговая сессия. Free tier очень узкий, берём минимум.
  'gemini-2.5-flash-native-audio-preview-12-2025': { rpm: 3, rpd: 25, tpm: 250_000 },
} as const;

/** Самые жёсткие лимиты для неизвестных моделей — лучше переоценить чем выйти в платный. */
const UNKNOWN_MODEL_LIMITS = { rpm: 3, rpd: 50, tpm: 250_000 };

/**
 * Доля от лимита, при которой блокируем вызов. 0.85 = блок на 85%, оставляем 15%
 * запас на конкурентные вызовы и расхождение DB ↔ реального GCP-счётчика.
 */
export const SAFETY_RATIO = 0.85;

/** Внутрипроцессный burst-cap. Не зависит от БД, защищает от спайков в первые секунды. */
const SOFT_RPM_CAP = 8;

/**
 * USD caps — пользовательские пределы поверх free-tier-гарантий. Защищают от:
 *   - утечки ключа (T1) → внешний абюзер, бьющий через прод-IP whitelist
 *   - бага «бесконечный цикл» (T3) → cap режет на $0.45/день раньше чем budget alert
 *   - long-context занижения оценки (T6/T9) → накопительный USD точнее токенов
 *
 * Управление через env:
 *   AI_USD_CAP_DAILY=0.50         — максимум $/день (UTC reset)
 *   AI_USD_CAP_TOTAL=4.50         — максимум $/период (с AI_USD_CAP_PERIOD_START)
 *   AI_USD_CAP_PERIOD_START=YYYY-MM-DD
 *
 * Блок на USD_SAFETY_RATIO=0.9 от любого cap — оставляем 10% запас на одиночный
 * вызов, чтобы не пробить точно на пограничной заявке.
 */
const USD_CAP_DAILY = Number(process.env.AI_USD_CAP_DAILY ?? '0.50');
const USD_CAP_TOTAL = Number(process.env.AI_USD_CAP_TOTAL ?? '4.50');
const USD_PERIOD_START = process.env.AI_USD_CAP_PERIOD_START ?? '2026-04-30';
const USD_SAFETY_RATIO = 0.9;

export class QuotaExceededError extends Error {
  readonly scope: 'rpm' | 'rpd' | 'tpm' | 'usd_daily' | 'usd_total';
  readonly retryAfterSec: number;
  constructor(
    message: string,
    scope: 'rpm' | 'rpd' | 'tpm' | 'usd_daily' | 'usd_total',
    retryAfterSec: number,
  ) {
    super(message);
    this.name = 'QuotaExceededError';
    this.scope = scope;
    this.retryAfterSec = retryAfterSec;
  }
}

interface RecentRow {
  created_at: string | Date;
  prompt_tokens: number;
  completion_tokens: number;
  model?: string;
}

const rpmBucket: { ts: number[] } = { ts: [] };

async function loadRecent(model: string | null, since: Date): Promise<RecentRow[]> {
  if (db.isPostgres) {
    const sql = model
      ? `SELECT created_at, prompt_tokens, completion_tokens, model
         FROM ai_generations
         WHERE provider = 'gemini' AND model = $1 AND created_at >= $2`
      : `SELECT created_at, prompt_tokens, completion_tokens, model
         FROM ai_generations
         WHERE provider = 'gemini' AND created_at >= $1`;
    const params = model ? [model, since] : [since];
    return db.raw<RecentRow>(sql, params);
  }
  // in-memory
  const all = await db.query('ai_generations');
  const sinceMs = since.getTime();
  return all
    .filter((r: any) => {
      if (r.provider !== 'gemini') return false;
      if (model && r.model !== model) return false;
      const t = new Date(r.created_at).getTime();
      return t >= sinceMs;
    })
    .map((r: any) => ({
      created_at: r.created_at,
      prompt_tokens: r.prompt_tokens ?? 0,
      completion_tokens: r.completion_tokens ?? 0,
      model: r.model,
    }));
}

/**
 * USD-cap pre-flight. Читает накопленный расход за UTC-сутки и за период
 * (с AI_USD_CAP_PERIOD_START) из ai_generations.cost_usd. Блокирует на 90%
 * от любого cap. Вызывается из assertQuota() — отдельно дёргать не нужно.
 *
 * Throws QuotaExceededError(scope='usd_daily' | 'usd_total').
 */
export async function assertUsdBudget(): Promise<void> {
  const now = new Date();
  const utcDayStart = new Date(Date.UTC(
    now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),
  ));
  const periodStart = new Date(USD_PERIOD_START + 'T00:00:00Z');

  const spendSince = async (since: Date): Promise<number> => {
    if (db.isPostgres) {
      const rows = await db.raw<{ usd: string | number }>(
        `SELECT COALESCE(SUM(cost_usd), 0)::float8 AS usd
         FROM ai_generations WHERE created_at >= $1`,
        [since],
      );
      return Number(rows[0]?.usd) || 0;
    }
    const rows = await db.query('ai_generations');
    const sinceMs = since.getTime();
    let usd = 0;
    for (const r of rows as any[]) {
      if (new Date(r.created_at).getTime() >= sinceMs) {
        usd += Number(r.cost_usd) || 0;
      }
    }
    return usd;
  };

  const [daySpent, periodSpent] = await Promise.all([
    spendSince(utcDayStart),
    spendSince(periodStart),
  ]);

  if (daySpent >= USD_CAP_DAILY * USD_SAFETY_RATIO) {
    const utcMidnight = new Date(utcDayStart.getTime() + 24 * 3600_000);
    const retryAfter = Math.max(60, Math.floor((utcMidnight.getTime() - now.getTime()) / 1000));
    throw new QuotaExceededError(
      `Дневной USD-cap: $${daySpent.toFixed(4)}/$${USD_CAP_DAILY}. Сброс в 00:00 UTC.`,
      'usd_daily',
      retryAfter,
    );
  }
  if (periodSpent >= USD_CAP_TOTAL * USD_SAFETY_RATIO) {
    throw new QuotaExceededError(
      `Период USD-cap: $${periodSpent.toFixed(4)}/$${USD_CAP_TOTAL} с ${USD_PERIOD_START}. ` +
      `Поднимите AI_USD_CAP_TOTAL или сдвиньте AI_USD_CAP_PERIOD_START.`,
      'usd_total',
      24 * 3600,
    );
  }
}

/**
 * Pre-flight check. Throws QuotaExceededError если этот вызов превысит безопасный
 * порог (RPM/RPD/TPM/USD). Вызывать ПЕРЕД каждым обращением к Gemini.
 */
export async function assertQuota(model: string): Promise<void> {
  const known = FREE_TIER[model as keyof typeof FREE_TIER];
  const limits = known ?? UNKNOWN_MODEL_LIMITS;

  const now = new Date();
  const oneMinAgo = new Date(now.getTime() - 60_000);
  const oneDayAgo = new Date(now.getTime() - 24 * 3600_000);
  const nowMs = now.getTime();

  // 1) Внутрипроцессный burst guard.
  rpmBucket.ts = rpmBucket.ts.filter((t) => t > nowMs - 60_000);
  if (rpmBucket.ts.length >= SOFT_RPM_CAP) {
    throw new QuotaExceededError(
      `Burst guard: ${rpmBucket.ts.length}/${SOFT_RPM_CAP} вызовов за минуту в этом процессе.`,
      'rpm',
      30,
    );
  }

  // 2) DB-счётчик за 24ч (для RPD) и 60с (для RPM/TPM).
  const recent = await loadRecent(model, oneDayAgo);
  const rpm = recent.filter((r) => new Date(r.created_at) >= oneMinAgo).length;
  const rpd = recent.length;
  const tpm = recent
    .filter((r) => new Date(r.created_at) >= oneMinAgo)
    .reduce((a, r) => a + (r.prompt_tokens || 0) + (r.completion_tokens || 0), 0);

  const safe = (n: number) => Math.floor(n * SAFETY_RATIO);

  // Резервируем слот ДО проверки чтобы конкурентные вызовы видели нашу занятость.
  rpmBucket.ts.push(nowMs);

  if (rpm >= safe(limits.rpm)) {
    throw new QuotaExceededError(
      `Достигнут безопасный лимит RPM (${rpm}/${limits.rpm}, модель ${model}). Попробуйте через минуту.`,
      'rpm',
      60,
    );
  }
  if (rpd >= safe(limits.rpd)) {
    // Free-tier reset = 00:00 PT (~10:00 МСК следующего дня).
    const ptNow = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
    const ptMidnight = new Date(ptNow);
    ptMidnight.setDate(ptMidnight.getDate() + 1);
    ptMidnight.setHours(0, 0, 0, 0);
    const retryAfter = Math.max(60, Math.floor((ptMidnight.getTime() - ptNow.getTime()) / 1000));
    throw new QuotaExceededError(
      `Достигнут дневной лимит (${rpd}/${limits.rpd}, модель ${model}). Сброс в 00:00 PT (~10:00 МСК).`,
      'rpd',
      retryAfter,
    );
  }
  if (tpm >= safe(limits.tpm)) {
    throw new QuotaExceededError(
      `Достигнут безопасный лимит токенов/мин (${tpm}/${limits.tpm}, модель ${model}).`,
      'tpm',
      60,
    );
  }

  // USD-cap — последняя линия. Накопительный, не зависит от модели.
  await assertUsdBudget();
}

export type QuotaStatus = 'ok' | 'warn' | 'crit';

export interface QuotaSnapshot {
  model: string;
  limits: { rpm: number; rpd: number; tpm: number };
  current: { rpmUsed: number; rpdUsed: number; tpmUsed: number };
  pct: { rpm: number; rpd: number; tpm: number };
  worstStatus: QuotaStatus;
  known: boolean;
}

export interface SpendSnapshot {
  last24hUsd: number;
  last7dUsd: number;
  thisMonthUsd: number;
  thisMonthTokens: number;
  projectedMonthUsd: number;
  /** Бюджет = $0 для free-tier. Любой расход > 0 — сигнал что мы вышли в платный. */
  budgetUsd: number;
  budgetRemainingUsd: number;
  budgetPctUsed: number;
}

function pctOf(used: number, limit: number): number {
  if (limit <= 0) return 0;
  return Math.min(100, (used / limit) * 100);
}

function statusFromPct(pct: number): QuotaStatus {
  if (pct >= 85) return 'crit';
  if (pct >= 60) return 'warn';
  return 'ok';
}

export async function getQuotaSnapshots(): Promise<QuotaSnapshot[]> {
  const now = new Date();
  const oneMinAgo = new Date(now.getTime() - 60_000);
  const oneDayAgo = new Date(now.getTime() - 24 * 3600_000);

  const rows = await loadRecent(null, oneDayAgo);

  const byModel = new Map<string, RecentRow[]>();
  for (const r of rows) {
    const m = r.model || 'unknown';
    if (!byModel.has(m)) byModel.set(m, []);
    byModel.get(m)!.push(r);
  }

  // Гарантируем, что все известные free-tier модели присутствуют в выводе (даже с нулями).
  for (const m of Object.keys(FREE_TIER)) {
    if (!byModel.has(m)) byModel.set(m, []);
  }

  const snapshots: QuotaSnapshot[] = [];
  for (const [model, items] of byModel.entries()) {
    const known = (model in FREE_TIER);
    const limits = known
      ? FREE_TIER[model as keyof typeof FREE_TIER]
      : UNKNOWN_MODEL_LIMITS;
    const rpmUsed = items.filter((i) => new Date(i.created_at) >= oneMinAgo).length;
    const rpdUsed = items.length;
    const tpmUsed = items
      .filter((i) => new Date(i.created_at) >= oneMinAgo)
      .reduce((a, i) => a + (i.prompt_tokens || 0) + (i.completion_tokens || 0), 0);

    const pctRpm = pctOf(rpmUsed, limits.rpm);
    const pctRpd = pctOf(rpdUsed, limits.rpd);
    const pctTpm = pctOf(tpmUsed, limits.tpm);
    const worst = Math.max(pctRpm, pctRpd, pctTpm);

    snapshots.push({
      model,
      limits,
      current: { rpmUsed, rpdUsed, tpmUsed },
      pct: { rpm: pctRpm, rpd: pctRpd, tpm: pctTpm },
      worstStatus: statusFromPct(worst),
      known,
    });
  }

  // Сортируем: сначала «горячие», потом по имени модели.
  snapshots.sort((a, b) => {
    const order = { crit: 0, warn: 1, ok: 2 };
    if (order[a.worstStatus] !== order[b.worstStatus]) {
      return order[a.worstStatus] - order[b.worstStatus];
    }
    return a.model.localeCompare(b.model);
  });

  return snapshots;
}

export async function getSpendSnapshot(): Promise<SpendSnapshot> {
  const now = new Date();
  const day = new Date(now.getTime() - 24 * 3600_000);
  const week = new Date(now.getTime() - 7 * 24 * 3600_000);
  const month = new Date(now.getFullYear(), now.getMonth(), 1);
  const daysIntoMonth = Math.max(1, Math.ceil((now.getTime() - month.getTime()) / (24 * 3600_000)));
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  const sumSince = async (since: Date): Promise<{ usd: number; promptTok: number; complTok: number }> => {
    if (db.isPostgres) {
      const rows = await db.raw<{ usd: string | number; pt: number; ct: number }>(
        `SELECT COALESCE(SUM(cost_usd), 0)::float8 AS usd,
                COALESCE(SUM(prompt_tokens), 0)::int AS pt,
                COALESCE(SUM(completion_tokens), 0)::int AS ct
         FROM ai_generations WHERE created_at >= $1`,
        [since],
      );
      const r = rows[0] || { usd: 0, pt: 0, ct: 0 };
      return { usd: Number(r.usd) || 0, promptTok: Number(r.pt) || 0, complTok: Number(r.ct) || 0 };
    }
    const rows = await db.query('ai_generations');
    const sinceMs = since.getTime();
    let usd = 0, pt = 0, ct = 0;
    for (const r of rows as any[]) {
      if (new Date(r.created_at).getTime() < sinceMs) continue;
      usd += Number(r.cost_usd) || 0;
      pt += Number(r.prompt_tokens) || 0;
      ct += Number(r.completion_tokens) || 0;
    }
    return { usd, promptTok: pt, complTok: ct };
  };

  const [d1, d7, dMonth] = await Promise.all([sumSince(day), sumSince(week), sumSince(month)]);

  const projectedMonthUsd = (dMonth.usd / daysIntoMonth) * daysInMonth;

  // Budget = USD_CAP_TOTAL (накопительный за период). Был $0 в free-tier-only-режиме,
  // теперь = пользовательский cap, который реально применяется к assertUsdBudget().
  const BUDGET = USD_CAP_TOTAL;
  const periodStart = new Date(USD_PERIOD_START + 'T00:00:00Z');
  const periodSpend = await sumSince(periodStart);

  return {
    last24hUsd: d1.usd,
    last7dUsd: d7.usd,
    thisMonthUsd: dMonth.usd,
    thisMonthTokens: dMonth.promptTok + dMonth.complTok,
    projectedMonthUsd,
    budgetUsd: BUDGET,
    budgetRemainingUsd: Math.max(0, BUDGET - periodSpend.usd),
    budgetPctUsed: BUDGET > 0 ? Math.min(100, (periodSpend.usd / BUDGET) * 100) : 0,
  };
}
