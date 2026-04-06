import EventCalendar from '@/components/features/EventCalendar';

export default async function EventsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        {locale === 'kk' ? 'Іс-шаралар' : 'Мероприятия'}
      </h1>
      <p className="text-gray-500 mb-8">
        {locale === 'kk' ? 'Алдағы іс-шаралар мен оқиғалар' : 'Предстоящие мероприятия и события'}
      </p>
      <EventCalendar locale={locale} />
    </div>
  );
}
