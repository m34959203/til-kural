import { db } from '@/lib/db';
import { sendPushToUser, sendEmail } from '@/lib/push';
import { apiError } from '@/lib/api';

export async function POST(request: Request) {
  const token = request.headers.get('x-cron-token');
  if (!process.env.CRON_TOKEN || token !== process.env.CRON_TOKEN) {
    return apiError(401, 'Invalid cron token');
  }

  const today = new Date().toISOString().slice(0, 10);
  let users: { id: string; email: string; name: string; current_streak: number; last_activity_date?: string }[];

  if (db.isPostgres) {
    users = await db.raw(`
      SELECT id, email, name, current_streak, last_activity_date::text AS last_activity_date
      FROM users
      WHERE current_streak > 0
        AND (last_activity_date IS NULL OR last_activity_date < $1::date)
    `, [today]);
  } else {
    const all = await db.query('users');
    users = all.filter((u) => u.current_streak > 0 && (!u.last_activity_date || u.last_activity_date < today)) as any;
  }

  let pushed = 0;
  let emailed = 0;
  for (const u of users) {
    const p = await sendPushToUser(u.id, {
      title: 'Тіл-құрал',
      body: `Streak ${u.current_streak} күн — бүгін жалғастырыңыз!`,
      url: '/kk/learn',
    });
    if (p > 0) pushed += p;
    else if (u.email) {
      const ok = await sendEmail(
        u.email,
        'Тіл-құрал — streak',
        `Сәлеметсіз бе, ${u.name}!\n\nСіздің ағымдағы streak: ${u.current_streak} күн. Бүгін бір жаттығу жасап, серияны үзбеңіз: https://til-kural.kz/kk/learn`,
      );
      if (ok) emailed++;
    }
  }

  return Response.json({ ok: true, users: users.length, pushed, emailed });
}
