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
    ]);
    for (const [key, value] of Object.entries(body)) {
      if (!allowed.has(key)) continue;
      await setSetting(key, String(value ?? ''));
    }
    const settings = await getSettings(true);
    return Response.json({ settings });
  } catch (err) {
    return apiError(500, 'Failed to save settings', String(err));
  }
}
