import { db } from '@/lib/db';
import { requireAdminApi, apiError, requireFields } from '@/lib/api';

export async function GET() {
  try {
    const rows = await db.query(
      'departments',
      undefined,
      { orderBy: 'sort_order', order: 'asc' },
    );
    return Response.json({ departments: rows });
  } catch (err) {
    return apiError(500, 'Failed to load departments', String(err));
  }
}

export async function POST(request: Request) {
  const auth = await requireAdminApi(request);
  if (auth instanceof Response) return auth;

  try {
    const body = await request.json();
    const missing = requireFields(body, ['name_kk', 'name_ru']);
    if (missing.length) return apiError(400, 'Missing fields', missing);

    const row = await db.insert('departments', {
      name_kk: body.name_kk,
      name_ru: body.name_ru,
      description_kk: body.description_kk || null,
      description_ru: body.description_ru || null,
      head_user_id: body.head_user_id || null,
      sort_order: Number(body.sort_order || 0),
    });
    return Response.json({ department: row }, { status: 201 });
  } catch (err) {
    return apiError(500, 'Failed to create department', String(err));
  }
}
