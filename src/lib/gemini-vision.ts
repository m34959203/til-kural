import { analyzeImage } from './gemini';

export interface PhotoCheckResult {
  recognized_text: string;
  errors: PhotoError[];
  overall_score: number;
  feedback: string;
  literacy_score: number;
  coherence_score: number;
  lexical_diversity: number;
}

export interface PhotoError {
  word: string;
  correction: string;
  rule: string;
  position: number;
  type: 'spelling' | 'grammar' | 'punctuation' | 'style';
}

const PHOTO_CHECK_PROMPT = `Сен қазақ тілі маманысың. Берілген суретте қолжазба мәтін бар.

Тапсырмаларың:
1. Қолжазба мәтінді тану (OCR) — мәтінді цифрлық форматқа айналдыр
2. Орфографиялық қателерді тексер
3. Грамматикалық қателерді тексер
4. Тыныс белгілерін тексер
5. Стилистикалық кеңестер бер
6. Жалпы баға бер (0-100)

JSON форматында жауап бер:
{
  "recognized_text": "танылған мәтін",
  "errors": [
    {
      "word": "қате сөз",
      "correction": "дұрыс нұсқа",
      "rule": "ереже атауы",
      "position": 0,
      "type": "spelling|grammar|punctuation|style"
    }
  ],
  "overall_score": 85,
  "feedback": "Жалпы пікір мен кеңестер",
  "literacy_score": 90,
  "coherence_score": 80,
  "lexical_diversity": 75
}

Тек JSON қайтар, басқа мәтін жазба.`;

export async function checkPhotoText(
  imageBase64: string,
  mimeType: string
): Promise<PhotoCheckResult> {
  const response = await analyzeImage(imageBase64, mimeType, PHOTO_CHECK_PROMPT);

  try {
    const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned) as PhotoCheckResult;
  } catch {
    return {
      recognized_text: 'Мәтінді тану мүмкін болмады',
      errors: [],
      overall_score: 0,
      feedback: 'Суретті тану кезінде қате пайда болды. Қайта жүктеңіз.',
      literacy_score: 0,
      coherence_score: 0,
      lexical_diversity: 0,
    };
  }
}

export function getErrorColor(type: string): string {
  switch (type) {
    case 'spelling':
      return 'text-red-600 bg-red-50';
    case 'grammar':
      return 'text-orange-600 bg-orange-50';
    case 'punctuation':
      return 'text-yellow-600 bg-yellow-50';
    case 'style':
      return 'text-blue-600 bg-blue-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
}

export function getErrorLabel(type: string, locale: string = 'kk'): string {
  const labels: Record<string, Record<string, string>> = {
    spelling: { kk: 'Орфография', ru: 'Орфография' },
    grammar: { kk: 'Грамматика', ru: 'Грамматика' },
    punctuation: { kk: 'Тыныс белгі', ru: 'Пунктуация' },
    style: { kk: 'Стиль', ru: 'Стиль' },
  };
  return labels[type]?.[locale] || type;
}
