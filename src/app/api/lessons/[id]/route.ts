import { db } from '@/lib/db';
import { requireAdminApi, apiError } from '@/lib/api';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = await db.findOne('lessons', { id });
  if (!row) return apiError(404, 'Not found');
  return Response.json({ lesson: row });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi(request);
  if (auth instanceof Response) return auth;
  const { id } = await params;
  const body = await request.json();
  const allowed: Record<string, unknown> = {};
  for (const k of ['title_kk','title_ru','description_kk','description_ru','topic','difficulty','content','sort_order']) {
    if (k in body) allowed[k] = body[k];
  }
  const row = await db.update('lessons', id, allowed);
  if (!row) return apiError(404, 'Not found');
  return Response.json({ lesson: row });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi(request);
  if (auth instanceof Response) return auth;
  const { id } = await params;
  const ok = await db.delete('lessons', id);
  if (!ok) return apiError(404, 'Not found');
  return Response.json({ ok: true });
}
