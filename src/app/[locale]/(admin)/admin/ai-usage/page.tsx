'use client';

import { use, useEffect, useState } from 'react';

interface Snapshot {
  model: string;
  limits: { rpm: number; rpd: number; tpm: number };
  current: { rpmUsed: number; rpdUsed: number; tpmUsed: number };
  pct: { rpm: number; rpd: number; tpm: number };
  worstStatus: 'ok' | 'warn' | 'crit';
  known: boolean;
}

interface Spend {
  last24hUsd: number;
  last7dUsd: number;
  thisMonthUsd: number;
  thisMonthTokens: number;
  projectedMonthUsd: number;
  budgetUsd: number;
  budgetRemainingUsd: number;
  budgetPctUsed: number;
}

interface RecentRow {
  id: string;
  provider: string;
  model: string;
  purpose: string;
  prompt_tokens: number;
  completion_tokens: number;
  cost_usd: number;
  duration_ms: number;
  user_id: string | null;
  user_email?: string | null;
  created_at: string;
}

interface ApiResponse {
  quotas: Snapshot[];
  spend: Spend;
  recent: RecentRow[];
  safety_ratio: number;
}

const STATUS_COLORS: Record<Snapshot['worstStatus'], string> = {
  ok: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  warn: 'bg-amber-50 border-amber-200 text-amber-800',
  crit: 'bg-red-50 border-red-200 text-red-800',
};

const BAR_COLORS: Record<Snapshot['worstStatus'], string> = {
  ok: 'bg-emerald-500',
  warn: 'bg-amber-500',
  crit: 'bg-red-500',
};

function pickStatusForBar(pct: number): Snapshot['worstStatus'] {
  if (pct >= 85) return 'crit';
  if (pct >= 60) return 'warn';
  return 'ok';
}

function Bar({ used, limit, label }: { used: number; limit: number; label: string }) {
  const pct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;
  const status = pickStatusForBar(pct);
  return (
    <div>
      <div className="flex items-baseline justify-between text-xs">
        <span className="text-gray-600">{label}</span>
        <span className="font-mono text-gray-900">
          {used.toLocaleString('ru-RU')} / {limit.toLocaleString('ru-RU')}
          <span className="text-gray-400 ml-1">({pct.toFixed(0)}%)</span>
        </span>
      </div>
      <div className="mt-1 h-2 rounded-full bg-gray-100 overflow-hidden">
        <div
          className={`h-full ${BAR_COLORS[status]} transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function AdminAiUsagePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const isKk = locale === 'kk';
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchData = async () => {
    setError(null);
    try {
      const res = await fetch('/api/admin/ai-usage', { credentials: 'include' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as ApiResponse;
      setData(json);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(() => void fetchData(), 30_000);
    return () => clearInterval(id);
  }, [autoRefresh]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-baseline justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isKk ? 'AI квоталары мен шығыс' : 'Квоты и расход AI'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {isKk
              ? 'Free-tier Gemini лимиттерін бақылау. Ақылы тарифке шығу — басты қауіп.'
              : 'Контроль free-tier лимитов Gemini. Главная цель — НЕ выйти в платный тариф.'}
            {data && (
              <> · safety_ratio = <span className="font-mono">{data.safety_ratio}</span></>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-xs text-gray-600">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            {isKk ? 'Авто 30с' : 'Авто 30с'}
          </label>
          <button
            onClick={() => void fetchData()}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg bg-teal-600 text-white text-sm hover:bg-teal-700 disabled:opacity-50"
          >
            {loading ? '…' : (isKk ? 'Жаңарту' : 'Обновить')}
          </button>
        </div>
      </div>

      {error && (
        <p className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {data && (
        <>
          {/* Spend block */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
              <div className="text-[11px] uppercase tracking-wide text-gray-400">
                {isKk ? '24 сағат' : '24 часа'}
              </div>
              <div className="font-mono text-lg text-gray-900">
                ${data.spend.last24hUsd.toFixed(4)}
              </div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
              <div className="text-[11px] uppercase tracking-wide text-gray-400">
                {isKk ? '7 күн' : '7 дней'}
              </div>
              <div className="font-mono text-lg text-gray-900">
                ${data.spend.last7dUsd.toFixed(4)}
              </div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
              <div className="text-[11px] uppercase tracking-wide text-gray-400">
                {isKk ? 'Ағымдағы ай' : 'Этот месяц'}
              </div>
              <div className="font-mono text-lg text-gray-900">
                ${data.spend.thisMonthUsd.toFixed(4)}
              </div>
              <div className="text-[11px] text-gray-500 mt-0.5">
                {data.spend.thisMonthTokens.toLocaleString('ru-RU')} {isKk ? 'токен' : 'токенов'}
              </div>
            </div>
            <div className={`rounded-xl border px-4 py-3 ${
              data.spend.thisMonthUsd > 0
                ? 'border-red-300 bg-red-50'
                : 'border-emerald-200 bg-emerald-50'
            }`}>
              <div className="text-[11px] uppercase tracking-wide text-gray-500">
                {isKk ? 'Бюджет (free)' : 'Бюджет (free)'}
              </div>
              <div className={`font-mono text-lg ${
                data.spend.thisMonthUsd > 0 ? 'text-red-700' : 'text-emerald-700'
              }`}>
                {data.spend.thisMonthUsd > 0
                  ? (isKk ? 'АҚЫЛЫЛЫҚТА!' : 'ВЫШЛИ В ПЛАТНЫЙ!')
                  : (isKk ? 'Free-tier ✓' : 'Free-tier ✓')}
              </div>
              <div className="text-[11px] text-gray-500 mt-0.5">
                {isKk ? 'Болжам айға' : 'Прогноз на месяц'}: ${data.spend.projectedMonthUsd.toFixed(4)}
              </div>
            </div>
          </div>

          {/* Quotas per model */}
          <div className="space-y-3 mb-8">
            <h2 className="text-sm font-semibold text-gray-700">
              {isKk ? 'Модель бойынша квоталар' : 'Квоты по моделям'}
            </h2>
            {data.quotas.map((q) => (
              <div
                key={q.model}
                className={`rounded-xl border px-4 py-3 ${STATUS_COLORS[q.worstStatus]}`}
              >
                <div className="flex items-baseline justify-between mb-2">
                  <code className="text-sm font-mono font-semibold">{q.model}</code>
                  <span className="text-[11px] uppercase tracking-wide">
                    {q.worstStatus === 'crit'
                      ? (isKk ? 'критикалық' : 'критично')
                      : q.worstStatus === 'warn'
                        ? (isKk ? 'ескерту' : 'внимание')
                        : 'ok'}
                    {!q.known && <span className="ml-2 opacity-70">({isKk ? 'белгісіз модель' : 'неизвестная модель'})</span>}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Bar used={q.current.rpmUsed} limit={q.limits.rpm} label="RPM (60с)" />
                  <Bar used={q.current.rpdUsed} limit={q.limits.rpd} label="RPD (24ч)" />
                  <Bar used={q.current.tpmUsed} limit={q.limits.tpm} label="TPM (60с)" />
                </div>
              </div>
            ))}
          </div>

          {/* Recent calls */}
          <h2 className="text-sm font-semibold text-gray-700 mb-2">
            {isKk ? 'Соңғы 50 вызов' : 'Последние 50 вызовов'}
          </h2>
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-3 py-2 text-left">{isKk ? 'Уақыт' : 'Время'}</th>
                  <th className="px-3 py-2 text-left">{isKk ? 'Модель' : 'Модель'}</th>
                  <th className="px-3 py-2 text-left">Purpose</th>
                  <th className="px-3 py-2 text-right">in</th>
                  <th className="px-3 py-2 text-right">out</th>
                  <th className="px-3 py-2 text-right">ms</th>
                  <th className="px-3 py-2 text-right">$</th>
                  <th className="px-3 py-2 text-left">User</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.recent.length === 0 && (
                  <tr><td colSpan={8} className="px-3 py-6 text-center text-gray-500">
                    {isKk ? 'Жазбалар жоқ' : 'Записей нет'}
                  </td></tr>
                )}
                {data.recent.map((r) => (
                  <tr key={r.id}>
                    <td className="px-3 py-2 text-xs text-gray-500 whitespace-nowrap">
                      {new Date(r.created_at).toLocaleString(isKk ? 'kk-KZ' : 'ru-RU')}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs">{r.model}</td>
                    <td className="px-3 py-2 text-xs text-gray-600">{r.purpose}</td>
                    <td className="px-3 py-2 font-mono text-xs text-right">{r.prompt_tokens}</td>
                    <td className="px-3 py-2 font-mono text-xs text-right">{r.completion_tokens}</td>
                    <td className="px-3 py-2 font-mono text-xs text-right text-gray-500">{r.duration_ms}</td>
                    <td className="px-3 py-2 font-mono text-xs text-right">
                      {r.cost_usd > 0 ? `$${r.cost_usd.toFixed(6)}` : '—'}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-500 truncate max-w-[180px]">
                      {r.user_email || (r.user_id ? r.user_id.slice(0, 8) : '—')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
