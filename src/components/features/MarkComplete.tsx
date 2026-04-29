'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';

interface MarkCompleteProps {
  lessonId: string;
  locale: string;
  score?: number;
  weakPoints?: string[];
  /** Если true — отрисовать как «уже завершено» сразу. */
  initialDone?: boolean;
  className?: string;
}

interface Progress {
  xp_gained?: number;
  current_streak?: number;
  level?: number;
  achievements_unlocked?: string[];
}

/**
 * Кнопка «Сабақты аяқтау» / «Завершить урок».
 * Вызывает POST /api/lessons/:id/complete (нужен Bearer / cookie auth).
 * Идемпотентно: повторный клик обновит score, но не задублирует XP.
 */
export default function MarkComplete({ lessonId, locale, score = 0, weakPoints, initialDone, className }: MarkCompleteProps) {
  const [done, setDone] = useState(!!initialDone);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsLogin, setNeedsLogin] = useState(false);

  const t = (kk: string, ru: string) => (locale === 'kk' ? kk : ru);

  const submit = async () => {
    setLoading(true);
    setError(null);
    setNeedsLogin(false);
    try {
      const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;
      const res = await fetch(`/api/lessons/${lessonId}/complete`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ score, weak_points: weakPoints || [] }),
      });
      if (res.status === 401) {
        setNeedsLogin(true);
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json().catch(() => ({}));
      setDone(true);
      if (data?.progress) setProgress(data.progress);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  if (needsLogin) {
    return (
      <div className={className}>
        <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          {t(
            'Прогресті сақтау үшін кіріңіз — сонда XP мен streak есептеледі.',
            'Войдите, чтобы сохранить прогресс — XP и streak начислятся в профиль.',
          )}
        </p>
      </div>
    );
  }

  if (done) {
    return (
      <div className={className}>
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          <div className="font-medium">
            ✓ {t('Сабақ аяқталды!', 'Урок завершён!')}
          </div>
          {progress ? (
            <div className="text-emerald-800/80 mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
              {typeof progress.xp_gained === 'number' && progress.xp_gained > 0 && (
                <span>+{progress.xp_gained} XP</span>
              )}
              {typeof progress.current_streak === 'number' && progress.current_streak > 0 && (
                <span>🔥 {progress.current_streak} {t('күн', 'дней')}</span>
              )}
              {typeof progress.level === 'number' && (
                <span>Lvl {progress.level}</span>
              )}
              {Array.isArray(progress.achievements_unlocked) && progress.achievements_unlocked.length > 0 && (
                <span>🏆 {progress.achievements_unlocked.length}</span>
              )}
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <Button onClick={submit} loading={loading} className="w-full sm:w-auto">
        ✓ {t('Сабақты аяқтау', 'Завершить урок')}
      </Button>
      {error && (
        <p className="text-xs text-red-600 mt-2">{t('Қате', 'Ошибка')}: {error}</p>
      )}
    </div>
  );
}
