'use client';

import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import StreakCounter from '@/components/ui/StreakCounter';

interface LeaderboardTableProps {
  locale: string;
}

interface Leader {
  rank: number;
  id: string;
  name: string;
  xp: number;
  level: number;
  streak: number;
  language_level?: string | null;
}

export default function LeaderboardTable({ locale }: LeaderboardTableProps) {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch('/api/game/leaderboard', { cache: 'no-store' });
        const json = await r.json();
        if (!cancelled) setLeaders(json.leaderboard || []);
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return 'G';
    if (rank === 2) return 'S';
    if (rank === 3) return 'B';
    return `${rank}`;
  };

  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {locale === 'kk' ? 'Көшбасшылар кестесі' : 'Таблица лидеров'}
      </h3>

      {loading && (
        <p className="text-sm text-gray-400 py-4">
          {locale === 'kk' ? 'Жүктелуде...' : 'Загрузка...'}
        </p>
      )}

      {!loading && leaders.length === 0 && (
        <p className="text-sm text-gray-500 py-4">
          {locale === 'kk'
            ? 'Әзірше қатысушылар жоқ. Бірінші болыңыз!'
            : 'Пока нет участников. Станьте первым!'}
        </p>
      )}

      <div className="space-y-2">
        {leaders.map((leader) => (
          <div
            key={leader.id || leader.rank}
            className={`flex items-center gap-4 p-3 rounded-lg ${
              leader.rank <= 3 ? 'bg-amber-50' : 'hover:bg-gray-50'
            }`}
          >
            <span className="text-lg w-8 text-center font-bold">{getMedalEmoji(leader.rank)}</span>
            <Avatar name={leader.name} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 text-sm truncate">{leader.name}</p>
              <p className="text-xs text-gray-500">
                {locale === 'kk' ? 'Деңгей' : 'Уровень'} {leader.level}
                {leader.language_level ? ` · ${leader.language_level}` : ''}
              </p>
            </div>
            <StreakCounter streak={leader.streak} locale={locale} size="sm" />
            <span className="text-sm font-bold text-teal-700 w-16 text-right">{leader.xp} XP</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
