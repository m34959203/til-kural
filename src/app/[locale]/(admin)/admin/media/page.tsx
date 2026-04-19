import MediaLibrary from '@/components/features/MediaLibrary';

export default async function AdminMediaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {locale === 'kk' ? 'Медиатека' : 'Медиатека'}
      </h1>
      <MediaLibrary locale={locale} />
    </div>
  );
}
