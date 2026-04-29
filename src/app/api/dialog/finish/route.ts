import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { awardProgress } from '@/lib/award-progress';

/**
 * POST /api/dialog/finish { topic?: string, turns?: number, mentor?: string }
 * Финализирует сессию dialog-trainer'а и начисляет XP/streak/achievements.
 * Идемпотентность по нашим меркам — это полный коридор «один dialog = одна
 * запись в dialog_sessions», так что вызов на каждый «end-of-conversation»
 * шарма не делает: дублирующая сессия = дублирующая XP-награда.
 *
 * Anti-abuse: минимум 4 turn'а от пользователя, иначе считаем «trial» и не
 * платим XP (только пишем сессию).
 */
export async function POST(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) return Response.json({ ok: false }, { status: 401 });
  try {
    const body = await request.json().catch(() => ({}));
    const turns = Math.max(0, Number(body?.turns ?? 0));
    const topic = typeof body?.topic === 'string' ? body.topic : null;
    const mentor = typeof body?.mentor === 'string' ? body.mentor : 'abai';

    try {
      await db.insert('dialog_sessions', {
        user_id: user.id,
        topic,
        mentor,
        turns,
        completed_at: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('[dialog/finish] dialog_sessions insert skipped:', err);
    }

    let progress = null;
    if (turns >= 4) {
      try {
        progress = await awardProgress(user.id, 'dialog_session', { score: Math.min(100, turns * 10) });
      } catch (e) {
        console.warn('[dialog/finish] awardProgress skipped:', e);
      }
    }

    return Response.json({ ok: true, progress });
  } catch (err) {
    return Response.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
