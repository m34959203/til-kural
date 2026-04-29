import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

interface AchievementCondition {
  type?: string;
  value?: number;
}

interface AchievementRow {
  id: string;
  code: string;
  condition?: AchievementCondition | null;
}

interface UserAchievementRow {
  achievement_id: string;
  earned_at?: string;
}

interface UserRow {
  language_level?: string | null;
  current_streak?: number | null;
  longest_streak?: number | null;
  level?: number | null;
  xp_points?: number | null;
}

/**
 * GET /api/profile/achievements
 * Возвращает: { earned: [{code, earned_at}], progress: {code: {current, target}} }
 * Прогресс позволяет UI показывать «4/10» внутри каждой ачивки и градацию
 * locked / in-progress / earned (audit P1).
 *
 * Без авторизации — пустые поля.
 */
export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) return Response.json({ earned: [], progress: {} });

  try {
    const [allRows, userRows, userMeta] = await Promise.all([
      db.query('achievements') as Promise<AchievementRow[]>,
      db.query('user_achievements', { user_id: user.id }) as Promise<UserAchievementRow[]>,
      db.findOne('users', { id: user.id }) as Promise<UserRow | null>,
    ]);
    const idToCode = new Map(allRows.map((a) => [a.id, a.code]));
    const earned: Array<{ code: string; earned_at?: string }> = [];
    for (const u of userRows) {
      const code = idToCode.get(u.achievement_id);
      if (typeof code === 'string') earned.push({ code, earned_at: u.earned_at });
    }

    // Подсчитаем «текущее значение» для типов условий, которые знаем.
    // Один раз — потом матчим к каждой ачивке.
    const [lessonsCount, testsCount, writingCount, photoCount] = await Promise.all([
      db.count('user_lessons', { user_id: user.id, completed: true }).catch(() => 0),
      db.count('test_sessions', { user_id: user.id }).catch(() => 0),
      db.count('writing_checks', { user_id: user.id }).catch(() => 0),
      db.count('photo_checks', { user_id: user.id }).catch(() => 0),
    ]);
    const dialogCount = await db.count('dialog_sessions', { user_id: user.id }).catch(() => 0);
    const userQuestsDone = await db.query('user_quests', { user_id: user.id }).catch(() => []);
    const completedQuests = (userQuestsDone as Array<{ completed_at?: string | null }>).filter((q) => q.completed_at).length;

    const currentStreak = userMeta?.current_streak ?? 0;
    const longestStreak = userMeta?.longest_streak ?? 0;
    const userLevel = userMeta?.level ?? 1;
    const langLevel = userMeta?.language_level ?? null;

    const progress: Record<string, { current: number; target: number }> = {};
    for (const a of allRows) {
      const cond = a.condition || {};
      const target = typeof cond.value === 'number' ? cond.value : 1;
      let current = 0;
      switch (cond.type) {
        case 'lessons_completed': current = lessonsCount; break;
        case 'tests_completed': current = testsCount; break;
        case 'writing_checks': current = writingCount; break;
        case 'photo_checks': current = photoCount; break;
        case 'dialog_sessions': current = dialogCount; break;
        case 'quests_completed': current = completedQuests; break;
        case 'streak_days': current = Math.max(currentStreak, longestStreak); break;
        case 'level': current = userLevel; break;
        case 'placement_done': current = langLevel ? 1 : 0; break;
        default: current = 0;
      }
      progress[a.code] = { current: Math.min(current, target), target };
    }

    return Response.json({ earned, progress });
  } catch (err) {
    return Response.json({ earned: [], progress: {}, error: String(err) });
  }
}
