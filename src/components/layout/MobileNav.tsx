'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface MobileNavProps {
  locale: string;
}

export default function MobileNav({ locale }: MobileNavProps) {
  const pathname = usePathname();

  const items = [
    { href: `/${locale}`, label: locale === 'kk' ? 'Басты' : 'Главная', icon: '🏠' },
    { href: `/${locale}/learn`, label: locale === 'kk' ? 'Оқу' : 'Учить', icon: '📚' },
    { href: `/${locale}/test`, label: locale === 'kk' ? 'Тест' : 'Тест', icon: '✅' },
    { href: `/${locale}/game`, label: locale === 'kk' ? 'Ойын' : 'Игра', icon: '🎮' },
    { href: `/${locale}/profile`, label: locale === 'kk' ? 'Мен' : 'Я', icon: '👤' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 lg:hidden">
      <div className="flex items-center justify-around h-16">
        {items.map((item) => {
          const isActive = pathname === item.href || (item.href !== `/${locale}` && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1 transition-colors',
                isActive ? 'text-teal-700' : 'text-gray-500'
              )}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
