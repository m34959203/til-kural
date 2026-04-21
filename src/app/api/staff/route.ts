import { db } from '@/lib/db';
import { requireAdminApi, apiError, requireFields } from '@/lib/api';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const departmentId = searchParams.get('department_id') || undefined;
  try {
    const rows = await db.query(
      'staff',
      departmentId ? { department_id: departmentId } : undefined,
      { orderBy: 'sort_order', order: 'asc' },
    );
    return Response.json({ staff: rows });
  } catch (err) {
    return apiError(500, 'Failed to load staff', String(err));
  }
}

export async function POST(request: Request) {
  const auth = await requireAdminApi(request);
  if (auth instanceof Response) return auth;

  try {
    const body = await request.json();
    const missing = requireFields(body, ['name_kk', 'name_ru']);
    if (missing.length) return apiError(400, 'Missing fields', missing);

    const row = await db.insert('staff', {
      name_kk: body.name_kk,
      name_ru: body.name_ru,
      position_kk: body.position_kk || null,
      position_ru: body.position_ru || null,
      department_id: body.department_id || null,
      photo_url: body.photo_url || null,
      email: body.email || null,
      phone: body.phone || null,
      bio_kk: body.bio_kk || null,
      bio_ru: body.bio_ru || null,
      sort_order: Number(body.sort_order || 0),
    });
    return Response.json({ staff: row }, { status: 201 });
  } catch (err) {
    return apiError(500, 'Failed to create staff member', String(err));
  }
}
