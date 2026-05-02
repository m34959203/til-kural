/**
 * Cron endpoint: публикация запланированных news / events.
 *
 * Ставьте на расписание раз в минуту (cron / Vercel Cron / Plesk scheduler):
 *   curl -X POST https://til-kural.kz/api/cron/publish-scheduled \
 *        -H "Authorization: Bearer $CRON_SECRET"
 *   # или
 *   curl "https://til-kural.kz/api/cron/publish-scheduled?token=$CRON_SECRET"
 *
 * Что делает:
 *   - news:   status='draft' AND scheduled_at <= NOW()  →  status='published', published_at=NOW()
 *   - events: status='draft' AND scheduled_at <= NOW()  →  status='upcoming'
 *
 * Отдаёт: { ok, published_news, published_events, at }.
 */
import { db } from '@/lib/db';
import { apiError } from '@/lib/api';
import { autoPostNews, autoPostEvent } from '@/lib/auto-post';

function checkAuth(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const header = request.headers.get('authorization');
  if (header && header.startsWith('Bearer ') && header.slice(7) === secret) {
    return true;
  }

  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  if (token && token === secret) {
    return true;
  }

  return false;
}

async function runPublishScheduled() {
  const nowIso = new Date().toISOString();
  let publishedNews = 0;
  let publishedEvents = 0;

  if (db.isPostgres) {
    const newsRes = await db.raw<Record<string, unknown>>(
      `UPDATE news
          SET status = 'published',
              published_at = COALESCE(published_at, NOW()),
              updated_at  = NOW()
        WHERE status = 'draft'
          AND scheduled_at IS NOT NULL
          AND scheduled_at <= NOW()
        RETURNING *`,
    );
    publishedNews = newsRes.length;
    for (const row of newsRes) {
      autoPostNews(row as Parameters<typeof autoPostNews>[0]);
    }

    const eventsRes = await db.raw<Record<string, unknown>>(
      `UPDATE events
          SET status = 'upcoming'
        WHERE status = 'draft'
          AND scheduled_at IS NOT NULL
          AND scheduled_at <= NOW()
        RETURNING *`,
    );
    publishedEvents = eventsRes.length;
    for (const row of eventsRes) {
      autoPostEvent(row as Parameters<typeof autoPostEvent>[0]);
    }
  } else {
    // In-memory: итерируемся и апдейтим по id.
    const allNews = await db.query('news');
    for (const n of allNews) {
      if (n.status === 'draft' && n.scheduled_at && String(n.scheduled_at) <= nowIso) {
        const row = await db.update('news', String(n.id), {
          status: 'published',
          published_at: n.published_at || nowIso,
          updated_at: nowIso,
        });
        publishedNews++;
        if (row) autoPostNews(row as Parameters<typeof autoPostNews>[0]);
      }
    }

    const allEvents = await db.query('events');
    for (const e of allEvents) {
      if (e.status === 'draft' && e.scheduled_at && String(e.scheduled_at) <= nowIso) {
        const row = await db.update('events', String(e.id), { status: 'upcoming' });
        publishedEvents++;
        if (row) autoPostEvent(row as Parameters<typeof autoPostEvent>[0]);
      }
    }
  }

  return {
    ok: true,
    published_news: publishedNews,
    published_events: publishedEvents,
    at: nowIso,
  };
}

export async function POST(request: Request) {
  if (!checkAuth(request)) return apiError(401, 'Invalid cron secret');
  try {
    const result = await runPublishScheduled();
    return Response.json(result);
  } catch (err) {
    return apiError(500, 'publish-scheduled failed', String(err));
  }
}

export async function GET(request: Request) {
  if (!checkAuth(request)) return apiError(401, 'Invalid cron secret');
  try {
    const result = await runPublishScheduled();
    return Response.json(result);
  } catch (err) {
    return apiError(500, 'publish-scheduled failed', String(err));
  }
}
