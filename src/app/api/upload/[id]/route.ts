import { promises as fs } from 'node:fs';
import path from 'node:path';
import { db } from '@/lib/db';
import { requireAdminApi, apiError } from '@/lib/api';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi(request);
  if (auth instanceof Response) return auth;
  const { id } = await params;
  const row = await db.findOne('media', { id });
  if (!row) return apiError(404, 'Not found');
  try {
    await fs.unlink(path.join(process.cwd(), 'public', 'uploads', row.filename));
  } catch { /* ok */ }
  await db.delete('media', id);
  return Response.json({ ok: true });
}
