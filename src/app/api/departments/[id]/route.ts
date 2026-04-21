import { db } from '@/lib/db';
import { requireAdminApi, apiError } from '@/lib/api';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await db.findOne('departments', { id });
  if (!item) return apiError(404, 'Not found');
  return Response.json({ department: item });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi(request);
  if (auth instanceof Response) return auth;
  const { id } = await params;
  try {
    const body = await request.json();
    const allowed: Record<string, unknown> = {};
    for (const k of ['name_kk', 'name_ru', 'description_kk', 'description_ru', 'head_user_id', 'sort_order']) {
      if (k in body) allowed[k] = k === 'sort_order' ? Number(body[k] || 0) : body[k];
    }
    const row = await db.update('departments', id, allowed);
    if (!row) return apiError(404, 'Not found');
    return Response.json({ department: row });
  } catch (err) {
    return apiError(500, 'Failed to update department', String(err));
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi(request);
  if (auth instanceof Response) return auth;
  const { id } = await params;
  const ok = await db.delete('departments', id);
  if (!ok) return apiError(404, 'Not found');
  return Response.json({ ok: true });
}
