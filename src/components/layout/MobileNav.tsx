'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { GOV_LANGUAGE_LINKS } from '@/lib/external-links';
import { useCurrentUser } from '@/hooks/useCurrentUser';

interface MobileNavProps {
  locale: string;
}

// Custom event channel so the Header (or anyone) can trigger the drawer without
// sharing React state. Dispatch `window.dispatchEvent(new Event('tk-mobile-nav:open'))`.
export const MOBILE_NAV_OPEN_EVENT = 'tk-mobile-nav:open';

export default function MobileNav({ locale }: MobileNavProps) {
  const pathname = usePathname() || `/${locale}`;
  const [open, setOpen] = useState(false);

  // Listen for external open requests (e.g. Header hamburger button).
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener(MOBILE_NAV_OPEN_EVENT, handler);
    return () => window.removeEventListener(MOBILE_NAV_OPEN_EVENT, handler);
  }, []);

  // Lock body scroll while drawer is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const pathWithoutLocale = pathname.replace(/^\/(kk|ru)(?=\/|$)/, '') || '/';
  const kkHref = `/kk${pathWithoutLocale === '/' ? '' : pathWithoutLocale}`;
  const ruHref = `/ru${pathWithoutLocale === '/' ? '' : pathWithoutLocale}`;

  const navItems = [
    { href: ``, label: locale === 'kk' ? 'Басты' : 'Главная' },
    { href: `/about`, label: locale === 'kk' ? 'Біз туралы' : 'О нас' },
    { href: `/learn`, label: locale === 'kk' ? 'Оқу' : 'Обучение' },
    { href: `/test`, label: locale === 'kk' ? 'Тест' : 'Тест' },
    { href: `/photo-check`, label: locale === 'kk' ? 'Фото-тексеру' : 'Фото-проверка' },
    { href: `/game`, label: locale === 'kk' ? 'Ойын' : 'Игра' },
    { href: `/news`, label: locale === 'kk' ? 'Жаңалықтар' : 'Новости' },
    { href: `/resources`, label: locale === 'kk' ? 'Ресурстар' : 'Ресурсы' },
  ].map((i) => ({ href: `/${locale}${i.href}`, label: i.label }));

  const govLinks = [
    { href: 'https://www.akorda.kz', label: locale === 'kk' ? 'Ақорда' : 'Акорда' },
    ...GOV_LANGUAGE_LINKS.map((l) => ({ href: l.href, label: locale === 'kk' ? l.label_kk : l.label_ru })),
  ];

  const isActive = (href: string) => {
    if (href === `/${locale}`) return pathname === `/${locale}` || pathname === `/${locale}/`;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          'xl:hidden fixed inset-0 z-50 bg-tk-night/50 backdrop-blur-sm transition-opacity duration-300',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        id="tk-mobile-drawer"
        className={cn(
          'xl:hidden fixed top-0 right-0 bottom-0 z-50 w-[85%] max-w-sm bg-tk-beige shadow-2xl transform transition-transform duration-300 ease-out flex flex-col',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
        role="dialog"
        aria-modal="true"
        aria-label={locale === 'kk' ? 'Мобильдік мәзір' : 'Мобильное меню'}
      >
        {/* Drawer header */}
        <div className="h-20 px-5 flex items-center justify-between border-b border-tk-beige-2 bg-white">
          <Link href={`/${locale}`} className="flex items-center gap-3" onClick={() => setOpen(false)}>
            <div className="w-10 h-10 rounded-xl gradient-blue flex items-center justify-center shadow-md">
              <svg width="22" height="22" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                <path d="M8 24 L 20 8 L 24 12 L 12 28 Z" fill="#F5C518" />
              </svg>
            </div>
            <div>
              <div className="text-[17px] font-extrabold leading-none text-tk-night">Тіл-құрал</div>
              <div className="text-[10px] text-tk-muted mt-0.5 tracking-wide">
                {locale === 'kk' ? 'Қазақ тілін оқыту орталығы' : 'Учебно-методический центр'}
              </div>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="w-10 h-10 rounded-xl hover:bg-tk-beige-2 flex items-center justify-center text-tk-ink transition"
            aria-label={locale === 'kk' ? 'Жабу' : 'Закрыть'}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {/* Drawer body */}
        <div className="flex-1 overflow-y-auto">
          <nav className="p-4 flex flex-col gap-1 text-[15px] font-semibold">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'px-4 py-3 rounded-xl transition',
                  isActive(item.href)
                    ? 'bg-tk-blue/10 text-tk-blue-dark'
                    : 'text-tk-ink hover:bg-tk-beige-2',
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Language switcher */}
          <div className="px-4 pb-4">
            <div className="text-[11px] uppercase tracking-[0.2em] font-extrabold text-tk-muted mb-2 px-2">
              {locale === 'kk' ? 'Тіл' : 'Язык'}
            </div>
            <div className="flex gap-2">
              <Link
                href={kkHref}
                onClick={() => setOpen(false)}
                className={cn(
                  'flex-1 text-center px-4 py-2.5 rounded-xl text-sm font-bold transition border-2',
                  locale === 'kk'
                    ? 'bg-tk-blue-dark text-white border-tk-blue-dark'
                    : 'bg-white text-tk-blue-dark border-tk-beige-2 hover:border-tk-blue-dark',
                )}
              >
                KK
              </Link>
              <Link
                href={ruHref}
                onClick={() => setOpen(false)}
                className={cn(
                  'flex-1 text-center px-4 py-2.5 rounded-xl text-sm font-bold transition border-2',
                  locale === 'ru'
                    ? 'bg-tk-blue-dark text-white border-tk-blue-dark'
                    : 'bg-white text-tk-blue-dark border-tk-beige-2 hover:border-tk-blue-dark',
                )}
              >
                RU
              </Link>
            </div>
          </div>

          {/* Gov resources */}
          <div className="px-4 pb-4">
            <div className="text-[11px] uppercase tracking-[0.2em] font-extrabold text-tk-muted mb-2 px-2">
              {locale === 'kk' ? 'Мемлекеттік ресурстар' : 'Государственные ресурсы'}
            </div>
            <ul className="flex flex-col gap-0.5 text-sm">
              {govLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between px-4 py-2.5 rounded-xl text-tk-ink hover:bg-tk-beige-2 transition"
                  >
                    <span>{link.label}</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M7 17L17 7M7 7h10v10" />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Drawer footer actions — условные по роли */}
        <MobileActions locale={locale} close={() => setOpen(false)} />
      </aside>
    </>
  );
}

function MobileActions({ locale, close }: { locale: string; close: () => void }) {
  const { user, loading } = useCurrentUser();
  const router = useRouter();
  const isKk = locale === 'kk';
  const isAdmin = user && ['admin', 'editor', 'moderator'].includes(user.role || '');

  const logout = async () => {
    try { await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }); } catch {}
    try { localStorage.removeItem('token'); } catch {}
    close();
    router.push(`/${locale}`);
    setTimeout(() => router.refresh(), 100);
  };

  if (loading) {
    return <div className="p-4 border-t border-tk-beige-2 bg-white"><div className="h-12 bg-gray-100 rounded-xl animate-pulse" /></div>;
  }

  if (!user) {
    return (
      <div className="p-4 border-t border-tk-beige-2 bg-white flex flex-col gap-2">
        <Link
          href={`/${locale}/login`}
          onClick={close}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-tk-blue-dark text-tk-blue-dark font-bold text-sm hover:bg-tk-blue-dark hover:text-white transition"
        >
          <span>{isKk ? 'Кіру' : 'Войти'}</span>
        </Link>
        <Link
          href={`/${locale}/learn`}
          onClick={close}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-tk-terra text-white font-bold text-sm shadow-md hover:shadow-lg hover:brightness-110 transition"
        >
          <span>{isKk ? 'Оқуды бастау' : 'Начать обучение'}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 border-t border-tk-beige-2 bg-white flex flex-col gap-2">
      <div className="px-1 pb-1">
        <div className="text-sm font-semibold text-tk-ink truncate">{user.name || user.email}</div>
        <div className="text-xs text-tk-muted truncate">{user.email} · <span className="font-bold text-tk-blue-dark">{user.role}</span></div>
      </div>
      <Link
        href={`/${locale}/profile`}
        onClick={close}
        className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-tk-blue-dark text-tk-blue-dark font-bold text-sm hover:bg-tk-blue-dark hover:text-white transition"
      >
        <span>👤 {isKk ? 'Жеке кабинет' : 'Личный кабинет'}</span>
      </Link>
      {isAdmin && (
        <Link
          href={`/${locale}/admin`}
          onClick={close}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-tk-terra text-white font-bold text-sm shadow-md hover:shadow-lg hover:brightness-110 transition"
        >
          <span>🛠 {isKk ? 'Әкімші панелі' : 'Админ-панель'}</span>
        </Link>
      )}
      <button
        onClick={logout}
        className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-red-200 text-red-600 font-semibold text-sm hover:bg-red-50 transition"
      >
        <span>⎋ {isKk ? 'Шығу' : 'Выход'}</span>
      </button>
    </div>
  );
}
