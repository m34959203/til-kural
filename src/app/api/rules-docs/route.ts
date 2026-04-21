import { db } from '@/lib/db';
import { requireAdminApi, apiError } from '@/lib/api';
import { RulesDocsSchema, validateBody } from '@/lib/validators';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || undefined;
  try {
    const rows = await db.query(
      'rules_documents',
      category ? { category } : undefined,
      { orderBy: 'sort_order', order: 'asc' },
    );
    return Response.json({ docs: rows });
  } catch (err) {
    return apiError(500, 'Failed to load rules documents', String(err));
  }
}

export async function POST(request: Request) {
  const auth = await requireAdminApi(request);
  if (auth instanceof Response) return auth;

  try {
    const body = await request.json();
    const result = validateBody(RulesDocsSchema, body);
    if (!result.ok) {
      return Response.json({ error: 'Validation failed', errors: result.errors }, { status: 400 });
    }
    const data = result.data;

    const row = await db.insert('rules_documents', {
      title_kk: data.title_kk,
      title_ru: data.title_ru,
      description_kk: data.description_kk || null,
      description_ru: data.description_ru || null,
      year: data.year || null,
      pdf_url: data.pdf_url || null,
      category: data.category || 'other',
      sort_order: Number(data.sort_order || 0),
    });
    return Response.json({ doc: row }, { status: 201 });
  } catch (err) {
    return apiError(500, 'Failed to create rules document', String(err));
  }
}
