import { checkPhotoText } from '@/lib/gemini-vision';
import { getUserFromRequest } from '@/lib/auth';
import { db } from '@/lib/db';
import { awardProgress } from '@/lib/award-progress';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { image?: string; locale?: string };
    const { image } = body;
    const locale: 'kk' | 'ru' = body.locale === 'ru' ? 'ru' : 'kk';

    if (!image) {
      return Response.json({ error: 'Image is required' }, { status: 400 });
    }

    // Extract base64 data and mime type
    const match = image.match(/^data:(image\/\w+);base64,(.+)$/);
    if (!match) {
      return Response.json({ error: 'Invalid image format' }, { status: 400 });
    }

    const mimeType = match[1];
    const base64Data = match[2];

    const result = await checkPhotoText(base64Data, mimeType, locale);

    // Persist record (если user_id не резолвится — пропускаем, не падаем)
    let checkId: string | null = null;
    const user = await getUserFromRequest(request);
    if (user) {
      try {
        const row = await db.insert('photo_checks', {
          user_id: user.id,
          image_url: '', // raw base64 не сохраняем в БД, чтобы не раздувать; слот оставлен для будущего storage
          recognized_text: result.recognized_text || '',
          errors: result.errors || [],
          overall_score: result.overall_score ?? 0,
          feedback: result.feedback || '',
        });
        checkId = row?.id ?? null;
      } catch (dbErr) {
        console.warn('[photo-check] db insert skipped:', dbErr);
      }
      try {
        await awardProgress(user.id, 'photo_check', { score: result.overall_score ?? 0 });
      } catch (e) {
        console.warn('[photo-check] awardProgress skipped:', e);
      }
    }

    return Response.json({ result, id: checkId, locale });
  } catch (error) {
    return Response.json({ error: 'Photo check failed', details: String(error) }, { status: 500 });
  }
}

/**
 * GET /api/photo-check?limit=20
 * Возвращает последние N фото-проверок залогиненного юзера.
 * Анон — 401.
 */
export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const rawLimit = Number(url.searchParams.get('limit') ?? '20');
  const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(rawLimit, 1), 100) : 20;

  try {
    const rows = await db.query(
      'photo_checks',
      { user_id: user.id },
      { orderBy: 'created_at', order: 'desc', limit }
    );
    return Response.json({
      items: rows.map((r) => ({
        id: r.id,
        overall_score: r.overall_score ?? 0,
        recognized_text: r.recognized_text ?? '',
        errors_count: Array.isArray(r.errors) ? r.errors.length : 0,
        created_at: r.created_at,
      })),
    });
  } catch (err) {
    return Response.json({ error: 'Fetch failed', details: String(err) }, { status: 500 });
  }
}
