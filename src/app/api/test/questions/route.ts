import questionsData from '@/data/test-questions-bank.json';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'level';
  const difficulty = searchParams.get('difficulty');
  const topic = searchParams.get('topic');
  const limit = parseInt(searchParams.get('limit') || '20');

  let questions = questionsData.filter((q) => q.test_type === type);

  if (difficulty) {
    questions = questions.filter((q) => q.difficulty === difficulty);
  }
  if (topic) {
    questions = questions.filter((q) => q.topic === topic);
  }

  // Shuffle and limit
  const shuffled = questions.sort(() => Math.random() - 0.5).slice(0, limit);

  return Response.json({ questions: shuffled, total: shuffled.length });
}
