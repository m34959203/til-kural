'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import LevelBadge from '@/components/ui/LevelBadge';

interface CertificateViewProps {
  locale: string;
  certificateId?: string;
}

export default function CertificateView({ locale, certificateId }: CertificateViewProps) {
  const params = useSearchParams();
  const queryLevel = params.get('level');
  const queryScore = params.get('score');
  const queryName = params.get('name');

  const [userName, setUserName] = useState(queryName || '');
  const level = queryLevel || 'B1';
  const score = queryScore ? Number(queryScore) : 78;
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (userName) return;
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.user) {
          setUserName(data.user.name || data.user.email?.split('@')[0] || 'Student');
        } else {
          setUserName('Student');
        }
      })
      .catch(() => setUserName('Student'));
  }, [userName]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch('/api/test/certificate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: userName || 'Student',
          level,
          score,
          certificateId,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificate-${certificateId || level}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      alert(locale === 'kk' ? 'Жүктеу кезінде қате' : 'Ошибка при загрузке');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Card className="max-w-lg mx-auto text-center py-10">
      <div className="border-4 border-amber-500 rounded-xl p-8 mb-6 bg-gradient-to-b from-white to-amber-50">
        <div className="border-2 border-teal-700 rounded-lg p-6">
          <h3 className="text-sm text-teal-700 font-medium mb-1">TIL-KURAL</h3>
          <p className="text-xs text-gray-400 mb-4">
            {locale === 'kk' ? 'Қазақ тілін оқыту орталығы' : 'Центр обучения казахскому языку'}
          </p>

          <h2 className="text-2xl font-bold text-teal-800 mb-1">СЕРТИФИКАТ</h2>
          <div className="w-24 h-0.5 bg-amber-500 mx-auto mb-4" />

          <p className="text-sm text-gray-600 mb-2">
            {locale === 'kk' ? 'Куәландырады' : 'Подтверждает, что'}
          </p>
          <p className="text-xl font-semibold text-teal-800 mb-4">{userName || '—'}</p>

          <p className="text-sm text-gray-600 mb-2">
            {locale === 'kk' ? 'Қазақ тілін білу деңгейі' : 'Уровень владения казахским языком'}
          </p>
          <div className="mb-4">
            <LevelBadge level={level} size="lg" />
          </div>

          <p className="text-sm text-gray-500">
            {locale === 'kk' ? `Балл: ${score}%` : `Балл: ${score}%`}
          </p>
        </div>
      </div>

      <Button size="lg" onClick={handleDownload} disabled={downloading}>
        {downloading
          ? locale === 'kk' ? 'Жүктелуде…' : 'Загрузка…'
          : `📥 ${locale === 'kk' ? 'PDF жүктеу' : 'Скачать PDF'}`}
      </Button>
    </Card>
  );
}
