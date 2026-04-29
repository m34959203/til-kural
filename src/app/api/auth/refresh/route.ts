import { db } from '@/lib/db';
import { signToken } from '@/lib/auth';
import {
  REFRESH_COOKIE_NAME,
  buildClearRefreshCookie,
  buildRefreshCookie,
  findValidRefresh,
  generateRefreshToken,
  readCookie,
  revokeRefresh,
  storeRefreshToken,
} from '@/lib/refresh-tokens';

const ACCESS_COOKIE_MAX_AGE = 60 * 60; // 1h

function buildAuthCookie(token: string): string {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `tk-token=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${ACCESS_COOKIE_MAX_AGE}${secure}`;
}

/**
 * POST /api/auth/refresh
 * Читает refresh-токен из cookie tk-refresh, выдаёт новые access + refresh
 * (rotation — старый отзывается). Если токен невалиден / отозван / истёк —
 * возвращает 401 + чистит обе cookie.
 */
export async function POST(request: Request) {
  const refresh = readCookie(request, REFRESH_COOKIE_NAME);
  if (!refresh) {
    return Response.json({ error: 'No refresh token' }, { status: 401 });
  }

  const row = await findValidRefresh(refresh);
  if (!row) {
    const res = Response.json({ error: 'Invalid or expired refresh token' }, { status: 401 });
    res.headers.append('Set-Cookie', buildClearRefreshCookie());
    return res;
  }

  const user = await db.findOne('users', { id: row.user_id });
  if (!user) {
    return Response.json({ error: 'User not found' }, { status: 401 });
  }

  // Rotation: новый refresh-токен, старый — отзываем.
  await revokeRefresh(refresh);
  const { token: newRefreshToken, hash: newRefreshHash } = generateRefreshToken();
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim()
    || request.headers.get('x-real-ip') || null;
  const ua = request.headers.get('user-agent') || null;
  await storeRefreshToken(String(user.id), newRefreshHash, { ip, ua });

  const accessToken = signToken({
    id: String(user.id),
    email: String(user.email),
    role: String(user.role),
    name: String(user.name),
  });

  const res = Response.json({ token: accessToken });
  res.headers.append('Set-Cookie', buildAuthCookie(accessToken));
  res.headers.append('Set-Cookie', buildRefreshCookie(newRefreshToken));
  return res;
}
