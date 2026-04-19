import { getMessages, isValidLocale } from '@/lib/i18n';
import { buildMetadata, SITE } from '@/lib/seo';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const l = isValidLocale(locale) ? locale : 'kk';
  return buildMetadata({
    locale: l,
    title: SITE.name,
    description: l === 'kk'
      ? 'AI-мұғалім, ҚАЗТЕСТ дайындық, фото-тексеру, геймификация — қазақ тілін үйренудің толық платформасы.'
      : 'AI-учитель, подготовка к КАЗТЕСТ, фото-проверка, геймификация — платформа изучения казахского языка.',
    path: `/${l}`,
  });
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  const messages = getMessages(locale);
  return (
    <>
      <span className="sr-only">{messages.common.siteName}</span>
      {children}
    </>
  );
}
