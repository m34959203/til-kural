/**
 * Schema / helpers for the "История центра" CMS block (ТЗ 3.3.2).
 *
 * Represents timeline entries on the /about page. If `year` is null/empty,
 * the block is rendered as a standalone markdown paragraph.
 */

export interface HistoryBlock {
  id: string;
  year: string | null;
  title_kk: string;
  title_ru: string;
  description_kk: string | null;
  description_ru: string | null;
  image_url: string | null;
  sort_order: number;
  created_at: string;
}

export const HISTORY_TABLE = 'history_blocks';

export type HistoryBlockInput = Partial<Omit<HistoryBlock, 'id' | 'created_at'>>;

export function pickAllowed(body: Record<string, unknown>): HistoryBlockInput {
  const allowed: HistoryBlockInput = {};
  const keys: (keyof HistoryBlockInput)[] = [
    'year',
    'title_kk',
    'title_ru',
    'description_kk',
    'description_ru',
    'image_url',
    'sort_order',
  ];
  for (const k of keys) {
    if (k in body) {
      if (k === 'sort_order') {
        allowed.sort_order = Number(body[k] ?? 0);
      } else {
        const v = body[k];
        (allowed as Record<string, unknown>)[k] = v === '' ? null : v;
      }
    }
  }
  return allowed;
}

/**
 * Sort comparator: primary by sort_order asc, secondary by year asc (numeric),
 * entries without year fall to the end.
 */
export function sortBlocks(blocks: HistoryBlock[]): HistoryBlock[] {
  return [...blocks].sort((a, b) => {
    const so = (a.sort_order ?? 0) - (b.sort_order ?? 0);
    if (so !== 0) return so;
    const ay = a.year ? Number(a.year) : Number.POSITIVE_INFINITY;
    const by = b.year ? Number(b.year) : Number.POSITIVE_INFINITY;
    if (Number.isFinite(ay) && Number.isFinite(by)) return ay - by;
    if (Number.isFinite(ay)) return -1;
    if (Number.isFinite(by)) return 1;
    return 0;
  });
}
