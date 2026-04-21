/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from '@/lib/db';
import { requireAdminApi, apiError } from '@/lib/api';

/**
 * GET /api/admin/analytics/timeseries?days=30
 *
 * Возвращает daily-aggregates за последние N дней для 4 метрик:
 *   - registrations  (users.created_at)
 *   - certificates   (certificates.issued_at)
 *   - test_sessions  (test_sessions.completed_at)
 *   - photo_checks   (photo_checks.created_at)
 *
 * Формат: { days, series: { metric: Array<{date, count}> } } длиной ровно N,
 * пустые дни count=0 — так график всегда покрывает полный диапазон.
 */

type SeriesPoint = { date: string; count: number };

function toDayKey(d: Date): string {
  // YYYY-MM-DD (UTC, чтобы одна и та же дата получалась и в браузере, и на сервере)
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function emptySeries(days: number): SeriesPoint[] {
  const out: SeriesPoint[] = [];
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(today.getUTCDate() - i);
    out.push({ date: toDayKey(d), count: 0 });
  }
  return out;
}

function aggregateByDay(rows: any[], dateField: string, days: number): SeriesPoint[] {
  const series = emptySeries(days);
  const idx = new Map(series.map((p, i) => [p.date, i]));
  for (const r of rows) {
    const raw = r?.[dateField];
    if (!raw) continue;
    const d = new Date(raw);
    if (!Number.isFinite(d.getTime())) continue;
    d.setUTCHours(0, 0, 0, 0);
    const key = toDayKey(d);
    const i = idx.get(key);
    if (i !== undefined) series[i].count += 1;
  }
  return series;
}

export async function GET(request: Request) {
  const auth = await requireAdminApi(request);
  if (auth instanceof Response) return auth;

  const { searchParams } = new URL(request.url);
  const daysRaw = Number(searchParams.get('days') || 30);
  const days = Math.max(1, Math.min(Number.isFinite(daysRaw) ? daysRaw : 30, 365));

  try {
    // Для в-памяти и Postgres одинаково через db.query (без фильтра — тянем последние записи).
    // Лимит большой: 5000 за раз покрывает 90-365 дней при нормальном трафике.
    const limit = 5000;
    const [users, certs, sessions, photos] = await Promise.all([
      db.query('users', undefined, { orderBy: 'created_at', order: 'desc', limit }).catch(() => []),
      db
        .query('certificates', undefined, { orderBy: 'issued_at', order: 'desc', limit })
        .catch(() => []),
      db
        .query('test_sessions', undefined, { orderBy: 'completed_at', order: 'desc', limit })
        .catch(() => []),
      db
        .query('photo_checks', undefined, { orderBy: 'created_at', order: 'desc', limit })
        .catch(() => []),
    ]);

    return Response.json({
      days,
      series: {
        registrations: aggregateByDay(users, 'created_at', days),
        certificates: aggregateByDay(certs, 'issued_at', days),
        test_sessions: aggregateByDay(sessions, 'completed_at', days),
        photo_checks: aggregateByDay(photos, 'created_at', days),
      },
    });
  } catch (err) {
    return apiError(500, 'Failed to compute timeseries', String(err));
  }
}
