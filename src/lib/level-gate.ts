/**
 * Утилиты для сравнения CEFR-уровней и проверки доступа к урокам.
 * Уровень пользователя >= required уровня урока => разблокировано.
 */

export const LEVEL_ORDER = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
export type CEFR = (typeof LEVEL_ORDER)[number];

/**
 * Индекс уровня в шкале CEFR. Для null/undefined/неизвестного значения — 0
 * (трактуем как «ниже самого низкого», у новичка без теста = A1-).
 */
export function levelIndex(lv?: string | null): number {
  if (!lv) return 0;
  const i = LEVEL_ORDER.indexOf(lv as CEFR);
  return i === -1 ? 0 : i;
}

/**
 * Разблокирован ли урок для данного пользователя.
 * - Если у урока нет required_level — всегда открыт.
 * - Иначе userLevel >= required.
 */
export function isUnlocked(
  userLevel: string | null | undefined,
  required: string | null | undefined
): boolean {
  if (!required) return true;
  return levelIndex(userLevel) >= levelIndex(required);
}
