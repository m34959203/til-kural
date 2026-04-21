import { db } from '@/lib/db';

interface LeaderUser {
  id: string;
  name: string;
  xp_points?: number;
  level?: number;
  current_streak?: number;
  language_level?: string;
}

export async function GET() {
  try {
    const rows = (await db.query('users', undefined, {
      orderBy: 'xp_points',
      order: 'desc',
      limit: 20,
    })) as LeaderUser[];

    const leaderboard = rows.map((u, idx) => ({
      rank: idx + 1,
      id: u.id,
      name: u.name || '—',
      xp: u.xp_points ?? 0,
      level: u.level ?? 1,
      streak: u.current_streak ?? 0,
      language_level: u.language_level ?? null,
    }));

    return Response.json({ leaderboard });
  } catch (err) {
    console.warn('[leaderboard] db query failed:', err);
    return Response.json({ leaderboard: [] });
  }
}
