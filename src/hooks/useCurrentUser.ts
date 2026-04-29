'use client';

import { useCallback, useEffect, useState } from 'react';

export interface CurrentUser {
  id: number | string;
  email: string;
  name: string;
  role: string;
  language_level?: string | null;
  mentor_avatar?: string | null;
  xp_points?: number;
  level?: number;
  current_streak?: number;
  longest_streak?: number;
}

export interface UseCurrentUserResult {
  user: CurrentUser | null;
  loading: boolean;
}

/**
 * Shared React hook to fetch the currently logged-in user from /api/auth/me.
 * Returns { user: null } for anonymous visitors (401 response) — consumers
 * should fall back to sensible defaults (e.g. level 'B1').
 *
 * Refetches when:
 *   - component first mounts;
 *   - any code dispatches `window.dispatchEvent(new Event('auth-change'))`
 *     (login/logout flows must do this so Header updates without hard reload);
 *   - the localStorage `token` key changes from another tab (storage event).
 */
export function useCurrentUser(): UseCurrentUserResult {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const r = await fetch('/api/auth/me', { credentials: 'include', cache: 'no-store' });
      const d = r.ok ? await r.json() : null;
      setUser((d?.user as CurrentUser | undefined) ?? null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await fetchUser();
      if (cancelled) return;
    })();

    const onAuthChange = () => { void fetchUser(); };
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'token') void fetchUser();
    };

    window.addEventListener('auth-change', onAuthChange);
    window.addEventListener('storage', onStorage);

    return () => {
      cancelled = true;
      window.removeEventListener('auth-change', onAuthChange);
      window.removeEventListener('storage', onStorage);
    };
  }, [fetchUser]);

  return { user, loading };
}

export default useCurrentUser;
