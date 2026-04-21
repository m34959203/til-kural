import { db } from '@/lib/db';
import { requireAdminApi, apiError, requireFields } from '@/lib/api';

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
    const missing = requireFields(body, ['title_kk', 'title_ru']);
    if (missing.length) return apiError(400, 'Missing fields', missing);

    const row = await db.insert('rules_documents', {
      title_kk: body.title_kk,
      title_ru: body.title_ru,
      description_kk: body.description_kk || null,
      description_ru: body.description_ru || null,
      year: body.year || null,
      pdf_url: body.pdf_url || null,
      category: body.category || 'other',
      sort_order: Number(body.sort_order || 0),
    });
    return Response.json({ doc: row }, { status: 201 });
  } catch (err) {
    return apiError(500, 'Failed to create rules document', String(err));
  }
}
