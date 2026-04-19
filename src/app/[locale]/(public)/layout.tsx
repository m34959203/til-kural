import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MobileNav from '@/components/layout/MobileNav';
import { getMessages } from '@/lib/i18n';
import { getMenuItems } from '@/lib/settings';

export default async function PublicLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = getMessages(locale);
  const menu = await getMenuItems(locale);
  const menuItems = menu.map((m) => ({
    href: m.href,
    label: locale === 'kk' ? m.kk : m.ru,
  }));

  return (
    <>
      <Header locale={locale} messages={messages} menuItems={menuItems} />
      <main className="flex-1 pb-20 lg:pb-0">{children}</main>
      <Footer locale={locale} messages={messages} />
      <MobileNav locale={locale} />
    </>
  );
}
