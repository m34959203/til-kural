import { calculateLevel } from './utils';

export const XP_REWARDS = {
  lesson_complete: 50,
  test_complete: 30,
  test_perfect: 100,
  dialog_session: 25,
  writing_check: 20,
  photo_check: 30,
  quest_complete: 0, // variable, defined in quest
  streak_bonus_7: 100,
  streak_bonus_30: 500,
  streak_bonus_100: 1000,
  daily_login: 10,
} as const;

export const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500, 5500];

export const LEVEL_NAMES_KK = [
  'Бастаушы', 'Жаңа бастаушы', 'Оқушы', 'Тыңдаушы', 'Білімді',
  'Тәжірибелі', 'Маман', 'Сарапшы', 'Ұстаз', 'Шебер', 'Дана',
];

export const LEVEL_NAMES_RU = [
  'Начинающий', 'Новичок', 'Ученик', 'Слушатель', 'Знающий',
  'Опытный', 'Специалист', 'Эксперт', 'Наставник', 'Мастер', 'Мудрец',
];

export function calculateXPGain(action: keyof typeof XP_REWARDS, score?: number): number {
  let xp: number = XP_REWARDS[action];
  if (score !== undefined && score >= 90) {
    xp = Math.floor(xp * 1.5); // Bonus for high score
  }
  return xp;
}

export function checkStreakBonus(streakDays: number): number {
  if (streakDays === 100) return XP_REWARDS.streak_bonus_100;
  if (streakDays === 30) return XP_REWARDS.streak_bonus_30;
  if (streakDays === 7) return XP_REWARDS.streak_bonus_7;
  return 0;
}

export function updateStreak(lastActivityDate: string | null): {
  newStreak: number;
  streakBroken: boolean;
  isNewDay: boolean;
} {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!lastActivityDate) {
    return { newStreak: 1, streakBroken: false, isNewDay: true };
  }

  const lastDate = new Date(lastActivityDate);
  lastDate.setHours(0, 0, 0, 0);

  const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return { newStreak: 0, streakBroken: false, isNewDay: false }; // Same day
  }
  if (diffDays === 1) {
    return { newStreak: 1, streakBroken: false, isNewDay: true }; // Consecutive day
  }
  return { newStreak: 1, streakBroken: true, isNewDay: true }; // Streak broken
}

export function checkLevelUp(oldXP: number, newXP: number): boolean {
  return calculateLevel(oldXP) < calculateLevel(newXP);
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  xp: number;
  level: number;
  streak: number;
  rank: number;
}

export function buildLeaderboard(
  users: Array<{ id: string; name: string; xp_points: number; level: number; current_streak: number }>
): LeaderboardEntry[] {
  return users
    .sort((a, b) => b.xp_points - a.xp_points)
    .map((u, idx) => ({
      userId: u.id,
      name: u.name,
      xp: u.xp_points,
      level: u.level,
      streak: u.current_streak,
      rank: idx + 1,
    }));
}
