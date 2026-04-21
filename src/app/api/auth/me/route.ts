import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return Response.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      language_level: user.language_level ?? null,
      mentor_avatar: user.mentor_avatar ?? null,
      xp_points: user.xp_points ?? 0,
      level: user.level ?? 1,
      current_streak: user.current_streak ?? 0,
      longest_streak: user.longest_streak ?? 0,
    },
  });
}
