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
  'rule_22 — Ауыспалы осы шақ / настояще-будущее -ады/-еді',
  'rule_23 — Сілтеу есімдіктері / указательные местоимения',
  'rule_24 — Емес / отрицание именных предложений',
  'rule_25 — Жіктік жалғаулары / аффиксы сказуемости',
].join('\n');

function buildPrompt(locale: 'kk' | 'ru'): string {
  if (locale === 'ru') {
    return `Ты — преподаватель казахского языка. На фото — рукописный (или печатный) текст ученика.

Задачи:
1. Распознать текст с фото (OCR) — БЕЗ ИСПРАВЛЕНИЙ И НОРМАЛИЗАЦИИ. Если ученик написал «Кәзақша» — ты передаёшь ровно «Кәзақша», а не «Қазақша». Любая авто-коррекция OCR недопустима — она лишает ученика обратной связи.
2. Найти орфографические, грамматические, пунктуационные и стилистические ошибки.
3. Дать общую оценку 0–100 + три суб-метрики (грамотность / связность / лексика).
4. Заполнить feedback и пояснения СТРОГО НА РУССКОМ. Английский запрещён. Казахский — только в цитатах примеров.
5. Если ошибка — лишнее слово, в поле "correction" пиши "(удалить)" по-русски (НЕ "(алынды)").

ОБЯЗАТЕЛЬНО для каждой ошибки заполнить:
- "word": цитата как написал ученик (ровно как на фото).
- "correction": правильный вариант. Если слово нужно удалить — "(удалить)".
- "rule": краткое название категории (например, «Притяжательные окончания», «Стиль»).
- "rule_explanation": 2-3 предложения на русском.
- "example_correct": 1-2 правильных примера.
- "rule_slug": если правило соответствует одному из ниже — этот slug; если нет — null.

Список slug-ов /basics:
${RULE_SLUGS_HINT}

Верни ТОЛЬКО JSON (без code-fence обёрток):
{
  "recognized_text": "точный распознанный текст без правок",
  "errors": [
    {
      "word": "...",
      "correction": "...",
      "rule": "...",
      "rule_explanation": "пояснение на русском, 2-3 предложения",
      "example_correct": ["...", "..."],
      "rule_slug": "rule_NN или null",
      "position": 0,
      "type": "spelling|grammar|punctuation|style"
    }
  ],
  "overall_score": 0..100,
  "feedback": "Общий отзыв на РУССКОМ, 2-4 предложения",
  "literacy_score": 0..100,
  "coherence_score": 0..100,
  "lexical_diversity": 0..100
}`;
  }

  // locale === 'kk'
  return `Сен қазақ тілі маманысың. Суретте оқушының қолжазба (немесе басылған) мәтіні бар.

Міндеттер:
1. Мәтінді тану (OCR) — ТҮЗЕТУСІЗ, нормалау жоқ. Оқушы "Кәзақша" жазса — сен дәл "Кәзақша" қайтар, "Қазақша" емес. Авто-түзету тыйым салынған.
2. Орфография, грамматика, тыныс белгілері, стиль қателерін тап.
3. Жалпы баға 0–100 + үш суб-көрсеткіш (грамотность / коһеренттілік / лексика).
4. Барлық feedback пен ереже түсіндірмелері — қазақша.
5. Егер қате — артық сөз болса, "correction" — "(жою)" немесе "(алып тастау)".

Әр қате үшін:
- "word", "correction", "rule", "rule_explanation" (2-3 сөйлем қазақша),
  "example_correct", "rule_slug" (сәйкес келсе ${RULE_SLUGS_HINT.split('\n')[0].split(' — ')[0]}..rule_25; сәйкес келмесе null).

Тек JSON қайтар, code-fence жоқ.`;
}

export async function checkPhotoText(
  imageBase64: string,
  mimeType: string,
  locale: 'kk' | 'ru' = 'kk',
  userId: string | null = null,
): Promise<PhotoCheckResult> {
  const prompt = buildPrompt(locale);
  const response = await analyzeImage(imageBase64, mimeType, prompt, { purpose: 'photo-check', userId });

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
          typeof e.rule_slug === 'string' && /^rule_\d{1,2}$/.test(e.rule_slug)
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
