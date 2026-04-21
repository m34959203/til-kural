import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

export interface UserPayload {
  id: string;
  email: string;
  role: string;
  name: string;
  // Optional extended fields — не кладутся в JWT, подтягиваются из БД в getUserFromRequest
  language_level?: string | null;
  mentor_avatar?: string | null;
  xp_points?: number;
  level?: number;
  current_streak?: number;
  longest_streak?: number;
}

// То, что реально уходит в JWT — минимальный, иммутабельный набор.
// language_level/xp/streak НЕ пихаем в токен: они мутируют, а токен живёт 7 дней.
interface JWTClaims {
  id: string;
  email: string;
  role: string;
  name: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: UserPayload): string {
  const claims: JWTClaims = {
    id: payload.id,
    email: payload.email,
    role: payload.role,
    name: payload.name,
  };
  return jwt.sign(claims, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JWTClaims | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTClaims;
  } catch {
    return null;
  }
}

/**
 * Достаём значение cookie по имени из raw-заголовка Cookie.
 * Парсер осознанно примитивный — без зависимостей, чтобы работало и в Node, и (при необходимости)
 * без next/headers. Для middleware используется собственный парсер в `src/middleware.ts`.
 */
function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get('cookie');
  if (!header) return null;
  const needle = `${name}=`;
  // Разбиваем по ';' и обрезаем пробелы — стандартный формат Cookie header.
  for (const part of header.split(';')) {
    const trimmed = part.trim();
    if (trimmed.startsWith(needle)) {
      return decodeURIComponent(trimmed.slice(needle.length));
    }
  }
  return null;
}

export async function getUserFromRequest(request: Request): Promise<UserPayload | null> {
  // Принимаем токен из Authorization: Bearer ИЛИ из httpOnly cookie tk-token.
  // Bearer приоритетнее (совместимость с существующими клиентами, использующими localStorage).
  let token: string | null = null;
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.slice(7);
  } else {
    token = readCookie(request, 'tk-token');
  }
  if (!token) return null;
  const claims = verifyToken(token);
  if (!claims) return null;
  const user = await db.findOne('users', { id: claims.id });
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    language_level: user.language_level ?? null,
    mentor_avatar: user.mentor_avatar ?? null,
    xp_points: typeof user.xp_points === 'number' ? user.xp_points : 0,
    level: typeof user.level === 'number' ? user.level : 1,
    current_streak: typeof user.current_streak === 'number' ? user.current_streak : 0,
    longest_streak: typeof user.longest_streak === 'number' ? user.longest_streak : 0,
  };
}

export function requireAuth(user: UserPayload | null): UserPayload {
  if (!user) throw new Error('Unauthorized');
  return user;
}

export function requireAdmin(user: UserPayload | null): UserPayload {
  const u = requireAuth(user);
  if (u.role !== 'admin') throw new Error('Forbidden');
  return u;
}
