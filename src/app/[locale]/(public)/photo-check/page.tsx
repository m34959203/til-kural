import { getMessages } from '@/lib/i18n';
import PhotoChecker from '@/components/features/PhotoChecker';

export default async function PhotoCheckPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const m = getMessages(locale);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{m.photoCheck.title}</h1>
      <p className="text-gray-500 mb-8">{m.photoCheck.subtitle}</p>
      <PhotoChecker locale={locale} />
    </div>
  );
}
