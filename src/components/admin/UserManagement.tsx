'use client';

import { useEffect, useMemo, useState } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

interface UserRow {
  id: string;
  email: string;
  name: string;
  role: string;
  phone?: string | null;
  language_level?: string | null;
  xp_points?: number | null;
  level?: number | null;
  current_streak?: number | null;
  longest_streak?: number | null;
  created_at?: string | null;
}

const ROLES: { value: string; label_kk: string; label_ru: string }[] = [
  { value: 'user', label_kk: 'Пайдаланушы', label_ru: 'Пользователь' },
  { value: 'editor', label_kk: 'Редактор', label_ru: 'Редактор' },
  { value: 'moderator', label_kk: 'Модератор', label_ru: 'Модератор' },
  { value: 'admin', label_kk: 'Әкімші', label_ru: 'Администратор' },
];

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const roleBadge = (role: string) => {
  const cls =
    role === 'admin'
      ? 'bg-red-100 text-red-700'
      : role === 'editor' || role === 'moderator'
      ? 'bg-amber-100 text-amber-700'
      : 'bg-gray-100 text-gray-600';
  return <span className={`px-2 py-0.5 rounded-full text-xs ${cls}`}>{role}</span>;
};

export default function UserManagement({ locale }: { locale: string }) {
  const isKk = locale === 'kk';
  const [rows, setRows] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  // Create form state
  const [creating, setCreating] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('user');
  const [newLevel, setNewLevel] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [savingNew, setSavingNew] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Inline row state
  const [editingRoleFor, setEditingRoleFor] = useState<string | null>(null);
  const [rowBusy, setRowBusy] = useState<string | null>(null);

  const reload = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/users');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setRows((data.users || []) as UserRow[]);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (u) =>
        (u.email || '').toLowerCase().includes(q) ||
        (u.name || '').toLowerCase().includes(q) ||
        (u.role || '').toLowerCase().includes(q),
    );
  }, [rows, query]);

  const resetCreateForm = () => {
    setNewEmail('');
    setNewName('');
    setNewPassword('');
    setNewRole('user');
    setNewLevel('');
    setNewPhone('');
    setCreateError(null);
  };

  const submitCreate = async () => {
    setSavingNew(true);
    setCreateError(null);
    try {
      const payload: Record<string, unknown> = {
        email: newEmail.trim().toLowerCase(),
        name: newName.trim(),
        password: newPassword,
        role: newRole,
      };
      if (newLevel) payload.language_level = newLevel;
      if (newPhone.trim()) payload.phone = newPhone.trim();
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      resetCreateForm();
      setCreating(false);
      await reload();
    } catch (e) {
      setCreateError(String(e instanceof Error ? e.message : e));
    } finally {
      setSavingNew(false);
    }
  };

  const changeRole = async (user: UserRow, role: string) => {
    if (role === user.role) {
      setEditingRoleFor(null);
      return;
    }
    setRowBusy(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `HTTP ${res.status}`);
      }
      setEditingRoleFor(null);
      await reload();
    } catch (e) {
      alert(String(e instanceof Error ? e.message : e));
    } finally {
      setRowBusy(null);
    }
  };

  const resetPassword = async (user: UserRow) => {
    const pwd = window.prompt(
      isKk
        ? `${user.email} үшін жаңа құпиясөз (кемінде 8 таңба):`
        : `Новый пароль для ${user.email} (минимум 8 символов):`,
      '',
    );
    if (pwd === null) return;
    if (pwd.length < 8) {
      alert(isKk ? 'Құпиясөз тым қысқа' : 'Пароль слишком короткий');
      return;
    }
    setRowBusy(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}?action=reset-password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_password: pwd }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `HTTP ${res.status}`);
      }
      alert(isKk ? 'Құпиясөз жаңартылды' : 'Пароль обновлён');
    } catch (e) {
      alert(String(e instanceof Error ? e.message : e));
    } finally {
      setRowBusy(null);
    }
  };

  const removeUser = async (user: UserRow) => {
    if (!confirm(isKk ? `${user.email} — жою керек пе?` : `Удалить ${user.email}?`)) return;
    setRowBusy(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await reload();
    } catch (e) {
      alert(String(e instanceof Error ? e.message : e));
    } finally {
      setRowBusy(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isKk ? 'Пайдаланушыларды басқару' : 'Управление пользователями'}
        </h1>
        <Button
          onClick={() => {
            setCreating((v) => !v);
            if (creating) resetCreateForm();
          }}
        >
          {creating ? (isKk ? 'Жабу' : 'Закрыть') : isKk ? '+ Жаңа пайдаланушы' : '+ Создать пользователя'}
        </Button>
      </div>

      {creating && (
        <Card className="mb-6">
          <h2 className="text-lg font-semibold mb-4">
            {isKk ? 'Жаңа пайдаланушы' : 'Новый пользователь'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="user@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isKk ? 'Аты-жөні' : 'Имя'} *
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isKk ? 'Құпиясөз (≥ 8)' : 'Пароль (≥ 8)'} *
              </label>
              <input
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                placeholder="ChangeMe2026!"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isKk ? 'Рөл' : 'Роль'}
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {isKk ? r.label_kk : r.label_ru}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isKk ? 'Тіл деңгейі' : 'Уровень языка'}
              </label>
              <select
                value={newLevel}
                onChange={(e) => setNewLevel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">—</option>
                {LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isKk ? 'Телефон' : 'Телефон'}
              </label>
              <input
                type="text"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
          {createError && <div className="mt-3 text-sm text-red-600">{createError}</div>}
          <div className="mt-4 flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => {
                setCreating(false);
                resetCreateForm();
              }}
            >
              {isKk ? 'Болдырмау' : 'Отмена'}
            </Button>
            <Button onClick={submitCreate} loading={savingNew}>
              {isKk ? 'Құру' : 'Создать'}
            </Button>
          </div>
        </Card>
      )}

      <Card>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={isKk ? 'Email / аты / рөлі бойынша іздеу…' : 'Поиск по email / имени / роли…'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div className="text-sm text-gray-500">
            {isKk ? `Барлығы: ${rows.length}` : `Всего: ${rows.length}`}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-400">{isKk ? 'Жүктелуде…' : 'Загрузка…'}</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            {rows.length === 0
              ? isKk
                ? 'Пайдаланушылар жоқ'
                : 'Пользователей нет'
              : isKk
              ? 'Сәйкестік табылмады'
              : 'Ничего не найдено'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-medium text-gray-500">{isKk ? 'Аты-жөні' : 'Имя'}</th>
                  <th className="pb-3 font-medium text-gray-500">Email</th>
                  <th className="pb-3 font-medium text-gray-500">{isKk ? 'Рөлі' : 'Роль'}</th>
                  <th className="pb-3 font-medium text-gray-500">XP</th>
                  <th className="pb-3 font-medium text-gray-500">{isKk ? 'Деңгей' : 'Уровень'}</th>
                  <th className="pb-3 font-medium text-gray-500">{isKk ? 'Стрик' : 'Стрик'}</th>
                  <th className="pb-3 font-medium text-gray-500 text-right">
                    {isKk ? 'Әрекеттер' : 'Действия'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => {
                  const busy = rowBusy === u.id;
                  return (
                    <tr key={u.id} className="border-b last:border-0 hover:bg-gray-50 align-top">
                      <td className="py-3 text-gray-800">{u.name || '—'}</td>
                      <td className="py-3 text-gray-800">{u.email}</td>
                      <td className="py-3">
                        {editingRoleFor === u.id ? (
                          <select
                            autoFocus
                            defaultValue={u.role}
                            onBlur={() => setEditingRoleFor(null)}
                            onChange={(e) => changeRole(u, e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                          >
                            {ROLES.map((r) => (
                              <option key={r.value} value={r.value}>
                                {isKk ? r.label_kk : r.label_ru}
                              </option>
                            ))}
                          </select>
                        ) : (
                          roleBadge(u.role)
                        )}
                      </td>
                      <td className="py-3 text-gray-800">{u.xp_points ?? 0}</td>
                      <td className="py-3 text-gray-800">{u.language_level || '—'}</td>
                      <td className="py-3 text-gray-800">
                        {u.current_streak ?? 0}
                        {u.longest_streak ? <span className="text-gray-400"> / {u.longest_streak}</span> : null}
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex gap-2 justify-end flex-wrap">
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={busy}
                            onClick={() => setEditingRoleFor((cur) => (cur === u.id ? null : u.id))}
                            title={isKk ? 'Рөлді өзгерту' : 'Сменить роль'}
                          >
                            {isKk ? 'Рөл' : 'Роль'}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={busy}
                            onClick={() => resetPassword(u)}
                            title={isKk ? 'Құпиясөзді ысыру' : 'Сбросить пароль'}
                          >
                            {isKk ? 'Құпиясөз' : 'Пароль'}
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            disabled={busy}
                            onClick={() => removeUser(u)}
                          >
                            {isKk ? 'Жою' : 'Удалить'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
