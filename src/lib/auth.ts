import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

export interface UserPayload {
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
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): UserPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserPayload;
  } catch {
    return null;
  }
}

export async function getUserFromRequest(request: Request): Promise<UserPayload | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  const payload = verifyToken(token);
  if (!payload) return null;
  const user = await db.findOne('users', { id: payload.id });
  if (!user) return null;
  return { id: user.id, email: user.email, role: user.role, name: user.name };
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
