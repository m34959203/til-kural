import { getMessages } from '@/lib/i18n';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = getMessages(locale);

  return (
    <html lang={locale} className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-gray-50">
        <div className="sr-only">{messages.common.siteName}</div>
        {children}
      </body>
    </html>
  );
}
