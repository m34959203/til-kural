import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import StreakCounter from '@/components/ui/StreakCounter';

interface LeaderboardTableProps {
  locale: string;
}

export default function LeaderboardTable({ locale }: LeaderboardTableProps) {
  const leaders = [
    { rank: 1, name: 'Айгерім Т.', xp: 5200, level: 9, streak: 45 },
    { rank: 2, name: 'Нұрлан К.', xp: 4800, level: 8, streak: 32 },
    { rank: 3, name: 'Дарья М.', xp: 4500, level: 8, streak: 28 },
    { rank: 4, name: 'Асан Б.', xp: 4100, level: 7, streak: 21 },
    { rank: 5, name: 'Мадина С.', xp: 3800, level: 7, streak: 19 },
    { rank: 6, name: 'Тимур Ж.', xp: 3500, level: 6, streak: 15 },
    { rank: 7, name: 'Камила А.', xp: 3200, level: 6, streak: 12 },
    { rank: 8, name: 'Ерлан Н.', xp: 2900, level: 5, streak: 10 },
    { rank: 9, name: 'Жанар О.', xp: 2600, level: 5, streak: 8 },
    { rank: 10, name: 'Руслан Т.', xp: 2300, level: 4, streak: 5 },
  ];

  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `${rank}`;
  };

  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {locale === 'kk' ? 'Көшбасшылар кестесі' : 'Таблица лидеров'}
      </h3>
      <div className="space-y-2">
        {leaders.map((leader) => (
          <div
            key={leader.rank}
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
