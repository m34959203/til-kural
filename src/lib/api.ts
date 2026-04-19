/* eslint-disable @typescript-eslint/no-explicit-any */
import { getUserFromRequest, UserPayload } from './auth';

export async function requireAdminApi(request: Request): Promise<UserPayload | Response> {
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
