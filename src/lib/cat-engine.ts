/**
 * CAT (Computerized Adaptive Testing) engine для определения уровня A1-C2.
 *
 * Логика:
 *   - старт с B1;
 *   - 2 правильных подряд на уровне X → следующий вопрос уровня X+1;
 *   - 2 неправильных подряд → X-1;
 *   - одинокая ошибка после правильных — остаёмся на текущем уровне;
 *   - стоп после 15 вопросов (или 10 если стабилизация на одном уровне подряд).
 *   - финальный уровень — mode последних 4 корректных ответов;
 *   - если есть 3+ правильных C2 — итог C2.
 */

export type CEFR = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export const CEFR_ORDER: CEFR[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export interface BankQuestion {
  id: string;
  test_type: string;
  topic: string;
  difficulty: string;
  question_kk: string;
  question_ru?: string;
  options: string[];
  correct_answer: string;
  explanation_kk?: string;
  explanation_ru?: string;
}

export interface AnsweredItem {
  questionId: string;
  correct: boolean;
  /** Уровень вопроса, который был задан (для реконструкции состояния) */
  difficulty?: CEFR;
}

export interface CATSession {
  currentLevel: CEFR;
  correctStreak: number;
  incorrectStreak: number;
  answered: AnsweredItem[];
  usedIds: Set<string>;
}

export const MIN_QUESTIONS = 10;
export const MAX_QUESTIONS = 15;
export const STABILIZATION_WINDOW = 6; // сколько последних вопросов смотрим на «залип» уровень

export function isCEFR(x: unknown): x is CEFR {
  return typeof x === 'string' && (CEFR_ORDER as readonly string[]).includes(x);
}

export function clampLevel(idx: number): CEFR {
  if (idx < 0) return CEFR_ORDER[0];
  if (idx > CEFR_ORDER.length - 1) return CEFR_ORDER[CEFR_ORDER.length - 1];
  return CEFR_ORDER[idx];
}

export function nextLevelUp(level: CEFR): CEFR {
  return clampLevel(CEFR_ORDER.indexOf(level) + 1);
}

export function nextLevelDown(level: CEFR): CEFR {
  return clampLevel(CEFR_ORDER.indexOf(level) - 1);
}

/**
 * Восстанавливает состояние CAT-сессии из полной истории ответов.
 * history[i].difficulty — уровень вопроса, который был задан.
 * Сервер (stateless) вызывает это на каждом шаге.
 */
export function buildSession(history: AnsweredItem[], bank: BankQuestion[]): CATSession {
  const bankById = new Map(bank.map((q) => [q.id, q]));
  let level: CEFR = 'B1';
  let correctStreak = 0;
  let incorrectStreak = 0;
  const usedIds = new Set<string>();

  for (const a of history) {
    usedIds.add(a.questionId);
    const q = bankById.get(a.questionId);
    const diff: CEFR = isCEFR(a.difficulty)
      ? a.difficulty
      : q && isCEFR(q.difficulty)
        ? (q.difficulty as CEFR)
        : level;
    // уровень этого вопроса = diff; после него корректируем `level`.
    if (a.correct) {
      correctStreak += 1;
      incorrectStreak = 0;
      if (correctStreak >= 2) {
        level = nextLevelUp(diff);
        correctStreak = 0; // сбрасываем стрик при переходе
      } else {
        level = diff; // остаёмся
      }
    } else {
      incorrectStreak += 1;
      correctStreak = 0;
      if (incorrectStreak >= 2) {
        level = nextLevelDown(diff);
        incorrectStreak = 0;
      } else {
        level = diff; // одинокая ошибка — на том же
      }
    }
  }

  return {
    currentLevel: level,
    correctStreak,
    incorrectStreak,
    answered: history.slice(),
    usedIds,
  };
}

/**
 * Выбирает следующий вопрос по состоянию сессии.
 * Если на уровне вопросы закончились — пробует соседние уровни.
 * Возвращает null если вопросов не осталось.
 */
export function selectNextQuestion(
  history: AnsweredItem[],
  bank: BankQuestion[],
): { question: BankQuestion; level: CEFR } | null {
  const session = buildSession(history, bank);
  const levelQuestions = (lvl: CEFR) =>
    bank.filter((q) => q.test_type === 'level' && q.difficulty === lvl && !session.usedIds.has(q.id));

  // 1) пробуем текущий уровень
  const candidates = levelQuestions(session.currentLevel);
  if (candidates.length > 0) {
    const picked = candidates[Math.floor(Math.random() * candidates.length)];
    return { question: picked, level: session.currentLevel };
  }

  // 2) расширяем поиск: сначала выше, потом ниже, потом по всем
  const idx = CEFR_ORDER.indexOf(session.currentLevel);
  for (let delta = 1; delta < CEFR_ORDER.length; delta++) {
    for (const sign of [+1, -1]) {
      const neighbor = CEFR_ORDER[idx + sign * delta];
      if (!neighbor) continue;
      const list = levelQuestions(neighbor);
      if (list.length > 0) {
        const picked = list[Math.floor(Math.random() * list.length)];
        return { question: picked, level: neighbor };
      }
    }
  }

  return null;
}

/**
 * Признак остановки теста.
 */
export function shouldStop(history: AnsweredItem[]): boolean {
  if (history.length >= MAX_QUESTIONS) return true;
  if (history.length < MIN_QUESTIONS) return false;

  // Стабилизация: последние STABILIZATION_WINDOW ответов все на одном уровне
  const tail = history.slice(-STABILIZATION_WINDOW);
  if (tail.length < STABILIZATION_WINDOW) return false;
  const levels = tail.map((a) => a.difficulty).filter(isCEFR);
  if (levels.length !== tail.length) return false;
  const unique = new Set(levels);
  return unique.size === 1;
}

/**
 * Оценка финального уровня по истории.
 * Правила:
 *  1) Если правильных ответов на C2 ≥ 3 — итог C2.
 *  2) Иначе — mode уровней последних 4 *правильных* ответов.
 *  3) Если правильных нет вообще — A1.
 */
export function estimateLevel(history: AnsweredItem[]): CEFR {
  const correctAnswers = history.filter((a) => a.correct && isCEFR(a.difficulty)) as Array<
    AnsweredItem & { difficulty: CEFR }
  >;

  const c2Count = correctAnswers.filter((a) => a.difficulty === 'C2').length;
  if (c2Count >= 3) return 'C2';

  if (correctAnswers.length === 0) return 'A1';

  // mode последних 4 правильных
  const recent = correctAnswers.slice(-4);
  const counts = new Map<CEFR, number>();
  for (const a of recent) {
    counts.set(a.difficulty, (counts.get(a.difficulty) || 0) + 1);
  }
  let bestLevel: CEFR = recent[recent.length - 1].difficulty;
  let bestCount = -1;
  for (const [lvl, cnt] of counts.entries()) {
    if (
      cnt > bestCount ||
      (cnt === bestCount && CEFR_ORDER.indexOf(lvl) > CEFR_ORDER.indexOf(bestLevel))
    ) {
      bestLevel = lvl;
      bestCount = cnt;
    }
  }
  return bestLevel;
}
