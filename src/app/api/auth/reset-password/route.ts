import crypto from 'node:crypto';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { apiError } from '@/lib/api';

/**
 * POST /api/auth/reset-password { token, password }
 * Принимает одноразовый токен (32 байта, hex) и устанавливает новый пароль.
 * Токен — single-use: после использования помечается `used_at = NOW()`.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const token = typeof body?.token === 'string' ? body.token.trim() : '';
    const password = typeof body?.password === 'string' ? body.password : '';
    if (!token || token.length < 32) return apiError(400, 'Invalid token');
    if (!password || password.length < 8) return apiError(400, 'Weak password');

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const reset = await db.findOne('password_resets', { token_hash: tokenHash });
    if (!reset) return apiError(400, 'Invalid or expired token');
    if (reset.used_at) return apiError(400, 'Token already used');
    if (reset.expires_at && new Date(reset.expires_at).getTime() < Date.now()) {
      return apiError(400, 'Token expired');
    }

    const passwordHashNew = await hashPassword(password);
    await db.update('users', reset.user_id, { password_hash: passwordHashNew });
    await db.update('password_resets', reset.id, { used_at: new Date().toISOString() });

    return Response.json({ ok: true });
  } catch (err) {
    return apiError(500, 'Reset failed', String(err));
  }
}
