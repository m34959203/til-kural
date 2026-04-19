import { db } from '@/lib/db';
import { requireAdminApi, apiError, requireFields, slugify } from '@/lib/api';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || undefined;
  const limit = Number(searchParams.get('limit') || 50);
  try {
    const rows = await db.query(
      'news',
      status ? { status } : undefined,
      { orderBy: 'published_at', order: 'desc', limit },
    );
    return Response.json({ news: rows });
  } catch (err) {
    return apiError(500, 'Failed to load news', String(err));
  }
}

export async function POST(request: Request) {
  const auth = await requireAdminApi(request);
  if (auth instanceof Response) return auth;

  try {
    const body = await request.json();
    const missing = requireFields(body, ['title_kk', 'title_ru']);
    if (missing.length) return apiError(400, 'Missing fields', missing);

    const slug = body.slug?.trim() || slugify(body.title_ru || body.title_kk);
    const now = new Date().toISOString();
    const row = await db.insert('news', {
      slug,
      title_kk: body.title_kk,
      title_ru: body.title_ru,
      content_kk: body.content_kk || null,
      content_ru: body.content_ru || null,
      excerpt_kk: body.excerpt_kk || null,
      excerpt_ru: body.excerpt_ru || null,
      image_url: body.image_url || null,
      video_url: body.video_url || null,
      status: body.status || 'draft',
      published_at: body.status === 'published' ? (body.published_at || now) : null,
      updated_at: now,
    });
    return Response.json({ news: row }, { status: 201 });
  } catch (err) {
    return apiError(500, 'Failed to create news', String(err));
  }
}
