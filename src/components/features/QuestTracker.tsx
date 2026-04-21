'use client';

import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import Progress from '@/components/ui/Progress';

interface QuestTrackerProps {
  locale: string;
}

interface QuestTemplate {
  id: string;
  title_kk: string;
  title_ru: string;
  description_kk?: string;
  description_ru?: string;
  tasks: unknown[];
  xp_reward: number;
}

interface UserQuest {
  quest_id: string;
  progress: { completedTasks?: number; totalTasks?: number } | Record<string, unknown>;
  started_at: string;
  completed_at?: string | null;
}

export default function QuestTracker({ locale }: QuestTrackerProps) {
  const [quests, setQuests] = useState<QuestTemplate[]>([]);
  const [userQuests, setUserQuests] = useState<UserQuest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const r = await fetch('/api/game/quests', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          cache: 'no-store',
        });
        const json = await r.json();
        if (!cancelled) {
          setQuests(json.quests || []);
          setUserQuests(json.userQuests || []);
        }
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

  const activeQuests = userQuests.length
    ? userQuests
        .filter((uq) => !uq.completed_at)
        .map((uq) => {
          const tpl = quests.find((q) => q.id === uq.quest_id);
          if (!tpl) return null;
          const p = (uq.progress || {}) as { completedTasks?: number; totalTasks?: number };
          const tasksTotal = p.totalTasks ?? tpl.tasks.length;
          const tasksDone = p.completedTasks ?? 0;
          const progress = tasksTotal ? Math.round((tasksDone / tasksTotal) * 100) : 0;
          return {
            id: tpl.id,
            title: locale === 'kk' ? tpl.title_kk : tpl.title_ru,
            progress,
            tasksTotal,
            tasksDone,
            xpReward: tpl.xp_reward,
          };
        })
        .filter((v): v is NonNullable<typeof v> => v !== null)
    : [];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">
        {locale === 'kk' ? 'Белсенді квесттер' : 'Активные квесты'}
      </h3>

      {loading && (
        <p className="text-sm text-gray-400">
          {locale === 'kk' ? 'Жүктелуде...' : 'Загрузка...'}
        </p>
      )}

      {!loading && activeQuests.length === 0 && (
        <Card>
          <p className="text-sm text-gray-500">
            {locale === 'kk'
              ? 'Белсенді квест жоқ. Квесттер бетінен бастаңыз.'
              : 'Нет активных квестов. Начните один со страницы квестов.'}
          </p>
        </Card>
      )}

      {activeQuests.map((quest) => (
        <Card key={quest.id}>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-900">{quest.title}</h4>
            <span className="text-xs text-amber-600 font-medium">+{quest.xpReward} XP</span>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span>
              {quest.tasksDone}/{quest.tasksTotal} {locale === 'kk' ? 'тапсырма' : 'заданий'}
            </span>
            <span>{quest.progress}%</span>
          </div>
          <Progress value={quest.progress} size="sm" color="amber" />
        </Card>
      ))}
    </div>
  );
}
