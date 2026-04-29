'use client';

import { useState } from 'react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Progress from '@/components/ui/Progress';
import Button from '@/components/ui/Button';

interface QuestTask {
  day?: number;
  step?: number;
  task_kk?: string;
  task_ru?: string;
  type?: string;
  topic?: string;
  min_score?: number;
}

interface QuestCardProps {
  locale: string;
  quest: {
    id: string;
    title_kk: string;
    title_ru: string;
    description_kk: string;
    description_ru: string;
    quest_type: string;
    xp_reward: number;
    duration_days: number;
    tasks: Array<Record<string, unknown>>;
  };
  progress?: number;
  started?: boolean;
  /** Сколько задач уже завершено (для рендера ✅). */
  completedTasks?: number;
}

// Маршрут для первого задания квеста — выбираем по type первой задачи.
function firstStepHref(locale: string, tasks: QuestTask[]): string {
  const first = tasks[0];
  if (!first) return `/${locale}/learn`;
  if (first.type === 'dialog') return `/${locale}/learn/dialog`;
  if (first.type === 'test') return `/${locale}/test/topics`;
  if (first.type === 'lesson') return `/${locale}/learn/lessons`;
  if (first.type === 'photo' || first.type === 'photo-check') return `/${locale}/photo-check`;
  if (first.type === 'writing') return `/${locale}/learn/writing`;
  return `/${locale}/learn`;
}

export default function QuestCard({ locale, quest, progress = 0, started = false, completedTasks = 0 }: QuestCardProps) {
  const isKk = locale === 'kk';
  const [isStarted, setIsStarted] = useState(started);
  const [starting, setStarting] = useState(false);
  const [showSteps, setShowSteps] = useState(false);
  const title = isKk ? quest.title_kk : quest.title_ru;
  const description = isKk ? quest.description_kk : quest.description_ru;
  const tasks = (quest.tasks as unknown as QuestTask[]) ?? [];

  const handleStart = async () => {
    setStarting(true);
    try {
      const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;
      const res = await fetch('/api/game/quests', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ questId: quest.id, action: 'start' }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setIsStarted(true);
      setShowSteps(true);
      // После старта — переходим на первое задание квеста.
      const href = firstStepHref(locale, tasks);
      if (typeof window !== 'undefined' && href) {
        window.location.assign(href);
      }
    } catch (e) {
      console.error(e);
      alert(isKk ? 'Квестті бастау сәтсіз аяқталды' : 'Не удалось начать квест');
    } finally {
      setStarting(false);
    }
  };

  const typeLabels: Record<string, Record<string, string>> = {
    daily: { kk: 'Күнделікті', ru: 'Ежедневный' },
    challenge: { kk: 'Челлендж', ru: 'Челлендж' },
    learning: { kk: 'Оқу', ru: 'Обучение' },
    skill: { kk: 'Дағды', ru: 'Навык' },
    streak: { kk: 'Серия', ru: 'Серия' },
    vocabulary: { kk: 'Сөздік', ru: 'Словарь' },
  };

  const stepIcon = (type?: string): string => {
    if (type === 'dialog') return '💬';
    if (type === 'test') return '✅';
    if (type === 'lesson') return '📚';
    if (type === 'photo' || type === 'photo-check') return '📷';
    if (type === 'writing') return '✍️';
    return '•';
  };

  return (
    <Card hover>
      <div className="flex items-start justify-between mb-3 gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
        <Badge variant="gold">{typeLabels[quest.quest_type]?.[locale] || quest.quest_type}</Badge>
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-500 mb-3 flex-wrap">
        <span>+{quest.xp_reward} XP</span>
        <span>{quest.duration_days} {isKk ? 'күн' : 'дней'}</span>
        <span>{tasks.length} {isKk ? 'тапсырма' : 'заданий'}</span>
        <button
          type="button"
          onClick={() => setShowSteps((v) => !v)}
          className="ml-auto text-teal-700 hover:text-teal-900 underline"
        >
          {showSteps
            ? (isKk ? 'Тапсырмаларды жасыру' : 'Свернуть задания')
            : (isKk ? 'Тапсырмалар тізімі' : 'Список заданий')}
        </button>
      </div>

      {/* Карта квеста — список заданий с галочками */}
      {showSteps && tasks.length > 0 && (
        <ol className="mb-3 space-y-1.5 text-sm">
          {tasks.map((t, idx) => {
            const done = idx < completedTasks;
            const label = isKk ? t.task_kk : t.task_ru;
            return (
              <li key={idx} className={`flex items-start gap-2 ${done ? 'opacity-60' : ''}`}>
                <span className="text-base shrink-0" aria-hidden>
                  {done ? '✅' : stepIcon(t.type)}
                </span>
                <span className={done ? 'line-through' : ''}>
                  <span className="text-xs text-gray-400 mr-1">
                    {t.day ? `${isKk ? 'Күн' : 'День'} ${t.day}:` : t.step ? `${isKk ? 'Қадам' : 'Шаг'} ${t.step}:` : ''}
                  </span>
                  {label}
                </span>
              </li>
            );
          })}
        </ol>
      )}

      {isStarted ? (
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">{isKk ? 'Прогресс' : 'Прогресс'}</span>
            <span className="font-medium text-teal-700">{progress}%</span>
          </div>
          <Progress value={progress} size="sm" color="amber" />
          {tasks.length > 0 && (
            <Link
              href={firstStepHref(locale, tasks)}
              className="block text-center text-xs text-teal-700 hover:text-teal-900 underline mt-2"
            >
              ▶ {isKk ? 'Келесі тапсырмаға өту' : 'Перейти к следующему заданию'}
            </Link>
          )}
        </div>
      ) : (
        <Button size="sm" variant="outline" className="w-full" onClick={handleStart} loading={starting}>
          {isKk ? 'Квестті бастау' : 'Начать квест'}
        </Button>
      )}
    </Card>
  );
}
