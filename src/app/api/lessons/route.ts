import { db } from '@/lib/db';
import { requireAdminApi, parsePagination, paginationMeta } from '@/lib/api';
import { LessonsSchema, validateBody } from '@/lib/validators';

const LESSONS_SEARCH_COLS = ['title_kk', 'title_ru', 'topic'];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const topic = searchParams.get('topic') || undefined;
  const difficulty = searchParams.get('difficulty') || undefined;
  const { page, limit, offset, search, paginated } = parsePagination(searchParams);

  const filter: Record<string, unknown> = {};
  if (topic) filter.topic = topic;
  if (difficulty) filter.difficulty = difficulty;
  const filterOrUndef = Object.keys(filter).length ? filter : undefined;

  const rows = await db.queryWithSearch(
    'lessons',
    filterOrUndef,
    LESSONS_SEARCH_COLS,
    search,
    paginated
      ? { orderBy: 'sort_order', order: 'asc', limit, offset }
      : { orderBy: 'sort_order', order: 'asc' },
  );

  if (!paginated) {
    return Response.json({ lessons: rows });
  }

  const total = await db.countWhere('lessons', filterOrUndef, LESSONS_SEARCH_COLS, search);
  return Response.json({ lessons: rows, ...paginationMeta(total, page, limit) });
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
