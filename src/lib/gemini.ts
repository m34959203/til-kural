import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || '';

let genAI: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (!genAI) {
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

export async function chatWithAI(
  systemPrompt: string,
  userMessage: string,
  history: { role: string; content: string }[] = []
): Promise<string> {
  if (!apiKey) {
    return simulateAIResponse(userMessage);
  }

  const client = getClient();
  const model = client.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const contents = [
    ...history.map((h) => ({
      role: h.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: h.content }],
    })),
    { role: 'user', parts: [{ text: userMessage }] },
  ];

  const result = await model.generateContent({
    contents,
    systemInstruction: systemPrompt,
  });

  return result.response.text();
}

export async function analyzeImage(
  imageBase64: string,
  mimeType: string,
  prompt: string
): Promise<string> {
  if (!apiKey) {
    return simulatePhotoCheckResponse();
  }

  const client = getClient();
  const model = client.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const result = await model.generateContent([
    { text: prompt },
    {
      inlineData: {
        mimeType,
        data: imageBase64,
      },
    },
  ]);

  return result.response.text();
}

export interface ExerciseGenContext {
  /** Тема урока, на котором запущен генератор. Передаётся в промпт, чтобы
   *  AI генерировал задачи именно по теме (а не случайные про прошедшее время). */
  lessonTitle?: string;
  /** Целевой словарь темы (10–20 ключевых слов). Если задан — упражнения должны
   *  использовать ИМЕННО эти слова. */
  targetVocab?: string[];
  /** Целевая грамматика темы (правила из rule_ids). */
  targetGrammar?: string[];
  /** Локаль интерфейса — на каком языке давать пояснения. По умолчанию kk. */
  locale?: 'kk' | 'ru';
}

export async function generateExercises(
  topic: string,
  level: string,
  weakPoints: string[] = [],
  avgScore?: number,
  ctx: ExerciseGenContext = {},
): Promise<string> {
  const hasScore = typeof avgScore === 'number' && !Number.isNaN(avgScore);
  const scorePct = hasScore ? Math.round(avgScore as number) : null;
  const locale: 'kk' | 'ru' = ctx.locale === 'ru' ? 'ru' : 'kk';

  let difficultyBlock = '';
  let difficultyTag = 'standard';
  if (hasScore && scorePct !== null) {
    if (scorePct < 50) {
      difficultyTag = 'basic';
      difficultyBlock = `Студент часто ошибается в этой теме (средний балл ${scorePct}%). Дай базовые (basic) упражнения с подробными подсказками, простыми примерами и пошаговыми объяснениями. В поле "explanation" обязательно укажи правило и разбери ошибку. Отметь упражнения как "базовые" и используй простой уровень лексики.`;
    } else if (scorePct > 85) {
      difficultyTag = 'advanced';
      difficultyBlock = `Студент силён в этой теме (средний балл ${scorePct}%). Дай продвинутые (advanced) упражнения с нюансами: редкие исключения, стилистические оттенки, сложные конструкции. Отметь упражнения как "продвинутые".`;
    } else {
      difficultyBlock = `Средний балл студента по теме: ${scorePct}%. Дай сбалансированные упражнения стандартного уровня.`;
    }
  }

  const weakBlock = weakPoints.length > 0
    ? `Уделить особое внимание этим подтемам: ${weakPoints.join(', ')}.`
    : '';

  const lessonBlock = ctx.lessonTitle
    ? `КОНТЕКСТ УРОКА: «${ctx.lessonTitle}». Все упражнения должны быть про эту тему — лексика, ситуации и грамматика должны соответствовать теме урока, а не случайной грамматике.`
    : '';

  const vocabBlock = ctx.targetVocab && ctx.targetVocab.length > 0
    ? `ОБЯЗАТЕЛЬНО использовать в упражнениях эти слова темы (минимум 5 из списка): ${ctx.targetVocab.slice(0, 30).join(', ')}.`
    : '';

  const grammarBlock = ctx.targetGrammar && ctx.targetGrammar.length > 0
    ? `Грамматическая фокусировка: ${ctx.targetGrammar.join('; ')}.`
    : '';

  const localeNote = locale === 'ru'
    ? 'Поле "question" — пишется ПО-РУССКИ с пропуском для казахского слова или предложения; либо казахское предложение с пропуском, но переводом в скобках. Поле "explanation" — на русском.'
    : 'Поле "question" және "explanation" — қазақ тілінде.';

  const systemPrompt = `Ты — учитель казахского языка. Сгенерируй упражнения по заданной теме и уровню.
Уровень (CEFR): ${level}
Категория: ${topic}
${lessonBlock}
${vocabBlock}
${grammarBlock}
Режим сложности: ${difficultyTag}
${difficultyBlock}
${weakBlock}
${localeNote}

Верни ТОЛЬКО JSON-массив из 5 упражнений, без обрамления и комментариев:
[{"question": "...", "options": ["..."], "correct": "...", "explanation": "..."}]

В поле "explanation" обязательно отмечай сложность словом "базовые" (basic), "стандартные" или "продвинутые" (advanced) согласно режиму "${difficultyTag}".`;

  const userMessage = locale === 'ru'
    ? `Сделай 5 упражнений по теме «${ctx.lessonTitle || topic}» (категория: ${topic}, уровень ${level}, режим: ${difficultyTag}${scorePct !== null ? `, avg_score=${scorePct}%` : ''}).`
    : `${ctx.lessonTitle || topic} тақырыбынан ${level} деңгейіне сай 5 жаттығу жаса (категория: ${topic}, режим: ${difficultyTag}${scorePct !== null ? `, avg_score=${scorePct}%` : ''}).`;

  return chatWithAI(systemPrompt, userMessage);
}

export interface WritingCheckOptions {
  /** Локаль интерфейса. Определяет, на каком языке возвращается feedback. */
  locale?: 'kk' | 'ru';
  /** Жанр текста: free / letter / essay / application / sms / congrats. */
  genre?: string;
}

export async function checkWriting(text: string, level: string, opts: WritingCheckOptions = {}): Promise<string> {
  const locale: 'kk' | 'ru' = opts.locale === 'ru' ? 'ru' : 'kk';
  const genre = opts.genre || 'free';

  // Жанровая инструкция — каждый жанр имеет свой регистр.
  const genreNote = ((): string => {
    if (genre === 'letter') return locale === 'ru' ? 'Жанр: личное письмо. Допустим разговорный тон, обращение «дорогой/құрметті».' : 'Жанр: жеке хат. Жылы, ауызекі стиль.';
    if (genre === 'essay') return locale === 'ru' ? 'Жанр: эссе/сочинение. Литературный регистр, аргументация, абзацная структура.' : 'Жанр: эссе. Әдеби стиль, дәлелдеу, абзацтық құрылым.';
    if (genre === 'application') return locale === 'ru' ? 'Жанр: заявление/официальное письмо. Формальный регистр, без разговорных оборотов.' : 'Жанр: ресми хат / арыз. Формалды стиль.';
    if (genre === 'sms') return locale === 'ru' ? 'Жанр: SMS/мессенджер. Короткие фразы, ОК — разговорный стиль.' : 'Жанр: SMS / мессенджер. Қысқа, ауызекі стиль.';
    if (genre === 'congrats') return locale === 'ru' ? 'Жанр: поздравление. Тёплый стиль, пожелания.' : 'Жанр: құттықтау. Жылы стиль, тілектер.';
    return locale === 'ru' ? 'Жанр: свободный.' : 'Жанр: еркін.';
  })();

  if (locale === 'ru') {
    const systemPrompt = `Ты — преподаватель казахского языка. Проверь текст ученика и дай развёрнутый отзыв.

Целевой уровень CEFR: ${level}
${genreNote}

ВАЖНЫЕ ПРАВИЛА ОТВЕТА:
1. Ответ — СТРОГО в JSON. Никаких code-fence обёрток (тройные обратные кавычки), никакого текста до или после.
2. ВСЕ ПОЯСНЕНИЯ — НА РУССКОМ. Английский запрещён. Казахский — только в цитатах примеров (поле "original", "corrected").
3. Не придумывай ошибок там, где их нет. Если текст корректен — пустой массив corrections и высокий score.

ИЩИ ОШИБКИ ПО КАТЕГОРИЯМ:
• Орфография (опечатки, э/ё, нарушение гармонии гласных)
• Грамматика: падежные окончания (септік), притяжательные (тәуелдік), личные (жіктік), времена глагола, отрицание, порядок слов SOV
• Лексика: несуществующие слова, диалектизмы, устаревшие формы (һәм → және)
• Семантические противоречия (например, «25 лет + школа» — должно быть «университет»)

ОБЯЗАТЕЛЬНО ПРОВЕРЯЙ СТИЛЬ (а не только грамматику):
• Лексические повторы — одно слово 3+ раза в коротком тексте (например, «өте» 4 раза подряд)
• Тавтологичные предложения, которые можно объединить
• Однообразный синтаксис: повторы подлежащего «мен мен мен» в перечислении (нужно: «мен оқимын, жазамын, сөйлеймін»)
• Логические разрывы между предложениями
• Несоответствие жанру (если задан)

Каждая стилистическая проблема — отдельная запись в corrections с rule="Стиль" или rule="Повтор лексики".

Верни JSON со схемой:
{
  "score": 0-100,
  "corrections": [
    {
      "original": "цитата из текста как есть",
      "corrected": "исправленный вариант",
      "rule": "категория ошибки на русском (например: «Орфография», «Падежные окончания», «Стиль: повтор лексики»)",
      "explanation": "развёрнутое пояснение на русском, что не так и почему так лучше"
    }
  ],
  "feedback": "Общий отзыв 2-4 предложения на русском (включая стилистическую оценку)",
  "strengths": ["сильная сторона на русском", "..."],
  "improvements": ["что улучшить на русском", "..."]
}`;
    return chatWithAI(systemPrompt, `Проверь текст: """${text}"""`);
  }

  // locale === 'kk'
  const systemPrompt = `Сен қазақ тілінің оқытушысысың. Оқушының мәтінін тексер.

Мақсатты CEFR деңгейі: ${level}
${genreNote}

ЖАУАП ЕРЕЖЕЛЕРІ:
1. Жауап — тек қана JSON. \`\`\`json\`\`\` немесе кез келген қаптаманы қолданба.
2. БАРЛЫҚ түсіндірмелер ҚАЗАҚ ТІЛІНДЕ. Ағылшын тілі тыйым салынған.
3. Қате жоқ жерде ойдан қате тапма.

ҚАТЕ САНАТТАРЫН ТЕКСЕР:
• Орфография (қатеп жазу, дауысты үндестігі)
• Грамматика: септік, тәуелдік, жіктік, шақ, болымсыздық, SOV
• Лексика: жоқ сөздер, диалектизм, ескірген формалар (һәм → және)
• Мағыналық қарама-қайшылық

МІНДЕТТІ ТҮРДЕ СТИЛЬДІ ТЕКСЕР:
• Лексикалық қайталау (бір сөз қатарынан 3+ рет)
• Тавтология
• Бірыңғай синтаксис
• Логикалық үзілімдер

Әр стиль мәселесі — corrections-те жеке жазба, rule="Стиль".

JSON схемасы:
{
  "score": 0-100,
  "corrections": [{"original": "...", "corrected": "...", "rule": "санат қазақша", "explanation": "қазақша түсіндірме"}],
  "feedback": "Жалпы пікір қазақша 2-4 сөйлем",
  "strengths": ["..."],
  "improvements": ["..."]
}`;
  return chatWithAI(systemPrompt, `Мәтінді тексер: """${text}"""`);
}

function simulateAIResponse(message: string): string {
  const responses = [
    'Сәлеметсіз бе! Мен сіздің қазақ тілі мұғаліміңізбін. Сұрағыңызға жауап берейін.',
    'Жақсы сұрақ! Қазақ тілінде бұл тақырып өте маңызды.',
    'Дұрыс! Жаттығуды жалғастырайық. Келесі тапсырманы орындаңыз.',
    'Қазақ тілін үйрену — ұлы іс! Жалғастырыңыз!',
  ];
  return responses[Math.floor(Math.random() * responses.length)] +
    `\n\n(Демо режим — Gemini API кілтін .env файлына қосыңыз)\nСіздің сұрағыңыз: "${message}"`;
}

function simulatePhotoCheckResponse(): string {
  return JSON.stringify({
    recognized_text: 'Бұл демо режимдегі мәтін танылуы.',
    errors: [
      { word: 'мысал', correction: 'мысалы', rule: 'Буын үндестігі', position: 0 },
    ],
    overall_score: 75,
    feedback: 'Жалпы жақсы жазылған. Кейбір орфографиялық қателер бар.',
  });
}
