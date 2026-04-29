import { generateExercises } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const topic: string = body?.topic ?? 'grammar';
    const level: string = body?.level ?? 'B1';
    const locale: 'kk' | 'ru' = body?.locale === 'ru' ? 'ru' : 'kk';
    const lessonTitle: string | undefined =
      typeof body?.lessonTitle === 'string' && body.lessonTitle.trim() ? body.lessonTitle.trim() : undefined;
    const targetVocab: string[] = Array.isArray(body?.targetVocab)
      ? body.targetVocab.filter((s: unknown): s is string => typeof s === 'string' && s.length > 0)
      : [];
    const targetGrammar: string[] = Array.isArray(body?.targetGrammar)
      ? body.targetGrammar.filter((s: unknown): s is string => typeof s === 'string' && s.length > 0)
      : [];
    const weakPoints: string[] = Array.isArray(body?.weakPoints)
      ? body.weakPoints.filter((s: unknown): s is string => typeof s === 'string' && s.length > 0)
      : [];
    const rawScore = body?.avg_score;
    const avgScore: number | undefined =
      typeof rawScore === 'number' && !Number.isNaN(rawScore)
        ? Math.max(0, Math.min(100, rawScore))
        : undefined;

    const result = await generateExercises(topic, level, weakPoints, avgScore, {
      lessonTitle,
      targetVocab,
      targetGrammar,
      locale,
    });

    let difficulty: 'basic' | 'standard' | 'advanced' = 'standard';
    if (typeof avgScore === 'number') {
      if (avgScore < 50) difficulty = 'basic';
      else if (avgScore > 85) difficulty = 'advanced';
    }

    try {
      const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const exercises = JSON.parse(cleaned);
      return Response.json({
        exercises,
        difficulty,
        topic,
        level,
        lessonTitle: lessonTitle ?? null,
        weakPoints,
        avg_score: avgScore ?? null,
      });
    } catch {
      const fallbackNote =
        difficulty === 'basic'
          ? (locale === 'ru' ? 'базовые' : 'базалық')
          : difficulty === 'advanced'
            ? (locale === 'ru' ? 'продвинутые' : 'озық')
            : (locale === 'ru' ? 'стандартные' : 'стандартты');
      const fallbackQuestion = lessonTitle
        ? (locale === 'ru' ? `Вопрос по теме «${lessonTitle}»` : `«${lessonTitle}» тақырыбынан сұрақ`)
        : (locale === 'ru' ? `Вопрос по теме «${topic}»` : `${topic} тақырыбынан сұрақ`);
      return Response.json({
        exercises: [
          { question: `${fallbackQuestion} 1`, options: ['A', 'B', 'C', 'D'], correct: 'A', explanation: fallbackNote },
          { question: `${fallbackQuestion} 2`, options: ['A', 'B', 'C', 'D'], correct: 'B', explanation: fallbackNote },
          { question: `${fallbackQuestion} 3`, options: ['A', 'B', 'C', 'D'], correct: 'C', explanation: fallbackNote },
        ],
        difficulty,
        topic,
        level,
        lessonTitle: lessonTitle ?? null,
        weakPoints,
        avg_score: avgScore ?? null,
      });
    }
  } catch (error) {
    return Response.json({ error: 'Failed to generate exercises', details: String(error) }, { status: 500 });
  }
}
