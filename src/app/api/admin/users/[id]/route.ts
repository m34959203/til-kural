import { db } from '@/lib/db';
import { requireAdminApi, apiError } from '@/lib/api';
import { hashPassword } from '@/lib/auth';

const ALLOWED_FIELDS = ['name', 'role', 'phone', 'language_level'];

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi(request);
  if (auth instanceof Response) return auth;
  const { id } = await params;
  try {
    const body = await request.json();
    const patch: Record<string, unknown> = {};
    for (const k of ALLOWED_FIELDS) if (k in body) patch[k] = body[k];
    if (patch.role && !['user', 'admin', 'editor', 'moderator'].includes(String(patch.role))) {
      return apiError(400, 'Invalid role');
    }
    const row = await db.update('users', id, patch);
    if (!row) return apiError(404, 'Not found');
    return Response.json({ user: row });
  } catch (err) {
    return apiError(500, 'Failed to update user', String(err));
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi(request);
  if (auth instanceof Response) return auth;
  const { id } = await params;
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action') || '';
    const body = await request.json().catch(() => ({}));

    // Универсальный reset-password: либо ?action=reset-password, либо просто body.new_password
    if (action === 'reset-password' || typeof body.new_password === 'string') {
      const newPassword = typeof body.new_password === 'string' ? body.new_password : '';
      if (!newPassword || newPassword.length < 8) return apiError(400, 'Weak password');
      const existing = await db.findOne('users', { id });
      if (!existing) return apiError(404, 'Not found');
      const password_hash = await hashPassword(newPassword);
      await db.update('users', id, { password_hash });
      return Response.json({ ok: true });
    }

    return apiError(400, 'Unknown PATCH action');
  } catch (err) {
    return apiError(500, 'Failed to patch user', String(err));
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi(request);
  if (auth instanceof Response) return auth;
  const { id } = await params;
  const ok = await db.delete('users', id);
  if (!ok) return apiError(404, 'Not found');
  return Response.json({ ok: true });
}
