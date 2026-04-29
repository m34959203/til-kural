import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { awardProgress } from '@/lib/award-progress';

/**
 * POST /api/lessons/[id]/complete
 * Тело: { score?: number, weak_points?: string[] }
 *
 * Регистрирует прохождение урока пользователем (idempotent: повторный POST
 * обновляет score / weak_points), и начисляет XP/streak/level/achievements.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromRequest(request);
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: lessonId } = await params;
  const body = (await request.json().catch(() => ({}))) as {
    score?: number;
    weak_points?: string[];
  };
  const score = typeof body.score === 'number' ? Math.max(0, Math.min(100, body.score)) : 0;
  const weakPoints = Array.isArray(body.weak_points) ? body.weak_points : [];

  // Урок существует?
  const lesson = await db.findOne('lessons', { id: lessonId });
  if (!lesson) return Response.json({ error: 'Lesson not found' }, { status: 404 });

  // upsert user_lessons (идемпотентно). weak_points — jsonb, передаём строкой,
  // иначе node-pg сериализует JS-массив как PG array literal `{...}`.
  const weakPointsJson = JSON.stringify(weakPoints);
  const existing = await db.findOne('user_lessons', { user_id: user.id, lesson_id: lessonId });
  if (existing) {
    await db.update('user_lessons', existing.id, {
      completed: true,
      score,
      weak_points: weakPointsJson,
      completed_at: new Date().toISOString(),
    });
  } else {
    await db.insert('user_lessons', {
      user_id: user.id,
      lesson_id: lessonId,
      completed: true,
      score,
      weak_points: weakPointsJson,
      completed_at: new Date().toISOString(),
    });
  }

  // XP/streak/achievements начисляем только при первом завершении —
  // повторный complete не должен дублировать награды.
  let progress = null;
  if (!existing || !existing.completed) {
    progress = await awardProgress(user.id, 'lesson_complete', { score });
  }

  return Response.json({ ok: true, lesson_id: lessonId, score, progress });
}
