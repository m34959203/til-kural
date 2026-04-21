import Link from 'next/link';
import { GOV_LANGUAGE_LINKS } from '@/lib/external-links';

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

  const year = new Date().getFullYear();

  const nav = [
    { href: `/${locale}/learn`, label: t.learn || (locale === 'kk' ? 'Оқу' : 'Обучение') },
    { href: `/${locale}/test`, label: t.test || (locale === 'kk' ? 'Тестілеу' : 'Тестирование') },
    { href: `/${locale}/photo-check`, label: locale === 'kk' ? 'Фото-тексеру' : 'Фото-проверка' },
    { href: `/${locale}/game`, label: t.game || (locale === 'kk' ? 'Ойын' : 'Игра') },
    { href: `/${locale}/news`, label: t.news || (locale === 'kk' ? 'Жаңалықтар' : 'Новости') },
    { href: `/${locale}/resources`, label: locale === 'kk' ? 'Ресурстар' : 'Ресурсы' },
  ];

  const govLinks = [
    { href: 'https://www.akorda.kz', label: f.aqorda || 'Ақорда' },
    ...GOV_LANGUAGE_LINKS.map((l) => ({
      href: l.href,
      label: (f[l.key] as string | undefined) || (locale === 'kk' ? l.label_kk : l.label_ru),
    })),
  ];

  return (
    <footer className="bg-tk-night text-white/80">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-16 grid md:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* About */}
        <div>
          <Link href={`/${locale}`} className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl gradient-blue flex items-center justify-center shadow-md">
              <svg width="26" height="26" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                <path d="M8 24 L 20 8 L 24 12 L 12 28 Z" fill="#F5C518" />
              </svg>
            </div>
            <div>
              <div className="text-xl font-extrabold text-white">Тіл-құрал</div>
              <div className="text-[11px] text-white/60">
                {t.siteDescription || (locale === 'kk' ? 'Оқыту-әдістемелік орталығы' : 'Учебно-методический центр')}
              </div>
            </div>
          </Link>
          <p className="mt-5 text-sm leading-relaxed">
            {locale === 'kk'
              ? 'AI технологиясымен қазақ тілін оқытудың жаңа деңгейі. Байтұрсынұлының мұрасы — заманауи платформада.'
              : 'Новый уровень обучения казахскому языку с AI. Наследие Байтурсынулы — на современной платформе.'}
          </p>
          <div className="mt-5 flex gap-3">
            <a
              href="#"
              aria-label="Twitter"
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-tk-gold hover:text-tk-night flex items-center justify-center transition"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M22 5.8a8.5 8.5 0 01-2.36.64 4.13 4.13 0 001.81-2.27 8.21 8.21 0 01-2.61 1 4.1 4.1 0 00-7 3.74 11.64 11.64 0 01-8.45-4.29 4.16 4.16 0 001.27 5.49A4.09 4.09 0 012 9.7v.05a4.1 4.1 0 003.29 4A4.1 4.1 0 013.4 14a4.1 4.1 0 003.83 2.85A8.23 8.23 0 012 18.56a11.6 11.6 0 006.29 1.84A11.59 11.59 0 0020 8.66c0-.18 0-.35-.01-.53A8.18 8.18 0 0022 5.8z" />
              </svg>
            </a>
            <a
              href="#"
              aria-label="Telegram"
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-tk-gold hover:text-tk-night flex items-center justify-center transition"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 01-1.93.07 4.28 4.28 0 004 2.98 8.521 8.521 0 01-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
              </svg>
            </a>
            <a
              href="#"
              aria-label="Facebook"
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-tk-gold hover:text-tk-night flex items-center justify-center transition"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 008.44-9.9c0-5.53-4.5-10.02-10-10.02z" />
              </svg>
            </a>
            <a
              href="#"
              aria-label="YouTube"
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-tk-gold hover:text-tk-night flex items-center justify-center transition"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Navigation */}
        <div>
          <h3 className="font-extrabold text-white text-sm tracking-[0.2em] uppercase">
            {locale === 'kk' ? 'Навигация' : 'Навигация'}
          </h3>
          <ul className="mt-5 space-y-2.5 text-sm">
            {nav.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-tk-gold transition">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Gov resources */}
        <div>
          <h3 className="font-extrabold text-white text-sm tracking-[0.2em] uppercase">
            {f.govLinks || (locale === 'kk' ? 'Мемлекеттік ресурстар' : 'Государственные ресурсы')}
          </h3>
          <ul className="mt-5 space-y-2.5 text-sm">
            {govLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-tk-gold transition flex items-center gap-2"
                >
                  <span>{link.label}</span>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M7 17L17 7M7 7h10v10" />
                  </svg>
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contacts */}
        <div>
          <h3 className="font-extrabold text-white text-sm tracking-[0.2em] uppercase">
            {t.contacts || (locale === 'kk' ? 'Байланыс' : 'Контакты')}
          </h3>
          <ul className="mt-5 space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F5C518" strokeWidth="2" className="mt-0.5 shrink-0" aria-hidden="true">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>
                {locale === 'kk' ? 'Астана қаласы' : 'г. Астана'}
                <br />
                <span className="text-white/60 text-xs">
                  {locale === 'kk' ? 'Мәңгілік ел даңғылы, 55' : 'пр. Мәңгілік ел, 55'}
                </span>
              </span>
            </li>
            <li className="flex items-start gap-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F5C518" strokeWidth="2" className="mt-0.5 shrink-0" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.37 1.9.72 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0122 16.92z" />
              </svg>
              <a href="tel:+77172000000" className="hover:text-tk-gold transition">+7 (7172) 00-00-00</a>
            </li>
            <li className="flex items-start gap-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F5C518" strokeWidth="2" className="mt-0.5 shrink-0" aria-hidden="true">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <path d="M22 6l-10 7L2 6" />
              </svg>
              <a href="mailto:info@til-kural.kz" className="hover:text-tk-gold transition">info@til-kural.kz</a>
            </li>
          </ul>
        </div>
      </div>

      {/* Thin gold ornament strip */}
      <div className="ornament-strip opacity-30" />

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-5 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-white/50">
          <div>&copy; {year} Тіл-құрал. {f.rights || (locale === 'kk' ? 'Барлық құқықтар қорғалған' : 'Все права защищены')}.</div>
          <div className="flex gap-5">
            <Link href={`/${locale}/privacy`} className="hover:text-tk-gold transition">
              {locale === 'kk' ? 'Құпиялылық' : 'Конфиденциальность'}
            </Link>
            <Link href={`/${locale}/terms`} className="hover:text-tk-gold transition">
              {locale === 'kk' ? 'Шарттар' : 'Условия'}
            </Link>
            <Link href={`/${locale}/cookies`} className="hover:text-tk-gold transition">
              Cookie
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
