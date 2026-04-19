import { apiError } from '@/lib/api';

export async function POST(request: Request) {
  try {
    let name = '', email = '', subject = '', message = '';
    const ct = request.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      const body = await request.json();
      ({ name, email, subject, message } = body);
    } else {
      const form = await request.formData();
      name = String(form.get('name') || '');
      email = String(form.get('email') || '');
      subject = String(form.get('subject') || '');
      message = String(form.get('message') || '');
    }

    if (!name || !email || !message) return apiError(400, 'Missing fields');
    if (message.length > 5000) return apiError(400, 'Message too long');

    // Forward via email if SMTP configured, otherwise just log
    try {
      const nodemailer = await import('nodemailer').catch(() => null);
      if (nodemailer && process.env.SMTP_HOST) {
        const t = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT || 587),
          secure: process.env.SMTP_SECURE === 'true',
          auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
        });
        await t.sendMail({
          from: process.env.SMTP_FROM || 'no-reply@til-kural.kz',
          to: process.env.CONTACT_TO || 'info@til-kural.kz',
          subject: `[Tіл-құрал] ${subject || 'Новое сообщение'}`,
          text: `Имя: ${name}\nEmail: ${email}\n\n${message}`,
        });
      } else {
        console.log('[contact]', { name, email, subject, message });
      }
    } catch (err) {
      console.error('[contact] mail error:', err);
    }

    return Response.json({ ok: true });
  } catch (err) {
    return apiError(500, 'Contact failed', String(err));
  }
}
