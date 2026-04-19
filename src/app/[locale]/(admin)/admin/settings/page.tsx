import SettingsForm from '@/components/features/SettingsForm';

export default async function AdminSettingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {locale === 'kk' ? 'Баптаулар' : 'Настройки сайта'}
      </h1>
      <SettingsForm locale={locale} />
    </div>
  );
}
