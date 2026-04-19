import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { apiError } from '@/lib/api';

export async function GET() {
  return Response.json({ publicKey: process.env.VAPID_PUBLIC_KEY || null });
}

export async function POST(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) return apiError(401, 'Unauthorized');
  try {
    const sub = await request.json();
    if (!sub?.endpoint || !sub?.keys?.p256dh || !sub?.keys?.auth) {
      return apiError(400, 'Invalid subscription');
    }
    const existing = await db.findOne('push_subscriptions', { endpoint: sub.endpoint });
    if (existing) {
      if (existing.user_id !== user.id) await db.update('push_subscriptions', existing.id, { user_id: user.id });
      return Response.json({ ok: true });
    }
    await db.insert('push_subscriptions', {
      user_id: user.id,
      endpoint: sub.endpoint,
      p256dh: sub.keys.p256dh,
      auth: sub.keys.auth,
    });
    return Response.json({ ok: true }, { status: 201 });
  } catch (err) {
    return apiError(500, 'Subscribe failed', String(err));
  }
}

export async function DELETE(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) return apiError(401, 'Unauthorized');
  const { endpoint } = await request.json();
  const sub = await db.findOne('push_subscriptions', { endpoint });
  if (sub?.user_id === user.id) await db.delete('push_subscriptions', sub.id);
  return Response.json({ ok: true });
}
