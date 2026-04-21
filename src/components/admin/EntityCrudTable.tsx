'use client';

import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export type FieldType = 'text' | 'textarea' | 'number' | 'date' | 'datetime' | 'select' | 'checkbox';

export interface CrudField {
  name: string;
  label_kk: string;
  label_ru: string;
  type: FieldType;
  required?: boolean;
  options?: { value: string; label_kk: string; label_ru: string }[];
  placeholder?: string;
  defaultValue?: unknown;
}

export interface CrudColumn {
  field: string;
  label_kk: string;
  label_ru: string;
  render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode;
}

export interface EntityCrudConfig {
  apiPath: string;           // e.g. "/api/news"
  listKey: string;           // root key of GET list response, e.g. "news"
  itemKey: string;           // root key of single item in POST/PUT/GET(id), e.g. "news" (for news) or "lesson"
  titleKk: string;
  titleRu: string;
  fields: CrudField[];
  columns: CrudColumn[];
}

type Row = Record<string, unknown> & { id: string };

interface Props {
  locale: string;
  config: EntityCrudConfig;
}

export default function EntityCrudTable({ locale, config }: Props) {
  const isKk = locale === 'kk';
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Row | null>(null);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = async () => {
    setLoading(true);
    try {
      const res = await fetch(config.apiPath);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setRows((data[config.listKey] || []) as Row[]);
    } catch (e) {
      console.error(e);
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { reload(); }, [config.apiPath]);

  const openCreate = () => {
    const init: Record<string, unknown> = {};
    for (const f of config.fields) {
      init[f.name] = f.defaultValue ?? (f.type === 'checkbox' ? false : f.type === 'number' ? 0 : '');
    }
    setFormData(init);
    setCreating(true);
    setEditing(null);
  };

  const openEdit = (row: Row) => {
    const init: Record<string, unknown> = {};
    for (const f of config.fields) {
      init[f.name] = row[f.name] ?? (f.type === 'checkbox' ? false : f.type === 'number' ? 0 : '');
    }
    setFormData(init);
    setEditing(row);
    setCreating(false);
  };

  const closeForm = () => {
    setEditing(null);
    setCreating(false);
    setFormData({});
    setError(null);
  };

  const submit = async () => {
    setSaving(true);
    setError(null);
    try {
      const url = editing ? `${config.apiPath}/${editing.id}` : config.apiPath;
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `HTTP ${res.status}`);
      }
      closeForm();
      await reload();
    } catch (e) {
      setError(String(e));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row: Row) => {
    if (!confirm(isKk ? 'Жою керек пе?' : 'Точно удалить?')) return;
    try {
      const res = await fetch(`${config.apiPath}/${row.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await reload();
    } catch (e) {
      alert(String(e));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{isKk ? config.titleKk : config.titleRu}</h1>
        <Button onClick={openCreate}>{isKk ? 'Жаңа қосу' : 'Добавить'}</Button>
      </div>

      <Card>
        {loading ? (
          <div className="text-center py-8 text-gray-400">{isKk ? 'Жүктелуде…' : 'Загрузка…'}</div>
        ) : rows.length === 0 ? (
          <div className="text-center py-8 text-gray-400">{isKk ? 'Жазбалар жоқ' : 'Записей нет'}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  {config.columns.map((c) => (
                    <th key={c.field} className="pb-3 font-medium text-gray-500">{isKk ? c.label_kk : c.label_ru}</th>
                  ))}
                  <th className="pb-3 font-medium text-gray-500 text-right">{isKk ? 'Әрекеттер' : 'Действия'}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b last:border-0 hover:bg-gray-50 align-top">
                    {config.columns.map((c) => (
                      <td key={c.field} className="py-3 text-gray-800">
                        {c.render ? c.render(row[c.field], row) : String(row[c.field] ?? '—')}
                      </td>
                    ))}
                    <td className="py-3 text-right">
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(row)}>
                          {isKk ? 'Өңдеу' : 'Редактировать'}
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => remove(row)}>
                          {isKk ? 'Жою' : 'Удалить'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {(creating || editing) && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={closeForm}>
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {editing ? (isKk ? 'Өңдеу' : 'Редактирование') : (isKk ? 'Жаңа жазба' : 'Новая запись')}
              </h2>
              <button onClick={closeForm} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
            </div>
            <div className="p-6 space-y-4">
              {config.fields.map((f) => (
                <FormField
                  key={f.name}
                  field={f}
                  locale={locale}
                  value={formData[f.name]}
                  onChange={(v) => setFormData((prev) => ({ ...prev, [f.name]: v }))}
                />
              ))}
              {error && <div className="text-red-600 text-sm">{error}</div>}
            </div>
            <div className="p-6 border-t flex justify-end gap-3">
              <Button variant="ghost" onClick={closeForm}>{isKk ? 'Болдырмау' : 'Отмена'}</Button>
              <Button onClick={submit} loading={saving}>
                {isKk ? 'Сақтау' : 'Сохранить'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FormField({
  field,
  locale,
  value,
  onChange,
}: {
  field: CrudField;
  locale: string;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const isKk = locale === 'kk';
  const label = isKk ? field.label_kk : field.label_ru;
  const commonInput = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500';

  if (field.type === 'checkbox') {
    return (
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={!!value}
          onChange={(e) => onChange(e.target.checked)}
          className="w-4 h-4 accent-teal-600"
        />
        <span className="text-sm text-gray-700">{label}</span>
      </label>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {field.required && <span className="text-red-500">*</span>}
      </label>
      {field.type === 'textarea' ? (
        <textarea
          className={commonInput + ' min-h-[100px]'}
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
        />
      ) : field.type === 'select' ? (
        <select
          className={commonInput}
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">—</option>
          {field.options?.map((o) => (
            <option key={o.value} value={o.value}>{isKk ? o.label_kk : o.label_ru}</option>
          ))}
        </select>
      ) : field.type === 'number' ? (
        <input
          type="number"
          className={commonInput}
          value={Number(value ?? 0)}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      ) : field.type === 'date' ? (
        <input
          type="date"
          className={commonInput}
          value={String(value ?? '').slice(0, 10)}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : field.type === 'datetime' ? (
        <input
          type="datetime-local"
          className={commonInput}
          value={String(value ?? '').slice(0, 16)}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          type="text"
          className={commonInput}
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
        />
      )}
    </div>
  );
}
