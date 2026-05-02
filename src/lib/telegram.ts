/**
 * Telegram Bot API клиент. Используется auto-post.ts для публикации новостей
 * и мероприятий в канал/чат, заданный через TELEGRAM_CHAT_ID.
 *
 * ENV:
 *   TELEGRAM_BOT_TOKEN — выдаётся @BotFather.
 *   TELEGRAM_CHAT_ID   — id канала (-100…), супергруппы или личного чата.
 *
 * Без обоих переменных функции возвращают false и не делают сетевой вызов.
 */

const TELEGRAM_API = 'https://api.telegram.org';

function getBotToken(): string {
  return process.env.TELEGRAM_BOT_TOKEN || '';
}

function getChatId(): string {
  return process.env.TELEGRAM_CHAT_ID || '';
}

export function isTelegramConfigured(): boolean {
  return !!(getBotToken() && getChatId());
}

export async function sendTelegramMessage(text: string): Promise<boolean> {
  const token = getBotToken();
  const chatId = getChatId();
  if (!token || !chatId) return false;

  try {
    const r = await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: false,
      }),
    });
    if (!r.ok) {
      console.warn('[telegram] sendMessage failed', r.status, await r.text().catch(() => ''));
    }
    return r.ok;
  } catch (e) {
    console.warn('[telegram] sendMessage error:', e);
    return false;
  }
}

/**
 * Публикация фото с подписью. Принимает либо абсолютный http(s) URL (Telegram
 * сам скачает), либо относительный путь типа `/uploads/foo.jpg` — тогда читаем
 * файл с диска и шлём multipart, чтобы не зависеть от того, доступен ли наш
 * домен извне (cloudflared может отвалиться).
 */
export async function sendTelegramPhoto(photoUrl: string, caption: string): Promise<boolean> {
  const token = getBotToken();
  const chatId = getChatId();
  if (!token || !chatId) return false;

  try {
    const isRemote = /^https?:\/\//i.test(photoUrl);
    if (isRemote) {
      const r = await fetch(`${TELEGRAM_API}/bot${token}/sendPhoto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          photo: photoUrl,
          caption,
          parse_mode: 'HTML',
        }),
      });
      if (!r.ok) {
        // Telegram часто отбивает remote-URL за trycloudflare/самоподписанные SSL —
        // делаем graceful degradation: шлём текст без картинки.
        console.warn('[telegram] sendPhoto remote failed, falling back to text:', r.status);
        return sendTelegramMessage(caption);
      }
      return true;
    }

    // Локальный путь → multipart upload.
    const { promises: fs } = await import('node:fs');
    const path = await import('node:path');
    const rel = photoUrl.startsWith('/') ? photoUrl.slice(1) : photoUrl;
    // Поддерживаем оба варианта расположения uploads:
    //   public/uploads/foo.jpg → раздаётся напрямую Next-static
    //   uploads/foo.jpg        → если UPLOAD_DIR вынесен из public
    const candidates = [
      path.join(process.cwd(), 'public', rel),
      path.join(process.cwd(), rel),
    ];
    let abs = candidates[0];
    for (const c of candidates) {
      try {
        await fs.access(c);
        abs = c;
        break;
      } catch {
        // try next
      }
    }
    const buf = await fs.readFile(abs);
    const filename = path.basename(abs);

    const form = new FormData();
    form.append('chat_id', chatId);
    form.append('caption', caption);
    form.append('parse_mode', 'HTML');
    form.append('photo', new Blob([new Uint8Array(buf)], { type: 'image/jpeg' }), filename);

    const r = await fetch(`${TELEGRAM_API}/bot${token}/sendPhoto`, {
      method: 'POST',
      body: form,
    });
    if (!r.ok) {
      console.warn('[telegram] sendPhoto local failed:', r.status, await r.text().catch(() => ''));
      return sendTelegramMessage(caption);
    }
    return true;
  } catch (e) {
    console.warn('[telegram] sendPhoto error:', e);
    return false;
  }
}
