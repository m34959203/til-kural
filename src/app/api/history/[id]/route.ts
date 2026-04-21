import { db } from '@/lib/db';
import { requireAdminApi, apiError } from '@/lib/api';
import { HISTORY_TABLE, pickAllowed } from '@/lib/history-blocks';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await db.findOne(HISTORY_TABLE, { id });
  if (!item) return apiError(404, 'Not found');
  return Response.json({ history: item });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi(request);
  if (auth instanceof Response) return auth;
  const { id } = await params;
  try {
    const body = await request.json();
    const allowed = pickAllowed(body);
    const row = await db.update(HISTORY_TABLE, id, allowed as Record<string, unknown>);
    if (!row) return apiError(404, 'Not found');
    return Response.json({ history: row });
  } catch (err) {
    return apiError(500, 'Failed to update history block', String(err));
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi(request);
  if (auth instanceof Response) return auth;
  const { id } = await params;
  const ok = await db.delete(HISTORY_TABLE, id);
  if (!ok) return apiError(404, 'Not found');
  return Response.json({ ok: true });
}
