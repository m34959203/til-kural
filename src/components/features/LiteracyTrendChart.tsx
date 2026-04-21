'use client';

/**
 * Чистый SVG-график тренда грамотности по фото-проверкам.
 * Без внешних библиотек.
 *
 * Props:
 *  - data: [{ overall_score (0-100), created_at (ISO) }]
 *  - locale: 'kk' | 'ru'
 *  - avg: средняя оценка (опционально — посчитается, если не передана)
 *  - height / width: размеры SVG viewBox (по умолчанию 560×200)
 */

interface TrendPoint {
  overall_score: number;
  created_at: string | number | Date;
}

interface LiteracyTrendChartProps {
  data: TrendPoint[];
  locale?: string;
  avg?: number;
  height?: number;
  width?: number;
}

const PAD = { top: 16, right: 16, bottom: 28, left: 32 };

export default function LiteracyTrendChart({
  data,
  locale = 'kk',
  avg,
  height = 200,
  width = 560,
}: LiteracyTrendChartProps) {
  const points = [...data]
    .map((d) => ({
      score: Math.max(0, Math.min(100, Number(d.overall_score) || 0)),
      t: new Date(d.created_at).getTime(),
    }))
    .filter((p) => Number.isFinite(p.t))
    .sort((a, b) => a.t - b.t);

  if (points.length === 0) {
    return (
      <div className="text-center py-10 text-sm text-gray-500">
        {locale === 'kk' ? 'Деректер жоқ' : 'Нет данных'}
      </div>
    );
  }

  const average =
    typeof avg === 'number'
      ? avg
      : Math.round(points.reduce((s, p) => s + p.score, 0) / points.length);

  const innerW = width - PAD.left - PAD.right;
  const innerH = height - PAD.top - PAD.bottom;

  const minT = points[0].t;
  const maxT = points[points.length - 1].t;
  const tRange = Math.max(1, maxT - minT);

  const xOf = (t: number) =>
    points.length === 1 ? PAD.left + innerW / 2 : PAD.left + ((t - minT) / tRange) * innerW;
  const yOf = (score: number) => PAD.top + innerH - (score / 100) * innerH;

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xOf(p.t).toFixed(1)} ${yOf(p.score).toFixed(1)}`)
    .join(' ');

  // Гор. сетка: 0, 25, 50, 75, 100
  const gridLines = [0, 25, 50, 75, 100];
  const avgY = yOf(average);

  // Даты для оси X: первая и последняя
  const fmtDate = (ms: number) => {
    const d = new Date(ms);
    return d.toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'kk-KZ', {
      day: '2-digit',
      month: '2-digit',
    });
  };

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        className="max-w-full"
        role="img"
        aria-label={locale === 'kk' ? 'Сауаттылық динамикасы' : 'Динамика грамотности'}
      >
        {/* Сетка + подписи Y */}
        {gridLines.map((g) => (
          <g key={g}>
            <line
              x1={PAD.left}
              x2={width - PAD.right}
              y1={yOf(g)}
              y2={yOf(g)}
              stroke="#E5E7EB"
              strokeWidth={1}
              strokeDasharray={g === 0 || g === 100 ? undefined : '3 3'}
            />
            <text
              x={PAD.left - 6}
              y={yOf(g) + 3}
              textAnchor="end"
              fontSize={10}
              fill="#6B7280"
            >
              {g}
            </text>
          </g>
        ))}

        {/* Средняя оценка — пунктир */}
        <line
          x1={PAD.left}
          x2={width - PAD.right}
          y1={avgY}
          y2={avgY}
          stroke="#0D9488"
          strokeWidth={1.2}
          strokeDasharray="4 4"
          opacity={0.7}
        />
        <text
          x={width - PAD.right}
          y={avgY - 4}
          textAnchor="end"
          fontSize={10}
          fill="#0D9488"
          fontWeight={600}
        >
          {locale === 'kk' ? 'орташа' : 'среднее'}: {average}
        </text>

        {/* Линия тренда */}
        <path d={pathD} fill="none" stroke="#0D9488" strokeWidth={2.2} strokeLinejoin="round" />

        {/* Точки */}
        {points.map((p, i) => (
          <g key={i}>
            <circle
              cx={xOf(p.t)}
              cy={yOf(p.score)}
              r={4}
              fill="#ffffff"
              stroke="#0D9488"
              strokeWidth={2}
            />
            <title>
              {new Date(p.t).toLocaleString(locale === 'ru' ? 'ru-RU' : 'kk-KZ')} — {p.score}
            </title>
          </g>
        ))}

        {/* Подписи оси X: первая и последняя дата */}
        <text
          x={xOf(minT)}
          y={height - 8}
          fontSize={10}
          fill="#6B7280"
          textAnchor="start"
        >
          {fmtDate(minT)}
        </text>
        {points.length > 1 && (
          <text
            x={xOf(maxT)}
            y={height - 8}
            fontSize={10}
            fill="#6B7280"
            textAnchor="end"
          >
            {fmtDate(maxT)}
          </text>
        )}
      </svg>
    </div>
  );
}
