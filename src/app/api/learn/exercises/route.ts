import { generateExercises } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const { topic = 'grammar', level = 'B1', weakPoints = [] } = await request.json();

    const result = await generateExercises(topic, level, weakPoints);

    try {
      const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const exercises = JSON.parse(cleaned);
      return Response.json({ exercises });
    } catch {
      // Return fallback exercises
      return Response.json({
        exercises: [
          { question: `${topic} тақырыбынан сұрақ 1`, options: ['A', 'B', 'C', 'D'], correct: 'A', explanation: 'Түсіндірме' },
          { question: `${topic} тақырыбынан сұрақ 2`, options: ['A', 'B', 'C', 'D'], correct: 'B', explanation: 'Түсіндірме' },
          { question: `${topic} тақырыбынан сұрақ 3`, options: ['A', 'B', 'C', 'D'], correct: 'C', explanation: 'Түсіндірме' },
        ],
      });
    }
  } catch (error) {
    return Response.json({ error: 'Failed to generate exercises', details: String(error) }, { status: 500 });
  }
}
