import Card from '@/components/ui/Card';
import Progress from '@/components/ui/Progress';
import XPBar from '@/components/ui/XPBar';
import StreakCounter from '@/components/ui/StreakCounter';

interface ProgressTrackerProps {
  locale: string;
}

export default function ProgressTracker({ locale }: ProgressTrackerProps) {
  // Demo data
  const stats = {
    xp: 1250,
    level: 4,
    streak: 12,
    lessonsCompleted: 15,
    testsCompleted: 8,
    dialogSessions: 22,
    writingChecks: 5,
    photoChecks: 3,
  };

  const weeklyActivity = [
    { day: locale === 'kk' ? 'Дс' : 'Пн', value: 45 },
    { day: locale === 'kk' ? 'Сс' : 'Вт', value: 80 },
    { day: locale === 'kk' ? 'Ср' : 'Ср', value: 60 },
    { day: locale === 'kk' ? 'Бс' : 'Чт', value: 90 },
    { day: locale === 'kk' ? 'Жм' : 'Пт', value: 30 },
    { day: locale === 'kk' ? 'Сн' : 'Сб', value: 70 },
    { day: locale === 'kk' ? 'Жс' : 'Вс', value: 50 },
  ];

  return (
    <div className="space-y-6">
      {/* XP and Streak */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <h3 className="text-sm font-medium text-gray-500 mb-3">XP & {locale === 'kk' ? 'Деңгей' : 'Уровень'}</h3>
          <XPBar xp={stats.xp} level={stats.level} locale={locale} />
        </Card>
        <Card>
          <h3 className="text-sm font-medium text-gray-500 mb-3">{locale === 'kk' ? 'Серия' : 'Серия'}</h3>
          <StreakCounter streak={stats.streak} locale={locale} size="lg" />
        </Card>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: locale === 'kk' ? 'Сабақтар' : 'Уроки', value: stats.lessonsCompleted, color: 'teal' as const },
          { label: locale === 'kk' ? 'Тесттер' : 'Тесты', value: stats.testsCompleted, color: 'blue' as const },
          { label: locale === 'kk' ? 'Диалогтар' : 'Диалоги', value: stats.dialogSessions, color: 'amber' as const },
          { label: locale === 'kk' ? 'Жазбалар' : 'Письма', value: stats.writingChecks, color: 'green' as const },
        ].map((stat) => (
          <Card key={stat.label} padding="sm">
            <p className="text-xs text-gray-500">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </Card>
        ))}
      </div>

      {/* Weekly Activity */}
      <Card>
        <h3 className="text-sm font-medium text-gray-500 mb-4">
          {locale === 'kk' ? 'Апталық белсенділік' : 'Недельная активность'}
        </h3>
        <div className="flex items-end justify-between gap-2 h-32">
          {weeklyActivity.map((day) => (
            <div key={day.day} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full bg-gray-100 rounded-t-md relative" style={{ height: '100px' }}>
                <div
                  className="absolute bottom-0 w-full bg-teal-500 rounded-t-md transition-all"
                  style={{ height: `${day.value}%` }}
                />
              </div>
              <span className="text-xs text-gray-500">{day.day}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Skills breakdown */}
      <Card>
        <h3 className="text-sm font-medium text-gray-500 mb-4">
          {locale === 'kk' ? 'Дағдылар' : 'Навыки'}
        </h3>
        <div className="space-y-3">
          {[
            { label: locale === 'kk' ? 'Грамматика' : 'Грамматика', value: 72 },
            { label: locale === 'kk' ? 'Сөздік қор' : 'Словарный запас', value: 85 },
            { label: locale === 'kk' ? 'Тыңдау' : 'Аудирование', value: 60 },
            { label: locale === 'kk' ? 'Сөйлеу' : 'Говорение', value: 55 },
            { label: locale === 'kk' ? 'Жазу' : 'Письмо', value: 68 },
            { label: locale === 'kk' ? 'Оқу' : 'Чтение', value: 80 },
          ].map((skill) => (
            <div key={skill.label}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-700">{skill.label}</span>
                <span className="text-gray-500">{skill.value}%</span>
              </div>
              <Progress value={skill.value} size="sm" color={skill.value >= 70 ? 'green' : skill.value >= 50 ? 'amber' : 'red'} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
