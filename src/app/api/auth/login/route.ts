import { db } from '@/lib/db';
import { verifyPassword, signToken } from '@/lib/auth';
import { validateLogin } from '@/lib/validators';
import {
  generateRefreshToken,
  storeRefreshToken,
  buildRefreshCookie,
} from '@/lib/refresh-tokens';

// SECURITY (audit P1-sec): access JWT короткий — 1 час (см. lib/auth.ts).
// Долгоживущий refresh-токен — отдельный httpOnly cookie tk-refresh.
const ACCESS_COOKIE_MAX_AGE = 60 * 60; // 1h, синхронизировать с ACCESS_TOKEN_TTL в auth.ts

function buildAuthCookie(token: string): string {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `tk-token=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${ACCESS_COOKIE_MAX_AGE}${secure}`;
}

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

    // Refresh-токен (30d) — отдельная запись в refresh_tokens с возможностью отзыва.
    const { token: refreshToken, hash: refreshHash } = generateRefreshToken();
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim()
      || request.headers.get('x-real-ip') || null;
    const ua = request.headers.get('user-agent') || null;
    await storeRefreshToken(user.id, refreshHash, { ip, ua });

    const res = Response.json({
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
    res.headers.append('Set-Cookie', buildAuthCookie(token));
    res.headers.append('Set-Cookie', buildRefreshCookie(refreshToken));
    return res;
  } catch (error) {
    return Response.json({ error: 'Login failed', details: String(error) }, { status: 500 });
  }
}
