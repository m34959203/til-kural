import Card from '@/components/ui/Card';
import { cn } from '@/lib/utils';

interface StreakTrackerProps {
  locale: string;
  currentStreak: number;
  longestStreak: number;
}

export default function StreakTracker({ locale, currentStreak, longestStreak }: StreakTrackerProps) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      day: d.toLocaleDateString(locale === 'kk' ? 'kk-KZ' : 'ru-RU', { weekday: 'short' }),
      active: i >= 7 - Math.min(currentStreak, 7),
      isToday: i === 6,
    };
  });

  const milestones = [
    { days: 7, label: locale === 'kk' ? '1 апта' : '1 неделя', bonus: 100 },
    { days: 30, label: locale === 'kk' ? '1 ай' : '1 месяц', bonus: 500 },
    { days: 100, label: locale === 'kk' ? '100 күн' : '100 дней', bonus: 1000 },
  ];

  return (
    <Card>
      <div className="text-center mb-4">
        <p className="text-4xl mb-1">🔥</p>
        <p className="text-3xl font-bold text-orange-500">{currentStreak}</p>
        <p className="text-sm text-gray-500">
          {locale === 'kk' ? 'күндік серия' : 'дней серия'}
        </p>
      </div>

      {/* Week view */}
      <div className="flex justify-center gap-2 mb-4">
        {days.map((day, idx) => (
          <div key={idx} className="flex flex-col items-center gap-1">
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors',
                day.active
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-400',
                day.isToday && 'ring-2 ring-orange-300'
              )}
            >
              {day.active ? '✓' : ''}
            </div>
            <span className="text-[10px] text-gray-400">{day.day}</span>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="flex justify-center gap-6 text-center text-sm mb-4 pb-4 border-b">
        <div>
          <p className="text-gray-500">{locale === 'kk' ? 'Ағымдағы' : 'Текущая'}</p>
          <p className="font-bold text-lg text-orange-500">{currentStreak}</p>
        </div>
        <div>
          <p className="text-gray-500">{locale === 'kk' ? 'Ең ұзақ' : 'Лучшая'}</p>
          <p className="font-bold text-lg text-gray-700">{longestStreak}</p>
        </div>
      </div>

      {/* Milestones */}
      <div className="space-y-2">
        {milestones.map((ms) => (
          <div key={ms.days} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className={currentStreak >= ms.days ? 'text-green-500' : 'text-gray-300'}>
                {currentStreak >= ms.days ? '✅' : '⬜'}
              </span>
              <span className={currentStreak >= ms.days ? 'text-gray-900 font-medium' : 'text-gray-400'}>
                {ms.label}
              </span>
            </div>
            <span className="text-xs text-amber-600">+{ms.bonus} XP</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
