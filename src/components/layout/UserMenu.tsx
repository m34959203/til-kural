'use client';

import Link from 'next/link';
import { useCurrentUser } from '@/hooks/useCurrentUser';

interface Props {
  locale: string;
}

const ADMIN_ROLES = ['admin', 'editor', 'moderator'];

export default function UserMenu({ locale }: Props) {
  const { user, loading } = useCurrentUser();
  const isKk = locale === 'kk';

  // Загружаемся — рендерим пустой плейсхолдер нужного размера, чтобы не мигал layout
  if (loading) {
    return <div className="hidden sm:flex gap-2"><div className="w-36 h-11 rounded-xl bg-gray-100 animate-pulse" /><div className="w-44 h-11 rounded-xl bg-gray-100 animate-pulse" /></div>;
  }

  const isAdmin = user && ADMIN_ROLES.includes(user.role || '');

  // Первая кнопка (outline): Войти / Личный кабинет
  const primaryButton = !user ? (
    <Link
      href={`/${locale}/login`}
      className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-tk-blue-dark text-tk-blue-dark font-bold text-sm hover:bg-tk-blue-dark hover:text-white transition"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" />
      </svg>
      <span>{isKk ? 'Кіру' : 'Войти'}</span>
    </Link>
  ) : (
    <Link
      href={`/${locale}/profile`}
      className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-tk-blue-dark text-tk-blue-dark font-bold text-sm hover:bg-tk-blue-dark hover:text-white transition"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 4-7 8-7s8 3 8 7" />
      </svg>
      <span>{isKk ? 'Жеке кабинет' : 'Личный кабинет'}</span>
    </Link>
  );

  // Вторая кнопка (terra): Начать обучение / Админ-панель (для admin)
  const secondaryButton = isAdmin ? (
    <Link
      href={`/${locale}/admin`}
      className="hidden sm:flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-tk-terra text-white font-bold text-sm shadow-md hover:shadow-lg hover:brightness-110 transition"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
      <span>{isKk ? 'Әкімші панелі' : 'Админ-панель'}</span>
    </Link>
  ) : (
    <Link
      href={`/${locale}/learn`}
      className="hidden sm:flex px-4 sm:px-5 py-2.5 rounded-xl bg-tk-terra text-white font-bold text-sm shadow-md hover:shadow-lg hover:brightness-110 transition items-center gap-2"
    >
      <span>{isKk ? 'Оқуды бастау' : 'Начать обучение'}</span>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
        <path d="M5 12h14M13 5l7 7-7 7" />
      </svg>
    </Link>
  );

  return (
    <>
      {primaryButton}
      {secondaryButton}
    </>
  );
}
