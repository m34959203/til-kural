import PronunciationPractice from '@/components/features/PronunciationPractice';

export default async function PronunciationPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <PronunciationPractice locale={locale} />
    </div>
  );
}
