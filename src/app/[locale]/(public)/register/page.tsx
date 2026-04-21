'use client';

import { use, useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

interface RegisterResponse {
  token?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  error?: string;
  errors?: string[] | Array<{ field?: string; message?: string }>;
}

export default function RegisterPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const t = {
    title: locale === 'kk' ? 'Тіркелу' : 'Регистрация',
    subtitle: locale === 'kk'
      ? 'Жаңа аккаунт жасаңыз — тегін'
      : 'Создайте новый аккаунт — бесплатно',
    name: locale === 'kk' ? 'Аты-жөні' : 'ФИО',
    email: 'Email',
    password: locale === 'kk' ? 'Құпиясөз' : 'Пароль',
    password_hint: locale === 'kk' ? 'Кемінде 8 таңба' : 'Минимум 8 символов',
    password2: locale === 'kk' ? 'Құпиясөзді растау' : 'Подтверждение пароля',
    password_mismatch: locale === 'kk' ? 'Құпиясөздер сәйкес келмейді' : 'Пароли не совпадают',
    submit: locale === 'kk' ? 'Тіркелу' : 'Зарегистрироваться',
    submitting: locale === 'kk' ? 'Жіберілуде...' : 'Отправка...',
    network: locale === 'kk' ? 'Желі қатесі. Қайталап көріңіз.' : 'Сетевая ошибка. Попробуйте снова.',
    hasAccount: locale === 'kk' ? 'Аккаунтыңыз бар ма?' : 'Уже есть аккаунт?',
    login: locale === 'kk' ? 'Кіру' : 'Войти',
    terms: locale === 'kk' ? 'Тіркеле отырып,' : 'Регистрируясь, вы соглашаетесь с',
    termsLink: locale === 'kk' ? 'Пайдалану шарттарымен' : 'Условиями использования',
    and: locale === 'kk' ? 'және' : 'и',
    privacyLink: locale === 'kk' ? 'Құпиялылық саясатымен келісесіз' : 'Политикой конфиденциальности',
  };

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (password !== password2) {
      setError(t.password_mismatch);
      return;
    }
    if (password.length < 8) {
      setError(locale === 'kk' ? 'Құпиясөз кемінде 8 таңба болуы керек' : 'Пароль должен быть минимум 8 символов');
      return;
    }
    setSubmitting(true);
    try {
      const r = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
        credentials: 'same-origin',
      });
      const data = (await r.json()) as RegisterResponse;
      if (!r.ok || !data.token) {
        let msg = data.error || '';
        if (Array.isArray(data.errors)) {
          const items = data.errors.map((e) =>
            typeof e === 'string' ? e : (e?.message || e?.field || '')
          ).filter(Boolean);
          if (items.length) msg = items.join(', ');
        }
        setError(msg || t.network);
        setSubmitting(false);
        return;
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', data.token);
      }
      const dest = nextPath && nextPath.startsWith('/') ? nextPath : `/${locale}/profile`;
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
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            {t.name}
          </label>
          <input
            id="name"
            type="text"
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>

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
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
          <p className="mt-1 text-xs text-gray-500">{t.password_hint}</p>
        </div>

        <div>
          <label htmlFor="password2" className="block text-sm font-medium text-gray-700 mb-1">
            {t.password2}
          </label>
          <input
            id="password2"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
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

      <p className="mt-4 text-center text-xs text-gray-500">
        {t.terms}{' '}
        <Link href={`/${locale}/terms`} className="text-teal-700 hover:underline">
          {t.termsLink}
        </Link>
        {' '}{t.and}{' '}
        <Link href={`/${locale}/privacy`} className="text-teal-700 hover:underline">
          {t.privacyLink}
        </Link>.
      </p>

      <p className="mt-6 text-center text-sm text-gray-500">
        {t.hasAccount}{' '}
        <Link href={`/${locale}/login${nextPath ? `?next=${encodeURIComponent(nextPath)}` : ''}`} className="font-medium text-teal-700 hover:text-teal-800">
          {t.login}
        </Link>
      </p>
    </div>
  );
}
