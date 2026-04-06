import questionsData from '@/data/test-questions-bank.json';

export async function POST(request: Request) {
  try {
    const { answers, questionIds } = await request.json();

    if (!answers || !questionIds) {
      return Response.json({ error: 'Answers and questionIds are required' }, { status: 400 });
    }

    let correct = 0;
    const details: Array<{ questionId: string; correct: boolean; correctAnswer: string }> = [];

    for (let i = 0; i < questionIds.length; i++) {
      const question = questionsData.find((q) => q.id === questionIds[i]);
      const isCorrect = question?.correct_answer === answers[i];
      if (isCorrect) correct++;
      details.push({
        questionId: questionIds[i],
        correct: isCorrect,
        correctAnswer: question?.correct_answer || '',
      });
    }

    const score = Math.round((correct / questionIds.length) * 100);
    let level = 'A1';
    if (score >= 90) level = 'C1';
    else if (score >= 75) level = 'B2';
    else if (score >= 60) level = 'B1';
    else if (score >= 45) level = 'A2';

    return Response.json({
      score,
      correct,
      total: questionIds.length,
      level,
      details,
    });
  } catch (error) {
    return Response.json({ error: 'Evaluation failed', details: String(error) }, { status: 500 });
  }
}
