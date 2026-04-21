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
  /** 2-3 предложения, объясняющих правило на языке пользователя (ru/kk). */
  rule_explanation?: string;
  /** 1-2 примера правильного употребления. */
  example_correct?: string[];
  /** Опциональный id правила из kazakh-grammar-rules.json (rule_01..rule_21). */
  rule_slug?: string;
  position: number;
  type: 'spelling' | 'grammar' | 'punctuation' | 'style';
}

/**
 * Слаги правил из src/data/kazakh-grammar-rules.json.
 * Используются моделью для deep-link в /learn/basics#rule_XX.
 */
const RULE_SLUGS_HINT = [
  'rule_01 — Буын үндестігі / гармония гласных',
  'rule_02 — Үндестік заңы / ассимиляция согласных',
  'rule_03 — Көптік жалғауы / множественное число',
  'rule_04 — Септік жалғаулары / падежные окончания',
  'rule_05 — Тәуелдік жалғаулары / притяжательные окончания',
  'rule_06 — Сын есімнің шырайлары / степени сравнения',
  'rule_07 — Осы шақ / настоящее время',
  'rule_08 — Өткен шақ / прошедшее время',
  'rule_09 — Келер шақ / будущее время',
  'rule_10 — Етістіктің болымсыз түрі / отрицание глагола',
  'rule_11 — Сөз тәртібі / порядок слов (SOV)',
  'rule_12 — Сұраулы сөйлемдер / вопросы',
  'rule_13 — Септеулік шылаулар / послелоги',
  'rule_14 — Сан есім / числительные',
  'rule_15 — Жіктеу есімдіктері / личные местоимения',
  'rule_16 — Сөз тудырушы жұрнақтар / словообразовательные суффиксы',
  'rule_17 — Етістіктің рай категориясы / наклонения глагола',
  'rule_18 — Қазақ тіліне тән дыбыстар / специфические звуки',
  'rule_19 — Бас әріп / заглавная буква',
  'rule_20 — Есімше / причастия',
  'rule_21 — Мақал-мәтелдер / пословицы',
].join('\n');

function buildPrompt(locale: 'kk' | 'ru'): string {
  const explanationLang =
    locale === 'ru'
      ? 'Пояснение правила (rule_explanation) пиши на РУССКОМ языке, 2-3 предложения, чтобы было понятно ученику.'
      : 'Ереже түсіндірмесін (rule_explanation) ҚАЗАҚ тілінде жаз, 2-3 сөйлем, оқушыға түсінікті болатындай.';

  return `Сен қазақ тілі маманысың. Берілген суретте қолжазба мәтін бар.

Тапсырмаларың:
1. Қолжазба мәтінді тану (OCR) — мәтінді цифрлық форматқа айналдыр
2. Орфографиялық қателерді тексер
3. Грамматикалық қателерді тексер
4. Тыныс белгілерін тексер
5. Стилистикалық кеңестер бер
6. Жалпы баға бер (0-100)

ЕРЕЖЕ ТҮСІНДІРМЕСІ (МІНДЕТТІ!):
Әр қате үшін оқушыға ереже не істейтінін түсіндір:
- "rule": қысқа атау (мысалы: "Буын үндестігі")
- "rule_explanation": 2-3 сөйлемді түсіндірме (language below)
- "example_correct": 1-2 дұрыс қолданылған мысал массив түрінде
- "rule_slug": сәйкес келсе, төмендегі тізімнен slug (rule_01..rule_21), сәйкес келмесе null

${explanationLang}

Ереже слагтары (егер тақырыбы сәйкес келсе, дәл сол slug қайтар):
${RULE_SLUGS_HINT}

JSON форматында жауап бер:
{
  "recognized_text": "танылған мәтін",
  "errors": [
    {
      "word": "қате сөз",
      "correction": "дұрыс нұсқа",
      "rule": "ереже атауы",
      "rule_explanation": "2-3 предложения объясняющих правило на языке пользователя",
      "example_correct": ["дұрыс мысал 1", "дұрыс мысал 2"],
      "rule_slug": "rule_03",
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
}

export async function checkPhotoText(
  imageBase64: string,
  mimeType: string,
  locale: 'kk' | 'ru' = 'kk'
): Promise<PhotoCheckResult> {
  const prompt = buildPrompt(locale);
  const response = await analyzeImage(imageBase64, mimeType, prompt);

  try {
    const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned) as PhotoCheckResult;

    // Нормализуем новые поля: если модель не вернула — подставляем безопасные дефолты,
    // чтобы UI не падал.
    if (Array.isArray(parsed.errors)) {
      parsed.errors = parsed.errors.map((e) => ({
        ...e,
        rule_explanation: e.rule_explanation?.trim() || '',
        example_correct: Array.isArray(e.example_correct)
          ? e.example_correct.filter((x) => typeof x === 'string' && x.trim().length > 0)
          : [],
        rule_slug:
          typeof e.rule_slug === 'string' && /^rule_\d{2}$/.test(e.rule_slug)
            ? e.rule_slug
            : undefined,
      }));
    }

    return parsed;
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
