import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';

export default async function AdminAnalyticsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {locale === 'kk' ? 'Аналитика' : 'Аналитика'}
      </h1>
      <AnalyticsDashboard locale={locale} />
    </div>
  );
}
