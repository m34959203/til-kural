import questionsData from '@/data/test-questions-bank.json';
import {
  selectNextQuestion,
  shouldStop,
  estimateLevel,
  type AnsweredItem,
  type BankQuestion,
  type CEFR,
  isCEFR,
} from '@/lib/cat-engine';

const bank = questionsData as unknown as BankQuestion[];

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const rawAnswered: unknown[] = Array.isArray(body?.answered) ? body.answered : [];

    // Нормализуем историю: восстанавливаем difficulty из банка, если клиент не передал.
    const bankById = new Map(bank.map((q) => [q.id, q]));
    const history: AnsweredItem[] = rawAnswered
      .filter((x): x is { questionId: string; correct: boolean; difficulty?: string } => {
        return (
          !!x &&
          typeof x === 'object' &&
          typeof (x as { questionId?: unknown }).questionId === 'string' &&
          typeof (x as { correct?: unknown }).correct === 'boolean'
        );
      })
      .map((x) => {
        const q = bankById.get(x.questionId);
        const diff = isCEFR(x.difficulty)
          ? (x.difficulty as CEFR)
          : q && isCEFR(q.difficulty)
            ? (q.difficulty as CEFR)
            : undefined;
        return {
          questionId: x.questionId,
          correct: x.correct,
          difficulty: diff,
        } satisfies AnsweredItem;
      });

    // Стоп-условие
    if (shouldStop(history)) {
      const finalLevel = estimateLevel(history);
      return Response.json({
        done: true,
        finalLevel,
        answeredCount: history.length,
      });
    }

    const next = selectNextQuestion(history, bank);
    if (!next) {
      // Банк исчерпан — завершаем
      const finalLevel = estimateLevel(history);
      return Response.json({
        done: true,
        finalLevel,
        answeredCount: history.length,
      });
    }

    const { question, level } = next;

    // Возвращаем вопрос БЕЗ correct_answer (клиент не должен видеть ответ)
    return Response.json({
      done: false,
      question: {
        id: question.id,
        topic: question.topic,
        difficulty: level,
        question_kk: question.question_kk,
        question_ru: question.question_ru,
        options: question.options,
      },
      progress: {
        current: history.length + 1,
        max: 15,
      },
      currentLevel: level,
    });
  } catch (error) {
    return Response.json(
      { error: 'next-question failed', details: String(error) },
      { status: 500 },
    );
  }
}
