import { db } from '@/lib/db';
import {
  requireAdminApi,
  apiError,
  parsePagination,
  paginationMeta,
} from '@/lib/api';
import { TestQuestionsSchema, validateBody } from '@/lib/validators';

/**
 * CRUD для банка тестовых вопросов (таблица test_questions).
 *
 * GET — публичный список (используется админ-CRUD и возможным read-only UI).
 *       Фильтры: ?test_type=level&difficulty=A1&topic=grammar
 *       Пагинация: ?page=1&limit=25&search=...
 * POST — только admin/editor/moderator; создаёт вопрос.
 */

const TESTS_SEARCH_COLS = ['question_kk', 'question_ru', 'topic'];

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
  // Дефолт-лимит для tests был исторически 500 (бэкенд KAZTEST/level-test
  // ожидает большую пачку). Сохраняем поведение, когда клиент не передал page/limit.
  const { page, limit, offset, search, paginated } = parsePagination(searchParams, 500);

  const filter: Record<string, unknown> = {};
  if (test_type) filter.test_type = test_type;
  if (topic) filter.topic = topic;
  if (difficulty) filter.difficulty = difficulty;
  const filterOrUndef = Object.keys(filter).length ? filter : undefined;

  try {
    const rows = await db.queryWithSearch(
      'test_questions',
      filterOrUndef,
      TESTS_SEARCH_COLS,
      search,
      { orderBy: 'topic', order: 'asc', limit, offset },
    );

    if (!paginated) {
      return Response.json({ questions: rows });
    }

    const total = await db.countWhere(
      'test_questions',
      filterOrUndef,
      TESTS_SEARCH_COLS,
      search,
    );
    return Response.json({ questions: rows, ...paginationMeta(total, page, limit) });
  } catch (err) {
    return apiError(500, 'Failed to load test questions', String(err));
  }
}

export async function POST(request: Request) {
  const auth = await requireAdminApi(request);
  if (auth instanceof Response) return auth;

  try {
    const body = await request.json();
    const result = validateBody(TestQuestionsSchema, body);
    if (!result.ok) {
      return Response.json({ error: 'Validation failed', errors: result.errors }, { status: 400 });
    }
    const data = result.data;

    const opts = normalizeOptions(data.options);
    // Не даём сохранить нерешаемый вопрос: correct_answer должен быть в options.
    if (opts.length > 0 && !opts.map(String).includes(String(data.correct_answer))) {
      return Response.json(
        { error: 'Validation failed', errors: [{ field: 'correct_answer', message: 'Дұрыс жауап options ішінде болуы керек' }] },
        { status: 400 },
      );
    }

    const row = await db.insert('test_questions', {
      test_type: data.test_type,
      topic: data.topic,
      difficulty: data.difficulty,
      question_kk: data.question_kk,
      question_ru: data.question_ru || null,
      options: opts,
      correct_answer: data.correct_answer,
      explanation_kk: data.explanation_kk || null,
      explanation_ru: data.explanation_ru || null,
    });
    return Response.json({ question: row }, { status: 201 });
  } catch (err) {
    return apiError(500, 'Failed to create question', String(err));
  }
}
