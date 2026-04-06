import ThematicTest from '@/components/features/ThematicTest';

export default async function TopicTestPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <ThematicTest locale={locale} topic={id} />
    </div>
  );
}
