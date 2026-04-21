import { db } from '@/lib/db';
import { requireAdminApi, apiError } from '@/lib/api';

const FIELDS = [
  'test_type',
  'topic',
  'difficulty',
  'question_kk',
  'question_ru',
  'options',
  'correct_answer',
  'explanation_kk',
  'explanation_ru',
];

function normalizeOptions(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    const s = raw.trim();
    if (!s) return [];
    try {
      const parsed = JSON.parse(s);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      /* fall through */
    }
    return s.split(',').map((x) => x.trim()).filter(Boolean);
  }
  return [];
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await db.findOne('test_questions', { id });
  if (!item) return apiError(404, 'Not found');
  return Response.json({ question: item });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi(request);
  if (auth instanceof Response) return auth;
  const { id } = await params;
  try {
    const body = await request.json();
    const patch: Record<string, unknown> = {};
    for (const k of FIELDS) {
      if (k in body) patch[k] = body[k];
    }
    if ('options' in patch) patch.options = normalizeOptions(patch.options);
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
