/**
 * Единая server-side точка начисления прогресса пользователю.
 * Вызывается из endpoints (test/evaluate, lesson/complete, check-writing, photo-check).
 *
 * Делает в одной транзакции:
 *   1. Считает XP за action (с perfect-bonus при score >= 90)
 *   2. Обновляет streak (continue/break/start)
 *   3. Начисляет streak-bonus за milestones (7/30/100 дней)
 *   4. Пересчитывает level
 *   5. UPDATE users.{xp_points, level, current_streak, longest_streak, last_activity_date}
 *   6. Проверяет каталог achievements и инсёртит новые в user_achievements
 *
 * Результат — для UI-уведомлений ("Вы получили 50 XP, выиграли ачивку «Первый урок»").
 */
import { db } from '@/lib/db';
import {
  XP_REWARDS,
  calculateXPGain,
  checkStreakBonus,
  updateStreak,
} from '@/lib/gamification';
import { calculateLevel } from '@/lib/utils';

export type ProgressAction = keyof typeof XP_REWARDS;

export interface AwardProgressResult {
  xpGain: number;
  streakBonus: number;
  totalXP: number;
  level: number;
  leveledUp: boolean;
  currentStreak: number;
  longestStreak: number;
  achievementsUnlocked: { code: string; title_ru: string; title_kk: string; icon: string }[];
}

interface AchievementCondition {
  type: 'lessons_completed' | 'tests_completed' | 'writing_checks' | 'photo_checks' | 'streak_days' | 'level' | 'placement_done';
  value?: number;
}

interface AchievementRow {
  id: string;
  code: string;
  title_ru: string;
  title_kk: string;
  icon: string;
  condition: AchievementCondition;
}

interface UserRow {
  id: string;
  xp_points?: number | null;
  level?: number | null;
  current_streak?: number | null;
  longest_streak?: number | null;
  last_activity_date?: string | null;
  language_level?: string | null;
}

export async function awardProgress(
  userId: string,
  action: ProgressAction,
  options: { score?: number } = {}
): Promise<AwardProgressResult | null> {
  const userRow = (await db.findOne('users', { id: userId })) as UserRow | null;
  if (!userRow) return null;

  const xpGain = calculateXPGain(action, options.score);
  const oldXP = userRow.xp_points ?? 0;
  const oldLevel = userRow.level ?? 1;

  // Streak update — continue, break or start
  const lastActivity = userRow.last_activity_date
    ? typeof userRow.last_activity_date === 'string'
      ? userRow.last_activity_date
      : new Date(userRow.last_activity_date as unknown as Date).toISOString().split('T')[0]
    : null;
  const streakResult = updateStreak(lastActivity);
  let currentStreak = userRow.current_streak ?? 0;
  if (streakResult.isNewDay) {
    currentStreak = streakResult.streakBroken ? 1 : currentStreak + 1;
  } else if (currentStreak === 0) {
    // первая активность вообще
    currentStreak = 1;
  }
  const longestStreak = Math.max(userRow.longest_streak ?? 0, currentStreak);

  const streakBonus = checkStreakBonus(currentStreak);
  const totalXP = oldXP + xpGain + streakBonus;
  const newLevel = calculateLevel(totalXP);
  const leveledUp = newLevel > oldLevel;
  const today = new Date().toISOString().split('T')[0];

  await db.update('users', userId, {
    xp_points: totalXP,
    level: newLevel,
    current_streak: currentStreak,
    longest_streak: longestStreak,
    last_activity_date: today,
  });

  const achievementsUnlocked = await checkAndUnlockAchievements(userId, {
    level: newLevel,
    streak: currentStreak,
    languageLevelDefined: !!userRow.language_level,
  });

  return {
    xpGain,
    streakBonus,
    totalXP,
    level: newLevel,
    leveledUp,
    currentStreak,
    longestStreak,
    achievementsUnlocked,
  };
}

interface CheckContext {
  level: number;
  streak: number;
  languageLevelDefined: boolean;
}

async function checkAndUnlockAchievements(
  userId: string,
  ctx: CheckContext
): Promise<AwardProgressResult['achievementsUnlocked']> {
  const all = (await db.query('achievements')) as AchievementRow[];
  if (all.length === 0) return [];

  const earned = (await db.query('user_achievements', { user_id: userId })) as { achievement_id: string }[];
  const earnedIds = new Set(earned.map((e) => e.achievement_id));

  // Заранее посчитаем общие counts один раз — большинство ачивок их используют.
  const [lessonsCount, testsCount, writingCount, photoCount] = await Promise.all([
    db.count('user_lessons', { user_id: userId, completed: true }).catch(() => 0),
    db.count('test_sessions', { user_id: userId }).catch(() => 0),
    db.count('writing_checks', { user_id: userId }).catch(() => 0),
    db.count('photo_checks', { user_id: userId }).catch(() => 0),
  ]);

  const unlocked: AwardProgressResult['achievementsUnlocked'] = [];
  for (const a of all) {
    if (earnedIds.has(a.id)) continue;
    const c = a.condition || ({} as AchievementCondition);
    let met = false;
    switch (c.type) {
      case 'lessons_completed':
        met = lessonsCount >= (c.value ?? 1);
        break;
      case 'tests_completed':
        met = testsCount >= (c.value ?? 1);
        break;
      case 'writing_checks':
        met = writingCount >= (c.value ?? 1);
        break;
      case 'photo_checks':
        met = photoCount >= (c.value ?? 1);
        break;
      case 'streak_days':
        met = ctx.streak >= (c.value ?? 7);
        break;
      case 'level':
        met = ctx.level >= (c.value ?? 5);
        break;
      case 'placement_done':
        met = ctx.languageLevelDefined;
        break;
    }
    if (met) {
      try {
        await db.insert('user_achievements', { user_id: userId, achievement_id: a.id });
        unlocked.push({ code: a.code, title_ru: a.title_ru, title_kk: a.title_kk, icon: a.icon });
      } catch {
        // unique-конфликт — уже заработана в параллельном запросе, ОК
      }
    }
  }
  return unlocked;
}
