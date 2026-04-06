import Link from 'next/link';
import { getMessages } from '@/lib/i18n';
import Card from '@/components/ui/Card';
import LevelBadge from '@/components/ui/LevelBadge';
import Badge from '@/components/ui/Badge';

export default async function LessonsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const m = getMessages(locale);

  const lessons = [
    { id: '1', title_kk: 'Амандасу және танысу', title_ru: 'Приветствие и знакомство', topic: 'conversation', difficulty: 'A1', completed: true },
    { id: '2', title_kk: 'Сандар мен уақыт', title_ru: 'Числа и время', topic: 'vocabulary', difficulty: 'A1', completed: true },
    { id: '3', title_kk: 'Менің отбасым', title_ru: 'Моя семья', topic: 'vocabulary', difficulty: 'A1', completed: false },
    { id: '4', title_kk: 'Көптік жалғау', title_ru: 'Множественное число', topic: 'grammar', difficulty: 'A1', completed: false },
    { id: '5', title_kk: 'Дүкенде сатып алу', title_ru: 'Покупки в магазине', topic: 'conversation', difficulty: 'A2', completed: false },
    { id: '6', title_kk: 'Септік жалғаулары', title_ru: 'Падежные окончания', topic: 'grammar', difficulty: 'A2', completed: false },
    { id: '7', title_kk: 'Етістік шақтары', title_ru: 'Времена глагола', topic: 'grammar', difficulty: 'A2', completed: false },
    { id: '8', title_kk: 'Мейрамханада тапсырыс', title_ru: 'Заказ в ресторане', topic: 'conversation', difficulty: 'B1', completed: false },
    { id: '9', title_kk: 'Іскерлік қазақ тілі', title_ru: 'Деловой казахский', topic: 'business', difficulty: 'B2', completed: false },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{m.learn.lessonsTitle}</h1>
      <p className="text-gray-500 mb-8">
        {locale === 'kk' ? 'Қадам-қадаммен қазақ тілін үйреніңіз' : 'Изучайте казахский язык шаг за шагом'}
      </p>

      <div className="space-y-3">
        {lessons.map((lesson, idx) => (
          <Link key={lesson.id} href={`/${locale}/learn/lessons/${lesson.id}`}>
            <Card hover className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${lesson.completed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {lesson.completed ? '✓' : idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900">
                  {locale === 'kk' ? lesson.title_kk : lesson.title_ru}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <LevelBadge level={lesson.difficulty} size="sm" />
                  <Badge variant={lesson.completed ? 'success' : 'default'}>
                    {lesson.completed ? m.learn.completed : lesson.topic}
                  </Badge>
                </div>
              </div>
              <span className="text-gray-400 text-lg">→</span>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
