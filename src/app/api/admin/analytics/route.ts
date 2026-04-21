import { db } from '@/lib/db';
import { requireAdminApi, apiError } from '@/lib/api';

export async function GET(request: Request) {
  const auth = await requireAdminApi(request);
  if (auth instanceof Response) return auth;
  try {
    const [
      usersTotal, lessonsTotal, testQuestionsTotal, testSessionsTotal,
      certificatesTotal, newsTotal, eventsTotal, photoChecksTotal,
    ] = await Promise.all([
      db.count('users').catch(() => 0),
      db.count('lessons').catch(() => 0),
      db.count('test_questions').catch(() => 0),
      db.count('test_sessions').catch(() => 0),
      db.count('certificates').catch(() => 0),
      db.count('news').catch(() => 0),
      db.count('events').catch(() => 0),
      db.count('photo_checks').catch(() => 0),
    ]);

    const topUsersRaw = await db.query('users', undefined, { orderBy: 'xp_points', order: 'desc', limit: 10 }).catch(() => []);
    const topUsers = topUsersRaw.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      xp_points: u.xp_points ?? 0,
      level: u.level ?? 1,
      current_streak: u.current_streak ?? 0,
      language_level: u.language_level ?? null,
    }));

    const recentCerts = await db.query('certificates', undefined, { orderBy: 'issued_at', order: 'desc', limit: 10 }).catch(() => []);
    const recentNews = await db.query('news', undefined, { orderBy: 'updated_at', order: 'desc', limit: 5 }).catch(() => []);

    return Response.json({
      totals: {
        users: usersTotal,
        lessons: lessonsTotal,
        test_questions: testQuestionsTotal,
        test_sessions: testSessionsTotal,
        certificates: certificatesTotal,
        news: newsTotal,
        events: eventsTotal,
        photo_checks: photoChecksTotal,
      },
      topUsers,
      recentCerts,
      recentNews,
    });
  } catch (err) {
    return apiError(500, 'Failed to compute analytics', String(err));
  }
}
