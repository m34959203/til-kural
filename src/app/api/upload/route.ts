import { promises as fs } from 'node:fs';
import path from 'node:path';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { apiError } from '@/lib/api';

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'video/mp4', 'video/webm']);
const MAX_SIZE = 15 * 1024 * 1024;

export async function POST(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) return apiError(401, 'Unauthorized');

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) return apiError(400, 'No file');

    if (!ALLOWED.has(file.type)) return apiError(400, 'Unsupported mime type', file.type);
    if (file.size > MAX_SIZE) return apiError(400, 'File too large (max 15MB)');

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'bin';
    const safeBase = crypto.randomUUID();
    const filename = `${safeBase}.${ext}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(path.join(uploadDir, filename), buffer);
    const url = `/uploads/${filename}`;

    const row = await db.insert('media', {
      filename,
      original_name: file.name,
      url,
      mime_type: file.type,
      size: file.size,
      uploaded_by: user.id,
      alt_kk: null,
      alt_ru: null,
    });

    return Response.json({ media: row }, { status: 201 });
  } catch (err) {
    return apiError(500, 'Upload failed', String(err));
  }
}

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) return apiError(401, 'Unauthorized');
  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get('limit') || 60), 200);
  const rows = await db.query('media', undefined, { orderBy: 'created_at', order: 'desc', limit });
  return Response.json({ media: rows });
}
