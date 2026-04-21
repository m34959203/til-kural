import questionsData from '@/data/test-questions-bank.json';
import { getUserFromRequest } from '@/lib/auth';
import { recordTestOutcomes, type QuestionOutcome } from '@/lib/adaptive-recommender';
import { db } from '@/lib/db';
import {
  estimateLevel,
  isCEFR,
  type AnsweredItem,
  type BankQuestion,
  type CEFR,
} from '@/lib/cat-engine';

const bank = questionsData as unknown as BankQuestion[];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      answers,
      questionIds,
      testType = 'general',
      topic,
      mode,
      answered: adaptiveAnswered,
    } = body ?? {};

    // --- Ветка adaptive (CAT) ---
    if (mode === 'adaptive') {
      if (!Array.isArray(adaptiveAnswered) || adaptiveAnswered.length === 0) {
        return Response.json(
          { error: 'answered[] is required in adaptive mode' },
          { status: 400 },
        );
      }
      const bankById = new Map(bank.map((q) => [q.id, q]));
      const normalized: AnsweredItem[] = [];
      const outcomes: QuestionOutcome[] = [];
      const details: Array<{ questionId: string; correct: boolean; correctAnswer: string }> = [];

      for (const raw of adaptiveAnswered) {
        if (
          !raw ||
          typeof raw.questionId !== 'string' ||
          typeof raw.correct !== 'boolean'
        ) {
          continue;
        }
        const q = bankById.get(raw.questionId);
        const diff = isCEFR(raw.difficulty)
          ? (raw.difficulty as CEFR)
          : q && isCEFR(q.difficulty)
            ? (q.difficulty as CEFR)
            : undefined;
        normalized.push({ questionId: raw.questionId, correct: raw.correct, difficulty: diff });
        details.push({
          questionId: raw.questionId,
          correct: raw.correct,
          correctAnswer: q?.correct_answer || '',
        });
        if (q?.topic) outcomes.push({ topic: q.topic, is_correct: raw.correct });
      }

      const level = estimateLevel(normalized);
      const correctCount = normalized.filter((a) => a.correct).length;
      const score = normalized.length > 0
        ? Math.round((correctCount / normalized.length) * 100)
        : 0;

      const user = await getUserFromRequest(request);
      let sessionId: string | null = null;
      if (user) {
        await recordTestOutcomes(user.id, outcomes);
        try {
          const row = await db.insert('test_sessions', {
            user_id: user.id,
            test_type: 'level_adaptive',
            topic: topic || outcomes[0]?.topic || null,
            questions: normalized.map((a) => a.questionId),
            answers: normalized.map((a) => (a.correct ? '+' : '-')),
            score,
            level_result: level,
            started_at: new Date().toISOString(),
            completed_at: new Date().toISOString(),
          });
          sessionId = row?.id ?? null;
        } catch (dbErr) {
          console.warn('[test/evaluate adaptive] db insert skipped:', dbErr);
        }
      }

      return Response.json({
        mode: 'adaptive',
        score,
        correct: correctCount,
        total: normalized.length,
        level,
        details,
        sessionId,
      });
    }

    // --- Ветка legacy (answers + questionIds) ---
    if (!answers || !questionIds) {
      return Response.json({ error: 'Answers and questionIds are required' }, { status: 400 });
    }

    let correct = 0;
    const details: Array<{ questionId: string; correct: boolean; correctAnswer: string }> = [];
    const outcomes: QuestionOutcome[] = [];

    for (let i = 0; i < questionIds.length; i++) {
      const question = bank.find((q) => q.id === questionIds[i]);
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
