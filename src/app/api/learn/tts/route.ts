import { generateSpeech, getPronunciationGuide } from '@/lib/tts';
import { apiError } from '@/lib/api';

export async function POST(request: Request) {
  try {
    const { text, mode = 'audio' } = await request.json();
    if (!text || typeof text !== 'string') return apiError(400, 'Text is required');
    if (text.length > 500) return apiError(400, 'Text too long (max 500 chars)');

    if (mode === 'guide') {
      const guide = await getPronunciationGuide(text);
      return Response.json({ guide });
    }

    const audio = await generateSpeech(text);
    if (!audio) {
      const guide = await getPronunciationGuide(text);
      return Response.json({ audio: null, guide, fallback: 'browser-tts' });
    }
    return Response.json({ audio });
  } catch (err) {
    return apiError(500, 'TTS failed', String(err));
  }
}
