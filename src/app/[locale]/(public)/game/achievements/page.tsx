'use client';

import { use, useEffect, useState } from 'react';
import achievementsData from '@/data/achievements.json';
import { useCurrentUser } from '@/hooks/useCurrentUser';

interface AchievementProgress {
  current: number;
  target: number;
}

export default function AchievementsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const isKk = locale === 'kk';
  const { user } = useCurrentUser();
  const [earned, setEarned] = useState<string[]>([]);
  const [progress, setProgress] = useState<Record<string, AchievementProgress>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;
    fetch('/api/profile/achievements', {
      credentials: 'include',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (cancelled) return;
        const codes = Array.isArray(data?.earned)
          ? (data.earned as Array<{ code: string }>).map((e) => e.code)
          : [];
        setEarned(codes);
        if (data?.progress && typeof data.progress === 'object') {
          setProgress(data.progress as Record<string, AchievementProgress>);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(String(err));
      })
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        {isKk ? 'Жетістіктер' : 'Достижения'}
      </h1>
      <p className="text-gray-500 mb-8">
        {loading
          ? (isKk ? 'Жүктелуде…' : 'Загрузка…')
          : `${earned.length}/${achievementsData.length} ${isKk ? 'алынған' : 'получено'}`}
      </p>

      {!user && !loading && (
        <p className="mb-6 text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          {isKk ? 'Жетістіктерді жинау үшін кіріңіз.' : 'Войдите, чтобы зарабатывать достижения.'}
        </p>
      )}

      {error && (
        <p className="mb-6 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {isKk ? 'Жетістіктерді жүктеу қатесі' : 'Не удалось загрузить достижения'}: {error}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {achievementsData.map((achievement) => {
          const isEarned = earned.includes(achievement.code);
          const p = progress[achievement.code];
          const pct = p && p.target > 0 ? Math.round((p.current / p.target) * 100) : 0;
          const inProgress = !isEarned && p && p.current > 0;
          const locked = !isEarned && (!p || p.current === 0);

          return (
            <div
              key={achievement.code}
              className={`rounded-xl border p-4 flex items-start gap-3 ${
                isEarned
                  ? 'border-emerald-200 bg-emerald-50'
                  : inProgress
                    ? 'border-amber-200 bg-amber-50/50'
                    : 'border-gray-200 bg-white opacity-70'
              }`}
            >
              <div className={`text-3xl shrink-0 ${locked ? 'grayscale' : ''}`} aria-hidden>
                {locked ? '🔒' : achievement.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className={`font-semibold text-sm ${isEarned ? 'text-emerald-900' : 'text-gray-900'}`}>
                    {isKk ? achievement.title_kk : achievement.title_ru}
                  </h3>
                  {isEarned && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                      ✓ {isKk ? 'Алынды' : 'Получено'}
                    </span>
                  )}
                  {inProgress && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                      {isKk ? 'Орындалуда' : 'В процессе'}
                    </span>
                  )}
                  {locked && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">
                      {isKk ? 'Жабық' : 'Заблокировано'}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {isKk ? achievement.description_kk : achievement.description_ru}
                </p>
                {p && p.target > 0 && !isEarned && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>
                        {p.current}/{p.target}
                      </span>
                      <span>{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${pct >= 50 ? 'bg-amber-400' : 'bg-gray-400'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
