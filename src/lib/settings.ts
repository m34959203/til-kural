import { db } from './db';

export interface SiteSettings {
  ga_id?: string;
  ym_id?: string;
  contact_phone?: string;
  contact_email?: string;
  contact_address_kk?: string;
  contact_address_ru?: string;
  map_lat?: string;
  map_lng?: string;
  map_2gis_id?: string;
  social_instagram?: string;
  social_facebook?: string;
  social_telegram?: string;
  menu_json?: string;
}

const DEFAULTS: SiteSettings = {
  contact_phone: '+7 (7212) 00-00-00',
  contact_email: 'info@til-kural.kz',
  contact_address_kk: 'Қарағанды қ., Тәуелсіздік д., 20',
  contact_address_ru: 'г. Караганда, пр. Тәуелсіздік, 20',
  map_lat: '49.8047',
  map_lng: '73.1094',
};

let cache: { data: SiteSettings; at: number } | null = null;
const TTL = 60_000;

export async function getSettings(force = false): Promise<SiteSettings> {
  if (!force && cache && Date.now() - cache.at < TTL) return cache.data;
  try {
    const rows = await db.query('site_settings');
    const data: SiteSettings = { ...DEFAULTS };
    for (const row of rows) {
      (data as Record<string, string>)[row.key] = row.value;
    }
    cache = { data, at: Date.now() };
    return data;
  } catch {
    return DEFAULTS;
  }
}

export async function setSetting(key: string, value: string) {
  const existing = await db.findOne('site_settings', { key });
  if (existing) {
    if (db.isPostgres) {
      await db.raw('UPDATE site_settings SET value = $1 WHERE key = $2', [value, key]);
    } else {
      // In-memory store keys as id too
      await db.update('site_settings', existing.id || key, { value });
    }
  } else {
    await db.insert('site_settings', { id: key, key, value });
  }
  cache = null;
}

export async function getMenuItems(locale: string) {
  const settings = await getSettings();
  if (settings.menu_json) {
    try {
      return JSON.parse(settings.menu_json) as Array<{ href: string; kk: string; ru: string }>;
    } catch {
      /* fall through */
    }
  }
  // Default menu if nothing configured
  const base = [
    { href: '/about', kk: 'Біз туралы', ru: 'О нас' },
    { href: '/learn', kk: 'Оқу', ru: 'Обучение' },
    { href: '/test', kk: 'Тест', ru: 'Тесты' },
    { href: '/photo-check', kk: 'Фото-тексеру', ru: 'Фото-проверка' },
    { href: '/game', kk: 'Ойын', ru: 'Игра' },
    { href: '/news', kk: 'Жаңалықтар', ru: 'Новости' },
    { href: '/events', kk: 'Іс-шаралар', ru: 'События' },
    { href: '/resources', kk: 'Ресурстар', ru: 'Ресурсы' },
    { href: '/contacts', kk: 'Байланыс', ru: 'Контакты' },
  ];
  return base.map((item) => ({ ...item, label: locale === 'kk' ? item.kk : item.ru }));
}
