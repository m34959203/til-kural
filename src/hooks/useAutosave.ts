'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * useAutosave — автосохранение формы-черновика.
 *
 * Семантика:
 *   1. Каждые `intervalMs` (по умолчанию 30 000 мс) проверяем, изменились ли данные
 *      с момента последнего сохранения. Если да — кладём JSON в localStorage
 *      под ключом `autosave:${key}` + timestamp; опционально вызываем
 *      `onServerSave(data)` для фонового POST в бекенд.
 *   2. При mount читаем localStorage: если там есть draft и его `savedAt`
 *      новее, чем `initialSavedAt` (необязательный параметр — напр. updated_at
 *      из БД), вызываем `onRestore(data, savedAt)`. Дальше UI сам решает —
 *      показать баннер «У вас есть несохранённый черновик, восстановить?»
 *      или молча подставить в state.
 *   3. `clearAutosave(key)` — хелпер, дергается после успешной публикации,
 *      чтобы не пихать клиенту устаревший драфт.
 *
 * В SSR и при отсутствии `window` хук безопасно деградирует (ничего не пишет).
 *
 * Типизируем через generic `T` — хук не знает структуру данных, просто
 * сериализует JSON.stringify. Поэтому в `data` нельзя класть цикли, Map/Set,
 * BigInt и т.п.
 */

export type AutosaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface UseAutosaveOptions<T> {
  /** Интервал автосейва в мс. По умолчанию 30 000 (30 секунд). */
  intervalMs?: number;
  /** Опциональный серверный сохраняльщик. Если кинет — статус 'error'. */
  onServerSave?: (data: T) => Promise<void>;
  /**
   * Колбэк восстановления: вызывается один раз при mount, если в localStorage
   * найден более свежий черновик. Принимает решение UI — подменять ли state.
   */
  onRestore?: (data: T, savedAt: Date) => void;
  /**
   * Момент последнего серверного сохранения (ISO string или Date). Если
   * черновик в localStorage старше — он не вызывает onRestore (сервер свежее).
   */
  initialSavedAt?: Date | string | null;
  /** Явный выключатель — удобно в тестах или при feature-flag. */
  disabled?: boolean;
}

export interface UseAutosaveResult {
  /** Момент последнего успешного сохранения (любого — local или server). */
  lastSaved: Date | null;
  status: AutosaveStatus;
  /** Ручной триггер — «сохранить сейчас, без ожидания интервала». */
  saveNow: () => Promise<void>;
}

interface AutosaveRecord<T> {
  data: T;
  savedAt: string; // ISO
}

const LS_PREFIX = 'autosave:';

function lsKey(key: string): string {
  return `${LS_PREFIX}${key}`;
}

/**
 * Удалить черновик после успешной публикации.
 * Безопасен в SSR — проверяет `window`.
 */
export function clearAutosave(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(lsKey(key));
  } catch {
    /* quota / privacy mode — просто молчим */
  }
}

/**
 * Прочитать черновик из localStorage (без восстановления). Удобно для
 * кнопки «показать сохранённый черновик».
 */
export function readAutosave<T>(key: string): AutosaveRecord<T> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(lsKey(key));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AutosaveRecord<T>;
    if (!parsed || typeof parsed.savedAt !== 'string') return null;
    return parsed;
  } catch {
    return null;
  }
}

export function useAutosave<T>(
  key: string,
  data: T,
  options: UseAutosaveOptions<T> = {},
): UseAutosaveResult {
  const { intervalMs = 30_000, onServerSave, onRestore, initialSavedAt, disabled } = options;

  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [status, setStatus] = useState<AutosaveStatus>('idle');

  // `dataRef` держит актуальные данные без ре-подписки интервала на каждое изменение.
  const dataRef = useRef<T>(data);
  // `lastSerializedRef` — что уже сохранили. Не сохраняем повторно, если не изменилось.
  const lastSerializedRef = useRef<string | null>(null);
  // `onServerSaveRef` / `onRestoreRef` — тот же трюк (стабильный интервал).
  const onServerSaveRef = useRef(onServerSave);
  const onRestoreRef = useRef(onRestore);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    onServerSaveRef.current = onServerSave;
  }, [onServerSave]);

  useEffect(() => {
    onRestoreRef.current = onRestore;
  }, [onRestore]);

  /**
   * Ядро автосейва — сериализует, проверяет изменение, пишет в localStorage,
   * опционально дёргает сервер. Возвращает Promise для `saveNow`.
   */
  const doSave = useCallback(async (): Promise<void> => {
    if (disabled) return;
    if (typeof window === 'undefined') return;

    let serialized: string;
    try {
      serialized = JSON.stringify({ data: dataRef.current, savedAt: new Date().toISOString() });
    } catch {
      setStatus('error');
      return;
    }

    // Если сериализованный payload не менялся — экономим IO и сервер.
    if (serialized === lastSerializedRef.current) return;

    setStatus('saving');

    try {
      window.localStorage.setItem(lsKey(key), serialized);
    } catch {
      // quota exceeded / privacy mode — не фатально, просто не сохранили локально.
    }

    try {
      if (onServerSaveRef.current) {
        await onServerSaveRef.current(dataRef.current);
      }
      lastSerializedRef.current = serialized;
      setLastSaved(new Date());
      setStatus('saved');
    } catch (err) {
      console.error('[useAutosave] server save failed', err);
      // Локально уже сохранили — это всё ещё прогресс, но статус = error.
      lastSerializedRef.current = serialized;
      setLastSaved(new Date());
      setStatus('error');
    }
  }, [disabled, key]);

  // Restore on mount (одноразово на `key`).
  useEffect(() => {
    if (disabled) return;
    if (typeof window === 'undefined') return;

    const stored = readAutosave<T>(key);
    if (!stored) return;

    const savedAt = new Date(stored.savedAt);
    if (Number.isNaN(savedAt.getTime())) return;

    if (initialSavedAt) {
      const initial =
        initialSavedAt instanceof Date ? initialSavedAt : new Date(initialSavedAt);
      if (!Number.isNaN(initial.getTime()) && initial >= savedAt) {
        // Сервер свежее — черновик устарел, можно смело выкинуть.
        return;
      }
    }

    onRestoreRef.current?.(stored.data, savedAt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Основной интервал автосейва.
  useEffect(() => {
    if (disabled) return;
    if (typeof window === 'undefined') return;

    const id = window.setInterval(() => {
      void doSave();
    }, intervalMs);

    return () => window.clearInterval(id);
  }, [disabled, intervalMs, doSave]);

  // При unmount — сохраняем последнее состояние, чтобы не потерять
  // изменения, сделанные за последние секунды перед уходом со страницы.
  useEffect(() => {
    return () => {
      if (disabled) return;
      // best-effort, без await
      void doSave();
    };
  }, [disabled, doSave]);

  return { lastSaved, status, saveNow: doSave };
}

export default useAutosave;
