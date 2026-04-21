/* eslint-disable @typescript-eslint/no-explicit-any */
import { getUserFromRequest, UserPayload } from './auth';

export async function requireAdminApi(request: Request): Promise<UserPayload | Response> {
  // DEV-режим: при DEV_ADMIN_BYPASS=1 пропускаем auth, отдаём синтетического admin.
  // SECURITY: работает ТОЛЬКО когда NODE_ENV !== 'production'. На проде (даже если
  // переменная случайно попала в окружение) bypass игнорируется — иначе CF-tunnel
  // открыл бы всю админку любому в интернете.
  if (process.env.NODE_ENV !== 'production' && process.env.DEV_ADMIN_BYPASS === '1') {
    return { id: 'dev-admin', email: 'dev@til-kural.local', role: 'admin', name: 'Dev Admin' };
  }
  const user = await getUserFromRequest(request);
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  if (!['admin', 'editor', 'moderator'].includes(user.role)) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }
  return user;
}

export function apiError(status: number, message: string, details?: unknown) {
  return Response.json({ error: message, details }, { status });
}

export function requireFields<T extends Record<string, any>>(body: T, fields: (keyof T)[]): string[] {
  return fields.filter((f) => body[f] === undefined || body[f] === null || body[f] === '').map(String);
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || `item-${Date.now()}`;
}

/**
 * Разбор серверной пагинации/поиска из URLSearchParams.
 *
 * Семантика (совпадает с паттерном smart-library-cbs):
 *   - `page`  — 1-based. `page < 1` → 1.
 *   - `limit` — 1..200 (если >200 — урезаем до 200). По умолчанию 50.
 *   - `search` — строка, trim. Пустая/отсутствует → undefined.
 *   - `paginated` — true, если в URL явно передан `page` или `limit` (тогда в ответ нужна pagination-meta).
 */
export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
  search?: string;
  paginated: boolean;
}

export function parsePagination(searchParams: URLSearchParams, defaultLimit = 50): PaginationParams {
  const hasPage = searchParams.has('page');
  const hasLimit = searchParams.has('limit');
  const hasSearch = searchParams.has('search');

  let page = Number(searchParams.get('page') || 1);
  if (!Number.isFinite(page) || page < 1) page = 1;

  let limit = Number(searchParams.get('limit') || defaultLimit);
  if (!Number.isFinite(limit) || limit < 1) limit = defaultLimit;
  if (limit > 200) limit = 200;

  const searchRaw = searchParams.get('search');
  const search = searchRaw && searchRaw.trim() ? searchRaw.trim() : undefined;

  return {
    page,
    limit,
    offset: (page - 1) * limit,
    search,
    paginated: hasPage || hasLimit || hasSearch,
  };
}

export function paginationMeta(total: number, page: number, limit: number) {
  return {
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}
