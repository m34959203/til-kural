'use client';

import { useEffect, useState } from 'react';

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
 */
export function useCurrentUser(): UseCurrentUserResult {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/auth/me', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (cancelled) return;
        setUser((d?.user as CurrentUser | undefined) ?? null);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { user, loading };
}

export default useCurrentUser;
