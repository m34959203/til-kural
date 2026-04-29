'use client';

import { use, useEffect, useState } from 'react';

interface AuditRow {
  id: string;
  actor_id: string | null;
  actor_email: string | null;
  actor_role: string | null;
  action: string;
  target_type: string | null;
  target_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  metadata: Record<string, unknown> | string | null;
  created_at: string;
}

const ACTION_OPTIONS = [
  { value: '', label: '— все действия —' },
  { value: 'user.create', label: 'user.create' },
  { value: 'user.update', label: 'user.update' },
  { value: 'user.delete', label: 'user.delete' },
  { value: 'user.reset_password', label: 'user.reset_password' },
  { value: 'settings.update', label: 'settings.update' },
];

export default function AdminAuditPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const isKk = locale === 'kk';
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionFilter, setActionFilter] = useState('');
  const [actorFilter, setActorFilter] = useState('');

  const fetchRows = async () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (actionFilter) params.set('action', actionFilter);
    if (actorFilter) params.set('actor', actorFilter);
    params.set('limit', '200');
    try {
      const res = await fetch(`/api/admin/audit-log?${params.toString()}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setRows(Array.isArray(data?.items) ? data.items : []);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void fetchRows(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const renderMetadata = (m: AuditRow['metadata']) => {
    if (!m) return '—';
    const obj = typeof m === 'string' ? (() => { try { return JSON.parse(m); } catch { return m; } })() : m;
    return (
      <pre className="text-[11px] text-gray-600 whitespace-pre-wrap break-words max-w-md">
        {typeof obj === 'string' ? obj : JSON.stringify(obj, null, 2)}
      </pre>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        {isKk ? 'Аудит журналы' : 'Журнал аудита'}
      </h1>
      <p className="text-gray-500 text-sm mb-6">
        {isKk
          ? 'Әкімші әрекеттерінің тарихы (user.create/update/delete, settings.update және т.б.).'
          : 'История админ-действий: user.create / update / delete / reset_password, settings.update и др.'}
      </p>

      <div className="flex flex-wrap items-end gap-3 mb-4">
        <label className="flex flex-col text-xs text-gray-600">
          <span className="mb-1">{isKk ? 'Әрекет' : 'Действие'}</span>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
          >
            {ACTION_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col text-xs text-gray-600">
          <span className="mb-1">Actor email</span>
          <input
            value={actorFilter}
            onChange={(e) => setActorFilter(e.target.value)}
            placeholder="admin@til-kural.kz"
            className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
          />
        </label>
        <button
          onClick={fetchRows}
          disabled={loading}
          className="px-4 py-1.5 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 disabled:opacity-50"
        >
          {loading ? '…' : (isKk ? 'Қолдану' : 'Применить')}
        </button>
      </div>

      {error && (
        <p className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-3 py-2 text-left">{isKk ? 'Уақыт' : 'Время'}</th>
              <th className="px-3 py-2 text-left">Actor</th>
              <th className="px-3 py-2 text-left">{isKk ? 'Әрекет' : 'Действие'}</th>
              <th className="px-3 py-2 text-left">Target</th>
              <th className="px-3 py-2 text-left">IP</th>
              <th className="px-3 py-2 text-left">Metadata</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {!loading && rows.length === 0 && (
              <tr><td colSpan={6} className="px-3 py-6 text-center text-gray-500">
                {isKk ? 'Жазбалар жоқ' : 'Записей нет'}
              </td></tr>
            )}
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="px-3 py-2 align-top whitespace-nowrap text-xs text-gray-600">
                  {new Date(r.created_at).toLocaleString(isKk ? 'kk-KZ' : 'ru-RU')}
                </td>
                <td className="px-3 py-2 align-top">
                  <div className="font-medium text-gray-800">{r.actor_email || '—'}</div>
                  <div className="text-[11px] text-gray-400">{r.actor_role || ''}</div>
                </td>
                <td className="px-3 py-2 align-top">
                  <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{r.action}</code>
                </td>
                <td className="px-3 py-2 align-top text-xs text-gray-600">
                  <div>{r.target_type || '—'}</div>
                  <div className="text-[11px] text-gray-400 truncate max-w-[180px]">{r.target_id || ''}</div>
                </td>
                <td className="px-3 py-2 align-top text-xs text-gray-500 whitespace-nowrap">{r.ip_address || '—'}</td>
                <td className="px-3 py-2 align-top">{renderMetadata(r.metadata)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
