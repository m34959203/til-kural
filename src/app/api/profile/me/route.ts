import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { apiError } from '@/lib/api';

function buildClearCookie(): string {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `tk-token=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0${secure}`;
}

/**
 * DELETE /api/profile/me
 * Удаление собственного аккаунта (right-to-delete по политике конфиденциальности).
 * Делает GDPR-style анонимизацию: чистим email/name/phone, ставим deleted_at,
 * удаляем токен-сессии. Прогресс/статистика остаются обезличенными.
 *
 * Для admin-роли блокируем — иначе можно случайно убить «последнего» админа.
 * Если нужно удалить admin'а — пусть это сделает другой admin через /api/admin/users/:id.
 */
export async function DELETE(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) return apiError(401, 'Unauthorized');
  if (user.role && user.role !== 'user') {
    return apiError(403, 'Admin/editor accounts must be deleted via admin panel');
  }

  try {
    const anonEmail = `deleted-${user.id}@til-kural.deleted`;
    await db.update('users', user.id, {
      email: anonEmail,
      name: 'Жойылған пайдаланушы',
      phone: null,
      password_hash: '',
      role: 'user',
      mentor_avatar: null,
      // deleted_at колонка опциональна — если её нет в схеме, db.update просто
      // отсеет неизвестные ключи (Postgres-режим скипнёт; in-memory примет).
      deleted_at: new Date().toISOString(),
    } as Record<string, unknown>);

    // Удалим push-подписки и password_resets, чтобы не приходили уведомления.
    try {
      const subs = await db.query('push_subscriptions', { user_id: user.id });
      for (const s of subs) await db.delete('push_subscriptions', s.id);
    } catch { /* таблица может отсутствовать — ok */ }
    try {
      const resets = await db.query('password_resets', { user_id: user.id });
      for (const r of resets) await db.delete('password_resets', r.id);
    } catch { /* ok */ }
  } catch (err) {
    return apiError(500, 'Account deletion failed', String(err));
  }

  const res = Response.json({ ok: true });
  res.headers.append('Set-Cookie', buildClearCookie());
  return res;
}
