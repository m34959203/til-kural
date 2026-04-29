import crypto from 'node:crypto';
import { db } from '@/lib/db';
import { sendEmail } from '@/lib/push';

const TOKEN_TTL_MIN = 60;

/**
 * POST /api/auth/forgot-password { email }
 * Генерирует одноразовый reset-токен (1 час), сохраняет его hash в `password_resets`
 * и отправляет письмо со ссылкой `/reset-password?token=...`.
 *
 * Защита от user enumeration: всегда отвечаем 200 ok=true, даже если email не найден.
 * Rate-limit на этом эндпоинте — через middleware (`/api/auth/*` 10 req/min/IP).
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    if (!email) return Response.json({ ok: true }); // не раскрываем

    const user = await db.findOne('users', { email });
    if (!user) {
      // Намеренно молча выходим — атакующий не должен различать «есть/нет юзера».
      return Response.json({ ok: true });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MIN * 60_000).toISOString();

    try {
      await db.insert('password_resets', {
        user_id: user.id,
        token_hash: tokenHash,
        expires_at: expiresAt,
        used_at: null,
      });
    } catch (err) {
      // Если таблица не создана — не фейлим, просто логируем (миграция 008 создаёт её).
      console.warn('[forgot-password] password_resets insert skipped:', err);
      return Response.json({ ok: true });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
    const resetUrl = `${appUrl}/kk/reset-password?token=${token}`;
    const subject = 'Тіл-құрал — құпиясөзді қалпына келтіру / Сброс пароля';
    const text =
      `Салеметсіз бе, ${user.name}!\n\n` +
      `Сіз құпиясөзді қалпына келтіруді сұрадыңыз. Сілтеме 1 сағат жарамды:\n${resetUrl}\n\n` +
      `Егер бұл сіз болмасаңыз — хатты елемеңіз.\n\n` +
      `— Тіл-құрал`;

    await sendEmail(email, subject, text);

    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ ok: true, _err: String(err) }); // та же защита
  }
}
