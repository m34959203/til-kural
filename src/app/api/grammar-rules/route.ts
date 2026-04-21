import { db } from '@/lib/db';
import { requireAdminApi, apiError } from '@/lib/api';
import { GrammarRulesSchema, validateBody } from '@/lib/validators';

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
    const result = validateBody(GrammarRulesSchema, body);
    if (!result.ok) {
      return Response.json({ error: 'Validation failed', errors: result.errors }, { status: 400 });
    }
    const data = result.data;

    const row = await db.insert('grammar_rules', {
      topic: data.topic,
      title_kk: data.title_kk,
      title_ru: data.title_ru,
      level: data.level || 'A1',
      description_kk: data.description_kk || null,
      description_ru: data.description_ru || null,
      examples: parseJsonField(data.examples, []),
      exceptions: parseJsonField(data.exceptions, []),
      rule_order: Number(data.rule_order || 0),
    });
    return Response.json({ rule: row }, { status: 201 });
  } catch (err) {
    return apiError(500, 'Failed to create grammar rule', String(err));
  }
}
