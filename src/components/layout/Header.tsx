'use client';

import Link from 'next/link';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import GovResourceLinks from '@/components/features/GovResourceLinks';

interface HeaderProps {
  locale: string;
  messages: {
    common: Record<string, string>;
  };
  menuItems?: Array<{ href: string; label: string }>;
}

export default function Header({ locale, messages, menuItems }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const t = messages.common;
  const otherLocale = locale === 'kk' ? 'ru' : 'kk';

  const navItems = menuItems?.length
    ? [{ href: `/${locale}`, label: t.home }, ...menuItems.map((i) => ({ href: `/${locale}${i.href}`, label: i.label }))]
    : [
        { href: `/${locale}`, label: t.home },
        { href: `/${locale}/learn`, label: t.learn },
        { href: `/${locale}/test`, label: t.test },
        { href: `/${locale}/photo-check`, label: locale === 'kk' ? 'Фото тексеру' : 'Фото проверка' },
        { href: `/${locale}/game`, label: t.game },
        { href: `/${locale}/news`, label: t.news },
        { href: `/${locale}/about`, label: t.about },
        { href: `/${locale}/contacts`, label: t.contacts },
      ];

  return (
    <>
      {/* Gov resource bar */}
      <div className="bg-teal-900 text-white text-xs">
        <div className="max-w-7xl mx-auto px-4 py-1 flex items-center justify-between">
          <GovResourceLinks locale={locale} />
          <Link
            href={`/${otherLocale}`}
            className="text-amber-300 hover:text-amber-200 font-medium"
          >
            {otherLocale === 'kk' ? 'Қазақша' : 'Русский'}
          </Link>
        </div>
      </div>

      {/* Main header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href={`/${locale}`} className="flex items-center gap-2">
              <div className="w-9 h-9 bg-teal-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">Т</span>
              </div>
              <div className="hidden sm:block">
                <div className="font-bold text-teal-800 text-lg leading-tight">Тіл-құрал</div>
                <div className="text-[10px] text-gray-500 leading-tight">{t.siteDescription}</div>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-3 py-2 text-sm text-gray-700 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-2">
              <Link
                href={`/${locale}/profile`}
                className="hidden sm:inline-flex items-center px-3 py-2 text-sm text-gray-700 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
              >
                {t.profile}
              </Link>
              <Link
                href={`/${locale}/learn`}
                className="hidden sm:inline-flex bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-800 transition-colors"
              >
                {locale === 'kk' ? 'Оқуды бастау' : 'Начать обучение'}
              </Link>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 text-gray-600 hover:text-gray-900"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {mobileOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile nav */}
          <div
            className={cn(
              'lg:hidden transition-all duration-300 overflow-hidden',
              mobileOpen ? 'max-h-96 pb-4' : 'max-h-0'
            )}
          >
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-2 text-sm text-gray-700 hover:text-teal-700 hover:bg-teal-50 rounded-lg"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href={`/${locale}/profile`}
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2 text-sm text-gray-700 hover:text-teal-700 hover:bg-teal-50 rounded-lg"
              >
                {t.profile}
              </Link>
            </nav>
          </div>
        </div>
      </header>
    </>
  );
}
