import Link from 'next/link';

interface FooterProps {
  locale: string;
  messages: {
    common: Record<string, string>;
    footer: Record<string, string>;
  };
}

export default function Footer({ locale, messages }: FooterProps) {
  const t = messages.common;
  const f = messages.footer;

  return (
    <footer className="bg-teal-900 text-white">
      {/* Kazakh ornament border */}
      <div className="h-2 bg-gradient-to-r from-amber-500 via-teal-600 to-amber-500" />

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">Т</span>
              </div>
              <div>
                <div className="font-bold text-lg">Тіл-құрал</div>
                <div className="text-teal-300 text-xs">{t.siteDescription}</div>
              </div>
            </div>
            <p className="text-teal-200 text-sm leading-relaxed">
              {locale === 'kk'
                ? 'AI технологиясымен қазақ тілін оқытудың жаңа деңгейі'
                : 'Новый уровень обучения казахскому языку с AI технологиями'}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-semibold text-amber-400 mb-4">{locale === 'kk' ? 'Навигация' : 'Навигация'}</h3>
            <nav className="flex flex-col gap-2 text-sm">
              <Link href={`/${locale}/learn`} className="text-teal-200 hover:text-white transition-colors">{t.learn}</Link>
              <Link href={`/${locale}/test`} className="text-teal-200 hover:text-white transition-colors">{t.test}</Link>
              <Link href={`/${locale}/game`} className="text-teal-200 hover:text-white transition-colors">{t.game}</Link>
              <Link href={`/${locale}/news`} className="text-teal-200 hover:text-white transition-colors">{t.news}</Link>
              <Link href={`/${locale}/resources`} className="text-teal-200 hover:text-white transition-colors">
                {locale === 'kk' ? 'Ресурстар' : 'Ресурсы'}
              </Link>
            </nav>
          </div>

          {/* Gov Resources */}
          <div>
            <h3 className="font-semibold text-amber-400 mb-4">{f.govLinks}</h3>
            <nav className="flex flex-col gap-2 text-sm">
              <a href="https://www.akorda.kz" target="_blank" rel="noopener noreferrer" className="text-teal-200 hover:text-white transition-colors">{f.aqorda}</a>
              <a href="https://baitursynuly.kz" target="_blank" rel="noopener noreferrer" className="text-teal-200 hover:text-white transition-colors">{f.baitursynuly}</a>
              <a href="https://tilalemi.kz" target="_blank" rel="noopener noreferrer" className="text-teal-200 hover:text-white transition-colors">{f.tilalemi}</a>
              <a href="https://terminkom.kz" target="_blank" rel="noopener noreferrer" className="text-teal-200 hover:text-white transition-colors">{f.terminkom}</a>
              <a href="https://emle.kz" target="_blank" rel="noopener noreferrer" className="text-teal-200 hover:text-white transition-colors">{f.emle}</a>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-amber-400 mb-4">{t.contacts}</h3>
            <div className="text-sm text-teal-200 space-y-2">
              <p>{locale === 'kk' ? 'Астана қаласы' : 'г. Астана'}</p>
              <p>+7 (7172) 00-00-00</p>
              <p>info@til-kural.kz</p>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-teal-800 text-center text-sm text-teal-300">
          <p>&copy; {new Date().getFullYear()} Тіл-құрал. {f.rights}.</p>
        </div>
      </div>
    </footer>
  );
}
