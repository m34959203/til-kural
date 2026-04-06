import LeaderboardTable from '@/components/features/LeaderboardTable';

export default async function LeaderboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        {locale === 'kk' ? 'Көшбасшылар кестесі' : 'Таблица лидеров'}
      </h1>
      <LeaderboardTable locale={locale} />
    </div>
  );
}
