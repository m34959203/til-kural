import { db } from '@/lib/db';
import { requireAdminApi, apiError } from '@/lib/api';

/**
 * GET /api/admin/audit-log?action=...&limit=200&offset=0
 *
 * Возвращает последние записи журнала админ-действий.
 * Фильтры:
 *   - action — точное совпадение ('user.create', 'settings.update', ...)
 *   - actor  — actor_email (точное)
 *   - target — target_id (точное)
 */
export async function GET(request: Request) {
  const auth = await requireAdminApi(request);
  if (auth instanceof Response) return auth;

  const url = new URL(request.url);
  const action = url.searchParams.get('action');
  const actor = url.searchParams.get('actor');
  const target = url.searchParams.get('target');
  const limitRaw = Number(url.searchParams.get('limit') ?? '100');
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 500) : 100;
  const offsetRaw = Number(url.searchParams.get('offset') ?? '0');
  const offset = Number.isFinite(offsetRaw) ? Math.max(offsetRaw, 0) : 0;

  const filter: Record<string, unknown> = {};
  if (action) filter.action = action;
  if (actor) filter.actor_email = actor;
  if (target) filter.target_id = target;

  try {
    const rows = await db.query(
      'audit_log',
      Object.keys(filter).length ? filter : undefined,
      { orderBy: 'created_at', order: 'desc', limit, offset },
    );
    return Response.json({ items: rows, limit, offset });
  } catch (err) {
    return apiError(500, 'Audit-log fetch failed', String(err));
  }
}
