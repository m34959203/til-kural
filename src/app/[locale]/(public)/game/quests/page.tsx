import questTemplates from '@/data/quest-templates.json';
import QuestCard from '@/components/features/QuestCard';

export default async function QuestsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        {locale === 'kk' ? 'Квесттер' : 'Квесты'}
      </h1>
      <p className="text-gray-500 mb-8">
        {locale === 'kk' ? 'Квесттерді орындап, XP жинаңыз' : 'Выполняйте квесты и получайте XP'}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {questTemplates.map((quest, idx) => (
          <QuestCard
            key={quest.id}
            locale={locale}
            quest={quest}
            started={idx < 2}
            progress={idx === 0 ? 57 : idx === 1 ? 23 : 0}
          />
        ))}
      </div>
    </div>
  );
}
