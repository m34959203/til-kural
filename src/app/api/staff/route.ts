import { db } from '@/lib/db';
import { requireAdminApi, apiError } from '@/lib/api';
import { StaffSchema, validateBody } from '@/lib/validators';

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
    const result = validateBody(StaffSchema, body);
    if (!result.ok) {
      return Response.json({ error: 'Validation failed', errors: result.errors }, { status: 400 });
    }
    const data = result.data;

    const row = await db.insert('staff', {
      name_kk: data.name_kk,
      name_ru: data.name_ru,
      position_kk: data.position_kk || null,
      position_ru: data.position_ru || null,
      department_id: data.department_id || null,
      photo_url: data.photo_url || null,
      email: data.email || null,
      phone: data.phone || null,
      bio_kk: data.bio_kk || null,
      bio_ru: data.bio_ru || null,
      sort_order: Number(data.sort_order || 0),
    });
    return Response.json({ staff: row }, { status: 201 });
  } catch (err) {
    return apiError(500, 'Failed to create staff member', String(err));
  }
}
