import { db } from '@/lib/db';
import { requireAdminApi, apiError, requireFields } from '@/lib/api';

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
  const missing = requireFields(body, ['title_kk', 'title_ru', 'topic', 'difficulty']);
  if (missing.length) return apiError(400, 'Missing fields', missing);
  const row = await db.insert('lessons', {
    title_kk: body.title_kk,
    title_ru: body.title_ru,
    description_kk: body.description_kk || null,
    description_ru: body.description_ru || null,
    topic: body.topic,
    difficulty: body.difficulty,
    content: body.content || {},
    sort_order: Number(body.sort_order ?? 0),
  });
  return Response.json({ lesson: row }, { status: 201 });
}
