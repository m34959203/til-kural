'use client';

import Card from '@/components/ui/Card';

export interface TopNItem {
  label: string;
  value: number;
  hint?: string;
}

interface Props {
  title: string;
  items: TopNItem[];
  locale: string;
  /** Максимальное значение шкалы. Если не задано — берётся max(value) из items. */
  maxValue?: number;
  /** Tailwind-класс фона для заполнения бара, напр. `bg-teal-500`. */
  accent?: string;
  /** Формат значения справа от лейбла. По умолчанию — toLocaleString. */
  formatValue?: (v: number) => string;
}

/**
 * Карточка с горизонтальными progress-барами для Top-N метрик.
 * Минималистичный, без зависимостей — переиспользуется на админ-дашборде.
 */
export default function TopNBars({
  title,
  items,
  locale,
  maxValue,
  accent = 'bg-teal-500',
  formatValue,
}: Props) {
  const isKk = locale === 'kk';
  const max = maxValue ?? items.reduce((m, it) => (it.value > m ? it.value : m), 0);
  const fmt = formatValue ?? ((v: number) => v.toLocaleString());

  return (
    <Card>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>
      {items.length === 0 ? (
        <div className="text-sm text-gray-400">{isKk ? 'Әзірге деректер жоқ' : 'Пока нет данных'}</div>
      ) : (
        <ul className="space-y-3">
          {items.map((it, i) => {
            const pct = max > 0 ? Math.max(2, Math.round((it.value / max) * 100)) : 0;
            return (
              <li key={`${it.label}-${i}`}>
                <div className="flex items-baseline justify-between gap-3 mb-1">
                  <span className="text-sm text-gray-900 font-medium truncate" title={it.label}>
                    {it.label}
                  </span>
                  <span className="text-sm text-gray-600 tabular-nums whitespace-nowrap">{fmt(it.value)}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                  <div className={`h-full ${accent} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                </div>
                {it.hint ? <div className="text-xs text-gray-400 mt-1">{it.hint}</div> : null}
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
