'use client';

import { use, useEffect, useState } from 'react';
import achievementsData from '@/data/achievements.json';
import AchievementBadge from '@/components/features/AchievementBadge';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export default function AchievementsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const { user } = useCurrentUser();
  const [earned, setEarned] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;
    fetch('/api/profile/achievements', {
      credentials: 'include',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const codes = Array.isArray(data?.earned)
          ? (data.earned as Array<{ code: string }>).map((e) => e.code)
          : [];
        setEarned(codes);
      })
      .catch(() => { /* пусто */ })
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        {locale === 'kk' ? 'Жетістіктер' : 'Достижения'}
      </h1>
      <p className="text-gray-500 mb-8">
        {loading
          ? (locale === 'kk' ? 'Жүктелуде…' : 'Загрузка…')
          : `${earned.length}/${achievementsData.length} ${locale === 'kk' ? 'алынған' : 'получено'}`}
      </p>
      {!user && !loading && (
        <p className="mb-6 text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          {locale === 'kk'
            ? 'Жетістіктерді жинау үшін кіріңіз.'
            : 'Войдите, чтобы зарабатывать достижения.'}
        </p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {achievementsData.map((achievement) => (
          <AchievementBadge
            key={achievement.code}
            title={locale === 'kk' ? achievement.title_kk : achievement.title_ru}
            description={locale === 'kk' ? achievement.description_kk : achievement.description_ru}
            icon={achievement.icon}
            earned={earned.includes(achievement.code)}
          />
        ))}
      </div>
    </div>
  );
}
