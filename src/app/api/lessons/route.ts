import { db } from '@/lib/db';
import { requireAdminApi } from '@/lib/api';
import { LessonsSchema, validateBody } from '@/lib/validators';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const topic = searchParams.get('topic') || undefined;
  const difficulty = searchParams.get('difficulty') || undefined;
  const filter: Record<string, unknown> = {};
  if (topic) filter.topic = topic;
  if (difficulty) filter.difficulty = difficulty;
  const rows = await db.query('lessons', filter, { orderBy: 'sort_order', order: 'asc' });
  return Response.json({ lessons: rows });
}

export async function POST(request: Request) {
  const auth = await requireAdminApi(request);
  if (auth instanceof Response) return auth;
  const body = await request.json();
  const result = validateBody(LessonsSchema, body);
  if (!result.ok) {
    return Response.json({ error: 'Validation failed', errors: result.errors }, { status: 400 });
  }
  const data = result.data;
  const row = await db.insert('lessons', {
    title_kk: data.title_kk,
    title_ru: data.title_ru,
    description_kk: data.description_kk || null,
    description_ru: data.description_ru || null,
    topic: data.topic,
    difficulty: data.difficulty,
    content: data.content || {},
    sort_order: Number(data.sort_order ?? 0),
  });
  return Response.json({ lesson: row }, { status: 201 });
}
