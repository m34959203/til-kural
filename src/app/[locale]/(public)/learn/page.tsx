import Link from 'next/link';
import { getMessages } from '@/lib/i18n';
import AITeacher from '@/components/features/AITeacher';
import Card from '@/components/ui/Card';

export default async function LearnPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const m = getMessages(locale);

  const sections = [
    { href: `/${locale}/learn/lessons`, icon: '📚', title: m.learn.lessons, desc: locale === 'kk' ? 'Қадам-қадаммен интерактивті сабақтар' : 'Пошаговые интерактивные уроки' },
    { href: `/${locale}/learn/dialog`, icon: '💬', title: m.learn.dialog, desc: locale === 'kk' ? 'AI-мен сөйлесу практикасы' : 'Практика разговора с AI' },
    { href: `/${locale}/learn/writing`, icon: '✍️', title: m.learn.writing, desc: locale === 'kk' ? 'Жазба жұмысты тексеру' : 'Проверка письменных работ' },
    { href: `/${locale}/learn/pronunciation`, icon: '🔊', title: m.learn.pronunciation, desc: locale === 'kk' ? 'Дұрыс айтылуды үйрену' : 'Изучение произношения' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{m.learn.title}</h1>
      <p className="text-gray-500 mb-8">
        {locale === 'kk' ? 'AI мұғалімімен қазақ тілін үйреніңіз' : 'Изучайте казахский язык с AI учителем'}
      </p>

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {sections.map((s) => (
          <Link key={s.href} href={s.href}>
            <Card hover className="text-center h-full" padding="sm">
              <div className="text-2xl mb-2">{s.icon}</div>
              <h3 className="font-medium text-sm text-gray-900">{s.title}</h3>
              <p className="text-xs text-gray-500 mt-1">{s.desc}</p>
            </Card>
          </Link>
        ))}
      </div>

      {/* AI Teacher Chat */}
      <AITeacher locale={locale} />
    </div>
  );
}
