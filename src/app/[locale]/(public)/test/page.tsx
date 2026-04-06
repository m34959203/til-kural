import Link from 'next/link';
import { getMessages } from '@/lib/i18n';
import Card from '@/components/ui/Card';

export default async function TestPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const m = getMessages(locale);

  const tests = [
    { href: `/${locale}/test/level`, icon: '🎯', title: m.test.levelTest, desc: m.test.levelTestDesc },
    { href: `/${locale}/test/topics`, icon: '📋', title: m.test.thematicTests, desc: m.test.thematicTestsDesc },
    { href: `/${locale}/test/kaztest`, icon: '🏆', title: m.test.kaztest, desc: m.test.kaztestDesc },
    { href: `/${locale}/test/results`, icon: '📊', title: m.test.results, desc: locale === 'kk' ? 'Тест нәтижелерін қараңыз' : 'Просмотр результатов тестов' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{m.test.title}</h1>
      <p className="text-gray-500 mb-8">
        {locale === 'kk' ? 'Біліміңізді тексеріп, деңгейіңізді анықтаңыз' : 'Проверьте знания и определите свой уровень'}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tests.map((t) => (
          <Link key={t.href} href={t.href}>
            <Card hover className="h-full">
              <div className="text-3xl mb-3">{t.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t.title}</h3>
              <p className="text-sm text-gray-500">{t.desc}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
