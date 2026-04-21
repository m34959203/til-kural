import { db } from '@/lib/db';
import { verifyPassword, signToken } from '@/lib/auth';
import { validateLogin } from '@/lib/validators';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const errors = validateLogin(body);
    if (errors.length > 0) {
      return Response.json({ errors }, { status: 400 });
    }

    const user = await db.findOne('users', { email: body.email });
    if (!user) {
      return Response.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const valid = await verifyPassword(body.password, user.password_hash);
    if (!valid) {
      return Response.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = signToken({ id: user.id, email: user.email, role: user.role, name: user.name });

    return Response.json({
      token,
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
  } catch (error) {
    return Response.json({ error: 'Login failed', details: String(error) }, { status: 500 });
  }
}
