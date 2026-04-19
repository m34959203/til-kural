'use client';

import { useEffect, useState } from 'react';

function urlBase64ToUint8Array(base64: string) {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const s = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(s);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

export default function PushOptIn({ locale }: { locale: string }) {
  const [state, setState] = useState<'idle' | 'unsupported' | 'granted' | 'denied' | 'pending'>('idle');
  const [publicKey, setPublicKey] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setState('unsupported');
      return;
    }
    fetch('/api/push/subscribe').then((r) => r.json()).then((d) => setPublicKey(d.publicKey));
  }, []);

  async function subscribe() {
    if (!publicKey) return;
    setState('pending');
    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
      const token = localStorage.getItem('token');
      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(sub),
      });
      setState(res.ok ? 'granted' : 'denied');
    } catch {
      setState('denied');
    }
  }

  if (state === 'unsupported' || !publicKey) return null;
  if (state === 'granted') {
    return <div className="text-xs text-emerald-700">✓ {locale === 'kk' ? 'Push қосылды' : 'Push включён'}</div>;
  }
  return (
    <button
      type="button"
      onClick={subscribe}
      disabled={state === 'pending'}
      className="text-xs text-teal-700 hover:text-teal-800 underline disabled:opacity-50"
    >
      🔔 {locale === 'kk' ? 'Күнделікті еске салу қосу' : 'Включить напоминания'}
    </button>
  );
}
