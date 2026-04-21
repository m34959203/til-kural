import { generateSpeech, getPronunciationGuide } from '@/lib/tts';
import { apiError } from '@/lib/api';

const ALLOWED_VOICES = new Set([
  'Aoede', 'Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr',
  'Achird', 'Algenib', 'Algieba', 'Alnilam', 'Autonoe', 'Callirrhoe',
  'Despina', 'Enceladus', 'Erinome', 'Gacrux', 'Iapetus', 'Laomedeia',
  'Leda', 'Orus', 'Pulcherrima', 'Rasalgethi', 'Sadachbia', 'Sadaltager',
  'Schedar', 'Sulafat', 'Umbriel', 'Vindemiatrix', 'Zubenelgenubi',
]);

export async function POST(request: Request) {
  try {
    const { text, mode = 'audio', voice } = await request.json();
    if (!text || typeof text !== 'string') return apiError(400, 'Text is required');
    if (text.length > 500) return apiError(400, 'Text too long (max 500 chars)');

    if (mode === 'guide') {
      const guide = await getPronunciationGuide(text);
      return Response.json({ guide });
    }

    const chosenVoice = typeof voice === 'string' && ALLOWED_VOICES.has(voice) ? voice : 'Aoede';
    const audio = await generateSpeech(text, chosenVoice);
    if (!audio) {
      const guide = await getPronunciationGuide(text);
      return Response.json({ audio: null, guide, fallback: 'browser-tts' });
    }
    return Response.json({ audio });
  } catch (err) {
    return apiError(500, 'TTS failed', String(err));
  }
}
