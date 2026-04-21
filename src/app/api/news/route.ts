import { db } from '@/lib/db';
import { requireAdminApi, apiError, slugify } from '@/lib/api';
import { NewsSchema, validateBody } from '@/lib/validators';

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
    const result = validateBody(NewsSchema, body);
    if (!result.ok) {
      return Response.json({ error: 'Validation failed', errors: result.errors }, { status: 400 });
    }
    const data = result.data;

    const slug = (data.slug && String(data.slug).trim()) || slugify(data.title_ru || data.title_kk);
    const now = new Date().toISOString();
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
      status: data.status || 'draft',
      published_at: data.status === 'published' ? (data.published_at || now) : null,
      updated_at: now,
    });
    return Response.json({ news: row }, { status: 201 });
  } catch (err) {
    return apiError(500, 'Failed to create news', String(err));
  }
}
