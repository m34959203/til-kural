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
    const body = await request.json();
    const text: string = typeof body?.text === 'string' ? body.text : '';
    const mode: string = typeof body?.mode === 'string' ? body.mode : 'audio';
    const voice = body?.voice;
    const locale: 'kk' | 'ru' = body?.locale === 'ru' ? 'ru' : 'kk';
    if (!text) return apiError(400, 'Text is required');
    // Dialog-ответы ИИ могут быть длинными. Режем до 2000 символов (последняя граница предложения).
    let clean = text.trim();
    if (clean.length > 2000) {
      clean = clean.slice(0, 2000);
      const lastDot = Math.max(clean.lastIndexOf('.'), clean.lastIndexOf('!'), clean.lastIndexOf('?'));
      if (lastDot > 1200) clean = clean.slice(0, lastDot + 1);
    }

    if (mode === 'guide') {
      const guide = await getPronunciationGuide(clean, locale);
      return Response.json({ guide });
    }

    const chosenVoice = typeof voice === 'string' && ALLOWED_VOICES.has(voice) ? voice : 'Aoede';
    const audio = await generateSpeech(clean, chosenVoice);
    if (!audio) {
      const guide = await getPronunciationGuide(clean, locale);
      return Response.json({ audio: null, guide, fallback: 'browser-tts' });
    }
    return Response.json({ audio });
  } catch (err) {
    return apiError(500, 'TTS failed', String(err));
  }
}
