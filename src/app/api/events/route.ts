import { db } from '@/lib/db';
import {
  requireAdminApi,
  apiError,
  parsePagination,
  paginationMeta,
} from '@/lib/api';
import { EventsSchema, validateBody } from '@/lib/validators';

const EVENTS_SEARCH_COLS = ['title_kk', 'title_ru', 'location'];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || undefined;
  const eventType = searchParams.get('event_type') || undefined;
  const { page, limit, offset, search, paginated } = parsePagination(searchParams);
  // Публичный режим (status ≠ draft и без фильтра): прячем «запланированные»
  // events, у которых scheduled_at > NOW() — как это делает cron для news.
  const hideScheduled = status !== 'draft';

  try {
    // Публичный raw-SQL путь оставляем как было (без серверной пагинации): он
    // используется главной страницей и там другие требования.
    if (hideScheduled && db.isPostgres && !paginated) {
      const whereStatus = status ? `AND status = $1` : '';
      const params = status ? [status] : [];
      const rows = await db.raw(
        `SELECT * FROM "events"
           WHERE (scheduled_at IS NULL OR scheduled_at <= NOW())
             AND status <> 'draft'
             ${whereStatus}
           ORDER BY start_date ASC`,
        params,
      );
      return Response.json({ events: rows });
    }

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (eventType) filter.event_type = eventType;
    const filterOrUndef = Object.keys(filter).length ? filter : undefined;

    const rows = await db.queryWithSearch(
      'events',
      filterOrUndef,
      EVENTS_SEARCH_COLS,
      search,
      paginated
        ? { orderBy: 'start_date', order: 'asc', limit, offset }
        : { orderBy: 'start_date', order: 'asc' },
    );

    const filtered = hideScheduled
      ? rows.filter((r) => {
          if (r.status === 'draft') return false;
          if (!r.scheduled_at) return true;
          return String(r.scheduled_at) <= new Date().toISOString();
        })
      : rows;

    if (!paginated) {
      return Response.json({ events: filtered });
    }

    const total = await db.countWhere('events', filterOrUndef, EVENTS_SEARCH_COLS, search);
    return Response.json({ events: filtered, ...paginationMeta(total, page, limit) });
  } catch (err) {
    return apiError(500, 'Failed to load events', String(err));
  }
}

export async function POST(request: Request) {
  const auth = await requireAdminApi(request);
  if (auth instanceof Response) return auth;
  try {
    const body = await request.json();
    const result = validateBody(EventsSchema, body);
    if (!result.ok) {
      return Response.json({ error: 'Validation failed', errors: result.errors }, { status: 400 });
    }
    const data = result.data;

    const now = new Date().toISOString();
    const scheduledAtRaw = data.scheduled_at ? String(data.scheduled_at).trim() : '';
    const scheduledAt = scheduledAtRaw ? new Date(scheduledAtRaw).toISOString() : null;

    // draft + scheduled_at в прошлом → сразу делаем upcoming (догоняем пропущенный cron).
    let status = data.status || 'upcoming';
    if (status === 'draft' && scheduledAt && scheduledAt <= now) {
      status = 'upcoming';
    }

    const row = await db.insert('events', {
      title_kk: data.title_kk,
      title_ru: data.title_ru,
      description_kk: data.description_kk || null,
      description_ru: data.description_ru || null,
      image_url: data.image_url || null,
      event_type: data.event_type || 'event',
      start_date: data.start_date,
      end_date: data.end_date || null,
      location: data.location || null,
      registration_url: data.registration_url || null,
      status,
      scheduled_at: scheduledAt,
    });
    return Response.json({ event: row }, { status: 201 });
  } catch (err) {
    return apiError(500, 'Failed to create event', String(err));
  }
}
