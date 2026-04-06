import Link from 'next/link';
import { getMessages } from '@/lib/i18n';
import Card from '@/components/ui/Card';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const m = getMessages(locale);

  const features = [
    { icon: '🤖', title: m.features.aiTeacher, desc: m.features.aiTeacherDesc, href: `/${locale}/learn` },
    { icon: '📝', title: m.features.testing, desc: m.features.testingDesc, href: `/${locale}/test` },
    { icon: '📷', title: m.features.photoCheck, desc: m.features.photoCheckDesc, href: `/${locale}/photo-check` },
    { icon: '🎮', title: m.features.gamification, desc: m.features.gamificationDesc, href: `/${locale}/game` },
    { icon: '💬', title: m.features.dialog, desc: m.features.dialogDesc, href: `/${locale}/learn/dialog` },
    { icon: '🔊', title: m.features.pronunciation, desc: m.features.pronunciationDesc, href: `/${locale}/learn/pronunciation` },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-teal-800 via-teal-700 to-teal-900 text-white kazakh-ornament">
        <div className="max-w-7xl mx-auto px-4 py-20 md:py-28">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              {m.hero.title}
            </h1>
            <p className="text-lg md:text-xl text-teal-100 mb-8 leading-relaxed">
              {m.hero.subtitle}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href={`/${locale}/learn`}
                className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 rounded-xl font-medium text-lg transition-colors"
              >
                {m.hero.cta}
              </Link>
              <Link
                href={`/${locale}/test/level`}
                className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-xl font-medium text-lg border border-white/30 transition-colors"
              >
                {m.hero.ctaTest}
              </Link>
            </div>
          </div>
        </div>
        {/* Decorative ornament line */}
        <div className="h-2 bg-gradient-to-r from-amber-500 via-teal-400 to-amber-500" />
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-12">
          {locale === 'kk' ? 'Платформа мүмкіндіктері' : 'Возможности платформы'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <Link key={f.href} href={f.href}>
              <Card hover className="h-full">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Levels overview */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-4">
            {locale === 'kk' ? 'Тіл деңгейлері' : 'Уровни языка'}
          </h2>
          <p className="text-gray-500 text-center mb-12 max-w-2xl mx-auto">
            {locale === 'kk'
              ? 'A1-ден C2-ге дейін — жүйелі түрде деңгейіңізді арттырыңыз'
              : 'От A1 до C2 — систематически повышайте свой уровень'}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((level) => (
              <Card key={level} hover className="text-center">
                <div className="text-2xl font-bold text-teal-700 mb-1">{level}</div>
                <p className="text-xs text-gray-500">
                  {level === 'A1' && (locale === 'kk' ? 'Бастаушы' : 'Начальный')}
                  {level === 'A2' && (locale === 'kk' ? 'Базалық' : 'Базовый')}
                  {level === 'B1' && (locale === 'kk' ? 'Орта' : 'Средний')}
                  {level === 'B2' && (locale === 'kk' ? 'Орта+' : 'Выше среднего')}
                  {level === 'C1' && (locale === 'kk' ? 'Жоғары' : 'Продвинутый')}
                  {level === 'C2' && (locale === 'kk' ? 'Шебер' : 'Мастер')}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mentors */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-12">
          {locale === 'kk' ? 'AI тәлімгерлер' : 'AI наставники'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: locale === 'kk' ? 'Абай Құнанбайұлы' : 'Абай Кунанбайулы',
              title: locale === 'kk' ? 'Ақын, ойшыл, ағартушы' : 'Поэт, мыслитель',
              quote: '\"Адам бол!\"',
              initials: 'АҚ',
              color: 'bg-indigo-700',
            },
            {
              name: locale === 'kk' ? 'Ахмет Байтұрсынұлы' : 'Ахмет Байтурсынулы',
              title: locale === 'kk' ? 'Тілші, ғалым' : 'Лингвист, учёный',
              quote: '\"Тіл — ұлттың жаны\"',
              initials: 'АБ',
              color: 'bg-emerald-700',
            },
            {
              name: locale === 'kk' ? 'Мұхтар Әуезов' : 'Мухтар Ауэзов',
              title: locale === 'kk' ? 'Жазушы, драматург' : 'Писатель, драматург',
              quote: '\"Абай жолы\"',
              initials: 'МӘ',
              color: 'bg-amber-700',
            },
          ].map((mentor) => (
            <Card key={mentor.name} hover className="text-center">
              <div className={`w-20 h-20 ${mentor.color} rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4`}>
                {mentor.initials}
              </div>
              <h3 className="font-semibold text-gray-900">{mentor.name}</h3>
              <p className="text-sm text-gray-500 mb-2">{mentor.title}</p>
              <p className="text-sm text-teal-700 italic">{mentor.quote}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-teal-800 text-white py-16 kazakh-ornament">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            {locale === 'kk' ? 'Бүгін бастаңыз!' : 'Начните сегодня!'}
          </h2>
          <p className="text-teal-200 mb-8 text-lg">
            {locale === 'kk'
              ? 'Тегін тіркеліп, AI мұғалімімен қазақ тілін үйреніңіз'
              : 'Зарегистрируйтесь бесплатно и изучайте казахский с AI учителем'}
          </p>
          <Link
            href={`/${locale}/learn`}
            className="inline-block bg-amber-500 hover:bg-amber-600 text-white px-10 py-4 rounded-xl font-medium text-lg transition-colors"
          >
            {m.hero.cta}
          </Link>
        </div>
      </section>
    </div>
  );
}
