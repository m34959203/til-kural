import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { calculateXPGain, checkStreakBonus, updateStreak, checkLevelUp } from '@/lib/gamification';
import { calculateLevel } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, score } = await request.json();

    const userData = await db.findOne('users', { id: user.id });
    if (!userData) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    const xpGain = calculateXPGain(action, score);
    const oldXP = userData.xp_points || 0;
    const newXP = oldXP + xpGain;
    const newLevel = calculateLevel(newXP);
    const leveledUp = checkLevelUp(oldXP, newXP);

    // Update streak
    const streakResult = updateStreak(userData.last_activity_date);
    let currentStreak = userData.current_streak || 0;

    if (streakResult.isNewDay) {
      if (streakResult.streakBroken) {
        currentStreak = 1;
      } else {
        currentStreak += 1;
      }
    }

    const streakBonus = checkStreakBonus(currentStreak);
    const totalXP = newXP + streakBonus;

    await db.update('users', user.id, {
      xp_points: totalXP,
      level: newLevel,
      current_streak: currentStreak,
      longest_streak: Math.max(userData.longest_streak || 0, currentStreak),
      last_activity_date: new Date().toISOString().split('T')[0],
    });

    return Response.json({
      xpGain: xpGain + streakBonus,
      totalXP,
      level: newLevel,
      leveledUp,
      currentStreak,
      streakBonus,
    });
  } catch (error) {
    return Response.json({ error: 'Progress update failed', details: String(error) }, { status: 500 });
  }
}
