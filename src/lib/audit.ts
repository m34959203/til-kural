/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from './db';
import type { UserPayload } from './auth';

export interface AuditEntry {
  action: string;
  target_type?: string;
  target_id?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Логирует критическое админ-действие в таблицу audit_log.
 * Никогда не бросает — провал записи не должен валить основной запрос.
 */
export async function recordAudit(
  request: Request,
  actor: UserPayload | null,
  entry: AuditEntry,
): Promise<void> {
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      null;
    const userAgent = request.headers.get('user-agent') || null;
    await db.insert('audit_log', {
      actor_id: actor?.id ?? null,
      actor_email: actor?.email ?? null,
      actor_role: actor?.role ?? null,
      action: entry.action,
      target_type: entry.target_type ?? null,
      target_id: entry.target_id ?? null,
      ip_address: ip,
      user_agent: userAgent,
      metadata: JSON.stringify(entry.metadata ?? {}),
    } as Record<string, any>);
  } catch (err) {
    console.warn('[audit] write failed:', err);
  }
}

/**
 * Маскирует email для безопасного отображения в admin-API.
 * a***@til-kural.kz, ab***@til-kural.kz и т.п.
 * Используется когда email раскрывать не нужно (например, при просмотре
 * чужих пользователей не-superadmin'ом).
 */
export function maskEmail(email: string | null | undefined): string {
  if (!email || typeof email !== 'string') return '';
  const at = email.indexOf('@');
  if (at <= 0) return email;
  const local = email.slice(0, at);
  const domain = email.slice(at);
  const visible = Math.min(2, Math.max(1, Math.floor(local.length / 3)));
  return local.slice(0, visible) + '***' + domain;
}

/**
 * Решает, надо ли скрывать email от текущего admin-актёра.
 * Правило: superadmin (env-флаг) видит всё, остальные admin/editor/moderator
 * видят свой email и маски остальных.
 */
export function shouldUnmaskEmail(actor: UserPayload | null, targetEmail: string): boolean {
  if (!actor) return false;
  if (actor.email === targetEmail) return true;
  // Super-admin определяется через явный список email-ов в env (запятая-разделитель).
  const superAdmins = (process.env.SUPER_ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return superAdmins.includes(actor.email.toLowerCase());
}
