'use client';

import { use, useEffect, useState } from 'react';
import questTemplates from '@/data/quest-templates.json';
import QuestCard from '@/components/features/QuestCard';
import { useCurrentUser } from '@/hooks/useCurrentUser';

interface UserQuestProgress {
  completedTasks?: number;
  totalTasks?: number;
}

interface UserQuest {
  quest_id: string;
  progress: UserQuestProgress | null;
  started_at: string;
  completed_at?: string | null;
}

export default function QuestsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const { user } = useCurrentUser();
  const [userQuests, setUserQuests] = useState<UserQuest[]>([]);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;
    fetch('/api/game/quests', {
      credentials: 'include',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data?.userQuests)) setUserQuests(data.userQuests);
      })
      .catch(() => { /* ignore */ });
  }, [user]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        {locale === 'kk' ? 'Квесттер' : 'Квесты'}
      </h1>
      <p className="text-gray-500 mb-8">
        {locale === 'kk' ? 'Квесттерді орындап, XP жинаңыз' : 'Выполняйте квесты и получайте XP'}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {questTemplates.map((quest) => {
          const uq = userQuests.find((q) => q.quest_id === quest.id);
          const completed = uq?.progress?.completedTasks ?? 0;
          const total = uq?.progress?.totalTasks ?? quest.tasks.length;
          const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
          return (
            <QuestCard
              key={quest.id}
              locale={locale}
              quest={quest}
              started={!!uq}
              progress={pct}
            />
          );
        })}
      </div>
    </div>
  );
}
