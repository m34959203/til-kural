import Card from '@/components/ui/Card';
import Progress from '@/components/ui/Progress';

interface QuestTrackerProps {
  locale: string;
}

export default function QuestTracker({ locale }: QuestTrackerProps) {
  const activeQuests = [
    { id: '1', title: locale === 'kk' ? 'Сөйлесу шебері' : 'Мастер разговора', progress: 57, tasksTotal: 7, tasksDone: 4, xpReward: 500 },
    { id: '2', title: locale === 'kk' ? 'Күнделікті тәртіп' : 'Ежедневная дисциплина', progress: 23, tasksTotal: 4, tasksDone: 1, xpReward: 1500 },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">
        {locale === 'kk' ? 'Белсенді квесттер' : 'Активные квесты'}
      </h3>
      {activeQuests.map((quest) => (
        <Card key={quest.id}>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-900">{quest.title}</h4>
            <span className="text-xs text-amber-600 font-medium">+{quest.xpReward} XP</span>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span>{quest.tasksDone}/{quest.tasksTotal} {locale === 'kk' ? 'тапсырма' : 'заданий'}</span>
            <span>{quest.progress}%</span>
          </div>
          <Progress value={quest.progress} size="sm" color="amber" />
        </Card>
      ))}
    </div>
  );
}
