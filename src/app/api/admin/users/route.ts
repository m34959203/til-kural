import { db } from '@/lib/db';
import { requireAdminApi, apiError } from '@/lib/api';
import { hashPassword } from '@/lib/auth';
import { maskEmail, shouldUnmaskEmail, recordAudit } from '@/lib/audit';

const ALLOWED_ROLES = ['user', 'admin', 'editor', 'moderator'] as const;
const ALLOWED_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sanitize(u: Record<string, unknown>, opts: { unmask: boolean }) {
  const email = typeof u.email === 'string' ? u.email : '';
  return {
    id: u.id,
    email: opts.unmask ? email : maskEmail(email),
    name: u.name,
    role: u.role,
    phone: u.phone,
    language_level: u.language_level,
    xp_points: u.xp_points,
    level: u.level,
    current_streak: u.current_streak,
    longest_streak: u.longest_streak,
    created_at: u.created_at,
  };
}

export async function GET(request: Request) {
  const auth = await requireAdminApi(request);
  if (auth instanceof Response) return auth;
  const url = new URL(request.url);
  const format = url.searchParams.get('format');
  try {
    const rows = await db.query('users', undefined, { orderBy: 'created_at', order: 'desc', limit: 500 });

    // CSV-экспорт (audit P1): доступен только super-admin'ам, чтобы PII
    // не утекал «на всякий случай».
    if (format === 'csv') {
      const isSuper = (process.env.SUPER_ADMIN_EMAILS || '')
        .split(',').map((e) => e.trim().toLowerCase()).filter(Boolean)
        .includes(auth.email.toLowerCase());
      if (!isSuper) {
        return apiError(403, 'CSV export reserved for super-admin (SUPER_ADMIN_EMAILS)');
      }
      const escape = (v: unknown) => {
        const s = v == null ? '' : String(v);
        return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
      };
      const cols = ['id','email','name','role','phone','language_level','xp_points','level','current_streak','longest_streak','created_at'];
      const lines = [cols.join(',')];
      for (const u of rows) {
        lines.push(cols.map((c) => escape((u as Record<string, unknown>)[c])).join(','));
      }
      await recordAudit(request, auth, {
        action: 'users.export_csv',
        target_type: 'users',
        metadata: { count: rows.length },
      });
      return new Response(lines.join('\n'), {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="users-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    // Email не-self раскрываем только super-admin'ам (env SUPER_ADMIN_EMAILS).
    // Обычные admin/editor/moderator видят маску a***@til-kural.kz —
    // снижает риск утечки PII при компрометации одного admin-аккаунта.
    const safe = rows.map((u) =>
      sanitize(u, { unmask: shouldUnmaskEmail(auth, typeof u.email === 'string' ? u.email : '') }),
    );
    return Response.json({ users: safe });
  } catch (err) {
    return apiError(500, 'Failed to load users', String(err));
  }
}

export async function POST(request: Request) {
  const auth = await requireAdminApi(request);
  if (auth instanceof Response) return auth;
  try {
    const body = await request.json().catch(() => ({}));
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const role = typeof body.role === 'string' ? body.role : 'user';
    const phone = typeof body.phone === 'string' ? body.phone.trim() : null;
    const language_level =
      typeof body.language_level === 'string' && (ALLOWED_LEVELS as readonly string[]).includes(body.language_level)
        ? body.language_level
        : null;

    if (!email || !EMAIL_RE.test(email)) return apiError(400, 'Invalid email');
    if (!name) return apiError(400, 'Name is required');
    if (!password || password.length < 8) return apiError(400, 'Password must be at least 8 characters');
    if (!(ALLOWED_ROLES as readonly string[]).includes(role)) return apiError(400, 'Invalid role');

    const existing = await db.findOne('users', { email });
    if (existing) return apiError(409, 'Email already exists');

    const password_hash = await hashPassword(password);
    const row = await db.insert('users', {
      email,
      password_hash,
      name,
      role,
      phone: phone || null,
      language_level,
    });
    await recordAudit(request, auth, {
      action: 'user.create',
      target_type: 'user',
      target_id: String(row?.id ?? ''),
      metadata: { email, role, language_level },
    });
    return Response.json({ user: sanitize(row, { unmask: true }) }, { status: 201 });
  } catch (err) {
    return apiError(500, 'Failed to create user', String(err));
  }
}
