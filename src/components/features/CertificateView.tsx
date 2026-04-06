'use client';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import LevelBadge from '@/components/ui/LevelBadge';

interface CertificateViewProps {
  locale: string;
  certificateId?: string;
}

export default function CertificateView({ locale, certificateId }: CertificateViewProps) {
  const handleDownload = async () => {
    try {
      const res = await fetch('/api/test/certificate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: 'Test User',
          level: 'B1',
          score: 78,
          certificateId,
        }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificate-${certificateId || 'til-kural'}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert(locale === 'kk' ? 'Жүктеу кезінде қате' : 'Ошибка при загрузке');
    }
  };

  return (
    <Card className="max-w-lg mx-auto text-center py-10">
      {/* Certificate preview */}
      <div className="border-4 border-amber-500 rounded-xl p-8 mb-6 bg-gradient-to-b from-white to-amber-50">
        <div className="border-2 border-teal-700 rounded-lg p-6">
          <h3 className="text-sm text-teal-700 font-medium mb-1">TIL-KURAL</h3>
          <p className="text-xs text-gray-400 mb-4">
            {locale === 'kk' ? 'Қазақ тілін оқыту орталығы' : 'Центр обучения казахскому языку'}
          </p>

          <h2 className="text-2xl font-bold text-teal-800 mb-1">
            {locale === 'kk' ? 'СЕРТИФИКАТ' : 'СЕРТИФИКАТ'}
          </h2>
          <div className="w-24 h-0.5 bg-amber-500 mx-auto mb-4" />

          <p className="text-sm text-gray-600 mb-2">
            {locale === 'kk' ? 'Куәландырады' : 'Подтверждает, что'}
          </p>
          <p className="text-xl font-semibold text-teal-800 mb-4">Test User</p>

          <p className="text-sm text-gray-600 mb-2">
            {locale === 'kk' ? 'Қазақ тілін білу деңгейі' : 'Уровень владения казахским языком'}
          </p>
          <div className="mb-4">
            <LevelBadge level="B1" size="lg" />
          </div>

          <p className="text-sm text-gray-500">
            {locale === 'kk' ? 'Балл: 78%' : 'Балл: 78%'}
          </p>
        </div>
      </div>

      <Button size="lg" onClick={handleDownload}>
        📥 {locale === 'kk' ? 'PDF жүктеу' : 'Скачать PDF'}
      </Button>
    </Card>
  );
}
