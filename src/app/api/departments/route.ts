import { db } from '@/lib/db';
import { requireAdminApi, apiError } from '@/lib/api';
import { DepartmentsSchema, validateBody } from '@/lib/validators';

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
    const result = validateBody(DepartmentsSchema, body);
    if (!result.ok) {
      return Response.json({ error: 'Validation failed', errors: result.errors }, { status: 400 });
    }
    const data = result.data;

    const row = await db.insert('departments', {
      name_kk: data.name_kk,
      name_ru: data.name_ru,
      description_kk: data.description_kk || null,
      description_ru: data.description_ru || null,
      head_user_id: data.head_user_id || null,
      sort_order: Number(data.sort_order || 0),
    });
    return Response.json({ department: row }, { status: 201 });
  } catch (err) {
    return apiError(500, 'Failed to create department', String(err));
  }
}
