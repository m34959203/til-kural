import { db } from '@/lib/db';
import { requireAdminApi, apiError, requireFields } from '@/lib/api';

/**
 * CRUD для банка тестовых вопросов (таблица test_questions).
 *
 * GET — публичный список (используется админ-CRUD и возможным read-only UI).
 *       Фильтры: ?test_type=level&difficulty=A1&topic=grammar&limit=500
 * POST — только admin/editor/moderator; создаёт вопрос.
 */

function normalizeOptions(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    const s = raw.trim();
    if (!s) return [];
    try {
      const parsed = JSON.parse(s);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      /* fall through */
    }
    return s.split(',').map((x) => x.trim()).filter(Boolean);
  }
  return [];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const test_type = searchParams.get('test_type') || undefined;
  const topic = searchParams.get('topic') || undefined;
  const difficulty = searchParams.get('difficulty') || undefined;
  const limit = Number(searchParams.get('limit') || 500);

  const filter: Record<string, unknown> = {};
  if (test_type) filter.test_type = test_type;
  if (topic) filter.topic = topic;
  if (difficulty) filter.difficulty = difficulty;

  try {
    const rows = await db.query('test_questions', filter, {
      orderBy: 'topic',
      order: 'asc',
      limit,
    });
    return Response.json({ questions: rows });
  } catch (err) {
    return apiError(500, 'Failed to load test questions', String(err));
  }
}

export async function POST(request: Request) {
  const auth = await requireAdminApi(request);
  if (auth instanceof Response) return auth;

  try {
    const body = await request.json();
    const missing = requireFields(body, [
      'test_type',
      'topic',
      'difficulty',
      'question_kk',
      'correct_answer',
    ]);
    if (missing.length) return apiError(400, 'Missing fields', missing);

    const row = await db.insert('test_questions', {
      test_type: body.test_type,
      topic: body.topic,
      difficulty: body.difficulty,
      question_kk: body.question_kk,
      question_ru: body.question_ru || null,
      options: normalizeOptions(body.options),
      correct_answer: body.correct_answer,
      explanation_kk: body.explanation_kk || null,
      explanation_ru: body.explanation_ru || null,
    });
    return Response.json({ question: row }, { status: 201 });
  } catch (err) {
    return apiError(500, 'Failed to create question', String(err));
  }
}
