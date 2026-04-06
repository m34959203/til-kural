import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MobileNav from '@/components/layout/MobileNav';
import { getMessages } from '@/lib/i18n';

export default async function PublicLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = getMessages(locale);

  return (
    <>
      <Header locale={locale} messages={messages} />
      <main className="flex-1 pb-20 lg:pb-0">{children}</main>
      <Footer locale={locale} messages={messages} />
      <MobileNav locale={locale} />
    </>
  );
}
