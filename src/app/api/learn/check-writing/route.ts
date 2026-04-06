import { checkWriting } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const { text, level = 'B1' } = await request.json();

    if (!text) {
      return Response.json({ error: 'Text is required' }, { status: 400 });
    }

    const result = await checkWriting(text, level);

    try {
      const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleaned);
      return Response.json({ result: parsed });
    } catch {
      return Response.json({
        result: {
          score: 70,
          corrections: [],
          feedback: result,
          strengths: [],
          improvements: [],
        },
      });
    }
  } catch (error) {
    return Response.json({ error: 'Writing check failed', details: String(error) }, { status: 500 });
  }
}
