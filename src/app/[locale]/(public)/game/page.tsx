'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { getMessages } from '@/lib/i18n';
import Card from '@/components/ui/Card';
import XPBar from '@/components/ui/XPBar';
import StreakCounter from '@/components/ui/StreakCounter';
import QuestTracker from '@/components/features/QuestTracker';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { LEVEL_THRESHOLDS, LEVEL_NAMES_KK, LEVEL_NAMES_RU } from '@/lib/gamification';

interface Stats {
  xp_points: number;
  level: number;
  current_streak: number;
}

interface LeaderEntry {
  rank: number;
  id: string;
  xp: number;
}

export default function GamePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const m = getMessages(locale);
  const { user, loading: userLoading } = useCurrentUser();

  const [stats, setStats] = useState<Stats | null>(null);
  const [rank, setRank] = useState<number | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setStatsLoading(true);
    const token = window.localStorage.getItem('token');
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
    Promise.all([
      fetch('/api/profile/stats', { headers, credentials: 'include' }).then((r) => (r.ok ? r.json() : null)),
      fetch('/api/game/leaderboard').then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([statsData, lbData]) => {
        if (statsData?.totals) {
          setStats({
            xp_points: statsData.totals.xp_points ?? 0,
            level: statsData.totals.level ?? 1,
            current_streak: statsData.totals.current_streak ?? 0,
          });
        }
        if (Array.isArray(lbData?.leaderboard)) {
          const me = (lbData.leaderboard as LeaderEntry[]).find((e) => e.id === user.id);
          setRank(me?.rank ?? null);
        }
      })
      .finally(() => setStatsLoading(false));
  }, [user]);

  const loading = userLoading || statsLoading;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{m.game.title}</h1>

      {!userLoading && !user && (
        <Card className="mb-6 border-amber-200 bg-amber-50">
          <p className="text-sm text-amber-900">
            {locale === 'kk'
              ? 'XP, streak, рейтинг — авторизация қажет.'
              : 'XP, streak и место в рейтинге — после входа.'}{' '}
            <Link className="text-teal-700 underline" href={`/${locale}/login`}>
              {locale === 'kk' ? 'Кіру' : 'Войти'}
            </Link>
          </p>
        </Card>
      )}

      {/* User stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <p className="text-sm text-gray-500 mb-2">XP & {m.game.level}</p>
          {loading ? (
            <div className="h-6 bg-gray-100 rounded animate-pulse" />
          ) : (
            <XPBar xp={stats?.xp_points ?? 0} level={stats?.level ?? 1} locale={locale} />
          )}
        </Card>
        <Card className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{m.game.streak}</p>
            {loading ? (
              <div className="h-8 w-12 bg-gray-100 rounded animate-pulse mt-1" />
            ) : (
              <StreakCounter streak={stats?.current_streak ?? 0} locale={locale} size="lg" />
            )}
          </div>
        </Card>
        <Card className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{m.game.rank}</p>
            {loading ? (
              <div className="h-8 w-12 bg-gray-100 rounded animate-pulse mt-1" />
            ) : (
              <p className="text-3xl font-bold text-amber-500">{rank ? `#${rank}` : '—'}</p>
            )}
          </div>
        </Card>
      </div>

      {/* Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link href={`/${locale}/game/quests`}>
          <Card hover className="text-center h-full">
            <div className="text-3xl mb-2">🗺️</div>
            <h3 className="font-semibold text-gray-900">{m.game.quests}</h3>
          </Card>
        </Link>
        <Link href={`/${locale}/game/leaderboard`}>
          <Card hover className="text-center h-full">
            <div className="text-3xl mb-2">🏆</div>
            <h3 className="font-semibold text-gray-900">{m.game.leaderboard}</h3>
          </Card>
        </Link>
        <Link href={`/${locale}/game/achievements`}>
          <Card hover className="text-center h-full">
            <div className="text-3xl mb-2">🏅</div>
            <h3 className="font-semibold text-gray-900">{m.game.achievements}</h3>
          </Card>
        </Link>
      </div>

      {/* Active quests */}
      <QuestTracker locale={locale} />

      {/* Открытая шкала уровней (audit P0) */}
      <Card className="mt-8">
        <h3 className="font-semibold text-gray-900 mb-3">
          {locale === 'kk' ? 'Деңгейлер' : 'Шкала уровней'}
        </h3>
        <ol className="text-sm divide-y divide-gray-100">
          {LEVEL_THRESHOLDS.map((threshold, idx) => {
            const next = LEVEL_THRESHOLDS[idx + 1];
            const range = next != null ? `${threshold} – ${next - 1} XP` : `${threshold}+ XP`;
            const name = locale === 'kk' ? LEVEL_NAMES_KK[idx] : LEVEL_NAMES_RU[idx];
            const userLevel = stats?.level ?? 1;
            const isCurrent = idx + 1 === userLevel;
            return (
              <li
                key={idx}
                className={`py-1.5 flex items-center justify-between ${isCurrent ? 'font-semibold text-teal-700' : 'text-gray-700'}`}
              >
                <span>
                  {locale === 'kk' ? 'Деңгей' : 'Уровень'} {idx + 1}: {name}
                  {isCurrent && (
                    <span className="ml-2 text-xs text-teal-600">
                      ← {locale === 'kk' ? 'сіз осында' : 'вы здесь'}
                    </span>
                  )}
                </span>
                <span className="text-xs text-gray-500">{range}</span>
              </li>
            );
          })}
        </ol>
      </Card>

      {/* Правила streak (audit P1) */}
      <Card className="mt-4 border-amber-100 bg-amber-50/60">
        <h3 className="font-semibold text-amber-900 mb-2">
          🔥 {locale === 'kk' ? 'Серия қалай есептеледі' : 'Как считается серия (streak)'}
        </h3>
        <p className="text-sm text-amber-900/90 mb-2">
          {locale === 'kk'
            ? 'Бір күн санау үшін кем дегенде осы әрекеттердің бірін орындау керек:'
            : 'Чтобы день засчитался в серию, нужно сделать минимум одно из:'}
        </p>
        <ul className="text-sm text-amber-900/90 list-disc list-inside space-y-0.5">
          <li>{locale === 'kk' ? '1+ жаттығу немесе сабақ' : '1+ упражнение или урок'}</li>
          <li>{locale === 'kk' ? 'Тілдік диалог жүргізу (4+ реплика)' : 'Диалог-сессия (4+ реплики)'}</li>
          <li>{locale === 'kk' ? 'Жазба тексеру немесе фото-тексеру' : 'Проверка письма или фото-проверка'}</li>
          <li>{locale === 'kk' ? 'Тестен өту' : 'Прохождение теста'}</li>
        </ul>
        <p className="text-xs text-amber-900/70 mt-2">
          {locale === 'kk'
            ? 'Бір күн өткізіп алсаңыз, серия нөлге қайта түседі.'
            : 'Если пропустите день — серия сбрасывается.'}
        </p>
      </Card>
    </div>
  );
}
