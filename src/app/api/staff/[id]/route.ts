import { db } from '@/lib/db';
import { requireAdminApi, apiError } from '@/lib/api';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await db.findOne('staff', { id });
  if (!item) return apiError(404, 'Not found');
  return Response.json({ staff: item });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi(request);
  if (auth instanceof Response) return auth;
  const { id } = await params;
  try {
    const body = await request.json();
    const allowed: Record<string, unknown> = {};
    for (const k of [
      'name_kk', 'name_ru', 'position_kk', 'position_ru',
      'department_id', 'photo_url', 'email', 'phone',
      'bio_kk', 'bio_ru', 'sort_order',
    ]) {
      if (k in body) allowed[k] = k === 'sort_order' ? Number(body[k] || 0) : body[k];
    }
    const row = await db.update('staff', id, allowed);
    if (!row) return apiError(404, 'Not found');
    return Response.json({ staff: row });
  } catch (err) {
    return apiError(500, 'Failed to update staff member', String(err));
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi(request);
  if (auth instanceof Response) return auth;
  const { id } = await params;
  const ok = await db.delete('staff', id);
  if (!ok) return apiError(404, 'Not found');
  return Response.json({ ok: true });
}
