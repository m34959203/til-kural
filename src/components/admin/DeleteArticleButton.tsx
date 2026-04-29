'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  id: string;
  locale: string;
  /** Куда редиректить после удаления. Если не задано — остаёмся и делаем router.refresh(). */
  redirectTo?: string;
  /** Заголовок статьи в confirm() — для предотвращения случайных кликов. */
  label?: string;
  variant?: 'link' | 'button';
}

export default function DeleteArticleButton({
  id,
  locale,
  redirectTo,
  label,
  variant = 'link',
}: Props) {
  const router = useRouter();
  const isKk = locale === 'kk';
  const [busy, setBusy] = useState(false);
  const [, startTransition] = useTransition();

  const onClick = async () => {
    const msg = label
      ? isKk
        ? `«${label}» — жою керек пе?`
        : `Удалить «${label}»?`
      : isKk
        ? 'Мақаланы жою керек пе?'
        : 'Удалить статью?';
    if (!confirm(msg)) return;

    setBusy(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch(`/api/news/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        credentials: 'include',
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `HTTP ${res.status}`);
      }
      if (redirectTo) {
        router.push(redirectTo);
        router.refresh();
      } else {
        startTransition(() => router.refresh());
      }
    } catch (e) {
      alert(String(e instanceof Error ? e.message : e));
      setBusy(false);
    }
  };

  if (variant === 'button') {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        className="inline-flex items-center justify-center font-medium rounded-lg border border-gray-200 text-gray-600 hover:text-rose-700 hover:border-gray-300 px-4 py-2 text-sm transition-colors disabled:opacity-50"
      >
        {busy ? (isKk ? 'Жойылуда…' : 'Удаление…') : isKk ? 'Жою' : 'Удалить'}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="text-gray-500 hover:text-rose-700 font-medium text-sm disabled:opacity-50 transition-colors"
    >
      {busy ? (isKk ? 'Жойылуда…' : 'Удаление…') : isKk ? 'Жою' : 'Удалить'}
    </button>
  );
}
