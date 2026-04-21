import { db } from '@/lib/db';
import { requireAdminApi, apiError } from '@/lib/api';

/**
 * GET /api/media — список медиафайлов для админки (admin/editor/moderator).
 * Сортировка по дате загрузки (descending), лимит 100.
 * Возвращает минимальный маппинг для грида Media Library.
 */
export async function GET(request: Request) {
  const auth = await requireAdminApi(request);
  if (auth instanceof Response) return auth;
  try {
    // Колонка в схеме — created_at (см. sql/002_additions.sql), экспортируем как uploaded_at.
    const rows = await db.query('media', undefined, {
      orderBy: 'created_at',
      order: 'desc',
      limit: 100,
    });
    const media = rows.map((r) => ({
      id: r.id,
      url: r.url,
      filename: r.original_name || r.filename,
      mime_type: r.mime_type || null,
      size_bytes: typeof r.size === 'number' ? r.size : null,
      uploaded_at: r.created_at || null,
    }));
    return Response.json({ media });
  } catch (err) {
    return apiError(500, 'Failed to load media', String(err));
  }
}
