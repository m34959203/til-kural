import { db } from '@/lib/db';
import { requireAdminApi, apiError, requireFields } from '@/lib/api';
import { HISTORY_TABLE, pickAllowed, sortBlocks, HistoryBlock } from '@/lib/history-blocks';

export async function GET() {
  try {
    const rows = (await db.query(HISTORY_TABLE, undefined, {
      orderBy: 'sort_order',
      order: 'asc',
    })) as HistoryBlock[];
    return Response.json({ history: sortBlocks(rows) });
  } catch (err) {
    return apiError(500, 'Failed to load history', String(err));
  }
}

export async function POST(request: Request) {
  const auth = await requireAdminApi(request);
  if (auth instanceof Response) return auth;

  try {
    const body = await request.json();
    const missing = requireFields(body, ['title_kk', 'title_ru']);
    if (missing.length) return apiError(400, 'Missing fields', missing);

    const data = pickAllowed(body);
    const row = await db.insert(HISTORY_TABLE, {
      year: data.year ?? null,
      title_kk: body.title_kk,
      title_ru: body.title_ru,
      description_kk: data.description_kk ?? null,
      description_ru: data.description_ru ?? null,
      image_url: data.image_url ?? null,
      sort_order: data.sort_order ?? 0,
    });
    return Response.json({ history: row }, { status: 201 });
  } catch (err) {
    return apiError(500, 'Failed to create history block', String(err));
  }
}
