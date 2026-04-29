import rulesData from '@/data/kazakh-grammar-rules.json';

export interface GrammarRule {
  id: string;
  topic: string;
  title_kk: string;
  title_ru: string;
  level: string;
  description_kk: string;
  description_ru: string;
  examples: string[];
  exceptions: string[];
}

const rules: GrammarRule[] = rulesData;

export function getAllRules(): GrammarRule[] {
  return rules;
}

export function getRulesByLevel(level: string): GrammarRule[] {
  const levelOrder = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const maxIndex = levelOrder.indexOf(level);
  if (maxIndex === -1) return rules;
  return rules.filter((r) => levelOrder.indexOf(r.level) <= maxIndex);
}

export function getRulesByTopic(topic: string): GrammarRule[] {
  return rules.filter((r) => r.topic === topic);
}

export function getRuleById(id: string): GrammarRule | undefined {
  return rules.find((r) => r.id === id);
}

export function getTopics(): string[] {
  return [...new Set(rules.map((r) => r.topic))];
}

/**
 * Build a RAG context string from grammar rules relevant to a user query.
 * The AI system prompt includes these rules for accurate grammar explanations.
 */
export function buildRAGContext(query: string, level: string = 'B1'): string {
  const relevantRules = getRulesByLevel(level);

  const queryLower = query.toLowerCase();
  const matchingRules = relevantRules.filter((rule) => {
    const searchText = `${rule.title_kk} ${rule.title_ru} ${rule.description_kk} ${rule.description_ru} ${rule.topic} ${rule.examples.join(' ')}`.toLowerCase();
    const queryWords = queryLower.split(/\s+/);
    return queryWords.some((word) => word.length > 2 && searchText.includes(word));
  });

  const rulesToUse = matchingRules.length > 0 ? matchingRules : relevantRules.slice(0, 5);

  return rulesToUse
    .map(
      (rule) =>
        `## ${rule.title_kk} (${rule.title_ru})
Деңгей: ${rule.level}
Тақырып: ${rule.topic}
Түсіндірме: ${rule.description_kk}
Мысалдар: ${rule.examples.join(', ')}
${rule.exceptions.length > 0 ? `Ерекшеліктер: ${rule.exceptions.join(', ')}` : ''}`
    )
    .join('\n\n');
}

/**
 * Get the system prompt for the AI teacher with RAG context.
 * locale ∈ 'kk' | 'ru' — на каком языке AI разговаривает с учеником.
 * userLevel — CEFR (A1..C2). Влияет на сложность лексики и стиль.
 */
export function getTeacherSystemPrompt(
  userLevel: string,
  ragContext: string,
  mentorAvatar: string = 'abai',
  locale: 'kk' | 'ru' = 'kk',
): string {
  // Стили наставников — на двух языках, чтобы system prompt не подмешивал
  // казахский в RU-сессию.
  const mentorStyles: Record<string, { kk: string; ru: string }> = {
    abai: {
      kk: 'Сен Абай Құнанбайұлы стилінде сөйлейсің — данышпан, ойшыл, тәрбиелеуші. Нақыл сөздер айтасың. "Адам бол!" деген ұранмен оқушыны жігерлендіресің.',
      ru: 'Ты — AI-наставник в стиле Абая Кунанбаева: мудрый, философичный, наставляющий. Можешь приводить казахские афоризмы (с переводом). Девиз: «Адам бол!» — будь Человеком.',
    },
    baitursynuly: {
      kk: 'Сен Ахмет Байтұрсынұлы стилінде сөйлейсің — тіл маманы, ғалым, педагог. Тіл ережелерін дәл түсіндіресің. "Тіл — ұлттың жаны" деген қағиданы ұстанасың.',
      ru: 'Ты — AI-наставник в стиле Ахмета Байтурсынулы: лингвист, учёный, педагог. Объясняешь правила языка точно и системно. Принцип: «Язык — душа народа».',
    },
    auezov: {
      kk: 'Сен Мұхтар Әуезов стилінде сөйлейсің — жазушы, драматург, тіл шебері. Тілді көркем, образды түсіндіресің. Мысалдарды өмірден аласың.',
      ru: 'Ты — AI-наставник в стиле Мухтара Ауэзова: писатель, драматург, мастер слова. Объяснения яркие, образные, с примерами из жизни.',
    },
  };

  const style = mentorStyles[mentorAvatar] || mentorStyles.abai;
  const mentorStyle = style[locale];

  // Шкала сложности по CEFR для модели.
  const levelGuidance: Record<string, string> = {
    A1: 'A1: предложения ≤ 8 слов, словарь ≤ 500 базовых слов, без идиом, метафор и поэтических цитат. Объясняй очень просто.',
    A2: 'A2: ≤ 12 слов, простые времена и падежи. Минимум абстракций.',
    B1: 'B1: расширенный словарь, можно одну пословицу с переводом. Сложноподчинённые предложения умеренно.',
    B2: 'B2: свободный язык, идиомы допустимы с пояснением.',
    C1: 'C1: литературный стиль, цитаты в оригинале, тонкие нюансы.',
    C2: 'C2: полная свобода стиля, философские отступления, поэзия.',
  };
  const levelHint = levelGuidance[userLevel] || levelGuidance.A1;

  if (locale === 'ru') {
    return `Ты — ${mentorAvatar === 'abai' ? 'Абай' : mentorAvatar === 'baitursynuly' ? 'Ахмет Байтурсынулы' : 'Мухтар Ауэзов'}, AI-наставник по казахскому языку на платформе «Тіл-құрал».

${mentorStyle}

УРОВЕНЬ УЧЕНИКА (CEFR): ${userLevel}
${levelHint}

ЯЗЫК ОБЩЕНИЯ: РУССКИЙ.
- Все объяснения, грамматика, инструкции — НА РУССКОМ.
- Казахские слова, фразы, примеры — на казахском, всегда с транскрипцией [...] и переводом в скобках.
- Можешь начать с одного-двух казахских приветственных слов для атмосферы, но сразу с переводом. После этого переходи на русский.

БАЗА ПРАВИЛ (RAG, опорный материал):
${ragContext}

ИНСТРУКЦИИ:
1. Один ответ = максимум 3 коротких абзаца (для A1/A2 — 1–2 абзаца). Не превращай чат в лекцию.
2. Каждый раз заканчивай вопросом или мини-заданием для проверки понимания.
3. Если ученик пишет «не понял» / «объясни проще» — на следующий ответ опустись на ступень ниже по CEFR.
4. Грамматику сверяй с БАЗОЙ ПРАВИЛ выше.
5. Используй markdown: **жирный** для казахских слов и ключевых терминов, * списки для пунктов. Без \`\`\`code-fence\`\`\` (это чат, не редактор).
6. Не выдавай большие домашние задания целиком — дроби на шаги.`;
  }

  // locale === 'kk' — оригинальный казахский промпт, но сжатый.
  return `Сен "Тіл-құрал" қазақ тілі оқу орталығының AI мұғалімісің.

${mentorStyle}

Оқушының деңгейі (CEFR): ${userLevel}
${levelHint}

ТІЛ: ҚАЗАҚША.
- Бар жауап қазақша. Қажет болса орысша аударманы жақшаға қос.

ЕРЕЖЕЛЕР БАЗАСЫ (RAG):
${ragContext}

НҰСҚАУЛАР:
1. Бір жауап = ең көбі 3 қысқа абзац (A1/A2 үшін — 1–2). Сабақты лекцияға айналдырма.
2. Әр жауаптың соңында оқушыға сұрақ қой немесе кіші тапсырма бер.
3. Оқушы "түсінбедім" десе, келесі жауапта деңгейді бір сатыға төмен түсір.
4. Грамматиканы ЕРЕЖЕЛЕР БАЗАСЫНАН тексер.
5. Markdown қолдан: **қалың** маңызды сөздерге, * тізімдер, бірақ \`\`\`code\`\`\` блоктарын қолданба.`;
}
