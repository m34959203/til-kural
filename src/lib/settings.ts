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
  // Реквизиты организации (goszakup.gov.kz/ru/registry/show_supplier/745311)
  org_full_name_kk?: string;
  org_full_name_ru?: string;
  org_short_name?: string;
  org_bin?: string;
  org_director?: string;
  org_registered_at?: string;
}

const DEFAULTS: SiteSettings = {
  contact_phone: '+7 705 314 3391',
  contact_email: 'info@til-kural.kz',
  contact_address_kk: 'Ұлытау обл., Сәтбаев қ., Академик Қаныш Сәтбаев даңғ., 111',
  contact_address_ru: 'Ұлытауская обл., г. Сатпаев, пр. Академика Каныша Сатпаева, 111',
  // Пр. Сатпаева 111, Сатпаев (по OSM, между 111а и 111б)
  map_lat: '47.9058',
  map_lng: '67.5296',
  org_full_name_kk: '«Тіл-құрал» оқу-әдістемелік орталығы — Сәтбаев қаласының мәдениет және тілдерді дамыту бөлімінің МКҚК',
  org_full_name_ru: 'КГУ «Учебно-методический центр «Тіл-құрал» ГУ «Отдел культуры и развития языков города Сатпаев» области Ұлытау',
  org_short_name: 'УМЦ «Тіл-құрал»',
  org_bin: '241240033540',
  org_director: 'Игенберлина Мадинат Балтина',
  org_registered_at: '2025-01-11',
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
  // site_settings(key PK, value). Никаких `id` колонок — иначе INSERT падает.
  if (db.isPostgres) {
    await db.raw(
      'INSERT INTO site_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value',
      [key, value],
    );
  } else {
    const existing = await db.findOne('site_settings', { key });
    if (existing) {
      await db.update('site_settings', existing.id || key, { value });
    } else {
      await db.insert('site_settings', { key, value });
    }
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
    { href: '/events', kk: 'Іс-шаралар', ru: 'Мероприятия' },
    { href: '/resources', kk: 'Ресурстар', ru: 'Ресурсы' },
    { href: '/contacts', kk: 'Байланыс', ru: 'Контакты' },
  ];
  return base.map((item) => ({ ...item, label: locale === 'kk' ? item.kk : item.ru }));
}
