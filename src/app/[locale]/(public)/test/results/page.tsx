import TestResults from '@/components/features/TestResults';

export default async function ResultsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <TestResults locale={locale} />
    </div>
  );
}
