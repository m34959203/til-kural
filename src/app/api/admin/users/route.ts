import { db } from '@/lib/db';
import { requireAdminApi, apiError } from '@/lib/api';

export async function GET(request: Request) {
  const auth = await requireAdminApi(request);
  if (auth instanceof Response) return auth;
  try {
    const rows = await db.query('users', undefined, { orderBy: 'created_at', order: 'desc', limit: 500 });
    const safe = rows.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      phone: u.phone,
      language_level: u.language_level,
      xp_points: u.xp_points,
      level: u.level,
      current_streak: u.current_streak,
      longest_streak: u.longest_streak,
      created_at: u.created_at,
    }));
    return Response.json({ users: safe });
  } catch (err) {
    return apiError(500, 'Failed to load users', String(err));
  }
}
