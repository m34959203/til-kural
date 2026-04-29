import { requireAdminApi, apiError } from '@/lib/api';
import { getSettings, setSetting } from '@/lib/settings';
import { recordAudit } from '@/lib/audit';

// Регулярки для валидации идентификаторов трекеров.
//   GA4: G-XXXXXXX (уникальный набор букв/цифр), Universal Analytics: UA-XXXXXX-X,
//   Google Ads: AW-XXXX, Yandex.Metrica: 6-9 цифр.
const GA_RE = /^(G-[A-Z0-9]{4,12}|UA-\d{4,10}-\d{1,3}|AW-\d{4,12})$/;
const YM_RE = /^\d{5,12}$/;
// http(s)://… или относительный путь /…  Запрещаем javascript:, data:, vbscript:.
const SAFE_HREF_RE = /^(https?:\/\/|\/)[^\s<>"]+$/i;
const FORBIDDEN_HREF_RE = /^(javascript|data|vbscript|file):/i;

export async function GET(request: Request) {
  const auth = await requireAdminApi(request);
  if (auth instanceof Response) return auth;
  const settings = await getSettings(true);
  return Response.json({ settings });
}

export async function PUT(request: Request) {
  const auth = await requireAdminApi(request);
  if (auth instanceof Response) return auth;
  try {
    const body = await request.json();
    const allowed = new Set([
      'ga_id','ym_id','contact_phone','contact_email','contact_address_kk','contact_address_ru',
      'map_lat','map_lng','map_2gis_id','social_instagram','social_facebook','social_telegram','menu_json',
      'org_full_name_kk','org_full_name_ru','org_short_name','org_bin','org_director','org_registered_at',
    ]);
    const changedKeys: string[] = [];
    for (const [key, value] of Object.entries(body)) {
      if (!allowed.has(key)) continue;
      const raw = String(value ?? '').trim();

      // Валидация GA / YM идентификаторов (audit P0-sec).
      // Иначе атакующий может подменить трекер на свой и собирать
      // данные о всех посетителях платформы.
      if (key === 'ga_id' && raw && !GA_RE.test(raw)) {
        return apiError(400, 'ga_id: ожидается G-XXXXXXX, UA-XXXXXX-X или AW-XXXXXXX');
      }
      if (key === 'ym_id' && raw && !YM_RE.test(raw)) {
        return apiError(400, 'ym_id: ожидается счётчик из 5–12 цифр');
      }

      // menu_json: расширенная валидация, явный запрет javascript:/data:/vbscript:
      if (key === 'menu_json' && raw) {
        try {
          const parsed = JSON.parse(raw);
          if (!Array.isArray(parsed)) {
            return apiError(400, 'menu_json must be a JSON array');
          }
          for (const item of parsed) {
            if (!item || typeof item !== 'object') {
              return apiError(400, 'menu_json items must be objects');
            }
            const href = (item as Record<string, unknown>).href;
            if (typeof href !== 'string') {
              return apiError(400, 'menu_json: each item needs string `href`');
            }
            if (FORBIDDEN_HREF_RE.test(href.trim())) {
              return apiError(400, `menu_json: href "${href}" использует запрещённую схему (javascript:/data:/vbscript:/file:)`);
            }
            if (!SAFE_HREF_RE.test(href.trim())) {
              return apiError(400, `menu_json: href "${href}" должен быть http(s) URL или относительным путём, начинающимся с /`);
            }
            // kk/ru — обычный текст, экранирование лежит на UI; проверяем хотя бы тип.
            const kk = (item as Record<string, unknown>).kk;
            const ru = (item as Record<string, unknown>).ru;
            if (kk !== undefined && typeof kk !== 'string') return apiError(400, 'menu_json: kk должен быть строкой');
            if (ru !== undefined && typeof ru !== 'string') return apiError(400, 'menu_json: ru должен быть строкой');
          }
        } catch (err) {
          return apiError(400, 'menu_json: invalid JSON', String(err));
        }
      }

      // Соц-ссылки тоже валидируем как safe href.
      if ((key === 'social_instagram' || key === 'social_facebook' || key === 'social_telegram') && raw) {
        if (FORBIDDEN_HREF_RE.test(raw) || !/^https?:\/\//i.test(raw)) {
          return apiError(400, `${key}: ожидается https:// URL`);
        }
      }

      await setSetting(key, raw);
      changedKeys.push(key);
    }

    if (changedKeys.length > 0) {
      await recordAudit(request, auth, {
        action: 'settings.update',
        target_type: 'settings',
        metadata: { keys: changedKeys },
      });
    }

    const settings = await getSettings(true);
    return Response.json({ settings });
  } catch (err) {
    return apiError(500, 'Failed to save settings', String(err));
  }
}
