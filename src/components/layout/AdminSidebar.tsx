'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface AdminSidebarProps {
  locale: string;
}

export default function AdminSidebar({ locale }: AdminSidebarProps) {
  const pathname = usePathname();

  const items = [
    { href: `/${locale}/admin`, label: locale === 'kk' ? 'Басқару тақтасы' : 'Панель', icon: '📊' },
    { href: `/${locale}/admin/lessons`, label: locale === 'kk' ? 'Сабақтар' : 'Уроки', icon: '📚' },
    { href: `/${locale}/admin/tests`, label: locale === 'kk' ? 'Тесттер' : 'Тесты', icon: '✅' },
    { href: `/${locale}/admin/news`, label: locale === 'kk' ? 'Жаңалықтар' : 'Новости', icon: '📰' },
    { href: `/${locale}/admin/events`, label: locale === 'kk' ? 'Іс-шаралар' : 'Мероприятия', icon: '📅' },
    { href: `/${locale}/admin/users`, label: locale === 'kk' ? 'Пайдаланушылар' : 'Пользователи', icon: '👥' },
    { href: `/${locale}/admin/analytics`, label: locale === 'kk' ? 'Аналитика' : 'Аналитика', icon: '📈' },
    { href: `/${locale}/admin/banners`, label: locale === 'kk' ? 'Баннерлер' : 'Баннеры', icon: '🖼️' },
  ];

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-200 p-4">
      <Link href={`/${locale}`} className="flex items-center gap-2 mb-8 px-2">
        <div className="w-8 h-8 bg-teal-700 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold">Т</span>
        </div>
        <span className="font-bold text-teal-800">Тіл-құрал</span>
      </Link>

      <nav className="flex flex-col gap-1">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
              pathname === item.href
                ? 'bg-teal-50 text-teal-700 font-medium'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            )}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-8 pt-4 border-t border-gray-200">
        <Link
          href={`/${locale}`}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
        >
          <span>🏠</span>
          <span>{locale === 'kk' ? 'Сайтқа оралу' : 'Вернуться на сайт'}</span>
        </Link>
      </div>
    </aside>
  );
}
