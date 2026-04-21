import { db } from '@/lib/db';
import { requireAdminApi, apiError, requireFields } from '@/lib/api';

export async function GET(request: Request) {
  const auth = await requireAdminApi(request);
  if (auth instanceof Response) return auth;
  try {
    const rows = await db.query('test_questions', undefined, { orderBy: 'topic', order: 'asc', limit: 500 });
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
    const missing = requireFields(body, ['test_type', 'topic', 'difficulty', 'question_kk', 'correct_answer']);
    if (missing.length) return apiError(400, 'Missing fields', missing);

    let options = body.options;
    if (typeof options === 'string') {
      try { options = JSON.parse(options); } catch { options = options.split(',').map((s: string) => s.trim()); }
    }
    if (!Array.isArray(options)) options = [];

    const row = await db.insert('test_questions', {
      test_type: body.test_type,
      topic: body.topic,
      difficulty: body.difficulty,
      question_kk: body.question_kk,
      question_ru: body.question_ru || null,
      options,
      correct_answer: body.correct_answer,
      explanation_kk: body.explanation_kk || null,
      explanation_ru: body.explanation_ru || null,
    });
    return Response.json({ question: row }, { status: 201 });
  } catch (err) {
    return apiError(500, 'Failed to create question', String(err));
  }
}
