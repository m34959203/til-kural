import KaztestPractice from '@/components/features/KaztestPractice';

export default async function KaztestPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <KaztestPractice locale={locale} />
    </div>
  );
}
