'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getMessages } from '@/lib/i18n';
import ProgressTracker from '@/components/features/ProgressTracker';
import StreakTracker from '@/components/features/StreakTracker';
import LiteracyTrendChart from '@/components/features/LiteracyTrendChart';
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import LevelBadge from '@/components/ui/LevelBadge';
import MentorAvatar from '@/components/features/MentorAvatar';
import MentorTrack from '@/components/features/MentorTrack';
import AdminProfile from '@/components/features/AdminProfile';

const ADMIN_ROLES = ['admin', 'editor', 'moderator'];

interface Stats {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    mentor_avatar?: string;
  };
  totals: {
    lessons_completed: number;
    tests_taken: number;
    photo_checks: number;
    writing_checks: number;
    certificates: number;
    current_streak: number;
    longest_streak: number;
    xp_points: number;
    level: number;
    language_level: string | null;
  };
}

interface LiteracyHistoryItem {
  id: string;
  overall_score: number;
  created_at: string;
}

interface LiteracyHistoryResponse {
  items: LiteracyHistoryItem[];
  avg: number;
  days: number;
  total: number;
}

export default function ProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const m = getMessages(locale);
  const router = useRouter();

  const [stats, setStats] = useState<Stats | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'unauth'>('loading');
  const [literacy, setLiteracy] = useState<LiteracyHistoryResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Auth работает и через cookie `tk-token` (основной путь), и через
      // Authorization: Bearer из localStorage (fallback для старых клиентов).
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      try {
        const r = await fetch('/api/profile/stats', {
          headers,
          credentials: 'include',
          cache: 'no-store',
        });
        if (r.status === 401) {
          if (!cancelled) setStatus('unauth');
          // Редирект на страницу логина с next-параметром, чтобы после входа вернуться
          setTimeout(() => {
            if (!cancelled) {
              router.replace(`/${locale}/login?next=/${locale}/profile`);
            }
          }, 800);
          return;
        }
        const json = (await r.json()) as Stats;
        if (!cancelled) {
          setStats(json);
          setStatus('ready');
        }

        // Грамотность по фото за 30 дней (best-effort, не ломает профиль)
        try {
          const hr = await fetch('/api/photo-check/history?days=30', {
            headers,
            credentials: 'include',
            cache: 'no-store',
          });
          if (hr.ok) {
            const hj = (await hr.json()) as LiteracyHistoryResponse;
            if (!cancelled) setLiteracy(hj);
          }
        } catch {
          /* ignore — блок рендерит пустое состояние */
        }
      } catch {
        if (!cancelled) setStatus('unauth');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [locale, router]);

  if (status === 'loading') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-gray-500">
        {locale === 'kk' ? 'Жүктелуде...' : 'Загрузка...'}
      </div>
    );
  }

  if (status === 'unauth' || !stats) {
    const loginHref = `/${locale}/login?next=/${locale}/profile`;
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          {locale === 'kk' ? 'Кіру қажет' : 'Требуется вход'}
        </h1>
        <p className="text-gray-500 mb-6">
          {locale === 'kk'
            ? 'Профильді көру үшін жүйеге кіріңіз.'
            : 'Войдите, чтобы увидеть профиль.'}
        </p>
        <a
          href={loginHref}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-700 text-white font-semibold text-sm hover:bg-teal-800 transition"
        >
          {locale === 'kk' ? 'Жүйеге кіру →' : 'Войти →'}
        </a>
      </div>
    );
  }

  const { user, totals } = stats;
  const displayLevel = totals.language_level || 'A1';
  const mentor = user.mentor_avatar || 'abai';

  // Админ / редактор / модератор — кабинет админ-центричный, не похожий на пользовательский
  if (ADMIN_ROLES.includes(user.role)) {
    return <AdminProfile locale={locale} user={user} />;
  }

  const logoutUser = async () => {
    try { await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }); } catch {}
    try { localStorage.removeItem('token'); } catch {}
    router.push(`/${locale}`);
    setTimeout(() => router.refresh(), 100);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <h1 className="text-3xl font-bold text-gray-900">{m.profile.title}</h1>
        <button
          onClick={logoutUser}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition"
        >
          ⎋ {locale === 'kk' ? 'Шығу' : 'Выход'}
        </button>
      </div>

      {/* User info */}
      <Card className="mb-8">
        <div className="flex items-center gap-4">
          <Avatar name={user.name} size="xl" />
          <div>
            <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
            <p className="text-gray-500 text-sm">{user.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <LevelBadge level={displayLevel} />
              <MentorAvatar mentor={mentor} size="sm" showName locale={locale} />
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ProgressTracker
            locale={locale}
            xp={totals.xp_points}
            level={totals.level}
            streak={totals.current_streak}
          />
        </div>
        <div>
          <StreakTracker
            locale={locale}
            currentStreak={totals.current_streak}
            longestStreak={totals.longest_streak}
          />
        </div>
      </div>

      {/* 📸 Грамотность по фото-проверкам */}
      <Card className="mt-8">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              📸 {locale === 'kk' ? 'Фото арқылы сауаттылық' : 'Грамотность по фото-проверкам'}
            </h2>
            <p className="text-sm text-gray-500">
              {locale === 'kk'
                ? 'Соңғы 30 күндегі динамика'
                : 'Динамика за последние 30 дней'}
            </p>
          </div>
          {literacy && literacy.total > 0 && (
            <div className="text-right">
              <div className="text-xs text-gray-500">
                {locale === 'kk' ? 'Орташа баға' : 'Средняя оценка'}
              </div>
              <div className="text-2xl font-bold text-teal-700">
                {literacy.avg}
                <span className="text-sm text-gray-400">/100</span>
              </div>
              <div className="text-xs text-gray-500">
                {locale === 'kk'
                  ? `${literacy.total} тексеру`
                  : `${literacy.total} проверок`}
              </div>
            </div>
          )}
        </div>

        {totals.photo_checks === 0 || !literacy || literacy.total === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
            <div className="text-4xl mb-2">📷</div>
            <p className="text-sm text-gray-600 mb-4">
              {locale === 'kk'
                ? 'Әлі бірде-бір фото тексерілмеген. Қолжазбаңызды жүктеңіз — AI қателерді көрсетіп, ережелерді түсіндіреді.'
                : 'Пока нет ни одной фото-проверки. Загрузите свою рукопись — AI укажет ошибки и объяснит правила.'}
            </p>
            <Link
              href={`/${locale}/photo-check`}
              className="inline-flex items-center justify-center rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 transition-colors"
            >
              {locale === 'kk'
                ? 'Бірінші фотоны жүктеу'
                : 'Загрузить первое фото'}
            </Link>
          </div>
        ) : (
          <div>
            <LiteracyTrendChart data={literacy.items} locale={locale} avg={literacy.avg} />
            <div className="mt-3 text-right">
              <Link
                href={`/${locale}/photo-check`}
                className="text-sm font-medium text-teal-700 hover:text-teal-800"
              >
                {locale === 'kk' ? 'Жаңа фото тексеру →' : 'Проверить новое фото →'}
              </Link>
            </div>
          </div>
        )}
      </Card>

      {/* 🪶 Учебный путь от наставника */}
      <MentorTrack
        mentor={user.mentor_avatar}
        currentLevel={totals.language_level}
        completedLessonIds={[]}
        locale={locale}
      />
    </div>
  );
}
