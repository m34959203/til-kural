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
