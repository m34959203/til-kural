import { getPronunciationGuide } from '@/lib/tts';

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text) {
      return Response.json({ error: 'Text is required' }, { status: 400 });
    }

    const guide = await getPronunciationGuide(text);

    return Response.json({ guide, phonetic: guide });
  } catch (error) {
    return Response.json({ error: 'TTS failed', details: String(error) }, { status: 500 });
  }
}
