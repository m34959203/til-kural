import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

interface AchievementRow {
  id: string;
  code: string;
}

interface UserAchievementRow {
  achievement_id: string;
  earned_at?: string;
}

/**
 * GET /api/profile/achievements
 * Возвращает список кодов ачивок, заработанных текущим юзером.
 * Без авторизации — пустой список (UI рендерит каталог как «не получено»).
 */
export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) return Response.json({ earned: [] });

  try {
    const [allRows, userRows] = await Promise.all([
      db.query('achievements') as Promise<AchievementRow[]>,
      db.query('user_achievements', { user_id: user.id }) as Promise<UserAchievementRow[]>,
    ]);
    const idToCode = new Map(allRows.map((a) => [a.id, a.code]));
    const earned: Array<{ code: string; earned_at?: string }> = [];
    for (const u of userRows) {
      const code = idToCode.get(u.achievement_id);
      if (typeof code === 'string') earned.push({ code, earned_at: u.earned_at });
    }
    return Response.json({ earned });
  } catch (err) {
    return Response.json({ earned: [], error: String(err) });
  }
}
