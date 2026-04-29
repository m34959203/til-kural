'use client';

import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import Progress from '@/components/ui/Progress';
import LevelBadge from '@/components/ui/LevelBadge';
import { useCurrentUser } from '@/hooks/useCurrentUser';

interface TestResultsProps {
  locale: string;
}

interface TestRow {
  id: string;
  test_type: string;
  topic?: string;
  score: number;
  level_result?: string;
  completed_at?: string;
}

const TYPE_LABELS: Record<string, { kk: string; ru: string }> = {
  level: { kk: 'Деңгей анықтау', ru: 'Определение уровня' },
  adaptive: { kk: 'Адаптивті тест', ru: 'Адаптивный тест' },
  thematic: { kk: 'Тақырыптық', ru: 'Тематический' },
  kaztest: { kk: 'ҚАЗТЕСТ', ru: 'ҚАЗТЕСТ' },
};

function labelFor(type: string, topic: string | undefined, locale: string): string {
  const base = TYPE_LABELS[type];
  const baseLabel = base ? (locale === 'kk' ? base.kk : base.ru) : type;
  return topic ? `${baseLabel} · ${topic}` : baseLabel;
}

function formatDate(iso?: string): string {
  if (!iso) return '';
  try {
    return new Date(iso).toISOString().slice(0, 10);
  } catch {
    return '';
  }
}

export default function TestResults({ locale }: TestResultsProps) {
  const { user, loading: userLoading } = useCurrentUser();
  const [results, setResults] = useState<TestRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const token = window.localStorage.getItem('token');
    fetch('/api/profile/stats', {
      credentials: 'include',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const tests = Array.isArray(data?.recent?.tests) ? (data.recent.tests as TestRow[]) : [];
        setResults(tests);
      })
      .catch(() => { /* пусто */ })
      .finally(() => setLoading(false));
  }, [user]);

  if (userLoading) {
    return <div className="h-24 bg-gray-100 rounded animate-pulse" />;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900">
        {locale === 'kk' ? 'Тест нәтижелері' : 'Результаты тестов'}
      </h2>

      {!user && (
        <p className="text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          {locale === 'kk' ? 'Тарихты көру үшін кіріңіз.' : 'Войдите, чтобы видеть историю тестов.'}
        </p>
      )}

      {user && loading && (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      )}

      {user && !loading && results.length === 0 && (
        <p className="text-sm text-gray-600">
          {locale === 'kk'
            ? 'Әзірге тест тапсырмадыңыз. Деңгей тестінен бастаңыз.'
            : 'Вы ещё не проходили тестов. Начните с теста уровня.'}
        </p>
      )}

      {results.map((r) => (
        <Card key={r.id} hover>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">{labelFor(r.test_type, r.topic, locale)}</h3>
              <p className="text-xs text-gray-500">{formatDate(r.completed_at)}</p>
            </div>
            <div className="flex items-center gap-3">
              {r.level_result && <LevelBadge level={r.level_result} size="sm" />}
              <div className="text-right">
                <p className="text-lg font-bold text-teal-700">{Math.round(r.score)}%</p>
              </div>
            </div>
          </div>
          <Progress
            value={Math.round(r.score)}
            className="mt-3"
            size="sm"
            color={r.score >= 80 ? 'green' : r.score >= 60 ? 'amber' : 'red'}
          />
        </Card>
      ))}
    </div>
  );
}
