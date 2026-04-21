'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MOBILE_NAV_OPEN_EVENT } from '@/components/layout/MobileNav';
import { GOV_LANGUAGE_LINKS } from '@/lib/external-links';

interface HeaderProps {
  locale: string;
  messages: {
    common: Record<string, string>;
  };
  menuItems?: Array<{ href: string; label: string }>;
}

// Inline logo mark matching the prototype (strings 172-177)
function LogoMark() {
  return (
    <div className="w-11 h-11 rounded-xl gradient-blue flex items-center justify-center shadow-md relative overflow-hidden shrink-0">
      <svg width="26" height="26" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path d="M8 24 L 20 8 L 24 12 L 12 28 Z" fill="#F5C518" stroke="#FAF6EC" strokeWidth="0.8" />
        <path d="M20 8 L 24 12" stroke="#0B1E3D" strokeWidth="1.5" />
        <circle cx="10" cy="26" r="1.5" fill="#0B1E3D" />
        <path d="M 14 22 L 17 19" stroke="#0B1E3D" strokeWidth="1" />
      </svg>
      <div className="absolute -right-2 -bottom-2 w-8 h-8 rounded-full sun-rays opacity-30"></div>
    </div>
  );
}

export default function Header({ locale, messages, menuItems }: HeaderProps) {
  const pathname = usePathname() || `/${locale}`;
  const t = messages.common;

  // Swap current locale segment for the other — keeps the user on the same page.
  const pathWithoutLocale = pathname.replace(/^\/(kk|ru)(?=\/|$)/, '') || '/';
  const kkHref = `/kk${pathWithoutLocale === '/' ? '' : pathWithoutLocale}`;
  const ruHref = `/ru${pathWithoutLocale === '/' ? '' : pathWithoutLocale}`;

  const govLinks = [
    { href: 'https://www.akorda.kz', label: locale === 'kk' ? 'Ақорда' : 'Акорда' },
    ...GOV_LANGUAGE_LINKS.map((l) => ({ href: l.href, label: locale === 'kk' ? l.label_kk : l.label_ru })),
  ];

  const defaultNav = [
    { href: '', label: t.home || (locale === 'kk' ? 'Басты' : 'Главная') },
    { href: '/about', label: t.about || (locale === 'kk' ? 'Біз туралы' : 'О нас') },
    { href: '/learn', label: t.learn || (locale === 'kk' ? 'Оқу' : 'Обучение') },
    { href: '/test', label: t.test || (locale === 'kk' ? 'Тест' : 'Тест') },
    { href: '/photo-check', label: locale === 'kk' ? 'Фото-тексеру' : 'Фото-проверка' },
    { href: '/game', label: t.game || (locale === 'kk' ? 'Ойын' : 'Игра') },
    { href: '/news', label: t.news || (locale === 'kk' ? 'Жаңалықтар' : 'Новости') },
    { href: '/resources', label: locale === 'kk' ? 'Ресурстар' : 'Ресурсы' },
  ];

  const navItems = menuItems?.length
    ? [
        { href: `/${locale}`, label: t.home || (locale === 'kk' ? 'Басты' : 'Главная') },
        ...menuItems.map((i) => ({ href: `/${locale}${i.href}`, label: i.label })),
      ]
    : defaultNav.map((i) => ({ href: `/${locale}${i.href}`, label: i.label }));

  const isActive = (href: string) => {
    if (href === `/${locale}`) return pathname === `/${locale}` || pathname === `/${locale}/`;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      {/* ============================================= */}
      {/* TOP BAR — государственные ресурсы + язык        */}
      {/* ============================================= */}
      <div className="bg-tk-night text-white/75 text-[12px] border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 h-9 flex items-center justify-between gap-4">
          {/* Desktop: лейбл + ссылки с разделителями */}
          <div className="hidden lg:flex items-center gap-3 min-w-0">
            <span className="inline-flex items-center gap-1.5 text-tk-gold/80 font-medium uppercase tracking-wider text-[10px] whitespace-nowrap">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2l-8 6v13h6v-7h4v7h6V8l-8-6z" />
              </svg>
              {locale === 'kk' ? 'Мемлекеттік ресурстар' : 'Госресурсы'}
            </span>
            <span className="text-white/20">·</span>
            <nav className="flex items-center gap-0 min-w-0 overflow-x-auto scrollbar-thin">
              {govLinks.map((link, i) => (
                <span key={link.href} className="inline-flex items-center whitespace-nowrap">
                  {i > 0 && <span className="text-white/15 mx-2.5 select-none">·</span>}
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:text-tk-gold transition"
                  >
                    {link.label}
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="opacity-40" aria-hidden="true">
                      <path d="M7 17L17 7M7 7h10v10" />
                    </svg>
                  </a>
                </span>
              ))}
            </nav>
          </div>

          {/* Mobile/tablet: компактный дропдаун "Ресурстар" */}
          <details className="lg:hidden relative group">
            <summary className="list-none inline-flex items-center gap-1.5 cursor-pointer select-none text-tk-gold/90 hover:text-tk-gold transition">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2l-8 6v13h6v-7h4v7h6V8l-8-6z" />
              </svg>
              <span className="font-medium text-[11px] uppercase tracking-wider">
                {locale === 'kk' ? 'Ресурстар' : 'Ресурсы'}
              </span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-open:rotate-180 transition-transform" aria-hidden="true">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </summary>
            <div className="absolute left-0 top-full mt-1 z-50 bg-tk-night border border-white/10 rounded-xl shadow-2xl py-1.5 min-w-[220px]">
              {govLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-3 px-4 py-2 hover:bg-white/5 hover:text-tk-gold transition"
                >
                  <span>{link.label}</span>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="opacity-40" aria-hidden="true">
                    <path d="M7 17L17 7M7 7h10v10" />
                  </svg>
                </a>
              ))}
            </div>
          </details>

          {/* Язык — pill-переключатель */}
          <div className="inline-flex items-center bg-white/5 border border-white/10 rounded-full p-0.5 shrink-0" role="group" aria-label={locale === 'kk' ? 'Тіл таңдау' : 'Выбор языка'}>
            <Link
              href={kkHref}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider transition ${
                locale === 'kk' ? 'bg-tk-gold text-tk-night' : 'text-white/60 hover:text-white'
              }`}
              aria-current={locale === 'kk' ? 'true' : undefined}
            >
              KK
            </Link>
            <Link
              href={ruHref}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider transition ${
                locale === 'ru' ? 'bg-tk-gold text-tk-night' : 'text-white/60 hover:text-white'
              }`}
              aria-current={locale === 'ru' ? 'true' : undefined}
            >
              RU
            </Link>
          </div>
        </div>
      </div>

      {/* ============================================= */}
      {/* HEADER — Logo + navigation                    */}
      {/* ============================================= */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-tk-beige-2">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 h-20 flex items-center justify-between gap-6">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-3 shrink-0">
            <LogoMark />
            <div className="hidden sm:block">
              <div className="text-[20px] font-extrabold leading-none text-tk-night">Тіл-құрал</div>
              <div className="text-[11px] text-tk-muted mt-0.5 tracking-wide">
                {locale === 'kk' ? 'Қазақ тілін оқыту орталығы' : 'Учебно-методический центр'}
              </div>
            </div>
          </Link>

          {/* Nav (desktop) */}
          <nav className="hidden xl:flex items-center gap-1 text-[14px] font-semibold">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={
                  isActive(item.href)
                    ? 'px-3 py-2 rounded-lg text-tk-blue-dark bg-tk-blue/10'
                    : 'px-3 py-2 rounded-lg text-tk-ink hover:bg-tk-beige-2 transition'
                }
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link
              href={`/${locale}/profile`}
              className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-tk-blue-dark text-tk-blue-dark font-bold text-sm hover:bg-tk-blue-dark hover:text-white transition"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 4-7 8-7s8 3 8 7" />
              </svg>
              <span>{t.profile || (locale === 'kk' ? 'Жеке кабинет' : 'Личный кабинет')}</span>
            </Link>
            <Link
              href={`/${locale}/learn`}
              className="hidden sm:flex px-4 sm:px-5 py-2.5 rounded-xl bg-tk-terra text-white font-bold text-sm shadow-md hover:shadow-lg hover:brightness-110 transition items-center gap-2"
            >
              <span>{locale === 'kk' ? 'Оқуды бастау' : 'Начать обучение'}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </Link>

            {/* Hamburger — visible below xl (where desktop nav hides) */}
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event(MOBILE_NAV_OPEN_EVENT))}
              className="xl:hidden w-11 h-11 rounded-xl border-2 border-tk-blue-dark text-tk-blue-dark flex items-center justify-center hover:bg-tk-blue-dark hover:text-white transition"
              aria-label={locale === 'kk' ? 'Мәзірді ашу' : 'Открыть меню'}
              aria-controls="tk-mobile-drawer"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
