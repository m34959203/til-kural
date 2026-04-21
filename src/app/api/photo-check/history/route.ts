import { getUserFromRequest } from '@/lib/auth';
import { db } from '@/lib/db';

/**
 * GET /api/photo-check/history?days=30
 * Отдаёт фото-проверки залогиненного юзера за последние N дней
 * в формате [{ id, overall_score, created_at }] — для LiteracyTrendChart.
 * Анон получает 401.
 */
export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const rawDays = Number(url.searchParams.get('days') ?? '30');
  const days = Number.isFinite(rawDays) ? Math.min(Math.max(rawDays, 1), 365) : 30;

  const sinceMs = Date.now() - days * 24 * 60 * 60 * 1000;

  try {
    // Берём все проверки юзера и фильтруем по дате на стороне приложения —
    // это работает и для Postgres (created_at — ISO/timestamp),
    // и для InMemoryDB (ISO-строки).
    const rows = await db.query(
      'photo_checks',
      { user_id: user.id },
      { orderBy: 'created_at', order: 'asc', limit: 1000 }
    );

    const items = rows
      .filter((r) => {
        const t = r.created_at ? new Date(r.created_at).getTime() : NaN;
        return Number.isFinite(t) && t >= sinceMs;
      })
      .map((r) => ({
        id: r.id as string,
        overall_score: Number(r.overall_score ?? 0),
        created_at: r.created_at,
      }));

    const avg =
      items.length > 0
        ? Math.round(items.reduce((acc, it) => acc + it.overall_score, 0) / items.length)
        : 0;

    return Response.json({ items, avg, days, total: items.length });
  } catch (err) {
    return Response.json(
      { error: 'History fetch failed', details: String(err) },
      { status: 500 }
    );
  }
}
