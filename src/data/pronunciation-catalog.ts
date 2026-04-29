/**
 * Каталог фонетической практики казахского — расширенный после audit
 * (было 12 фраз, стало 60+ единиц с покрытием всех 9 специфических звуков:
 *  ә, і, ң, ғ, қ, ө, ұ, ү, һ — 4 из них (ғ, ө, ұ, һ) ранее отсутствовали).
 *
 * Сгруппировано по типу:
 *  - sounds       — отдельные звуки (с примерами в начале/середине/конце)
 *  - words        — короткие слова (A1)
 *  - phrases      — фразы (A1–B1)
 *  - minimalPairs — минимальные пары для слухоразличения
 *  - tongueTwisters — скороговорки (B1+)
 */

export type PracticeLevel = 'A0' | 'A1' | 'A2' | 'B1' | 'B2';

export interface PracticeItem {
  word: string;
  translation: string;
  level: PracticeLevel;
  /** Опц. опорный звук — для тэгов и фильтрации. */
  focusSound?: string;
}

export interface MinimalPair {
  a: string;
  a_ru: string;
  b: string;
  b_ru: string;
  contrast: string; // например, 'қ vs к'
  level: PracticeLevel;
}

export interface SoundCard {
  letter: string;
  ipa: string;
  description_ru: string;
  examples: string[]; // казахские слова с этим звуком
}

// ─────────────────── 9 специфических звуков ───────────────────
export const KK_SOUNDS: SoundCard[] = [
  {
    letter: 'Ә ә',
    ipa: '[æ]',
    description_ru: 'Открытый передний — как «a» в англ. cat или нем. ä в Bär.',
    examples: ['әке (отец)', 'әдемі (красивый)', 'кәрі (старый)'],
  },
  {
    letter: 'І і',
    ipa: '[ɪ]',
    description_ru: 'Краткое «и» — как «i» в англ. sit (короче и слабее русского «и»).',
    examples: ['ішім (живот)', 'іні (младший брат)', 'тіл (язык)'],
  },
  {
    letter: 'Ң ң',
    ipa: '[ŋ]',
    description_ru: 'Носовой как «ng» в англ. sing — без размыкания на «г».',
    examples: ['таң (рассвет)', 'жаңа (новый)', 'мың (тысяча)'],
  },
  {
    letter: 'Ғ ғ',
    ipa: '[ʁ]',
    description_ru: 'Звонкий увулярный — нечто среднее между «г» и французским/арабским «р». Язык глубоко в задней части.',
    examples: ['ағаш (дерево)', 'тағам (еда)', 'тоғыз (девять)'],
  },
  {
    letter: 'Қ қ',
    ipa: '[q]',
    description_ru: 'Глухой увулярный — как русское «к», но язык глубже, как при лёгком покашливании. Аналог арабского ق.',
    examples: ['қала (город)', 'қыз (девушка)', 'тарақ (расчёска)'],
  },
  {
    letter: 'Ө ө',
    ipa: '[œ]',
    description_ru: 'Округлённое мягкое «о» — как нем. «ö» в schön. Губы трубочкой, как для «у», но звук «э».',
    examples: ['өзен (река)', 'көл (озеро)', 'өмір (жизнь)'],
  },
  {
    letter: 'Ұ ұ',
    ipa: '[ʊ]',
    description_ru: 'Краткое «у» — губы менее напряжены, чем в русском «у», звук короче.',
    examples: ['ұл (сын)', 'ұлы (великий)', 'тұр (стой)'],
  },
  {
    letter: 'Ү ү',
    ipa: '[y]',
    description_ru: 'Округлённое «и» — как нем. «ü» в über. Губы трубочкой, но звук «и».',
    examples: ['үй (дом)', 'үш (три)', 'күн (день/солнце)'],
  },
  {
    letter: 'Һ һ',
    ipa: '[h]',
    description_ru: 'Придыхательный «х» — как англ. «h» в hello (только в заимствованиях, в основном арабских).',
    examples: ['қаһарман (герой)', 'шаһар (город)', 'гауһар (бриллиант)'],
  },
];

// ─────────────────── Слова для практики ───────────────────
export const KK_WORDS: PracticeItem[] = [
  // A1 — простые слова без специфических звуков
  { word: 'мама', translation: 'мама', level: 'A1' },
  { word: 'ата', translation: 'дед', level: 'A1' },
  { word: 'апа', translation: 'старшая сестра / бабушка', level: 'A1' },
  { word: 'нан', translation: 'хлеб', level: 'A1' },
  { word: 'су', translation: 'вода', level: 'A1' },
  { word: 'жол', translation: 'дорога', level: 'A1' },
  { word: 'кітап', translation: 'книга', level: 'A1' },
  // A1 — со специфическими звуками (отдельно)
  { word: 'әке', translation: 'отец', level: 'A1', focusSound: 'ә' },
  { word: 'тіл', translation: 'язык', level: 'A1', focusSound: 'і' },
  { word: 'таң', translation: 'рассвет', level: 'A1', focusSound: 'ң' },
  { word: 'қала', translation: 'город', level: 'A1', focusSound: 'қ' },
  { word: 'қыз', translation: 'девушка', level: 'A1', focusSound: 'қ' },
  { word: 'үй', translation: 'дом', level: 'A1', focusSound: 'ү' },
  { word: 'үш', translation: 'три', level: 'A1', focusSound: 'ү' },
  { word: 'күн', translation: 'день / солнце', level: 'A1', focusSound: 'ү' },
  { word: 'ағаш', translation: 'дерево', level: 'A1', focusSound: 'ғ' },
  { word: 'тағам', translation: 'еда', level: 'A1', focusSound: 'ғ' },
  { word: 'тоғыз', translation: 'девять', level: 'A1', focusSound: 'ғ' },
  { word: 'өзен', translation: 'река', level: 'A1', focusSound: 'ө' },
  { word: 'көл', translation: 'озеро', level: 'A1', focusSound: 'ө' },
  { word: 'өмір', translation: 'жизнь', level: 'A1', focusSound: 'ө' },
  { word: 'ұл', translation: 'сын', level: 'A1', focusSound: 'ұ' },
  { word: 'ұлы', translation: 'великий', level: 'A1', focusSound: 'ұ' },
  { word: 'тұр', translation: 'стой', level: 'A1', focusSound: 'ұ' },
  { word: 'қаһарман', translation: 'герой', level: 'A2', focusSound: 'һ' },
  { word: 'шаһар', translation: 'город', level: 'A2', focusSound: 'һ' },
  { word: 'гауһар', translation: 'бриллиант', level: 'B1', focusSound: 'һ' },
  // A2 — слова посложнее
  { word: 'мектеп', translation: 'школа', level: 'A2' },
  { word: 'мұғалім', translation: 'учитель', level: 'A2' },
  { word: 'жұмыс', translation: 'работа', level: 'A2' },
  { word: 'кофе', translation: 'кофе', level: 'A2' },
];

// ─────────────────── Фразы для практики ───────────────────
export const KK_PHRASES: PracticeItem[] = [
  // A1 — приветствия и базовые фразы
  { word: 'Сәлеметсіз бе!', translation: 'Здравствуйте!', level: 'A1' },
  { word: 'Сәлем!', translation: 'Привет!', level: 'A1' },
  { word: 'Қалайсыз?', translation: 'Как дела?', level: 'A1' },
  { word: 'Жақсы, рақмет', translation: 'Хорошо, спасибо', level: 'A1' },
  { word: 'Менің атым…', translation: 'Меня зовут…', level: 'A1' },
  { word: 'Сау болыңыз!', translation: 'До свидания!', level: 'A1' },
  { word: 'Қош келдіңіз!', translation: 'Добро пожаловать!', level: 'A1' },
  { word: 'Қайырлы таң!', translation: 'Доброе утро!', level: 'A1' },
  { word: 'Қайырлы кеш!', translation: 'Добрый вечер!', level: 'A1' },
  { word: 'Иә / Жоқ', translation: 'Да / Нет', level: 'A1' },
  // A2 — повседневное
  { word: 'Қазір сағат қанша?', translation: 'Который сейчас час?', level: 'A2' },
  { word: 'Бұл қанша тұрады?', translation: 'Сколько это стоит?', level: 'A2' },
  { word: 'Кешіріңіз', translation: 'Извините', level: 'A2' },
  { word: 'Ауа райы қандай?', translation: 'Какая погода?', level: 'A2' },
  { word: 'Бүгін жақсы күн', translation: 'Сегодня хороший день', level: 'A2' },
  { word: 'Мен қазақша үйренемін', translation: 'Я учу казахский', level: 'A2' },
  // B1 — пословицы и культурное
  { word: 'Тіл — қарудан да күшті', translation: 'Язык сильнее оружия', level: 'B1' },
  { word: 'Білім — бақыт кілті', translation: 'Знание — ключ к счастью', level: 'B1' },
  { word: 'Еңбек етсең ерінбей, тояды қарның тіленбей', translation: 'Если работать без лени — не будешь голодать', level: 'B1' },
  { word: 'Жақсы сөз — жарым ырыс', translation: 'Доброе слово — половина счастья', level: 'B1' },
];

// ─────────────────── Минимальные пары ───────────────────
export const KK_MINIMAL_PAIRS: MinimalPair[] = [
  { a: 'қол', a_ru: 'рука', b: 'көл', b_ru: 'озеро', contrast: 'қ [q] vs к [k]', level: 'A1' },
  { a: 'қара', a_ru: 'чёрный', b: 'кәрі', b_ru: 'старый', contrast: 'қ + а vs к + ә', level: 'A1' },
  { a: 'өл', a_ru: 'умри', b: 'ол', b_ru: 'он / она', contrast: 'ө [œ] vs о [o]', level: 'A1' },
  { a: 'ұл', a_ru: 'сын', b: 'у', b_ru: 'яд', contrast: 'ұ [ʊ] vs у [u] (долгое)', level: 'A1' },
  { a: 'үш', a_ru: 'три', b: 'уш', b_ru: 'беги (повел.)', contrast: 'ү [y] vs у [u]', level: 'A1' },
  { a: 'таң', a_ru: 'рассвет', b: 'тан', b_ru: 'отвергай', contrast: 'ң [ŋ] vs н [n]', level: 'A1' },
  { a: 'ағаш', a_ru: 'дерево', b: 'ашу', b_ru: 'открой', contrast: 'ғ [ʁ] vs к [k]', level: 'A2' },
  { a: 'ән', a_ru: 'песня', b: 'ан', b_ru: 'зверь', contrast: 'ә [æ] vs а [a]', level: 'A1' },
  { a: 'тіл', a_ru: 'язык', b: 'тыл', b_ru: 'тыл', contrast: 'і [ɪ] vs ы [ɯ]', level: 'A2' },
  { a: 'көк', a_ru: 'голубой', b: 'кек', b_ru: 'месть', contrast: 'ө [œ] vs е [e]', level: 'A2' },
];

// ─────────────────── Скороговорки ───────────────────
export const KK_TONGUE_TWISTERS: PracticeItem[] = [
  { word: 'Қара қарға қарқылдайды', translation: 'Чёрная ворона каркает (тренируем қ-р)', level: 'B1' },
  { word: 'Көк көген, көк көрпе, көк көйлек', translation: 'Голубое одеяло, голубая рубашка (тренируем к-ө)', level: 'B1' },
  { word: 'Ағаштан ағаштан ағарған ағаш', translation: 'Дерево, побелевшее от дерева (тренируем ғ-а)', level: 'B2' },
  { word: 'Бөкен бөлмеде бөктерген бөренеге сүйенеді', translation: 'Косуля в комнате опирается на сухое бревно (мягкие гласные)', level: 'B2' },
];
