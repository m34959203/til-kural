import Link from 'next/link';
import Card from '@/components/ui/Card';

export default async function TopicsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const topics = [
    { id: 'family', icon: '👨‍👩‍👧‍👦', label_kk: 'Отбасы', label_ru: 'Семья' },
    { id: 'food', icon: '🍽️', label_kk: 'Тамақ', label_ru: 'Еда' },
    { id: 'colors', icon: '🎨', label_kk: 'Түстер', label_ru: 'Цвета' },
    { id: 'numbers', icon: '🔢', label_kk: 'Сандар', label_ru: 'Числа' },
    { id: 'days', icon: '📅', label_kk: 'Апта күндері', label_ru: 'Дни недели' },
    { id: 'greetings', icon: '👋', label_kk: 'Амандасу', label_ru: 'Приветствия' },
    { id: 'professions', icon: '👷', label_kk: 'Мамандықтар', label_ru: 'Профессии' },
    { id: 'city', icon: '🏙️', label_kk: 'Қала', label_ru: 'Город' },
    { id: 'nature', icon: '🌿', label_kk: 'Табиғат', label_ru: 'Природа' },
    { id: 'weather', icon: '🌤️', label_kk: 'Ауа райы', label_ru: 'Погода' },
    { id: 'grammar', icon: '📖', label_kk: 'Грамматика', label_ru: 'Грамматика' },
    { id: 'vocabulary', icon: '📝', label_kk: 'Сөздік қор', label_ru: 'Словарный запас' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        {locale === 'kk' ? 'Тақырыптық тесттер' : 'Тематические тесты'}
      </h1>
      <p className="text-gray-500 mb-8">
        {locale === 'kk' ? 'Тақырыпты таңдап, біліміңізді тексеріңіз' : 'Выберите тему и проверьте знания'}
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {topics.map((topic) => (
          <Link key={topic.id} href={`/${locale}/test/topics/${topic.id}`}>
            <Card hover className="text-center h-full">
              <div className="text-3xl mb-2">{topic.icon}</div>
              <h3 className="font-medium text-sm text-gray-900">
                {locale === 'kk' ? topic.label_kk : topic.label_ru}
              </h3>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
