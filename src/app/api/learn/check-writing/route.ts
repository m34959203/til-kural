import { checkWriting } from '@/lib/gemini';
import { getUserFromRequest } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { text, level = 'B1' } = await request.json();

    if (!text) {
      return Response.json({ error: 'Text is required' }, { status: 400 });
    }

    const raw = await checkWriting(text, level);

    let parsed: {
      score: number;
      corrections: unknown[];
      feedback: string;
      strengths: unknown[];
      improvements: unknown[];
    };
    try {
      const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = {
        score: 70,
        corrections: [],
        feedback: raw,
        strengths: [],
        improvements: [],
      };
    }

    // Persist (skip if no user)
    let checkId: string | null = null;
    try {
      const user = await getUserFromRequest(request);
      if (user) {
        const row = await db.insert('writing_checks', {
          user_id: user.id,
          input_text: text,
          corrections: parsed.corrections ?? [],
          score: parsed.score ?? 0,
        });
        checkId = row?.id ?? null;
      }
    } catch (dbErr) {
      console.warn('[check-writing] db insert skipped:', dbErr);
    }

    return Response.json({ result: parsed, id: checkId });
  } catch (error) {
    return Response.json({ error: 'Writing check failed', details: String(error) }, { status: 500 });
  }
}
