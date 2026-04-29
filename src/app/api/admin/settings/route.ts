import { requireAdminApi, apiError } from '@/lib/api';
import { getSettings, setSetting } from '@/lib/settings';

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
    for (const [key, value] of Object.entries(body)) {
      if (!allowed.has(key)) continue;
      const raw = String(value ?? '');
      // Валидация menu_json — иначе кривой JSON тихо ломает Header/MobileNav.
      if (key === 'menu_json' && raw.trim()) {
        try {
          const parsed = JSON.parse(raw);
          if (!Array.isArray(parsed)) {
            return apiError(400, 'menu_json must be a JSON array');
          }
          for (const item of parsed) {
            if (!item || typeof item !== 'object') {
              return apiError(400, 'menu_json items must be objects');
            }
            if (typeof (item as Record<string, unknown>).href !== 'string') {
              return apiError(400, 'menu_json: each item needs string `href`');
            }
          }
        } catch (err) {
          return apiError(400, 'menu_json: invalid JSON', String(err));
        }
      }
      await setSetting(key, raw);
    }
    const settings = await getSettings(true);
    return Response.json({ settings });
  } catch (err) {
    return apiError(500, 'Failed to save settings', String(err));
  }
}
