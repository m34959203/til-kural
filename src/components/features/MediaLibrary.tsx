'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface MediaItem {
  id: string;
  url: string;
  filename: string;
  original_name?: string;
  mime_type?: string;
  size?: number;
  created_at?: string;
}

function authHeader(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { authorization: `Bearer ${token}` } : {};
}

export default function MediaLibrary({
  locale,
  pickable,
  onPick,
}: {
  locale: string;
  pickable?: boolean;
  onPick?: (url: string) => void;
}) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/upload', { headers: { ...authHeader() } });
      const data = await res.json();
      setItems(data.media || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleUpload(ev: React.ChangeEvent<HTMLInputElement>) {
    const file = ev.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd, headers: { ...authHeader() } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setItems((prev) => [data.media, ...prev]);
    } catch (err) {
      setError(String(err));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(locale === 'kk' ? 'Жоқ па?' : 'Удалить?')) return;
    await fetch(`/api/upload/${id}`, { method: 'DELETE', headers: { ...authHeader() } });
    setItems((prev) => prev.filter((m) => m.id !== id));
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <input ref={fileRef} type="file" accept="image/*,video/*" onChange={handleUpload} disabled={uploading} className="block text-sm" />
        {uploading && <span className="text-sm text-teal-700">{locale === 'kk' ? 'Жүктелуде…' : 'Загрузка…'}</span>}
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>
      {loading ? (
        <div className="text-gray-500">{locale === 'kk' ? 'Жүктелуде…' : 'Загрузка…'}</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {items.map((m) => {
            const isVideo = m.mime_type?.startsWith('video/');
            return (
              <div key={m.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white group">
                <button
                  type="button"
                  className="block w-full aspect-square bg-gray-100 flex items-center justify-center"
                  onClick={() => pickable && onPick?.(m.url)}
                >
                  {isVideo ? (
                    <video src={m.url} className="w-full h-full object-cover" muted />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.url} alt={m.original_name || m.filename} className="w-full h-full object-cover" />
                  )}
                </button>
                <div className="p-2 text-xs text-gray-500 flex items-center justify-between gap-2">
                  <span className="truncate" title={m.original_name}>{m.original_name || m.filename}</span>
                  <button type="button" onClick={() => handleDelete(m.id)} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                </div>
              </div>
            );
          })}
          {items.length === 0 && (
            <div className="col-span-full text-gray-500 text-sm">
              {locale === 'kk' ? 'Медиа файлдар жоқ' : 'Медиафайлов нет'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
