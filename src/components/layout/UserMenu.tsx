'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useCurrentUser } from '@/hooks/useCurrentUser';

interface Props {
  locale: string;
}

const ADMIN_ROLES = ['admin', 'editor', 'moderator'];

export default function UserMenu({ locale }: Props) {
  const { user, loading } = useCurrentUser();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isKk = locale === 'kk';

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {}
    try { localStorage.removeItem('token'); } catch {}
    setOpen(false);
    router.push(`/${locale}`);
    // Жёсткий refresh чтобы cookie-state обновился везде
    setTimeout(() => router.refresh(), 100);
  };

  // Пока подгружается — показать скелетон, чтобы не мигало «Войти → Профиль»
  if (loading) {
    return <div className="hidden sm:block w-32 h-11 rounded-xl bg-gray-100 animate-pulse" />;
  }

  // Гость: один CTA «Войти» + второстепенная «Начать обучение» (бесплатный урок)
  if (!user) {
    return (
      <>
        <Link
          href={`/${locale}/login`}
          className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-tk-blue-dark text-tk-blue-dark font-bold text-sm hover:bg-tk-blue-dark hover:text-white transition"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" />
          </svg>
          <span>{isKk ? 'Кіру' : 'Войти'}</span>
        </Link>
        <Link
          href={`/${locale}/learn`}
          className="hidden sm:flex px-4 sm:px-5 py-2.5 rounded-xl bg-tk-terra text-white font-bold text-sm shadow-md hover:shadow-lg hover:brightness-110 transition items-center gap-2"
        >
          <span>{isKk ? 'Оқуды бастау' : 'Начать обучение'}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </Link>
      </>
    );
  }

  const isAdmin = ADMIN_ROLES.includes(user.role || '');
  const initial = (user.name || user.email || '?').charAt(0).toUpperCase();

  return (
    <div className="hidden sm:flex items-center gap-2">
      {/* Кнопка админ-панели — только для ролей admin/editor/moderator */}
      {isAdmin && (
        <Link
          href={`/${locale}/admin`}
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-tk-terra text-white font-bold text-sm shadow-md hover:shadow-lg hover:brightness-110 transition"
          title={isKk ? 'Әкімші панелі' : 'Админ-панель'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M3 7h18M3 12h18M3 17h18" />
          </svg>
          <span className="hidden md:inline">{isKk ? 'Әкімші' : 'Админ'}</span>
        </Link>
      )}

      {/* Dropdown профиля */}
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-haspopup="menu"
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 border-tk-blue-dark text-tk-blue-dark font-bold text-sm hover:bg-tk-blue-dark hover:text-white transition"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-tk-blue to-tk-blue-dark text-white flex items-center justify-center text-xs font-extrabold">
            {initial}
          </div>
          <span className="max-w-[120px] truncate">{user.name || user.email}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={open ? 'rotate-180 transition' : 'transition'} aria-hidden="true">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
        {open && (
          <div className="absolute right-0 top-full mt-2 z-50 min-w-[240px] bg-white rounded-2xl shadow-2xl border border-tk-beige-2 overflow-hidden">
            <div className="px-4 py-3 border-b border-tk-beige-2">
              <div className="font-semibold text-tk-ink truncate">{user.name || (isKk ? 'Пайдаланушы' : 'Пользователь')}</div>
              <div className="text-xs text-tk-muted truncate">{user.email}</div>
              {user.role && (
                <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-tk-blue/10 text-tk-blue-dark">
                  {user.role}
                </div>
              )}
            </div>
            <Link
              href={`/${locale}/profile`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-tk-ink hover:bg-tk-beige-2 transition"
            >
              <span>👤</span>
              <span>{isKk ? 'Жеке кабинет' : 'Личный кабинет'}</span>
            </Link>
            {isAdmin && (
              <Link
                href={`/${locale}/admin`}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-tk-ink hover:bg-tk-beige-2 transition"
              >
                <span>🛠</span>
                <span>{isKk ? 'Әкімші панелі' : 'Админ-панель'}</span>
              </Link>
            )}
            <button
              onClick={logout}
              className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition border-t border-tk-beige-2"
            >
              <span>⎋</span>
              <span>{isKk ? 'Шығу' : 'Выход'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
