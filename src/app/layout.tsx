import './globals.css';
import { buildMetadata, organizationJsonLd, SITE } from '@/lib/seo';
import Analytics from '@/components/layout/Analytics';

export const metadata = buildMetadata({
  locale: 'kk',
  title: SITE.tagline_kk,
  description: 'Қазақ тілін оқытудың AI платформасы: ИИ-мұғалім, тест, фото-тексеру, геймификация.',
  path: '/',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="kk" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-gray-50">
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd('kk')) }}
        />
        <Analytics />
      </body>
    </html>
  );
}
