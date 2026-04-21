// Очищаем httpOnly cookie tk-token. Клиенту стоит дополнительно вычистить
// localStorage.token со своей стороны — сервер на это влиять не может (httpOnly != localStorage).

function buildClearCookie(): string {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  // Max-Age=0 + пустое значение — стандартный способ стереть cookie.
  return `tk-token=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0${secure}`;
}

export async function POST() {
  const res = Response.json({ ok: true });
  res.headers.append('Set-Cookie', buildClearCookie());
  return res;
}

// GET-вариант удобен для <a href="/api/auth/logout"> как быстрый fallback.
export async function GET() {
  const res = Response.json({ ok: true });
  res.headers.append('Set-Cookie', buildClearCookie());
  return res;
}
