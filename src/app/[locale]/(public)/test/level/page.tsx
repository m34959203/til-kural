import LevelTest from '@/components/features/LevelTest';

export default async function LevelTestPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <LevelTest locale={locale} />
    </div>
  );
}
