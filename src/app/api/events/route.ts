import { db } from '@/lib/db';
import { requireAdminApi, apiError } from '@/lib/api';
import { EventsSchema, validateBody } from '@/lib/validators';

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
    const result = validateBody(EventsSchema, body);
    if (!result.ok) {
      return Response.json({ error: 'Validation failed', errors: result.errors }, { status: 400 });
    }
    const data = result.data;
    const row = await db.insert('events', {
      title_kk: data.title_kk,
      title_ru: data.title_ru,
      description_kk: data.description_kk || null,
      description_ru: data.description_ru || null,
      image_url: data.image_url || null,
      event_type: data.event_type || 'event',
      start_date: data.start_date,
      end_date: data.end_date || null,
      location: data.location || null,
      registration_url: data.registration_url || null,
      status: data.status || 'upcoming',
    });
    return Response.json({ event: row }, { status: 201 });
  } catch (err) {
    return apiError(500, 'Failed to create event', String(err));
  }
}
