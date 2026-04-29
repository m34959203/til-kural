'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MOBILE_NAV_OPEN_EVENT } from '@/components/layout/MobileNav';
import { GOV_LANGUAGE_LINKS } from '@/lib/external-links';
import UserMenu from '@/components/layout/UserMenu';

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

          {/* Nav (desktop) — 6 top-level групп, тематические дропдауны */}
          <nav className="hidden lg:flex items-center gap-1 text-[14px] font-semibold">
            <NavLink href={`/${locale}`} active={pathname === `/${locale}` || pathname === `/${locale}/`}>
              {locale === 'kk' ? 'Басты' : 'Главная'}
            </NavLink>
            <NavDropdown
              label={locale === 'kk' ? 'Оқу' : 'Обучение'}
              active={pathname.startsWith(`/${locale}/learn`) || pathname.startsWith(`/${locale}/photo-check`) || pathname.startsWith(`/${locale}/game`)}
              items={[
                { href: `/${locale}/learn`, label_kk: 'Сабақтар', label_ru: 'Уроки', desc_kk: '21 сабақ A1–B2', desc_ru: '21 урок A1–B2', icon: '📚' },
                { href: `/${locale}/learn/basics`, label_kk: 'Тіл негіздері', label_ru: 'Основы языка', desc_kk: '21 грамматика ережесі', desc_ru: '21 правило грамматики', icon: '📖' },
                { href: `/${locale}/learn/dialog`, label_kk: 'AI-диалог', label_ru: 'AI-диалог', desc_kk: 'Live дауыстық сөйлесу', desc_ru: 'Живой голос с AI', icon: '🎙️' },
                { href: `/${locale}/learn/pronunciation`, label_kk: 'Айтылым', label_ru: 'Произношение', desc_kk: 'Сөздердің дұрыс айтылуы', desc_ru: 'Правильное произношение', icon: '🔊' },
                { href: `/${locale}/photo-check`, label_kk: 'Фото-тексеру', label_ru: 'Фото-проверка', desc_kk: 'Қолжазбаны сканерлеу', desc_ru: 'Распознавание рукописи', icon: '📸' },
                { href: `/${locale}/game`, label_kk: 'Ойын', label_ru: 'Игра', desc_kk: 'Квесттер мен XP', desc_ru: 'Квесты и XP', icon: '🎮' },
              ]}
              locale={locale}
            />
            <NavDropdown
              label={locale === 'kk' ? 'Тестілеу' : 'Тесты'}
              active={pathname.startsWith(`/${locale}/test`) || pathname.startsWith(`/${locale}/kaztest-info`)}
              items={[
                { href: `/${locale}/test/level`, label_kk: 'Деңгей', label_ru: 'Уровень', desc_kk: 'A1–C2 адаптивті тест', desc_ru: 'Адаптивный тест A1–C2', icon: '🎯' },
                { href: `/${locale}/test/topics`, label_kk: 'Тақырыптық', label_ru: 'Тематические', desc_kk: 'Грамматика, лексика…', desc_ru: 'Грамматика, лексика…', icon: '📝' },
                { href: `/${locale}/test/kaztest`, label_kk: 'ҚАЗТЕСТ', label_ru: 'КАЗТЕСТ', desc_kk: '5 секция, 100 балл', desc_ru: '5 секций, 100 баллов', icon: '🏅' },
                { href: `/${locale}/kaztest-info`, label_kk: 'ҚАЗТЕСТ жөнінде', label_ru: 'О КАЗТЕСТ', desc_kk: 'Форматы мен ережелері', desc_ru: 'Формат и правила', icon: 'ℹ️' },
              ]}
              locale={locale}
            />
            <NavDropdown
              label={locale === 'kk' ? 'Орталық' : 'О центре'}
              active={pathname.startsWith(`/${locale}/about`) || pathname.startsWith(`/${locale}/events`) || pathname.startsWith(`/${locale}/rules`) || pathname.startsWith(`/${locale}/resources`)}
              items={[
                { href: `/${locale}/about`, label_kk: 'Біз туралы', label_ru: 'О нас', desc_kk: 'Тарих, бөлімдер, қызметкерлер', desc_ru: 'История, отделы, сотрудники', icon: '🏛' },
                { href: `/${locale}/events`, label_kk: 'Іс-шаралар', label_ru: 'События', desc_kk: 'Күнтізбе және жаңалықтар', desc_ru: 'Календарь и анонсы', icon: '📅' },
                { href: `/${locale}/rules`, label_kk: 'Ережелер', label_ru: 'Правила', desc_kk: 'Нормативтік құжаттар', desc_ru: 'Нормативные документы', icon: '📜' },
                { href: `/${locale}/resources`, label_kk: 'Ресурстар', label_ru: 'Ресурсы', desc_kk: 'Пайдалы сілтемелер', desc_ru: 'Полезные ссылки', icon: '🔗' },
              ]}
              locale={locale}
            />
            <NavLink href={`/${locale}/news`} active={pathname.startsWith(`/${locale}/news`)}>
              {locale === 'kk' ? 'Жаңалықтар' : 'Новости'}
            </NavLink>
            <NavLink href={`/${locale}/contacts`} active={pathname.startsWith(`/${locale}/contacts`)}>
              {locale === 'kk' ? 'Байланыс' : 'Контакты'}
            </NavLink>
          </nav>

          {/* Actions — условный блок: гость / user / admin */}
          <div className="flex items-center gap-2">
            <UserMenu locale={locale} />

            {/* Hamburger — visible below lg (где nav скрывается) */}
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event(MOBILE_NAV_OPEN_EVENT))}
              className="lg:hidden w-11 h-11 rounded-xl border-2 border-tk-blue-dark text-tk-blue-dark flex items-center justify-center hover:bg-tk-blue-dark hover:text-white transition"
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

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={
        active
          ? 'px-3 py-2 rounded-lg text-tk-blue-dark bg-tk-blue/10'
          : 'px-3 py-2 rounded-lg text-tk-ink hover:bg-tk-beige-2 transition'
      }
    >
      {children}
    </Link>
  );
}

interface DropdownItem {
  href: string;
  label_kk: string;
  label_ru: string;
  desc_kk?: string;
  desc_ru?: string;
  icon?: string;
}

function NavDropdown({
  label,
  items,
  locale,
  active,
}: {
  label: string;
  items: DropdownItem[];
  locale: string;
  active: boolean;
}) {
  const isKk = locale === 'kk';
  return (
    <div className="relative group">
      <button
        type="button"
        className={
          active
            ? 'flex items-center gap-1 px-3 py-2 rounded-lg text-tk-blue-dark bg-tk-blue/10'
            : 'flex items-center gap-1 px-3 py-2 rounded-lg text-tk-ink hover:bg-tk-beige-2 transition'
        }
        aria-haspopup="menu"
      >
        {label}
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="opacity-60 group-hover:opacity-100 group-focus-within:rotate-180 transition" aria-hidden="true">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {/* Панель. Появляется по :hover на группе и :focus-within. Невидима по умолчанию. */}
      <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 transition-all absolute left-0 top-full mt-1 z-50 min-w-[340px] bg-white rounded-2xl shadow-2xl border border-tk-beige-2 p-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-tk-beige-2 transition"
          >
            {item.icon && <span className="text-xl leading-none mt-0.5">{item.icon}</span>}
            <div className="min-w-0">
              <div className="font-semibold text-tk-ink text-sm">{isKk ? item.label_kk : item.label_ru}</div>
              {(item.desc_kk || item.desc_ru) && (
                <div className="text-xs text-tk-muted leading-snug mt-0.5">{isKk ? item.desc_kk : item.desc_ru}</div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
