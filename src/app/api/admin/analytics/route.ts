import { db } from '@/lib/db';
import { requireAdminApi, apiError } from '@/lib/api';

/**
 * Агрегирует топ-10 тем по количеству попыток.
 *
 * Приоритет: таблица `user_topic_stats` (SQL 003 — точный счётчик).
 * Fallback: группировка по `test_sessions.topic` (в in-memory режиме или если 003 не накатан).
 */
async function loadTopTopics(): Promise<Array<{ topic: string; attempts: number }>> {
  if (db.isPostgres) {
    try {
      const rows = await db.raw<{ topic_slug: string; attempts: string }>(
        `SELECT topic_slug, SUM(attempts)::bigint AS attempts
         FROM user_topic_stats
         GROUP BY topic_slug
         ORDER BY attempts DESC
         LIMIT 10`,
      );
      if (rows.length > 0) {
        return rows.map((r) => ({ topic: r.topic_slug, attempts: Number(r.attempts) || 0 }));
      }
    } catch {
      // Fallback ниже.
    }
    try {
      const rows = await db.raw<{ topic: string; attempts: string }>(
        `SELECT topic, COUNT(*)::bigint AS attempts
         FROM test_sessions
         WHERE topic IS NOT NULL
         GROUP BY topic
         ORDER BY attempts DESC
         LIMIT 10`,
      );
      return rows.map((r) => ({ topic: r.topic, attempts: Number(r.attempts) || 0 }));
    } catch {
      return [];
    }
  }

  // In-memory: агрегируем по test_sessions.topic
  try {
    const sessions = await db.query('test_sessions');
    const counts = new Map<string, number>();
    for (const s of sessions) {
      const topic = (s.topic as string | null) || null;
      if (!topic) continue;
      counts.set(topic, (counts.get(topic) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([topic, attempts]) => ({ topic, attempts }))
      .sort((a, b) => b.attempts - a.attempts)
      .slice(0, 10);
  } catch {
    return [];
  }
}

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

    // Топ-10 активных тем (user_topic_stats → fallback на test_sessions).
    const topTopics = await loadTopTopics();

    // Топ-10 «самых читаемых» новостей — proxy по updated_at, т.к. view-counter не реализован.
    const topNewsRaw = await db
      .query('news', { status: 'published' }, { orderBy: 'updated_at', order: 'desc', limit: 10 })
      .catch(() => []);
    const topNews = topNewsRaw.map((n) => ({
      id: n.id,
      title_ru: n.title_ru ?? '',
      title_kk: n.title_kk ?? '',
      updated_at: n.updated_at ?? null,
    }));

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
      topTopics,
      topNews,
    });
  } catch (err) {
    return apiError(500, 'Failed to compute analytics', String(err));
  }
}
