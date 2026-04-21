'use client';

import { use, useEffect, useState } from 'react';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';
import AnalyticsTimeSeriesChart from '@/components/admin/AnalyticsTimeSeriesChart';

type Point = { date: string; count: number };
type Series = {
  registrations: Point[];
  certificates: Point[];
  test_sessions: Point[];
  photo_checks: Point[];
};

const PERIODS = [7, 30, 90] as const;
type Period = (typeof PERIODS)[number];

export default function AdminAnalyticsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  const isKk = locale === 'kk';

  const [days, setDays] = useState<Period>(30);
  const [series, setSeries] = useState<Series | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`/api/admin/analytics/timeseries?days=${days}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(`HTTP ${r.status}`)))
      .then((d: { series: Series }) => {
        if (!cancelled) setSeries(d.series);
      })
      .catch((e) => {
        if (!cancelled) setError(String(e));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [days]);

  const label = (ru: string, kk: string) => (isKk ? kk : ru);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {isKk ? 'Аналитика' : 'Аналитика'}
      </h1>

      <AnalyticsDashboard locale={locale}>
        <div className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {isKk ? 'Динамика по дням' : 'Динамика по дням'}
            </h2>
            <div
              className="inline-flex rounded-lg border border-gray-200 bg-white overflow-hidden"
              role="tablist"
              aria-label={isKk ? 'Кезең' : 'Период'}
            >
              {PERIODS.map((p) => (
                <button
                  key={p}
                  type="button"
                  role="tab"
                  aria-selected={days === p}
                  onClick={() => setDays(p)}
                  className={`px-3 py-1.5 text-sm font-medium ${
                    days === p
                      ? 'bg-teal-600 text-white'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {isKk ? `${p} күн` : `${p} дн`}
                </button>
              ))}
            </div>
          </div>

          {loading && (
            <div className="text-sm text-gray-400">
              {isKk ? 'Жүктелуде…' : 'Загрузка…'}
            </div>
          )}
          {error && <div className="text-sm text-red-600">{error}</div>}
          {series && !loading && !error && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <AnalyticsTimeSeriesChart
                title={label('Регистрации', 'Тіркелулер')}
                data={series.registrations}
                color="#2563EB"
                locale={locale}
              />
              <AnalyticsTimeSeriesChart
                title={label('Сертификаты', 'Сертификаттар')}
                data={series.certificates}
                color="#059669"
                locale={locale}
              />
              <AnalyticsTimeSeriesChart
                title={label('Тест-сессии', 'Тест сессиялары')}
                data={series.test_sessions}
                color="#7C3AED"
                locale={locale}
              />
              <AnalyticsTimeSeriesChart
                title={label('Фото-проверки', 'Фото тексерулер')}
                data={series.photo_checks}
                color="#DC2626"
                locale={locale}
              />
            </div>
          )}
        </div>
      </AnalyticsDashboard>
    </div>
  );
}
