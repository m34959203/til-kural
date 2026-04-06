import WritingChecker from '@/components/features/WritingChecker';

export default async function WritingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <WritingChecker locale={locale} />
    </div>
  );
}
