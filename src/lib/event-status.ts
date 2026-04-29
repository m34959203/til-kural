/**
 * Авто-вычисление статуса мероприятия на основе текущего времени.
 *
 * Раньше status был чисто ручным полем — администратор не успевал
 * переводить «upcoming → past» руками, и события «протухали» (audit
 * /admin/events: семинар 25.04 числился upcoming через 5 дней).
 *
 * Теперь UI и публичный фильтр используют effective_status, который
 * вычисляется по start_date / end_date / stored status.
 *
 * Правила:
 *   - 'cancelled' / 'draft' — никогда не перезаписываем (явно выставлены).
 *   - now < start_date            → 'upcoming'
 *   - start_date ≤ now ≤ end_date → 'ongoing'
 *   - now > end_date              → 'past'
 *   - end_date отсутствует:
 *       now < start_date  → 'upcoming'
 *       now ≥ start_date  → 'past' (после старта без явного окончания
 *                             считаем «прошло» через 1 день, иначе ongoing)
 */

export type EventStatus = 'draft' | 'upcoming' | 'ongoing' | 'past' | 'cancelled';

export interface EventLike {
  start_date?: string | Date | null;
  end_date?: string | Date | null;
  status?: string | null;
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export function computeEffectiveStatus(event: EventLike, now: Date = new Date()): EventStatus {
  const stored = (event.status as EventStatus) || 'upcoming';
  // Явные финальные статусы не переписываем.
  if (stored === 'cancelled' || stored === 'draft') return stored;

  const startMs = event.start_date ? new Date(event.start_date as string).getTime() : NaN;
  if (!Number.isFinite(startMs)) return stored;
  const endMs = event.end_date ? new Date(event.end_date as string).getTime() : NaN;
  const nowMs = now.getTime();

  if (Number.isFinite(endMs)) {
    if (nowMs < startMs) return 'upcoming';
    if (nowMs <= endMs) return 'ongoing';
    return 'past';
  }
  // end_date пустой — считаем что событие однодневное, длится 24ч от start.
  if (nowMs < startMs) return 'upcoming';
  if (nowMs - startMs < ONE_DAY_MS) return 'ongoing';
  return 'past';
}

/** Применяет computeEffectiveStatus, добавляет в row поле effective_status и status_overridden. */
export function withEffectiveStatus<T extends EventLike>(events: T[], now: Date = new Date()): Array<T & { effective_status: EventStatus; status_overridden: boolean }> {
  return events.map((e) => {
    const eff = computeEffectiveStatus(e, now);
    return { ...e, effective_status: eff, status_overridden: eff !== (e.status as EventStatus) };
  });
}
