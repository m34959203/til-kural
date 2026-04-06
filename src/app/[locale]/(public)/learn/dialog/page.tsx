import DialogTrainer from '@/components/features/DialogTrainer';

export default async function DialogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <DialogTrainer locale={locale} />
    </div>
  );
}
