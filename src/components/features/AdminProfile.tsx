'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface AdminProfileProps {
  locale: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

interface Totals {
  users: number;
  lessons: number;
  test_questions: number;
  test_sessions: number;
  certificates: number;
  news: number;
  events: number;
  photo_checks: number;
}

export default function AdminProfile({ locale, user }: AdminProfileProps) {
  const router = useRouter();
  const isKk = locale === 'kk';
  const [totals, setTotals] = useState<Totals | null>(null);

  useEffect(() => {
    fetch('/api/admin/analytics', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.totals && setTotals(d.totals))
      .catch(() => {});
  }, []);

  const logout = async () => {
    try { await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }); } catch {}
    try { localStorage.removeItem('token'); } catch {}
    router.push(`/${locale}`);
    setTimeout(() => router.refresh(), 100);
  };

  const roleLabel: Record<string, string> = {
    admin: isKk ? 'Әкімші' : 'Администратор',
    editor: isKk ? 'Редактор' : 'Редактор',
    moderator: isKk ? 'Модератор' : 'Модератор',
  };

  const quickLinks = [
    { href: `/${locale}/admin`, icon: '📊', label: isKk ? 'Дашборд' : 'Дашборд', desc: isKk ? 'Шолу метрикалар' : 'Обзорные метрики' },
    { href: `/${locale}/admin/news`, icon: '📰', label: isKk ? 'Жаңалықтар' : 'Новости', desc: isKk ? 'Жаңалықтарды қосу/өзгерту' : 'Добавить/редактировать' },
    { href: `/${locale}/admin/events`, icon: '📅', label: isKk ? 'Іс-шаралар' : 'Мероприятия', desc: isKk ? 'Күнтізбе мен анонстар' : 'Календарь и анонсы' },
    { href: `/${locale}/admin/lessons`, icon: '📚', label: isKk ? 'Сабақтар' : 'Уроки', desc: isKk ? 'Оқу контент' : 'Учебный контент' },
    { href: `/${locale}/admin/tests`, icon: '✅', label: isKk ? 'Тест сұрақтары' : 'Тесты', desc: isKk ? 'Банк сұрақтар' : 'Банк вопросов' },
    { href: `/${locale}/admin/grammar`, icon: '📐', label: isKk ? 'Грамматика' : 'Грамматика', desc: isKk ? '21 ереже' : '21 правило' },
    { href: `/${locale}/admin/staff`, icon: '👔', label: isKk ? 'Қызметкерлер' : 'Сотрудники', desc: isKk ? 'Бөлімдер мен тізім' : 'Отделы и список' },
    { href: `/${locale}/admin/users`, icon: '👥', label: isKk ? 'Пайдаланушылар' : 'Пользователи', desc: isKk ? 'Аккаунттар мен рөлдер' : 'Аккаунты и роли' },
    { href: `/${locale}/admin/analytics`, icon: '📈', label: isKk ? 'Аналитика' : 'Аналитика', desc: isKk ? '30 күндегі динамика' : 'Динамика за 30 дней' },
    { href: `/${locale}/admin/settings`, icon: '⚙️', label: isKk ? 'Баптаулар' : 'Настройки', desc: isKk ? 'CMS-конфиг' : 'CMS-конфиг' },
  ];

  const metricBadge = (value: number | undefined, label: string, accent: string) => (
    <div className={`rounded-xl border p-3 ${accent}`}>
      <div className="text-2xl font-extrabold">{value ?? '—'}</div>
      <div className="text-[11px] uppercase tracking-wider opacity-80 mt-0.5">{label}</div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Welcome card — совсем не похоже на пользовательский профиль */}
      <div className="rounded-3xl bg-gradient-to-br from-tk-night to-tk-blue-dark text-white p-8 mb-8 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-tk-gold/10" />
        <div className="absolute right-6 top-6 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tk-gold text-tk-night font-bold text-xs uppercase tracking-wider">
          🛡 {roleLabel[user.role] || user.role}
        </div>
        <h1 className="text-3xl font-extrabold mb-2">
          {isKk ? `Сәлеметсіз бе, ${user.name}!` : `Добро пожаловать, ${user.name}!`}
        </h1>
        <p className="text-white/70 mb-6 max-w-2xl">
          {isKk
            ? 'Бұл — сайтты басқару орталығыңыз. Контентті, пайдаланушыларды, статистиканы осы жерден басқарыңыз.'
            : 'Это ваш центр управления сайтом. Отсюда вы управляете контентом, пользователями и видите статистику.'}
        </p>
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href={`/${locale}/admin`}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-tk-terra text-white font-bold text-sm shadow-lg hover:brightness-110 transition"
          >
            🛠 {isKk ? 'Әкімші панеліне өту' : 'Открыть админ-панель'}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </Link>
          <Button variant="ghost" onClick={logout} className="!text-white !border-white/30 !border hover:!bg-white/10">
            ⎋ {isKk ? 'Шығу' : 'Выход'}
          </Button>
        </div>
      </div>

      {/* Mini statistics — 8 quick metrics */}
      <h2 className="text-lg font-semibold text-gray-900 mb-3">
        {isKk ? 'Қысқаша статистика' : 'Быстрая статистика'}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {metricBadge(totals?.users, isKk ? 'Пайдаланушылар' : 'Юзеры', 'bg-blue-50 text-blue-900 border-blue-100')}
        {metricBadge(totals?.lessons, isKk ? 'Сабақтар' : 'Уроки', 'bg-teal-50 text-teal-900 border-teal-100')}
        {metricBadge(totals?.test_questions, isKk ? 'Сұрақтар' : 'Вопросы', 'bg-amber-50 text-amber-900 border-amber-100')}
        {metricBadge(totals?.test_sessions, isKk ? 'Сессиялар' : 'Сессии', 'bg-indigo-50 text-indigo-900 border-indigo-100')}
        {metricBadge(totals?.certificates, isKk ? 'Сертификат' : 'Сертификаты', 'bg-emerald-50 text-emerald-900 border-emerald-100')}
        {metricBadge(totals?.news, isKk ? 'Жаңалықтар' : 'Новости', 'bg-sky-50 text-sky-900 border-sky-100')}
        {metricBadge(totals?.events, isKk ? 'Іс-шаралар' : 'События', 'bg-orange-50 text-orange-900 border-orange-100')}
        {metricBadge(totals?.photo_checks, isKk ? 'Фото' : 'Фото', 'bg-rose-50 text-rose-900 border-rose-100')}
      </div>

      {/* Quick-access grid — совсем иначе, чем на user-профиле */}
      <h2 className="text-lg font-semibold text-gray-900 mb-3">
        {isKk ? 'Жылдам сілтемелер' : 'Быстрые ссылки'}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {quickLinks.map((l) => (
          <Link key={l.href} href={l.href}>
            <Card hover className="h-full flex items-start gap-3 p-4">
              <span className="text-2xl shrink-0">{l.icon}</span>
              <div className="min-w-0">
                <div className="font-semibold text-gray-900">{l.label}</div>
                <div className="text-xs text-gray-500 mt-0.5">{l.desc}</div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
