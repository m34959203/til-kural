import { db } from '@/lib/db';
import { requireAdminApi, apiError, isUuid } from '@/lib/api';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // News допускает GET по slug — поэтому пробуем UUID-поиск только если id похож на UUID.
  const byId = isUuid(id) ? await db.findOne('news', { id }) : null;
  const item = byId || (await db.findOne('news', { slug: id }));
  if (!item) return apiError(404, 'Not found');
  // Публично отдаём только опубликованные. Черновики/архивные доступны только админу.
  if (item.status !== 'published') {
    const auth = await requireAdminApi(_req);
    if (auth instanceof Response) return apiError(404, 'Not found');
  }
  return Response.json({ news: item });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi(request);
  if (auth instanceof Response) return auth;
  const { id } = await params;
  if (!isUuid(id)) return apiError(404, 'Not found');
  try {
    const body = await request.json();
    const allowed: Record<string, unknown> = {};
    for (const k of ['title_kk','title_ru','content_kk','content_ru','excerpt_kk','excerpt_ru','image_url','video_url','status','slug','published_at','scheduled_at']) {
      if (k in body) allowed[k] = body[k];
    }
    // Нормализуем scheduled_at: пустая строка → null.
    if ('scheduled_at' in allowed) {
      const v = allowed.scheduled_at;
      allowed.scheduled_at = v ? new Date(String(v)).toISOString() : null;
    }
    allowed.updated_at = new Date().toISOString();
    if (body.status === 'published' && !body.published_at) allowed.published_at = new Date().toISOString();
    const row = await db.update('news', id, allowed);
    if (!row) return apiError(404, 'Not found');
    return Response.json({ news: row });
  } catch (err) {
    return apiError(500, 'Failed to update news', String(err));
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi(request);
  if (auth instanceof Response) return auth;
  const { id } = await params;
  if (!isUuid(id)) return apiError(404, 'Not found');
  const ok = await db.delete('news', id);
  if (!ok) return apiError(404, 'Not found');
  return Response.json({ ok: true });
}
