import questionsData from '@/data/test-questions-bank.json';
import { getUserFromRequest } from '@/lib/auth';
import { recordTestOutcomes, type QuestionOutcome } from '@/lib/adaptive-recommender';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { answers, questionIds, testType = 'general', topic } = await request.json();

    if (!answers || !questionIds) {
      return Response.json({ error: 'Answers and questionIds are required' }, { status: 400 });
    }

    let correct = 0;
    const details: Array<{ questionId: string; correct: boolean; correctAnswer: string }> = [];
    const outcomes: QuestionOutcome[] = [];

    for (let i = 0; i < questionIds.length; i++) {
      const question = questionsData.find((q) => q.id === questionIds[i]);
      const isCorrect = question?.correct_answer === answers[i];
      if (isCorrect) correct++;
      details.push({
        questionId: questionIds[i],
        correct: isCorrect,
        correctAnswer: question?.correct_answer || '',
      });
      if (question?.topic) {
        outcomes.push({ topic: question.topic, is_correct: isCorrect });
      }
    }

    const score = Math.round((correct / questionIds.length) * 100);
    let level = 'A1';
    if (score >= 90) level = 'C1';
    else if (score >= 75) level = 'B2';
    else if (score >= 60) level = 'B1';
    else if (score >= 45) level = 'A2';

    const user = await getUserFromRequest(request);
    let sessionId: string | null = null;
    if (user) {
      await recordTestOutcomes(user.id, outcomes);
      try {
        const row = await db.insert('test_sessions', {
          user_id: user.id,
          test_type: testType,
          topic: topic || outcomes[0]?.topic || null,
          questions: questionIds,
          answers,
          score,
          level_result: level,
          started_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
        });
        sessionId = row?.id ?? null;
      } catch (dbErr) {
        console.warn('[test/evaluate] db insert skipped:', dbErr);
      }
    }

    return Response.json({
      score,
      correct,
      total: questionIds.length,
      level,
      details,
      sessionId,
    });
  } catch (error) {
    return Response.json({ error: 'Evaluation failed', details: String(error) }, { status: 500 });
  }
}
