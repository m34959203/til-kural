import Link from 'next/link';
import Card from '@/components/ui/Card';
import questionsData from '@/data/test-questions-bank.json';

interface BankRow {
  test_type?: string;
  topic?: string;
}

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

  // Подсчёт реального количества тематических вопросов в банке.
  const counts: Record<string, number> = {};
  for (const row of questionsData as BankRow[]) {
    if (row.test_type !== 'thematic') continue;
    if (!row.topic) continue;
    counts[row.topic] = (counts[row.topic] ?? 0) + 1;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        {locale === 'kk' ? 'Тақырыптық тесттер' : 'Тематические тесты'}
      </h1>
      <p className="text-gray-500 mb-8">
        {locale === 'kk' ? 'Тақырыпты таңдап, біліміңізді тексеріңіз' : 'Выберите тему и проверьте знания'}
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {topics.map((topic) => {
          const cnt = counts[topic.id] ?? 0;
          const placeholder = cnt < 3;
          return (
            <Link key={topic.id} href={`/${locale}/test/topics/${topic.id}`}>
              <Card hover className="text-center h-full relative">
                <div className="text-3xl mb-2">{topic.icon}</div>
                <h3 className="font-medium text-sm text-gray-900">
                  {locale === 'kk' ? topic.label_kk : topic.label_ru}
                </h3>
                <div className="mt-2 text-xs">
                  {placeholder ? (
                    <span className="inline-block px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px]">
                      {locale === 'kk' ? 'Әзірленуде' : 'В разработке'}
                    </span>
                  ) : (
                    <span className="text-gray-500">
                      {cnt} {locale === 'kk' ? 'сұрақ' : cnt === 1 ? 'вопрос' : (cnt < 5 ? 'вопроса' : 'вопросов')}
                    </span>
                  )}
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
