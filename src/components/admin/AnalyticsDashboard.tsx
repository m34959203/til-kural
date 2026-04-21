'use client';

import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';

interface Totals {
  users: number;
  lessons: number;
  test_questions: number;
  test_sessions: number;
  certificates: number;
  news: number;
  events: number;
  photo_checks: number;
}

interface TopUser {
  id: string;
  name: string;
  email: string;
  xp_points: number;
  level: number;
  current_streak: number;
  language_level: string | null;
}

interface AnalyticsData {
  totals: Totals;
  topUsers: TopUser[];
  recentCerts: Array<{ id: string; level: string; score: number; certificate_number: string; issued_at: string }>;
  recentNews: Array<{ id: string; title_ru: string; status: string; updated_at: string }>;
}

interface Props {
  locale: string;
  /**
   * Дополнительный контент, отображаемый после основных карточек и списков.
   * Используется на странице /admin/analytics для рендера time-series графиков.
   * На странице /admin проп не передаётся — поведение дашборда не меняется.
   */
  children?: React.ReactNode;
}

export default function AnalyticsDashboard({ locale, children }: Props) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const isKk = locale === 'kk';

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then((r) => (r.ok ? r.json() : Promise.reject(`HTTP ${r.status}`)))
      .then((d: AnalyticsData) => setData(d))
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-gray-400">{isKk ? 'Жүктелуде…' : 'Загрузка…'}</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!data) return null;

  const stats: { label_kk: string; label_ru: string; value: number; icon: string; accent: string }[] = [
    { label_kk: 'Пайдаланушылар', label_ru: 'Пользователи', value: data.totals.users, icon: '👥', accent: 'bg-blue-50 text-blue-700' },
    { label_kk: 'Сабақтар', label_ru: 'Уроки', value: data.totals.lessons, icon: '📚', accent: 'bg-teal-50 text-teal-700' },
    { label_kk: 'Тест сұрақтары', label_ru: 'Вопросы тестов', value: data.totals.test_questions, icon: '✅', accent: 'bg-amber-50 text-amber-700' },
    { label_kk: 'Тест сессиялары', label_ru: 'Сессии тестов', value: data.totals.test_sessions, icon: '🧪', accent: 'bg-indigo-50 text-indigo-700' },
    { label_kk: 'Сертификаттар', label_ru: 'Сертификаты', value: data.totals.certificates, icon: '🎓', accent: 'bg-emerald-50 text-emerald-700' },
    { label_kk: 'Фото-тексерулер', label_ru: 'Фото-проверок', value: data.totals.photo_checks, icon: '📸', accent: 'bg-rose-50 text-rose-700' },
    { label_kk: 'Жаңалықтар', label_ru: 'Новости', value: data.totals.news, icon: '📰', accent: 'bg-sky-50 text-sky-700' },
    { label_kk: 'Іс-шаралар', label_ru: 'Мероприятия', value: data.totals.events, icon: '📅', accent: 'bg-orange-50 text-orange-700' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label_ru}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">{isKk ? s.label_kk : s.label_ru}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{s.value.toLocaleString()}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${s.accent}`}>{s.icon}</div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {isKk ? 'Топ-10 оқушы (XP)' : 'Топ-10 учеников (XP)'}
          </h2>
          {data.topUsers.length === 0 ? (
            <div className="text-sm text-gray-400">{isKk ? 'Деректер жоқ' : 'Нет данных'}</div>
          ) : (
            <ol className="space-y-2">
              {data.topUsers.map((u, i) => (
                <li key={u.id} className="flex items-center justify-between text-sm py-1.5 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-gray-400 font-medium">{i + 1}</span>
                    <div>
                      <div className="font-medium text-gray-900">{u.name || u.email}</div>
                      <div className="text-xs text-gray-500">{u.language_level || '—'} · 🔥 {u.current_streak}</div>
                    </div>
                  </div>
                  <span className="font-semibold text-teal-700">{u.xp_points} XP</span>
                </li>
              ))}
            </ol>
          )}
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {isKk ? 'Соңғы сертификаттар' : 'Последние сертификаты'}
          </h2>
          {data.recentCerts.length === 0 ? (
            <div className="text-sm text-gray-400">{isKk ? 'Әзірге сертификаттар жоқ' : 'Сертификатов пока нет'}</div>
          ) : (
            <ul className="space-y-2">
              {data.recentCerts.map((c) => (
                <li key={c.id} className="flex items-center justify-between text-sm py-1.5 border-b last:border-0">
                  <div>
                    <div className="font-medium text-gray-900">#{c.certificate_number}</div>
                    <div className="text-xs text-gray-500">
                      {c.issued_at ? new Date(c.issued_at).toLocaleDateString() : '—'}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">{c.level}</span>
                    <span className="text-teal-700 font-semibold">{c.score}%</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {children}
    </div>
  );
}
