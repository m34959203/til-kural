import { db } from '@/lib/db';
import { requireAdminApi, apiError, parsePagination, paginationMeta } from '@/lib/api';
import { BannersSchema, validateBody } from '@/lib/validators';

const BANNERS_SEARCH_COLS = ['title', 'subtitle_kk', 'subtitle_ru'];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const position = searchParams.get('position') || undefined;
  const { page, limit, offset, search, paginated } = parsePagination(searchParams);

  const filter: Record<string, unknown> = {};
  if (position) filter.position = position;
  // `is_active`: префер явный параметр (?is_active=true|false). Старый `?active=1`
  // оставляем для обратной совместимости — он выставляет is_active=true.
  const isActiveParam = searchParams.get('is_active');
  if (isActiveParam !== null) {
    filter.is_active = isActiveParam === 'true' || isActiveParam === '1';
  } else if (searchParams.get('active')) {
    filter.is_active = true;
  }
  const filterOrUndef = Object.keys(filter).length ? filter : undefined;

  const rows = await db.queryWithSearch(
    'banners',
    filterOrUndef,
    BANNERS_SEARCH_COLS,
    search,
    paginated
      ? { orderBy: 'sort_order', order: 'asc', limit, offset }
      : { orderBy: 'sort_order', order: 'asc' },
  );

  if (!paginated) {
    return Response.json({ banners: rows });
  }

  const total = await db.countWhere('banners', filterOrUndef, BANNERS_SEARCH_COLS, search);
  return Response.json({ banners: rows, ...paginationMeta(total, page, limit) });
}

export async function POST(request: Request) {
  const auth = await requireAdminApi(request);
  if (auth instanceof Response) return auth;
  try {
    const body = await request.json();
    const result = validateBody(BannersSchema, body);
    if (!result.ok) {
      return Response.json({ error: 'Validation failed', errors: result.errors }, { status: 400 });
    }
    const data = result.data;
    const row = await db.insert('banners', {
      title: data.title || null,
      subtitle_kk: data.subtitle_kk || null,
      subtitle_ru: data.subtitle_ru || null,
      image_url: data.image_url,
      link_url: data.link_url || null,
      position: data.position || 'hero',
      is_active: data.is_active !== false,
      sort_order: Number(data.sort_order ?? 0),
    });
    return Response.json({ banner: row }, { status: 201 });
  } catch (err) {
    return apiError(500, 'Failed to create banner', String(err));
  }
}
