import { db } from '@/lib/db';
import { requireAdminApi, apiError, requireFields } from '@/lib/api';

function parseJsonField(value: unknown, fallback: unknown = []) {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export async function GET() {
  try {
    const rows = await db.query('grammar_rules', undefined, { orderBy: 'rule_order', order: 'asc' });
    return Response.json({ rules: rows });
  } catch (err) {
    return apiError(500, 'Failed to load grammar rules', String(err));
  }
}

export async function POST(request: Request) {
  const auth = await requireAdminApi(request);
  if (auth instanceof Response) return auth;

  try {
    const body = await request.json();
    const missing = requireFields(body, ['topic', 'title_kk', 'title_ru']);
    if (missing.length) return apiError(400, 'Missing fields', missing);

    const row = await db.insert('grammar_rules', {
      topic: body.topic,
      title_kk: body.title_kk,
      title_ru: body.title_ru,
      level: body.level || 'A1',
      description_kk: body.description_kk || null,
      description_ru: body.description_ru || null,
      examples: parseJsonField(body.examples, []),
      exceptions: parseJsonField(body.exceptions, []),
      rule_order: Number(body.rule_order || 0),
    });
    return Response.json({ rule: row }, { status: 201 });
  } catch (err) {
    return apiError(500, 'Failed to create grammar rule', String(err));
  }
}
