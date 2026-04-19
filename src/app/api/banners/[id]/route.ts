import { db } from '@/lib/db';
import { requireAdminApi, apiError } from '@/lib/api';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi(request);
  if (auth instanceof Response) return auth;
  const { id } = await params;
  const body = await request.json();
  const allowed: Record<string, unknown> = {};
  for (const k of ['title','subtitle_kk','subtitle_ru','image_url','link_url','position','is_active','sort_order']) {
    if (k in body) allowed[k] = body[k];
  }
  const row = await db.update('banners', id, allowed);
  if (!row) return apiError(404, 'Not found');
  return Response.json({ banner: row });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi(request);
  if (auth instanceof Response) return auth;
  const { id } = await params;
  const ok = await db.delete('banners', id);
  if (!ok) return apiError(404, 'Not found');
  return Response.json({ ok: true });
}
