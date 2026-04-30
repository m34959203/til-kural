import { checkWriting } from '@/lib/gemini';
import { getUserFromRequest } from '@/lib/auth';
import { db } from '@/lib/db';
import { awardProgress } from '@/lib/award-progress';
import { aiQuotaErrorResponse } from '@/lib/api';

const VALID_LEVELS = new Set(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
const VALID_GENRES = new Set(['free', 'letter', 'essay', 'application', 'sms', 'congrats']);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const text: string = typeof body?.text === 'string' ? body.text : '';
    const levelInput: string = typeof body?.level === 'string' ? body.level : 'A2';
    const level = VALID_LEVELS.has(levelInput) ? levelInput : 'A2';
    const locale: 'kk' | 'ru' = body?.locale === 'ru' ? 'ru' : 'kk';
    const genreInput: string = typeof body?.genre === 'string' ? body.genre : 'free';
    const genre = VALID_GENRES.has(genreInput) ? genreInput : 'free';

    if (!text) {
      return Response.json({ error: 'Text is required' }, { status: 400 });
    }

    const user = await getUserFromRequest(request);
    const raw = await checkWriting(text, level, { locale, genre, userId: user?.id ?? null });

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

    let checkId: string | null = null;
    if (user) {
      try {
        const row = await db.insert('writing_checks', {
          user_id: user.id,
          input_text: text,
          corrections: parsed.corrections ?? [],
          score: parsed.score ?? 0,
        });
        checkId = row?.id ?? null;
      } catch (dbErr) {
        console.warn('[check-writing] db insert skipped:', dbErr);
      }
      try {
        await awardProgress(user.id, 'writing_check', { score: parsed.score ?? 0 });
      } catch (e) {
        console.warn('[check-writing] awardProgress skipped:', e);
      }
    }

    return Response.json({ result: parsed, id: checkId, level, locale, genre });
  } catch (error) {
    const quota = aiQuotaErrorResponse(error);
    if (quota) return quota;
    return Response.json({ error: 'Writing check failed', details: String(error) }, { status: 500 });
  }
}
