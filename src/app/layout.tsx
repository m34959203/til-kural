import './globals.css';
import { Manrope, Lora } from 'next/font/google';
import { buildMetadata, getBaseUrl, organizationJsonLd, SITE } from '@/lib/seo';
import { getSettings } from '@/lib/settings';
import Analytics from '@/components/layout/Analytics';

const manrope = Manrope({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-manrope',
  display: 'swap',
});

const lora = Lora({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-lora',
  display: 'swap',
});

export const metadata = {
  ...buildMetadata({
    locale: 'kk',
    title: SITE.tagline_kk,
    description: 'Қазақ тілін оқытудың AI платформасы: ИИ-мұғалім, тест, фото-тексеру, геймификация.',
    path: '/',
  }),
  // Явно фиксируем metadataBase на случай, если Next.js будет резолвить
  // относительные URL где-то глубже по дереву — всегда через getBaseUrl().
  metadataBase: new URL(getBaseUrl()),
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Pull real organisation requisites from DB settings so Organization JSON-LD
  // stays in sync with contacts page. Falls back to static defaults on failure.
  const settings = await getSettings().catch(() => undefined);
  return (
    <html lang="kk" className={`h-full antialiased ${manrope.variable} ${lora.variable}`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-gray-50 font-sans">
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd('kk', settings)) }}
        />
        <Analytics />
      </body>
    </html>
  );
}
