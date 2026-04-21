'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { getMessages } from '@/lib/i18n';
import ProgressTracker from '@/components/features/ProgressTracker';
import StreakTracker from '@/components/features/StreakTracker';
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import LevelBadge from '@/components/ui/LevelBadge';
import MentorAvatar from '@/components/features/MentorAvatar';

interface Stats {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    mentor_avatar?: string;
  };
  totals: {
    lessons_completed: number;
    tests_taken: number;
    photo_checks: number;
    writing_checks: number;
    certificates: number;
    current_streak: number;
    longest_streak: number;
    xp_points: number;
    level: number;
    language_level: string | null;
  };
}

export default function ProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const m = getMessages(locale);
  const router = useRouter();

  const [stats, setStats] = useState<Stats | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'unauth'>('loading');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        if (!cancelled) setStatus('unauth');
        // Fallback: /login не реализован — уводим на главную локали
        setTimeout(() => {
          if (!cancelled) router.replace(`/${locale}`);
        }, 1200);
        return;
      }
      try {
        const r = await fetch('/api/profile/stats', {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        });
        if (r.status === 401) {
          if (!cancelled) setStatus('unauth');
          setTimeout(() => {
            if (!cancelled) router.replace(`/${locale}`);
          }, 1200);
          return;
        }
        const json = (await r.json()) as Stats;
        if (!cancelled) {
          setStats(json);
          setStatus('ready');
        }
      } catch {
        if (!cancelled) setStatus('unauth');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [locale, router]);

  if (status === 'loading') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-gray-500">
        {locale === 'kk' ? 'Жүктелуде...' : 'Загрузка...'}
      </div>
    );
  }

  if (status === 'unauth' || !stats) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          {locale === 'kk' ? 'Кіру қажет' : 'Требуется вход'}
        </h1>
        <p className="text-gray-500">
          {locale === 'kk'
            ? 'Профильді көру үшін жүйеге кіріңіз. Бас бетке бағытталудасыз...'
            : 'Войдите, чтобы увидеть профиль. Перенаправление на главную...'}
        </p>
      </div>
    );
  }

  const { user, totals } = stats;
  const displayLevel = totals.language_level || 'A1';
  const mentor = user.mentor_avatar || 'abai';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{m.profile.title}</h1>

      {/* User info */}
      <Card className="mb-8">
        <div className="flex items-center gap-4">
          <Avatar name={user.name} size="xl" />
          <div>
            <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
            <p className="text-gray-500 text-sm">{user.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <LevelBadge level={displayLevel} />
              <MentorAvatar mentor={mentor} size="sm" showName locale={locale} />
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ProgressTracker
            locale={locale}
            xp={totals.xp_points}
            level={totals.level}
            streak={totals.current_streak}
          />
        </div>
        <div>
          <StreakTracker
            locale={locale}
            currentStreak={totals.current_streak}
            longestStreak={totals.longest_streak}
          />
        </div>
      </div>
    </div>
  );
}
