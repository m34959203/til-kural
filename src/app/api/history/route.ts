import { db } from '@/lib/db';
import { requireAdminApi, apiError } from '@/lib/api';
import { HISTORY_TABLE, pickAllowed, sortBlocks, HistoryBlock } from '@/lib/history-blocks';
import { HistorySchema, validateBody } from '@/lib/validators';

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
    const result = validateBody(HistorySchema, body);
    if (!result.ok) {
      return Response.json({ error: 'Validation failed', errors: result.errors }, { status: 400 });
    }
    // pickAllowed нормализует поля (включая '' → null и sort_order → number).
    const data = pickAllowed(result.data as Record<string, unknown>);
    const row = await db.insert(HISTORY_TABLE, {
      year: data.year ?? null,
      title_kk: result.data.title_kk,
      title_ru: result.data.title_ru,
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
