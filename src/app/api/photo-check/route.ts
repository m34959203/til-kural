import { checkPhotoText } from '@/lib/gemini-vision';

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

    return Response.json({ result });
  } catch (error) {
    return Response.json({ error: 'Photo check failed', details: String(error) }, { status: 500 });
  }
}
