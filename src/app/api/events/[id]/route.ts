import { db } from '@/lib/db';
import { requireAdminApi, apiError } from '@/lib/api';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await db.findOne('events', { id });
  if (!item) return apiError(404, 'Not found');
  return Response.json({ event: item });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi(request);
  if (auth instanceof Response) return auth;
  const { id } = await params;
  try {
    const body = await request.json();
    const allowed: Record<string, unknown> = {};
    for (const k of ['title_kk','title_ru','description_kk','description_ru','image_url','event_type','start_date','end_date','location','registration_url','status','scheduled_at']) {
      if (k in body) allowed[k] = body[k];
    }
    if ('scheduled_at' in allowed) {
      const v = allowed.scheduled_at;
      allowed.scheduled_at = v ? new Date(String(v)).toISOString() : null;
    }
    const row = await db.update('events', id, allowed);
    if (!row) return apiError(404, 'Not found');
    return Response.json({ event: row });
  } catch (err) {
    return apiError(500, 'Failed to update event', String(err));
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi(request);
  if (auth instanceof Response) return auth;
  const { id } = await params;
  const ok = await db.delete('events', id);
  if (!ok) return apiError(404, 'Not found');
  return Response.json({ ok: true });
}
