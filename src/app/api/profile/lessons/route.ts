import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

/**
 * GET /api/profile/lessons
 * Возвращает массив lesson_id, которые юзер завершил.
 */
export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) return Response.json({ completedLessonIds: [] });
  try {
    const rows = await db.query('user_lessons', { user_id: user.id, completed: true });
    const ids = rows.map((r) => r.lesson_id).filter((x): x is string => typeof x === 'string');
    return Response.json({ completedLessonIds: ids });
  } catch {
    return Response.json({ completedLessonIds: [] });
  }
}
