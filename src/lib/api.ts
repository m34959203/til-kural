/* eslint-disable @typescript-eslint/no-explicit-any */
import { getUserFromRequest, UserPayload } from './auth';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * CSRF-проверка для не-GET запросов: требуем, чтобы Origin/Referer совпадал с одним
 * из доверенных источников. Защищает от cross-site POST с cookie-аутентификацией
 * (SameSite=Lax не блокирует top-level POST во всех браузерах).
 */
export function checkCsrf(request: Request): Response | null {
  if (SAFE_METHODS.has(request.method)) return null;
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  // Если используется только Bearer-токен (не cookie) — CSRF не страшен,
  // потому что атакующий не может прочитать localStorage. Но политикой
  // делаем Origin-check всегда, чтобы и cookie-flow был защищён.

  const trusted = new Set<string>();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (appUrl) {
    try { trusted.add(new URL(appUrl).origin); } catch { /* ignore */ }
  }
  // Доверяем самому хосту (на случай прямого обращения).
  const host = request.headers.get('host');
  if (host) {
    trusted.add(`https://${host}`);
    trusted.add(`http://${host}`);
  }

  const candidate = origin || (referer ? safeOrigin(referer) : null);
  if (!candidate) {
    return Response.json({ error: 'CSRF: missing Origin/Referer' }, { status: 403 });
  }
  if (!trusted.has(candidate)) {
    return Response.json({ error: 'CSRF: untrusted origin' }, { status: 403 });
  }
  return null;
}

function safeOrigin(url: string): string | null {
  try { return new URL(url).origin; } catch { return null; }
}

export async function requireAdminApi(request: Request): Promise<UserPayload | Response> {
  // DEV-режим: при DEV_ADMIN_BYPASS=1 пропускаем auth, отдаём синтетического admin.
  // SECURITY: работает ТОЛЬКО когда NODE_ENV !== 'production'. На проде (даже если
  // переменная случайно попала в окружение) bypass игнорируется — иначе CF-tunnel
  // открыл бы всю админку любому в интернете.
  if (process.env.NODE_ENV !== 'production' && process.env.DEV_ADMIN_BYPASS === '1') {
    return { id: 'dev-admin', email: 'dev@til-kural.local', role: 'admin', name: 'Dev Admin' };
  }
  // CSRF-защита для мутирующих запросов.
  const csrf = checkCsrf(request);
  if (csrf) return csrf;
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

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Возвращает true для строк, похожих на UUID v1-v5. */
export function isUuid(id: string | null | undefined): id is string {
  return typeof id === 'string' && UUID_RE.test(id);
}

export function requireFields<T extends Record<string, any>>(body: T, fields: (keyof T)[]): string[] {
  return fields.filter((f) => body[f] === undefined || body[f] === null || body[f] === '').map(String);
}

// Транслитерация кириллицы (включая казахские специфические) в латиницу,
// чтобы slug'и оставались URL-friendly даже для kk/ru заголовков.
const CYRILLIC_MAP: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'zh', з: 'z',
  и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
  с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh',
  щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
  ә: 'a', ғ: 'g', қ: 'q', ң: 'ng', ө: 'o', ұ: 'u', ү: 'u', һ: 'h', і: 'i',
};

export function slugify(input: string): string {
  const lower = input.toLowerCase();
  let translit = '';
  for (const ch of lower) {
    translit += CYRILLIC_MAP[ch] ?? ch;
  }
  return translit
    .replace(/[^a-z0-9]+/g, '-')
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
