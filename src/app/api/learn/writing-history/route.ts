import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

/**
 * GET /api/learn/writing-history?limit=10
 * Возвращает последние writing_checks текущего юзера с превью текста.
 * Для анона — пустой массив (UI блок не рендерится).
 */
export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) return Response.json({ items: [] });

  const url = new URL(request.url);
  const limitRaw = Number(url.searchParams.get('limit') || 10);
  const limit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(50, limitRaw)) : 10;

  try {
    const rows = await db.query('writing_checks', { user_id: user.id }, {
      orderBy: 'created_at',
      order: 'desc',
      limit,
    });
    const items = rows.map((r) => {
      const text = typeof r.input_text === 'string' ? r.input_text : '';
      const preview = text.length > 80 ? text.slice(0, 80).trim() + '…' : text;
      return {
        id: String(r.id),
        score: typeof r.score === 'number' ? r.score : Number(r.score) || 0,
        created_at: r.created_at,
        preview,
      };
    });
    return Response.json({ items });
  } catch (err) {
    return Response.json({ items: [], error: String(err) });
  }
}
