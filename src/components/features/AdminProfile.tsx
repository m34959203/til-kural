'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Newspaper,
  CalendarDays,
  BookOpen,
  CheckSquare,
  Scale,
  Briefcase,
  Users as UsersIcon,
  LineChart,
  Settings,
  Shield,
  ArrowRight,
  LogOut,
  type LucideIcon,
} from 'lucide-react';
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
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('auth-change'));
    router.push(`/${locale}`);
    setTimeout(() => router.refresh(), 100);
  };

  const roleLabel: Record<string, string> = {
    admin: isKk ? 'Әкімші' : 'Администратор',
    editor: isKk ? 'Редактор' : 'Редактор',
    moderator: isKk ? 'Модератор' : 'Модератор',
  };

  const quickLinks: { href: string; Icon: LucideIcon; label: string; desc: string; accent: string }[] = [
    { href: `/${locale}/admin`, Icon: LayoutDashboard, label: isKk ? 'Дашборд' : 'Дашборд', desc: isKk ? 'Шолу метрикалар' : 'Обзорные метрики', accent: 'bg-slate-50 text-slate-700' },
    { href: `/${locale}/admin/news`, Icon: Newspaper, label: isKk ? 'Жаңалықтар' : 'Новости', desc: isKk ? 'Жаңалықтарды қосу/өзгерту' : 'Добавить/редактировать', accent: 'bg-sky-50 text-sky-700' },
    { href: `/${locale}/admin/events`, Icon: CalendarDays, label: isKk ? 'Іс-шаралар' : 'Мероприятия', desc: isKk ? 'Күнтізбе мен анонстар' : 'Календарь и анонсы', accent: 'bg-orange-50 text-orange-700' },
    { href: `/${locale}/admin/lessons`, Icon: BookOpen, label: isKk ? 'Сабақтар' : 'Уроки', desc: isKk ? 'Оқу контент' : 'Учебный контент', accent: 'bg-teal-50 text-teal-700' },
    { href: `/${locale}/admin/tests`, Icon: CheckSquare, label: isKk ? 'Тест сұрақтары' : 'Тесты', desc: isKk ? 'Банк сұрақтар' : 'Банк вопросов', accent: 'bg-amber-50 text-amber-700' },
    { href: `/${locale}/admin/grammar`, Icon: Scale, label: isKk ? 'Грамматика' : 'Грамматика', desc: isKk ? '21 ереже' : '21 правило', accent: 'bg-violet-50 text-violet-700' },
    { href: `/${locale}/admin/staff`, Icon: Briefcase, label: isKk ? 'Қызметкерлер' : 'Сотрудники', desc: isKk ? 'Бөлімдер мен тізім' : 'Отделы и список', accent: 'bg-indigo-50 text-indigo-700' },
    { href: `/${locale}/admin/users`, Icon: UsersIcon, label: isKk ? 'Пайдаланушылар' : 'Пользователи', desc: isKk ? 'Аккаунттар мен рөлдер' : 'Аккаунты и роли', accent: 'bg-blue-50 text-blue-700' },
    { href: `/${locale}/admin/analytics`, Icon: LineChart, label: isKk ? 'Аналитика' : 'Аналитика', desc: isKk ? '30 күндегі динамика' : 'Динамика за 30 дней', accent: 'bg-emerald-50 text-emerald-700' },
    { href: `/${locale}/admin/settings`, Icon: Settings, label: isKk ? 'Баптаулар' : 'Настройки', desc: isKk ? 'CMS-конфиг' : 'CMS-конфиг', accent: 'bg-gray-50 text-gray-700' },
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
          <Shield size={14} strokeWidth={2.25} />
          <span>{roleLabel[user.role] || user.role}</span>
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
            <LayoutDashboard size={16} strokeWidth={2} />
            <span>{isKk ? 'Әкімші панеліне өту' : 'Открыть админ-панель'}</span>
            <ArrowRight size={16} strokeWidth={2.5} />
          </Link>
          <Button variant="ghost" onClick={logout} className="!text-white !border-white/30 !border hover:!bg-white/10">
            <LogOut size={16} strokeWidth={2} className="inline -mt-0.5 mr-1.5" />
            {isKk ? 'Шығу' : 'Выход'}
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
        {metricBadge(totals?.events, isKk ? 'Іс-шаралар' : 'Мероприятия', 'bg-orange-50 text-orange-900 border-orange-100')}
        {metricBadge(totals?.photo_checks, isKk ? 'Фото' : 'Фото', 'bg-rose-50 text-rose-900 border-rose-100')}
      </div>

      {/* Quick-access grid — совсем иначе, чем на user-профиле */}
      <h2 className="text-lg font-semibold text-gray-900 mb-3">
        {isKk ? 'Жылдам сілтемелер' : 'Быстрые ссылки'}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {quickLinks.map((l) => {
          const { Icon } = l;
          return (
            <Link key={l.href} href={l.href}>
              <Card hover className="h-full flex items-start gap-3 p-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${l.accent}`}>
                  <Icon size={20} strokeWidth={1.75} />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-gray-900">{l.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{l.desc}</div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
