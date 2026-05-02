/**
 * Авто-публикация новостей и событий «Тіл-құрал» в Telegram при переводе
 * status=published. Вызывается fire-and-forget из POST/PUT хэндлеров news/events
 * и из cron `/api/cron/publish-scheduled`.
 *
 * ENV:
 *   TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID — без них функция тихо пропускает.
 *   TELEGRAM_POST_LOCALES = 'kk' | 'ru' | 'both' (default 'both').
 *
 * Намеренно не имеет таблицы social_posts (как у smart-library-cbs) — пишем
 * только в console.warn при ошибках. Если понадобится аудит — добавить
 * sql/009_social_posts.sql и логировать туда.
 */
import { sendTelegramMessage, sendTelegramPhoto, isTelegramConfigured } from './telegram';

type Locale = 'kk' | 'ru';

interface NewsLike {
  id: string;
  slug: string;
  title_kk: string;
  title_ru: string;
  excerpt_kk?: string | null;
  excerpt_ru?: string | null;
  content_kk?: string | null;
  content_ru?: string | null;
  image_url?: string | null;
}

interface EventLike {
  id: string;
  title_kk: string;
  title_ru: string;
  description_kk?: string | null;
  description_ru?: string | null;
  image_url?: string | null;
  start_date: string;
  end_date?: string | null;
  location?: string | null;
  registration_url?: string | null;
}

function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL || '').replace(/\/$/, '');
}

function targetLocales(): Locale[] {
  const v = (process.env.TELEGRAM_POST_LOCALES || 'both').toLowerCase();
  if (v === 'kk') return ['kk'];
  if (v === 'ru') return ['ru'];
  return ['kk', 'ru'];
}

function stripHtml(html: string | null | undefined): string {
  return (html || '')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => {
    if (c === '&') return '&amp;';
    if (c === '<') return '&lt;';
    if (c === '>') return '&gt;';
    if (c === '"') return '&quot;';
    return '&#39;';
  });
}

function truncate(s: string, n: number): string {
  if (s.length <= n) return s;
  return s.slice(0, n).trimEnd() + '…';
}

/* ---------------------------- formatters -------------------------------- */

export function formatNewsForTelegram(item: NewsLike, locale: Locale): string {
  const title = locale === 'kk' ? item.title_kk : item.title_ru;
  const body =
    stripHtml(locale === 'kk' ? item.excerpt_kk : item.excerpt_ru) ||
    stripHtml(locale === 'kk' ? item.content_kk : item.content_ru);
  const url = siteUrl() ? `${siteUrl()}/${locale}/news/${item.slug}` : '';
  const readMore = locale === 'kk' ? 'Толық оқу' : 'Читать полностью';

  let msg = `📰 <b>${escapeHtml(title || '')}</b>\n\n`;
  if (body) msg += `${escapeHtml(truncate(body, 700))}\n\n`;
  msg += `📚 Тіл-құрал`;
  if (url) msg += `\n🔗 <a href="${url}">${readMore}</a>`;
  return msg.trim();
}

export function formatEventForTelegram(item: EventLike, locale: Locale): string {
  const title = locale === 'kk' ? item.title_kk : item.title_ru;
  const desc = stripHtml(locale === 'kk' ? item.description_kk : item.description_ru);
  const dateLine =
    item.end_date && item.end_date !== item.start_date
      ? `${item.start_date} — ${item.end_date}`
      : item.start_date;
  const url = siteUrl() ? `${siteUrl()}/${locale}/events` : '';
  const more = locale === 'kk' ? 'Іс-шаралар тізімі' : 'Все мероприятия';

  let msg = `📅 <b>${escapeHtml(title || '')}</b>\n\n`;
  if (desc) msg += `${escapeHtml(truncate(desc, 700))}\n\n`;
  msg += `🗓 ${escapeHtml(dateLine)}\n`;
  if (item.location) msg += `📍 ${escapeHtml(item.location)}\n`;
  if (item.registration_url) {
    const reg = locale === 'kk' ? 'Тіркелу' : 'Регистрация';
    msg += `🎟 <a href="${item.registration_url}">${reg}</a>\n`;
  }
  msg += `\n📚 Тіл-құрал`;
  if (url) msg += `\n🔗 <a href="${url}">${more}</a>`;
  return msg.trim();
}

/* ---------------------------- publishers -------------------------------- */

export interface PublishResult {
  platform: 'telegram';
  locale: Locale;
  ok: boolean;
  error?: string;
}

async function publishOne(text: string, imageUrl: string | undefined, locale: Locale): Promise<PublishResult> {
  try {
    const ok = imageUrl
      ? await sendTelegramPhoto(imageUrl, text)
      : await sendTelegramMessage(text);
    return { platform: 'telegram', locale, ok, error: ok ? undefined : 'telegram returned non-ok' };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.warn('[auto-post] telegram failed:', msg);
    return { platform: 'telegram', locale, ok: false, error: msg };
  }
}

export async function publishNewsToTelegram(item: NewsLike): Promise<PublishResult[]> {
  if (!isTelegramConfigured()) {
    return [{ platform: 'telegram', locale: 'kk', ok: false, error: 'TELEGRAM not configured (skip)' }];
  }
  const out: PublishResult[] = [];
  for (const loc of targetLocales()) {
    out.push(await publishOne(formatNewsForTelegram(item, loc), item.image_url || undefined, loc));
    // Между постами небольшая пауза — Telegram банит >30 сообщений/секунду в чат.
    await new Promise((r) => setTimeout(r, 200));
  }
  return out;
}

export async function publishEventToTelegram(item: EventLike): Promise<PublishResult[]> {
  if (!isTelegramConfigured()) {
    return [{ platform: 'telegram', locale: 'kk', ok: false, error: 'TELEGRAM not configured (skip)' }];
  }
  const out: PublishResult[] = [];
  for (const loc of targetLocales()) {
    out.push(await publishOne(formatEventForTelegram(item, loc), item.image_url || undefined, loc));
    await new Promise((r) => setTimeout(r, 200));
  }
  return out;
}

/**
 * Fire-and-forget обёртка: гарантирует, что хэндлер не подвиснет, даже если
 * Telegram-API тормозит. Ошибки уходят только в console.
 */
export function autoPostNews(item: NewsLike): void {
  publishNewsToTelegram(item)
    .then((results) => {
      const ok = results.filter((r) => r.ok).length;
      const total = results.length;
      console.log(`[auto-post] news ${item.id}: telegram ${ok}/${total}`);
    })
    .catch((e) => console.warn('[auto-post] news failed:', e));
}

export function autoPostEvent(item: EventLike): void {
  publishEventToTelegram(item)
    .then((results) => {
      const ok = results.filter((r) => r.ok).length;
      const total = results.length;
      console.log(`[auto-post] event ${item.id}: telegram ${ok}/${total}`);
    })
    .catch((e) => console.warn('[auto-post] event failed:', e));
}
