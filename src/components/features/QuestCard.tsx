'use client';

import { useState } from 'react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Progress from '@/components/ui/Progress';
import Button from '@/components/ui/Button';

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
}

export default function QuestCard({ locale, quest, progress = 0, started = false }: QuestCardProps) {
  const [isStarted, setIsStarted] = useState(started);
  const [starting, setStarting] = useState(false);
  const title = locale === 'kk' ? quest.title_kk : quest.title_ru;
  const description = locale === 'kk' ? quest.description_kk : quest.description_ru;

  const handleStart = async () => {
    setStarting(true);
    try {
      const res = await fetch('/api/game/quests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questId: quest.id, action: 'start' }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setIsStarted(true);
    } catch (e) {
      console.error(e);
      alert(locale === 'kk' ? 'Квестті бастау сәтсіз аяқталды' : 'Не удалось начать квест');
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

  return (
    <Card hover>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
        <Badge variant="gold">{typeLabels[quest.quest_type]?.[locale] || quest.quest_type}</Badge>
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
        <span>+{quest.xp_reward} XP</span>
        <span>{quest.duration_days} {locale === 'kk' ? 'күн' : 'дней'}</span>
        <span>{quest.tasks.length} {locale === 'kk' ? 'тапсырма' : 'заданий'}</span>
      </div>

      {isStarted ? (
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">{locale === 'kk' ? 'Прогресс' : 'Прогресс'}</span>
            <span className="font-medium text-teal-700">{progress}%</span>
          </div>
          <Progress value={progress} size="sm" color="amber" />
        </div>
      ) : (
        <Button size="sm" variant="outline" className="w-full" onClick={handleStart} loading={starting}>
          {locale === 'kk' ? 'Квестті бастау' : 'Начать квест'}
        </Button>
      )}
    </Card>
  );
}
