/**
 * КАЗТЕСТ scoring: 100-балльная шкала по секциям.
 * Основано на реальной структуре: аудирование, чтение, лексика-грамматика, письмо.
 * Веса подогнаны под типовое соотношение секций в официальном КАЗТЕСТ.
 */

export type Section = 'listening' | 'reading' | 'grammar' | 'vocabulary' | 'writing';
export type KaztestLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

export const SECTION_WEIGHTS: Record<Section, number> = {
  listening: 20,
  reading: 20,
  grammar: 25,
  vocabulary: 15,
  writing: 20,
};

const LEVEL_NAMES_KK: Record<KaztestLevel, string> = {
  A1: 'Бастауыш',
  A2: 'Қарапайым',
  B1: 'Орта',
  B2: 'Ортадан жоғары',
  C1: 'Жоғары',
};

const LEVEL_NAMES_RU: Record<KaztestLevel, string> = {
  A1: 'Начальный',
  A2: 'Элементарный',
  B1: 'Средний',
  B2: 'Выше среднего',
  C1: 'Продвинутый',
};

export interface SectionResult {
  section: Section;
  correct: number;
  total: number;
  weightedPoints: number;
  maxWeightedPoints: number;
  percent: number;
}

export interface KaztestResult {
  totalScore: number;           // 0-100
  level: KaztestLevel | 'FAIL';
  levelName: { kk: string; ru: string };
  correctCount: number;
  totalQuestions: number;
  sections: SectionResult[];
  passed: boolean;
}

export function computeKaztestResult(
  questions: Array<{ topic: string; correct_answer: string; difficulty: string }>,
  answers: Record<number, string>,
): KaztestResult {
  // Group by section
  const bySection: Record<Section, { correct: number; total: number }> = {
    listening: { correct: 0, total: 0 },
    reading: { correct: 0, total: 0 },
    grammar: { correct: 0, total: 0 },
    vocabulary: { correct: 0, total: 0 },
    writing: { correct: 0, total: 0 },
  };

  let correctCount = 0;
  questions.forEach((q, idx) => {
    const section = (q.topic as Section) in bySection ? (q.topic as Section) : 'grammar';
    bySection[section].total++;
    if (answers[idx] === q.correct_answer) {
      bySection[section].correct++;
      correctCount++;
    }
  });

  // Compute weighted score
  let totalScore = 0;
  let totalMaxWeight = 0;
  const sections: SectionResult[] = [];

  for (const sec of Object.keys(bySection) as Section[]) {
    const { correct, total } = bySection[sec];
    if (total === 0) continue;
    const weight = SECTION_WEIGHTS[sec];
    const weightedPoints = (correct / total) * weight;
    totalScore += weightedPoints;
    totalMaxWeight += weight;
    sections.push({
      section: sec,
      correct,
      total,
      weightedPoints: Math.round(weightedPoints * 10) / 10,
      maxWeightedPoints: weight,
      percent: Math.round((correct / total) * 100),
    });
  }

  // Normalize to 100 if some sections missing
  const normalizedScore = totalMaxWeight > 0 ? Math.round((totalScore / totalMaxWeight) * 100) : 0;

  const level = scoreToLevel(normalizedScore);
  const passed = normalizedScore >= 30;

  return {
    totalScore: normalizedScore,
    level,
    levelName: {
      kk: level === 'FAIL' ? 'Деңгей анықталмады' : LEVEL_NAMES_KK[level],
      ru: level === 'FAIL' ? 'Уровень не определён' : LEVEL_NAMES_RU[level],
    },
    correctCount,
    totalQuestions: questions.length,
    sections,
    passed,
  };
}

function scoreToLevel(score: number): KaztestLevel | 'FAIL' {
  if (score >= 90) return 'C1';
  if (score >= 75) return 'B2';
  if (score >= 60) return 'B1';
  if (score >= 45) return 'A2';
  if (score >= 30) return 'A1';
  return 'FAIL';
}

export const SECTION_LABELS: Record<Section, { kk: string; ru: string }> = {
  listening: { kk: 'Тыңдау', ru: 'Аудирование' },
  reading: { kk: 'Оқу', ru: 'Чтение' },
  grammar: { kk: 'Грамматика', ru: 'Грамматика' },
  vocabulary: { kk: 'Сөздік қор', ru: 'Лексика' },
  writing: { kk: 'Жазу', ru: 'Письмо' },
};

export const LEVEL_THRESHOLDS = [
  { min: 90, level: 'C1' as const, desc_kk: 'Жоғары — еркін сөйлеу', desc_ru: 'Продвинутый — свободное владение' },
  { min: 75, level: 'B2' as const, desc_kk: 'Ортадан жоғары — күрделі мәтіндер', desc_ru: 'Выше среднего — сложные тексты' },
  { min: 60, level: 'B1' as const, desc_kk: 'Орта — күнделікті қарым-қатынас', desc_ru: 'Средний — повседневное общение' },
  { min: 45, level: 'A2' as const, desc_kk: 'Қарапайым — негізгі жағдайлар', desc_ru: 'Элементарный — базовые ситуации' },
  { min: 30, level: 'A1' as const, desc_kk: 'Бастауыш — қарапайым сөздер', desc_ru: 'Начальный — простые слова' },
];
