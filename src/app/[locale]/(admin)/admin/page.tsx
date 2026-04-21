import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';

export default async function AdminDashboard({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {locale === 'kk' ? 'Басқару тақтасы' : 'Панель управления'}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {locale === 'kk'
            ? 'Сайт жөнінде шынайы статистика. Бөлімдер — сол жақ мәзірде.'
            : 'Реальная статистика по сайту. Разделы — в меню слева.'}
        </p>
      </div>
      <AnalyticsDashboard locale={locale} />
    </div>
  );
}
