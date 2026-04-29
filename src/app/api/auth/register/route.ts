import { db } from '@/lib/db';
import { hashPassword, signToken } from '@/lib/auth';
import { validateRegistration } from '@/lib/validators';
import {
  generateRefreshToken,
  storeRefreshToken,
  buildRefreshCookie,
} from '@/lib/refresh-tokens';

// SECURITY (P1-sec): синхронизировано с /api/auth/login.
const ACCESS_COOKIE_MAX_AGE = 60 * 60; // 1h

function buildAuthCookie(token: string): string {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `tk-token=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${ACCESS_COOKIE_MAX_AGE}${secure}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const errors = validateRegistration(body);
    if (errors.length > 0) {
      return Response.json({ errors }, { status: 400 });
    }

    const existing = await db.findOne('users', { email: body.email });
    if (existing) {
      return Response.json({ error: 'Email already registered' }, { status: 409 });
    }

    const password_hash = await hashPassword(body.password);
    const user = await db.insert('users', {
      email: body.email,
      password_hash,
      name: body.name,
      phone: body.phone || null,
      role: 'user',
      language_level: null,
      xp_points: 0,
      level: 1,
      current_streak: 0,
      longest_streak: 0,
      mentor_avatar: 'abai',
      created_at: new Date().toISOString(),
    });

    const token = signToken({ id: user.id, email: user.email, role: user.role, name: user.name });

    const res = Response.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        language_level: user.language_level ?? null,
        mentor_avatar: user.mentor_avatar ?? 'abai',
        xp_points: user.xp_points ?? 0,
        level: user.level ?? 1,
        current_streak: user.current_streak ?? 0,
        longest_streak: user.longest_streak ?? 0,
      },
    });
    // Зеркалим поведение /login: ставим httpOnly cookie tk-token, чтобы middleware
    // не отбрасывал свежезарегистрированного admin/editor на /login.
    res.headers.append('Set-Cookie', buildAuthCookie(token));

    // Refresh-токен (30d, отзываемый).
    const { token: refreshToken, hash: refreshHash } = generateRefreshToken();
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim()
      || request.headers.get('x-real-ip') || null;
    const ua = request.headers.get('user-agent') || null;
    await storeRefreshToken(user.id, refreshHash, { ip, ua });
    res.headers.append('Set-Cookie', buildRefreshCookie(refreshToken));

    return res;
  } catch (error) {
    return Response.json({ error: 'Registration failed', details: String(error) }, { status: 500 });
  }
}
