import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || '';

export interface TTSResult {
  audioBase64: string;
  mimeType: string;
}

/**
 * Generate speech from Kazakh text using Gemini.
 * Falls back to browser-based TTS if API is unavailable.
 */
export async function generateSpeech(text: string): Promise<TTSResult | null> {
  if (!apiKey) {
    return null; // Client will use browser SpeechSynthesis
  }

  try {
    const client = new GoogleGenerativeAI(apiKey);
    const model = client.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Use Gemini to generate phonetic guide
    const result = await model.generateContent(
      `Мәтінді дұрыс оқу үшін транскрипция жаса (қазақ тілінде): "${text}". Тек транскрипцияны жаз.`
    );

    // Return the phonetic text - client will use SpeechSynthesis
    return {
      audioBase64: Buffer.from(result.response.text()).toString('base64'),
      mimeType: 'text/plain',
    };
  } catch {
    return null;
  }
}

/**
 * Get pronunciation guide for a word or phrase
 */
export async function getPronunciationGuide(text: string): Promise<string> {
  if (!apiKey) {
    return `[${text}] — Дұрыс айтылуы: әр буынды анық айтыңыз.`;
  }

  try {
    const client = new GoogleGenerativeAI(apiKey);
    const model = client.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const result = await model.generateContent(
      `Қазақ тілі маманы ретінде "${text}" сөзінің/сөз тіркесінің дұрыс айтылуын түсіндір:
1. Буын бөлу
2. Екпін
3. Дыбыс ерекшеліктері
4. Жиі кететін қателер
Қысқаша жауап бер.`
    );

    return result.response.text();
  } catch {
    return `[${text}] — Дұрыс айтылуы туралы ақпарат қол жетімді емес.`;
  }
}
