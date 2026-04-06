import CertificateView from '@/components/features/CertificateView';

export default async function CertificatePage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <CertificateView locale={locale} certificateId={id} />
    </div>
  );
}
