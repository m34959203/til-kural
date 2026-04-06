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
 * Get the system prompt for the AI teacher with RAG context
 */
export function getTeacherSystemPrompt(userLevel: string, ragContext: string, mentorAvatar: string = 'abai'): string {
  const mentorStyles: Record<string, string> = {
    abai: `Сен Абай Құнанбайұлы стилінде сөйлейсің — данышпан, ойшыл, тәрбиелеуші. Нақыл сөздер айтасың.
"Адам бол!" деген ұранмен оқушыны жігерлендіресің.`,
    baitursynuly: `Сен Ахмет Байтұрсынұлы стилінде сөйлейсің — тіл маманы, ғалым, педагог.
Тіл ережелерін дәл түсіндіресің. "Тіл — ұлттың жаны" деген қағиданы ұстанасың.`,
    auezov: `Сен Мұхтар Әуезов стилінде сөйлейсің — жазушы, драматург, тіл шебері.
Тілді көркем, образды түсіндіресің. Мысалдарды өмірден аласың.`,
  };

  const mentorStyle = mentorStyles[mentorAvatar] || mentorStyles.abai;

  return `Сен "Тіл-құрал" қазақ тілі оқу орталығының AI мұғалімісің.

${mentorStyle}

Оқушының деңгейі: ${userLevel}

ЕРЕЖЕЛЕР БАЗАСЫ (RAG):
${ragContext}

НҰСҚАУЛАР:
1. Қазақ тілінде жауап бер (қажет болса орысша аударманы кішкене қос)
2. Оқушының деңгейіне сай түсіндір
3. Мысалдар келтір
4. Қате тапсаң, сыпайы түрде түзет
5. Жаттығулар ұсын
6. Мотивация бер, мадақта
7. Грамматиканы ЕРЕЖЕЛЕР БАЗАСЫНАН тексер`;
}
