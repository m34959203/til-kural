import { db } from '@/lib/db';
import { requireAdminApi, apiError } from '@/lib/api';

function parseJsonField(value: unknown) {
  if (value === undefined || value === null || value === '') return value;
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await db.findOne('grammar_rules', { id });
  if (!item) return apiError(404, 'Not found');
  return Response.json({ rule: item });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi(request);
  if (auth instanceof Response) return auth;
  const { id } = await params;
  try {
    const body = await request.json();
    const allowed: Record<string, unknown> = {};
    for (const k of [
      'topic', 'title_kk', 'title_ru', 'level',
      'description_kk', 'description_ru',
      'examples', 'exceptions', 'rule_order',
    ]) {
      if (k in body) {
        if (k === 'rule_order') {
          allowed[k] = Number(body[k] || 0);
        } else if (k === 'examples' || k === 'exceptions') {
          allowed[k] = parseJsonField(body[k]);
        } else {
          allowed[k] = body[k];
        }
      }
    }
    const row = await db.update('grammar_rules', id, allowed);
    if (!row) return apiError(404, 'Not found');
    return Response.json({ rule: row });
  } catch (err) {
    return apiError(500, 'Failed to update grammar rule', String(err));
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi(request);
  if (auth instanceof Response) return auth;
  const { id } = await params;
  const ok = await db.delete('grammar_rules', id);
  if (!ok) return apiError(404, 'Not found');
  return Response.json({ ok: true });
}
