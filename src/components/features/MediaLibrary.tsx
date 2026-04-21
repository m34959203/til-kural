'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface MediaItem {
  id: string;
  url: string;
  filename: string;
  mime_type?: string | null;
  size_bytes?: number | null;
  uploaded_at?: string | null;
}

function authHeader(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { authorization: `Bearer ${token}` } : {};
}

function formatBytes(bytes?: number | null): string {
  if (!bytes || bytes <= 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
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
  const [uploadProgress, setUploadProgress] = useState<{ done: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const isKk = locale === 'kk';
  const t = {
    title_loaders: isKk ? 'Жүктелуде…' : 'Загрузка…',
    empty: isKk ? 'Медиа файлдар жоқ' : 'Медиафайлов нет',
    empty_hint: isKk ? 'Алғашқы файлды жүктеңіз' : 'Загрузите первый файл',
    drag_prompt: isKk
      ? 'Файлдарды осы аймаққа тастаңыз немесе таңдаңыз'
      : 'Перетащите файлы сюда или выберите',
    upload_btn: isKk ? 'Файлдарды жүктеу' : 'Загрузить файлы',
    copy_link: isKk ? 'Сілтемені көшіру' : 'Копировать ссылку',
    copied: isKk ? 'Көшірілді!' : 'Скопировано!',
    delete_btn: isKk ? 'Жою' : 'Удалить',
    confirm_delete: isKk ? 'Файлды жоюға сенімдісіз бе?' : 'Удалить файл?',
    uploading: isKk ? 'Жүктелуде…' : 'Загрузка…',
    file: isKk ? 'файл' : 'файл',
    of: isKk ? '/' : 'из',
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/media', { headers: { ...authHeader() } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setItems(Array.isArray(data.media) ? data.media : []);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      const arr = Array.from(files);
      if (arr.length === 0) return;
      setError(null);
      setNotice(null);
      setUploading(true);
      setUploadProgress({ done: 0, total: arr.length });
      const uploaded: MediaItem[] = [];
      for (let i = 0; i < arr.length; i++) {
        const f = arr[i];
        try {
          const fd = new FormData();
          fd.append('file', f);
          const res = await fetch('/api/upload', {
            method: 'POST',
            body: fd,
            headers: { ...authHeader() },
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
          const m = data.media;
          if (m) {
            uploaded.push({
              id: m.id,
              url: m.url,
              filename: m.original_name || m.filename,
              mime_type: m.mime_type ?? null,
              size_bytes: typeof m.size === 'number' ? m.size : null,
              uploaded_at: m.created_at ?? null,
            });
          }
        } catch (err) {
          setError(`${f.name}: ${String(err)}`);
        }
        setUploadProgress({ done: i + 1, total: arr.length });
      }
      if (uploaded.length > 0) setItems((prev) => [...uploaded, ...prev]);
      setUploading(false);
      setUploadProgress(null);
      if (fileRef.current) fileRef.current.value = '';
    },
    [],
  );

  function handleFileInput(ev: React.ChangeEvent<HTMLInputElement>) {
    const files = ev.target.files;
    if (files && files.length > 0) uploadFiles(files);
  }

  function handleDragOver(ev: React.DragEvent<HTMLDivElement>) {
    ev.preventDefault();
    ev.stopPropagation();
    setDragActive(true);
  }
  function handleDragLeave(ev: React.DragEvent<HTMLDivElement>) {
    ev.preventDefault();
    ev.stopPropagation();
    setDragActive(false);
  }
  function handleDrop(ev: React.DragEvent<HTMLDivElement>) {
    ev.preventDefault();
    ev.stopPropagation();
    setDragActive(false);
    const files = ev.dataTransfer?.files;
    if (files && files.length > 0) uploadFiles(files);
  }

  async function handleCopyLink(url: string) {
    try {
      const full =
        typeof window !== 'undefined' && url.startsWith('/') ? window.location.origin + url : url;
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(full);
      } else {
        const ta = document.createElement('textarea');
        ta.value = full;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setNotice(t.copied);
      setTimeout(() => setNotice(null), 1500);
    } catch (err) {
      setError(String(err));
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(t.confirm_delete)) return;
    try {
      const res = await fetch(`/api/upload/${id}`, {
        method: 'DELETE',
        headers: { ...authHeader() },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setItems((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      setError(String(err));
    }
  }

  const isEmpty = !loading && items.length === 0;

  return (
    <div>
      {/* Верхняя панель: кнопка загрузки + статус */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 disabled:opacity-50"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          {t.upload_btn}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={handleFileInput}
          disabled={uploading}
          className="hidden"
        />
        {uploading && uploadProgress && (
          <span className="text-sm text-teal-700">
            {t.uploading} {uploadProgress.done} {t.of} {uploadProgress.total}
          </span>
        )}
        {notice && <span className="text-sm text-emerald-600">{notice}</span>}
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>

      {/* Drag-zone */}
      <div
        onDragOver={handleDragOver}
        onDragEnter={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        className={`mb-6 cursor-pointer rounded-xl border-2 border-dashed transition-colors ${
          dragActive
            ? 'border-teal-500 bg-teal-50'
            : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
        } ${isEmpty ? 'py-16' : 'py-8'} px-6 text-center`}
      >
        <div className="mx-auto w-12 h-12 mb-3 rounded-full bg-white flex items-center justify-center text-teal-600 shadow-sm">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 16 12 12 8 16" />
            <line x1="12" y1="12" x2="12" y2="21" />
            <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
            <polyline points="16 16 12 12 8 16" />
          </svg>
        </div>
        <div className="text-sm text-gray-700 font-medium">{t.drag_prompt}</div>
        {isEmpty && (
          <div className="text-xs text-gray-500 mt-1">{t.empty_hint}</div>
        )}
      </div>

      {/* Грид файлов */}
      {loading ? (
        <div className="text-gray-500">{t.title_loaders}</div>
      ) : items.length === 0 ? (
        <div className="text-center text-sm text-gray-500 py-4">{t.empty}</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {items.map((m) => {
            const mime = m.mime_type || '';
            const isImage = mime.startsWith('image/');
            const isVideo = mime.startsWith('video/');
            return (
              <div
                key={m.id}
                className="border border-gray-200 rounded-lg overflow-hidden bg-white group hover:shadow-md transition-shadow"
              >
                <button
                  type="button"
                  className="block w-full aspect-square bg-gray-100 flex items-center justify-center overflow-hidden"
                  onClick={() => pickable && onPick?.(m.url)}
                  title={pickable ? m.url : undefined}
                >
                  {isImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={m.url}
                      alt={m.filename}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : isVideo ? (
                    <video src={m.url} className="w-full h-full object-cover" muted />
                  ) : (
                    <div className="text-4xl text-gray-400">📄</div>
                  )}
                </button>
                <div className="p-2 text-xs text-gray-700">
                  <div className="truncate font-medium" title={m.filename}>
                    {m.filename}
                  </div>
                  <div className="text-gray-500 mt-0.5">{formatBytes(m.size_bytes)}</div>
                  <div className="mt-2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleCopyLink(m.url)}
                      className="flex-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
                      title={t.copy_link}
                    >
                      {isKk ? 'Сілтеме' : 'Ссылка'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(m.id)}
                      className="px-2 py-1 text-xs bg-red-50 hover:bg-red-100 rounded text-red-600"
                      title={t.delete_btn}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
