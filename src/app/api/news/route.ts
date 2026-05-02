import { db } from '@/lib/db';
import {
  requireAdminApi,
  apiError,
  slugify,
  parsePagination,
  paginationMeta,
} from '@/lib/api';
import { NewsSchema, validateBody } from '@/lib/validators';
import { autoPostNews } from '@/lib/auto-post';

const NEWS_SEARCH_COLS = ['title_kk', 'title_ru', 'slug'];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || undefined;
  const { page, limit, offset, search, paginated } = parsePagination(searchParams);
  // Публичный режим: если фильтр status=published, вернуть только то, что
  // РЕАЛЬНО опубликовано на текущий момент (published_at IS NULL OR <= NOW()).
  // Для админки (без фильтра или status=draft/archived) отдаём всё как есть.
  const publicPublishedOnly = status === 'published';

  try {
    // Публичный режим (status=published) сохраняем как было: raw-SQL с проверкой
    // даты публикации. Серверную пагинацию он не поддерживает — это исторический
    // публичный листинг, он и так работает с лимитом.
    if (publicPublishedOnly && db.isPostgres) {
      const rows = await db.raw(
        `SELECT * FROM "news"
           WHERE status = 'published'
             AND (published_at IS NULL OR published_at <= NOW())
           ORDER BY published_at DESC NULLS LAST
           LIMIT $1`,
        [limit],
      );
      return Response.json({ news: rows });
    }

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    const filterOrUndef = Object.keys(filter).length ? filter : undefined;

    const rows = await db.queryWithSearch(
      'news',
      filterOrUndef,
      NEWS_SEARCH_COLS,
      search,
      { orderBy: 'published_at', order: 'desc', limit, offset },
    );

    const filtered = publicPublishedOnly
      ? rows.filter((r) => !r.published_at || String(r.published_at) <= new Date().toISOString())
      : rows;

    if (!paginated) {
      return Response.json({ news: filtered });
    }

    const total = await db.countWhere('news', filterOrUndef, NEWS_SEARCH_COLS, search);
    return Response.json({ news: filtered, ...paginationMeta(total, page, limit) });
  } catch (err) {
    return apiError(500, 'Failed to load news', String(err));
  }
}

export async function POST(request: Request) {
  const auth = await requireAdminApi(request);
  if (auth instanceof Response) return auth;

  try {
    const body = await request.json();
    const result = validateBody(NewsSchema, body);
    if (!result.ok) {
      return Response.json({ error: 'Validation failed', errors: result.errors }, { status: 400 });
    }
    const data = result.data;

    const slug = (data.slug && String(data.slug).trim()) || slugify(data.title_ru || data.title_kk);
    const now = new Date().toISOString();

    // Нормализуем scheduled_at: пустая строка → null.
    const scheduledAtRaw = data.scheduled_at ? String(data.scheduled_at).trim() : '';
    const scheduledAt = scheduledAtRaw ? new Date(scheduledAtRaw).toISOString() : null;

    // Правила published_at:
    //   status='published' → published_at = data.published_at || NOW()
    //   status='draft' и scheduled_at в прошлом → публикуем сразу, published_at = NOW()
    //   иначе published_at = NULL (или data.published_at, если админ явно указал)
    let status = data.status || 'draft';
    let publishedAt: string | null = data.published_at ? String(data.published_at) : null;

    if (status === 'published') {
      publishedAt = publishedAt || now;
    } else if (status === 'draft' && scheduledAt && scheduledAt <= now) {
      status = 'published';
      publishedAt = publishedAt || now;
    }

    const row = await db.insert('news', {
      slug,
      title_kk: data.title_kk,
      title_ru: data.title_ru,
      content_kk: data.content_kk || null,
      content_ru: data.content_ru || null,
      excerpt_kk: data.excerpt_kk || null,
      excerpt_ru: data.excerpt_ru || null,
      image_url: data.image_url || null,
      video_url: data.video_url || null,
      status,
      published_at: publishedAt,
      scheduled_at: scheduledAt,
      updated_at: now,
    });
    if (status === 'published' && row) {
      autoPostNews(row as Parameters<typeof autoPostNews>[0]);
    }
    return Response.json({ news: row }, { status: 201 });
  } catch (err) {
    return apiError(500, 'Failed to create news', String(err));
  }
}
