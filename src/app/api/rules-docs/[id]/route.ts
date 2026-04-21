import { db } from '@/lib/db';
import { requireAdminApi, apiError } from '@/lib/api';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await db.findOne('rules_documents', { id });
  if (!item) return apiError(404, 'Not found');
  return Response.json({ doc: item });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi(request);
  if (auth instanceof Response) return auth;
  const { id } = await params;
  try {
    const body = await request.json();
    const allowed: Record<string, unknown> = {};
    for (const k of [
      'title_kk', 'title_ru', 'description_kk', 'description_ru',
      'year', 'pdf_url', 'category', 'sort_order',
    ]) {
      if (k in body) allowed[k] = k === 'sort_order' ? Number(body[k] || 0) : body[k];
    }
    const row = await db.update('rules_documents', id, allowed);
    if (!row) return apiError(404, 'Not found');
    return Response.json({ doc: row });
  } catch (err) {
    return apiError(500, 'Failed to update rules document', String(err));
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi(request);
  if (auth instanceof Response) return auth;
  const { id } = await params;
  const ok = await db.delete('rules_documents', id);
  if (!ok) return apiError(404, 'Not found');
  return Response.json({ ok: true });
}
