import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MobileNav from '@/components/layout/MobileNav';
import { getMessages } from '@/lib/i18n';
import { getMenuItems, getSettings } from '@/lib/settings';

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
  const settings = await getSettings().catch(() => undefined);
  const socials = {
    instagram: settings?.social_instagram,
    facebook: settings?.social_facebook,
    telegram: settings?.social_telegram,
  };

  return (
    <>
      {/* a11y: Skip-to-content для клавиатурной навигации */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 z-[60] bg-tk-night text-white px-3 py-2 rounded"
      >
        {locale === 'kk' ? 'Мазмұнға өту' : 'К содержимому'}
      </a>
      <Header locale={locale} messages={messages} menuItems={menuItems} />
      <main id="main" className="flex-1">{children}</main>
      <Footer locale={locale} messages={messages} socials={socials} />
      <MobileNav locale={locale} />
    </>
  );
}
