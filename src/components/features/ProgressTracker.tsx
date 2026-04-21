'use client';

import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import Progress from '@/components/ui/Progress';
import XPBar from '@/components/ui/XPBar';
import StreakCounter from '@/components/ui/StreakCounter';

interface Skills {
  grammar?: number;
  vocabulary?: number;
  listening?: number;
  speaking?: number;
  writing?: number;
  reading?: number;
}

interface ProgressTrackerProps {
  locale: string;
  xp?: number;
  level?: number;
  streak?: number;
  weekly?: number[];
  skills?: Skills;
  /** Если true — делаем self-fetch на /api/profile/stats. По умолчанию true, когда props не заданы. */
  autoload?: boolean;
}

interface StatsResponse {
  totals?: {
    xp_points?: number;
    level?: number;
    current_streak?: number;
    lessons_completed?: number;
    tests_taken?: number;
    photo_checks?: number;
    writing_checks?: number;
  };
}

const DEFAULT_WEEKLY = [0, 0, 0, 0, 0, 0, 0];

export default function ProgressTracker(props: ProgressTrackerProps) {
  const {
    locale,
    xp: xpProp,
    level: levelProp,
    streak: streakProp,
    weekly: weeklyProp,
    skills: skillsProp,
  } = props;

  const shouldAutoload =
    props.autoload ??
    (xpProp === undefined && levelProp === undefined && streakProp === undefined);

  const [data, setData] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(shouldAutoload);

  useEffect(() => {
    if (!shouldAutoload) return;
    let cancelled = false;
    (async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token) {
          setLoading(false);
          return;
        }
        const r = await fetch('/api/profile/stats', {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        });
        if (!r.ok) {
          setLoading(false);
          return;
        }
        const json = (await r.json()) as StatsResponse;
        if (!cancelled) {
          setData(json);
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [shouldAutoload]);

  const totals = data?.totals;
  const xp = xpProp ?? totals?.xp_points ?? 0;
  const level = levelProp ?? totals?.level ?? 1;
  const streak = streakProp ?? totals?.current_streak ?? 0;
  const lessonsCompleted = totals?.lessons_completed ?? 0;
  const testsCompleted = totals?.tests_taken ?? 0;
  const writingChecks = totals?.writing_checks ?? 0;
  const photoChecks = totals?.photo_checks ?? 0;

  const weeklyValues = weeklyProp ?? DEFAULT_WEEKLY;
  const weekLabelsKK = ['Дс', 'Сс', 'Ср', 'Бс', 'Жм', 'Сн', 'Жс'];
  const weekLabelsRU = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  const weekLabels = locale === 'kk' ? weekLabelsKK : weekLabelsRU;
  const weeklyActivity = weekLabels.map((day, i) => ({ day, value: weeklyValues[i] ?? 0 }));

  const skills = [
    { label: locale === 'kk' ? 'Грамматика' : 'Грамматика', value: skillsProp?.grammar ?? 0 },
    { label: locale === 'kk' ? 'Сөздік қор' : 'Словарный запас', value: skillsProp?.vocabulary ?? 0 },
    { label: locale === 'kk' ? 'Тыңдау' : 'Аудирование', value: skillsProp?.listening ?? 0 },
    { label: locale === 'kk' ? 'Сөйлеу' : 'Говорение', value: skillsProp?.speaking ?? 0 },
    { label: locale === 'kk' ? 'Жазу' : 'Письмо', value: skillsProp?.writing ?? 0 },
    { label: locale === 'kk' ? 'Оқу' : 'Чтение', value: skillsProp?.reading ?? 0 },
  ];

  return (
    <div className="space-y-6">
      {/* XP and Streak */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <h3 className="text-sm font-medium text-gray-500 mb-3">XP & {locale === 'kk' ? 'Деңгей' : 'Уровень'}</h3>
          <XPBar xp={xp} level={level} locale={locale} />
        </Card>
        <Card>
          <h3 className="text-sm font-medium text-gray-500 mb-3">{locale === 'kk' ? 'Серия' : 'Серия'}</h3>
          <StreakCounter streak={streak} locale={locale} size="lg" />
        </Card>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: locale === 'kk' ? 'Сабақтар' : 'Уроки', value: lessonsCompleted },
          { label: locale === 'kk' ? 'Тесттер' : 'Тесты', value: testsCompleted },
          { label: locale === 'kk' ? 'Фототексеру' : 'Фотопроверок', value: photoChecks },
          { label: locale === 'kk' ? 'Жазбалар' : 'Письма', value: writingChecks },
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
                  style={{ height: `${Math.max(0, Math.min(100, day.value))}%` }}
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
          {skills.map((skill) => (
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

      {loading && (
        <p className="text-xs text-gray-400 text-center">
          {locale === 'kk' ? 'Жүктелуде...' : 'Загрузка...'}
        </p>
      )}
    </div>
  );
}
