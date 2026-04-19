import { db } from '@/lib/db';
import { requireAdminApi, apiError, requireFields } from '@/lib/api';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || undefined;
  try {
    const rows = await db.query(
      'events',
      status ? { status } : undefined,
      { orderBy: 'start_date', order: 'asc' },
    );
    return Response.json({ events: rows });
  } catch (err) {
    return apiError(500, 'Failed to load events', String(err));
  }
}

export async function POST(request: Request) {
  const auth = await requireAdminApi(request);
  if (auth instanceof Response) return auth;
  try {
    const body = await request.json();
    const missing = requireFields(body, ['title_kk', 'title_ru', 'start_date']);
    if (missing.length) return apiError(400, 'Missing fields', missing);
    const row = await db.insert('events', {
      title_kk: body.title_kk,
      title_ru: body.title_ru,
      description_kk: body.description_kk || null,
      description_ru: body.description_ru || null,
      image_url: body.image_url || null,
      event_type: body.event_type || 'event',
      start_date: body.start_date,
      end_date: body.end_date || null,
      location: body.location || null,
      registration_url: body.registration_url || null,
      status: body.status || 'upcoming',
    });
    return Response.json({ event: row }, { status: 201 });
  } catch (err) {
    return apiError(500, 'Failed to create event', String(err));
  }
}
