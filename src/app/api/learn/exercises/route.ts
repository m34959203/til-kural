import { generateExercises } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const topic: string = body?.topic ?? 'grammar';
    const level: string = body?.level ?? 'B1';
    const weakPoints: string[] = Array.isArray(body?.weakPoints)
      ? body.weakPoints.filter((s: unknown): s is string => typeof s === 'string' && s.length > 0)
      : [];
    const rawScore = body?.avg_score;
    const avgScore: number | undefined =
      typeof rawScore === 'number' && !Number.isNaN(rawScore)
        ? Math.max(0, Math.min(100, rawScore))
        : undefined;

    const result = await generateExercises(topic, level, weakPoints, avgScore);

    let difficulty: 'basic' | 'standard' | 'advanced' = 'standard';
    if (typeof avgScore === 'number') {
      if (avgScore < 50) difficulty = 'basic';
      else if (avgScore > 85) difficulty = 'advanced';
    }

    try {
      const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const exercises = JSON.parse(cleaned);
      return Response.json({ exercises, difficulty, topic, level, weakPoints, avg_score: avgScore ?? null });
    } catch {
      const fallbackNote =
        difficulty === 'basic'
          ? 'базовые'
          : difficulty === 'advanced'
            ? 'продвинутые'
            : 'стандартные';
      return Response.json({
        exercises: [
          { question: `${topic} тақырыбынан сұрақ 1`, options: ['A', 'B', 'C', 'D'], correct: 'A', explanation: `Түсіндірме (${fallbackNote})` },
          { question: `${topic} тақырыбынан сұрақ 2`, options: ['A', 'B', 'C', 'D'], correct: 'B', explanation: `Түсіндірме (${fallbackNote})` },
          { question: `${topic} тақырыбынан сұрақ 3`, options: ['A', 'B', 'C', 'D'], correct: 'C', explanation: `Түсіндірме (${fallbackNote})` },
        ],
        difficulty,
        topic,
        level,
        weakPoints,
        avg_score: avgScore ?? null,
      });
    }
  } catch (error) {
    return Response.json({ error: 'Failed to generate exercises', details: String(error) }, { status: 500 });
  }
}
