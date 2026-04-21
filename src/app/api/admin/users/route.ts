import { db } from '@/lib/db';
import { requireAdminApi, apiError } from '@/lib/api';
import { hashPassword } from '@/lib/auth';

const ALLOWED_ROLES = ['user', 'admin', 'editor', 'moderator'] as const;
const ALLOWED_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sanitize(u: Record<string, unknown>) {
  return {
    id: u.id,
    email: u.email,
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
  try {
    const rows = await db.query('users', undefined, { orderBy: 'created_at', order: 'desc', limit: 500 });
    const safe = rows.map(sanitize);
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
    return Response.json({ user: sanitize(row) }, { status: 201 });
  } catch (err) {
    return apiError(500, 'Failed to create user', String(err));
  }
}
