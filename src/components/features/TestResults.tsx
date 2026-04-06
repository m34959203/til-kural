import Card from '@/components/ui/Card';
import Progress from '@/components/ui/Progress';
import LevelBadge from '@/components/ui/LevelBadge';

interface TestResultsProps {
  locale: string;
}

export default function TestResults({ locale }: TestResultsProps) {
  // Demo data
  const results = [
    { id: '1', type: locale === 'kk' ? 'Деңгей анықтау' : 'Определение уровня', score: 78, level: 'B1', date: '2026-04-01' },
    { id: '2', type: locale === 'kk' ? 'Грамматика' : 'Грамматика', score: 85, level: 'B1', date: '2026-03-28' },
    { id: '3', type: 'ҚАЗТЕСТ', score: 72, level: 'B1', date: '2026-03-25' },
    { id: '4', type: locale === 'kk' ? 'Сөздік қор' : 'Словарный запас', score: 90, level: 'B2', date: '2026-03-20' },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900">
        {locale === 'kk' ? 'Тест нәтижелері' : 'Результаты тестов'}
      </h2>

      {results.map((r) => (
        <Card key={r.id} hover>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">{r.type}</h3>
              <p className="text-xs text-gray-500">{r.date}</p>
            </div>
            <div className="flex items-center gap-3">
              <LevelBadge level={r.level} size="sm" />
              <div className="text-right">
                <p className="text-lg font-bold text-teal-700">{r.score}%</p>
              </div>
            </div>
          </div>
          <Progress value={r.score} className="mt-3" size="sm" color={r.score >= 80 ? 'green' : r.score >= 60 ? 'amber' : 'red'} />
        </Card>
      ))}
    </div>
  );
}
