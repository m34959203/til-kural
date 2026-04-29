import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { apiError } from '@/lib/api';

const ALLOWED_MENTORS = new Set(['abai', 'baitursynuly', 'auezov']);

/**
 * PUT /api/profile/mentor { mentor: 'abai' | 'baitursynuly' | 'auezov' }
 * Сохраняет выбор наставника текущего юзера.
 */
export async function PUT(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) return apiError(401, 'Unauthorized');
  try {
    const body = await request.json().catch(() => ({}));
    const mentor = typeof body?.mentor === 'string' ? body.mentor : '';
    if (!ALLOWED_MENTORS.has(mentor)) return apiError(400, 'Invalid mentor');
    await db.update('users', user.id, { mentor_avatar: mentor });
    return Response.json({ ok: true, mentor_avatar: mentor });
  } catch (err) {
    return apiError(500, 'Failed to save mentor', String(err));
  }
}
