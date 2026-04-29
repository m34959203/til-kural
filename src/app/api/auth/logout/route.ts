// Очищаем cookie tk-token и tk-refresh + отзываем refresh-токен в БД (audit P1-sec).
// localStorage.token больше не используется (см. login/register pages).

import {
  REFRESH_COOKIE_NAME,
  buildClearRefreshCookie,
  readCookie,
  revokeRefresh,
} from '@/lib/refresh-tokens';

function buildClearCookie(): string {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `tk-token=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0${secure}`;
}

async function handleLogout(request: Request) {
  const refresh = readCookie(request, REFRESH_COOKIE_NAME);
  if (refresh) {
    await revokeRefresh(refresh);
  }
  const res = Response.json({ ok: true });
  res.headers.append('Set-Cookie', buildClearCookie());
  res.headers.append('Set-Cookie', buildClearRefreshCookie());
  return res;
}

export async function POST(request: Request) {
  return handleLogout(request);
}

export async function GET(request: Request) {
  return handleLogout(request);
}
