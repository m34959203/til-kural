import { checkPhotoText } from '@/lib/gemini-vision';
import { getUserFromRequest } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { image } = await request.json();

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

    const result = await checkPhotoText(base64Data, mimeType);

    // Persist record (если user_id не резолвится — пропускаем, не падаем)
    let checkId: string | null = null;
    try {
      const user = await getUserFromRequest(request);
      if (user) {
        const row = await db.insert('photo_checks', {
          user_id: user.id,
          image_url: '', // raw base64 не сохраняем в БД, чтобы не раздувать; слот оставлен для будущего storage
          recognized_text: result.recognized_text || '',
          errors: result.errors || [],
          overall_score: result.overall_score ?? 0,
          feedback: result.feedback || '',
        });
        checkId = row?.id ?? null;
      }
    } catch (dbErr) {
      // Не ломаем ответ фронта, если инсерт упал
      console.warn('[photo-check] db insert skipped:', dbErr);
    }

    return Response.json({ result, id: checkId });
  } catch (error) {
    return Response.json({ error: 'Photo check failed', details: String(error) }, { status: 500 });
  }
}
