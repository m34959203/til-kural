import { db } from '@/lib/db';
import { requireAdminApi, apiError } from '@/lib/api';
import { BannersSchema, validateBody } from '@/lib/validators';

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
