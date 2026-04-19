import { db } from '@/lib/db';
import { requireAdminApi, apiError, requireFields } from '@/lib/api';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const position = searchParams.get('position') || undefined;
  const filter: Record<string, unknown> = {};
  if (position) filter.position = position;
  if (searchParams.get('active')) filter.is_active = true;
  const rows = await db.query('banners', filter, { orderBy: 'sort_order', order: 'asc' });
  return Response.json({ banners: rows });
}

export async function POST(request: Request) {
  const auth = await requireAdminApi(request);
  if (auth instanceof Response) return auth;
  try {
    const body = await request.json();
    const missing = requireFields(body, ['image_url']);
    if (missing.length) return apiError(400, 'Missing fields', missing);
    const row = await db.insert('banners', {
      title: body.title || null,
      subtitle_kk: body.subtitle_kk || null,
      subtitle_ru: body.subtitle_ru || null,
      image_url: body.image_url,
      link_url: body.link_url || null,
      position: body.position || 'hero',
      is_active: body.is_active !== false,
      sort_order: Number(body.sort_order ?? 0),
    });
    return Response.json({ banner: row }, { status: 201 });
  } catch (err) {
    return apiError(500, 'Failed to create banner', String(err));
  }
}
