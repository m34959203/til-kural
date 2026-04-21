import { getUserFromRequest } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const userRow = await db.findOne('users', { id: user.id });
    const filter = { user_id: user.id };

    const [lessons_completed, tests_taken, photo_checks, writing_checks, certificates] =
      await Promise.all([
        db.count('user_lessons', { ...filter, completed: true }).catch(() => 0),
        db.count('test_sessions', filter).catch(() => 0),
        db.count('photo_checks', filter).catch(() => 0),
        db.count('writing_checks', filter).catch(() => 0),
        db.count('certificates', filter).catch(() => 0),
      ]);

    const [recentTests, recentCertificates, recentPhotos, recentWriting] = await Promise.all([
      db
        .query('test_sessions', filter, { orderBy: 'completed_at', order: 'desc', limit: 10 })
        .catch(() => []),
      db
        .query('certificates', filter, { orderBy: 'issued_at', order: 'desc', limit: 10 })
        .catch(() => []),
      db
        .query('photo_checks', filter, { orderBy: 'created_at', order: 'desc', limit: 10 })
        .catch(() => []),
      db
        .query('writing_checks', filter, { orderBy: 'created_at', order: 'desc', limit: 10 })
        .catch(() => []),
    ]);

    return Response.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        mentor_avatar: userRow?.mentor_avatar ?? 'abai',
      },
      totals: {
        lessons_completed,
        tests_taken,
        photo_checks,
        writing_checks,
        certificates,
        current_streak: userRow?.current_streak ?? 0,
        longest_streak: userRow?.longest_streak ?? 0,
        xp_points: userRow?.xp_points ?? 0,
        level: userRow?.level ?? 1,
        language_level: userRow?.language_level ?? null,
      },
      recent: {
        tests: recentTests.map((t) => ({
          id: t.id,
          test_type: t.test_type,
          topic: t.topic,
          score: t.score,
          level_result: t.level_result,
          completed_at: t.completed_at,
        })),
        certificates: recentCertificates.map((c) => ({
          id: c.id,
          level: c.level,
          score: c.score,
          certificate_number: c.certificate_number,
          issued_at: c.issued_at,
        })),
        photos: recentPhotos.map((p) => ({
          id: p.id,
          overall_score: p.overall_score,
          created_at: p.created_at,
        })),
        writing: recentWriting.map((w) => ({
          id: w.id,
          score: w.score,
          created_at: w.created_at,
        })),
      },
    });
  } catch (err) {
    return Response.json({ error: 'Stats fetch failed', details: String(err) }, { status: 500 });
  }
}
