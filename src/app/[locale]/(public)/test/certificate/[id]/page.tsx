import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CertificateView from '@/components/features/CertificateView';
import { SITE } from '@/lib/seo';
import { db } from '@/lib/db';
import { isUuid } from '@/lib/api';

interface Params {
  locale: string;
  id: string;
}

async function loadCertificate(id: string) {
  if (!isUuid(id)) return null;
  try {
    return await db.findOne('certificates', { id });
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const sp = (await searchParams) || {};
  const pick = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || '';

  const name = pick(sp.name) || 'Student';
  const level = pick(sp.level) || 'B1';
  const score = pick(sp.score) || '';
  const isKk = locale === 'kk';

  const pageUrl = `${SITE.url}/${locale}/test/certificate/${id}`;
  const ogImage = `${SITE.url}/api/og/certificate?name=${encodeURIComponent(name)}&level=${encodeURIComponent(level)}&score=${encodeURIComponent(score)}&locale=${locale}`;
  const title = isKk
    ? `Тіл-құрал сертификаты — ${level}`
    : `Сертификат Тіл-құрал — ${level}`;
  const description = isKk
    ? `Қазақ тілі бойынша ${level} деңгейіне жеткен сертификат.`
    : `Сертификат о владении казахским языком на уровне ${level}.`;

  return {
    title,
    description,
    metadataBase: new URL(SITE.url),
    alternates: { canonical: pageUrl },
    openGraph: {
      type: 'website',
      locale: isKk ? 'kk_KZ' : 'ru_RU',
      siteName: SITE.name,
      url: pageUrl,
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
      site: SITE.twitter,
    },
    robots: { index: false, follow: false },
  };
}

export default async function CertificatePage({ params }: { params: Promise<Params> }) {
  const { locale, id } = await params;
  // Проверяем подлинность сертификата по БД — иначе любой `/anything` рендерил бы
  // «valid-looking» сертификат, что недопустимо для УМЦ.
  const cert = await loadCertificate(id);
  if (!cert) notFound();
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <CertificateView locale={locale} certificateId={id} />
    </div>
  );
}
