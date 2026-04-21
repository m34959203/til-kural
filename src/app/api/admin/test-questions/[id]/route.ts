import { db } from '@/lib/db';
import { requireAdminApi, apiError } from '@/lib/api';

const FIELDS = ['test_type', 'topic', 'difficulty', 'question_kk', 'question_ru', 'options', 'correct_answer', 'explanation_kk', 'explanation_ru'];

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi(request);
  if (auth instanceof Response) return auth;
  const { id } = await params;
  try {
    const body = await request.json();
    const patch: Record<string, unknown> = {};
    for (const k of FIELDS) if (k in body) patch[k] = body[k];
    if (typeof patch.options === 'string') {
      try { patch.options = JSON.parse(patch.options as string); } catch { patch.options = (patch.options as string).split(',').map((s) => s.trim()); }
    }
    const row = await db.update('test_questions', id, patch);
    if (!row) return apiError(404, 'Not found');
    return Response.json({ question: row });
  } catch (err) {
    return apiError(500, 'Failed to update question', String(err));
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi(request);
  if (auth instanceof Response) return auth;
  const { id } = await params;
  const ok = await db.delete('test_questions', id);
  if (!ok) return apiError(404, 'Not found');
  return Response.json({ ok: true });
}
