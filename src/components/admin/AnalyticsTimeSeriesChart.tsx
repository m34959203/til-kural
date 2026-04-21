'use client';

/**
 * Чистый SVG-график daily-агрегатов для админ-аналитики.
 * Без внешних библиотек. Принимает массив {date: 'YYYY-MM-DD', count: N}.
 *
 * Аналог LiteracyTrendChart, но для counts (min=0, max=динамический).
 */

interface Point {
  date: string;
  count: number;
}

interface Props {
  title: string;
  data: Point[];
  color?: string;
  locale?: string;
  height?: number;
  width?: number;
}

const PAD = { top: 16, right: 16, bottom: 28, left: 32 };

export default function AnalyticsTimeSeriesChart({
  title,
  data,
  color = '#0D9488',
  locale = 'ru',
  height = 180,
  width = 560,
}: Props) {
  const isKk = locale === 'kk';

  // Санируем входные данные, сохраняя порядок из API (ожидаем уже возрастающий по дате).
  const points = (data || [])
    .map((d) => ({
      date: String(d.date),
      count: Math.max(0, Math.round(Number(d.count) || 0)),
      t: new Date(d.date).getTime(),
    }))
    .filter((p) => Number.isFinite(p.t));

  const total = points.reduce((s, p) => s + p.count, 0);

  if (points.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">{title}</h3>
        <div className="text-center py-10 text-sm text-gray-500">
          {isKk ? 'Деректер жоқ' : 'Нет данных'}
        </div>
      </div>
    );
  }

  const maxCount = Math.max(1, ...points.map((p) => p.count));
  // Округляем max вверх до "красивого" числа, чтобы сетка была читаемой.
  const niceMax = (() => {
    if (maxCount <= 5) return 5;
    if (maxCount <= 10) return 10;
    const pow = Math.pow(10, Math.max(0, String(Math.ceil(maxCount)).length - 1));
    return Math.ceil(maxCount / pow) * pow;
  })();

  const innerW = width - PAD.left - PAD.right;
  const innerH = height - PAD.top - PAD.bottom;

  const xOf = (i: number) =>
    points.length === 1
      ? PAD.left + innerW / 2
      : PAD.left + (i / (points.length - 1)) * innerW;
  const yOf = (count: number) => PAD.top + innerH - (count / niceMax) * innerH;

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xOf(i).toFixed(1)} ${yOf(p.count).toFixed(1)}`)
    .join(' ');

  // Площадь под графиком (area fill) для визуальной массы
  const areaD =
    points.length > 0
      ? `${pathD} L ${xOf(points.length - 1).toFixed(1)} ${yOf(0).toFixed(1)} L ${xOf(0).toFixed(1)} ${yOf(0).toFixed(1)} Z`
      : '';

  const gridValues = [0, Math.round(niceMax / 2), niceMax];

  const fmtDate = (iso: string) => {
    const d = new Date(iso);
    if (!Number.isFinite(d.getTime())) return iso;
    return d.toLocaleDateString(isKk ? 'kk-KZ' : 'ru-RU', {
      day: '2-digit',
      month: '2-digit',
    });
  };

  // Рисуем все точки только если их ≤ 30, иначе — только первую и последнюю (чтобы не замусорить).
  const showAllDots = points.length <= 30;

  // Уникальный id градиента на инстанс компонента.
  const gradId = `tsg-${Math.abs(
    Array.from(title).reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0),
  )}-${points.length}`;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="flex items-baseline justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        <div className="text-xs text-gray-500">
          {isKk ? 'барлығы' : 'всего'}: <span className="font-semibold text-gray-800">{total}</span>
        </div>
      </div>
      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          width="100%"
          className="max-w-full"
          role="img"
          aria-label={title}
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.25" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Сетка + подписи Y */}
          {gridValues.map((g) => (
            <g key={g}>
              <line
                x1={PAD.left}
                x2={width - PAD.right}
                y1={yOf(g)}
                y2={yOf(g)}
                stroke="#E5E7EB"
                strokeWidth={1}
                strokeDasharray={g === 0 || g === niceMax ? undefined : '3 3'}
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

          {/* Площадь под графиком */}
          <path d={areaD} fill={`url(#${gradId})`} />

          {/* Линия тренда */}
          <path d={pathD} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />

          {/* Точки */}
          {(showAllDots ? points : [points[0], points[points.length - 1]]).map((p) => {
            const i = points.indexOf(p);
            return (
              <g key={`${p.date}-${i}`}>
                <circle
                  cx={xOf(i)}
                  cy={yOf(p.count)}
                  r={showAllDots ? 3 : 4}
                  fill="#ffffff"
                  stroke={color}
                  strokeWidth={1.8}
                />
                <title>
                  {fmtDate(p.date)} — {p.count}
                </title>
              </g>
            );
          })}

          {/* Подписи оси X: первая и последняя дата */}
          <text
            x={xOf(0)}
            y={height - 8}
            fontSize={10}
            fill="#6B7280"
            textAnchor="start"
          >
            {fmtDate(points[0].date)}
          </text>
          {points.length > 1 && (
            <text
              x={xOf(points.length - 1)}
              y={height - 8}
              fontSize={10}
              fill="#6B7280"
              textAnchor="end"
            >
              {fmtDate(points[points.length - 1].date)}
            </text>
          )}
        </svg>
      </div>
    </div>
  );
}
