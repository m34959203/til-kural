'use client';

import { useEffect, useState } from 'react';

interface Settings {
  ga_id?: string;
  ym_id?: string;
  contact_phone?: string;
  contact_email?: string;
  contact_address_kk?: string;
  contact_address_ru?: string;
  map_lat?: string;
  map_lng?: string;
  map_2gis_id?: string;
  social_instagram?: string;
  social_facebook?: string;
  social_telegram?: string;
  menu_json?: string;
}

const SECTIONS: Array<{ title: string; fields: Array<{ key: keyof Settings; label: string; type?: string; hint?: string }> }> = [
  {
    title: 'Аналитика',
    fields: [
      { key: 'ga_id', label: 'Google Analytics ID', hint: 'G-XXXXXXX' },
      { key: 'ym_id', label: 'Яндекс.Метрика ID', hint: '12345678' },
    ],
  },
  {
    title: 'Контакты',
    fields: [
      { key: 'contact_phone', label: 'Телефон' },
      { key: 'contact_email', label: 'Email' },
      { key: 'contact_address_kk', label: 'Мекенжай (KK)' },
      { key: 'contact_address_ru', label: 'Адрес (RU)' },
      { key: 'map_lat', label: 'Широта' },
      { key: 'map_lng', label: 'Долгота' },
      { key: 'map_2gis_id', label: '2GIS виджет ID', hint: 'M1bzf...' },
    ],
  },
  {
    title: 'Соцсети',
    fields: [
      { key: 'social_instagram', label: 'Instagram URL' },
      { key: 'social_facebook', label: 'Facebook URL' },
      { key: 'social_telegram', label: 'Telegram URL' },
    ],
  },
];

export default function SettingsForm({ locale }: { locale: string }) {
  const [data, setData] = useState<Settings>({});
  const [menu, setMenu] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  function token() {
    return typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  }

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/admin/settings', { headers: { authorization: `Bearer ${token()}` } });
      if (!res.ok) { setError('Forbidden'); return; }
      const json = await res.json();
      setData(json.settings || {});
      setMenu(json.settings?.menu_json || '');
    })();
  }, []);

  async function save(ev: React.FormEvent) {
    ev.preventDefault();
    setStatus('saving');
    setError(null);
    try {
      const body = { ...data, menu_json: menu };
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${token()}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Save failed');
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 2000);
    } catch (err) {
      setError(String(err));
      setStatus('error');
    }
  }

  return (
    <form onSubmit={save} className="space-y-8 max-w-3xl">
      {SECTIONS.map((section) => (
        <div key={section.title} className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{section.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {section.fields.map((f) => (
              <label key={f.key} className="block">
                <span className="block text-sm font-medium text-gray-700 mb-1">{f.label}</span>
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  type={f.type || 'text'}
                  value={(data[f.key] as string) || ''}
                  placeholder={f.hint}
                  onChange={(e) => setData({ ...data, [f.key]: e.target.value })}
                />
              </label>
            ))}
          </div>
        </div>
      ))}

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">{locale === 'kk' ? 'Мәзір (JSON)' : 'Меню (JSON)'}</h2>
        <p className="text-sm text-gray-500 mb-3">
          {locale === 'kk' ? 'Формат: [{"href":"/about","kk":"Біз туралы","ru":"О нас"}]' : 'Формат: [{"href":"/about","kk":"Біз туралы","ru":"О нас"}]'}
        </p>
        <textarea
          value={menu}
          onChange={(e) => setMenu(e.target.value)}
          className="w-full min-h-[160px] border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={status === 'saving'}
          className="bg-teal-700 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-teal-800 disabled:opacity-50"
        >
          {status === 'saving' ? (locale === 'kk' ? 'Сақталуда…' : 'Сохранение…') : (locale === 'kk' ? 'Сақтау' : 'Сохранить')}
        </button>
        {status === 'saved' && <span className="text-sm text-emerald-600">✓ {locale === 'kk' ? 'Сақталды' : 'Сохранено'}</span>}
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>
    </form>
  );
}
