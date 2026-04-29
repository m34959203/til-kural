'use client';

import { use, useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

interface LoginResponse {
  token?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  error?: string;
  errors?: string[];
}

export default function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const t = {
    title: locale === 'kk' ? 'Жүйеге кіру' : 'Вход в систему',
    subtitle:
      locale === 'kk'
        ? 'Email және құпиясөзбен кіріңіз'
        : 'Войдите по email и паролю',
    email: 'Email',
    password: locale === 'kk' ? 'Құпиясөз' : 'Пароль',
    submit: locale === 'kk' ? 'Кіру' : 'Войти',
    submitting: locale === 'kk' ? 'Кіру...' : 'Вход...',
    invalid:
      locale === 'kk'
        ? 'Email не құпиясөз қате'
        : 'Неверный email или пароль',
    network:
      locale === 'kk'
        ? 'Желі қатесі. Қайталап көріңіз.'
        : 'Сетевая ошибка. Попробуйте снова.',
    noAccount:
      locale === 'kk' ? 'Аккаунтыңыз жоқ па?' : 'Нет аккаунта?',
    register: locale === 'kk' ? 'Тіркелу' : 'Регистрация',
  };

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const r = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
        // cookie устанавливает сервер через Set-Cookie; credentials include на случай cross-origin fetch
        credentials: 'same-origin',
      });
      const data = (await r.json()) as LoginResponse;
      if (!r.ok || !data.token) {
        setError(data.error || (data.errors && data.errors.join(', ')) || t.invalid);
        setSubmitting(false);
        return;
      }
      // Сохраняем token в localStorage для совместимости с существующими клиентами
      // (profile, админ-фетчи), которые шлют Authorization: Bearer.
      // Cookie уже поставлен сервером (httpOnly) — основной механизм для middleware.
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', data.token);
        // Триггерим перечитку useCurrentUser в Header/UserMenu — иначе
        // после router.replace кнопка остаётся «Войти» до hard reload.
        window.dispatchEvent(new Event('auth-change'));
      }
      // next из query или профиль
      const dest =
        nextPath && nextPath.startsWith('/') ? nextPath : `/${locale}/profile`;
      router.replace(dest);
    } catch {
      setError(t.network);
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.title}</h1>
      <p className="text-gray-500 mb-8">{t.subtitle}</p>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            {t.email}
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            {t.password}
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-teal-600 px-4 py-2 font-medium text-white transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-teal-400"
        >
          {submitting ? t.submitting : t.submit}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        {t.noAccount}{' '}
        <Link href={`/${locale}/register`} className="font-medium text-teal-700 hover:text-teal-800">
          {t.register}
        </Link>
      </p>

      <p className="mt-2 text-center text-sm text-gray-500">
        <Link
          href={`/${locale}/forgot-password`}
          className="font-medium text-teal-700 hover:text-teal-800"
        >
          {locale === 'kk' ? 'Құпиясөзді ұмыттыңыз ба?' : 'Забыли пароль?'}
        </Link>
      </p>
    </div>
  );
}
