/**
 * /admin/editor — список статей (news) с кнопкой «Создать новую».
 *
 * Серверный компонент. Вместо fetch к /api/news читаем БД напрямую (тот же источник,
 * что и сам роут) — так нет проблем с base-URL и куками для SSR-а.  Для админки
 * показываем всё, не только published.
 */

import Link from 'next/link';
import { db } from '@/lib/db';
import Card from '@/components/ui/Card';
import { formatDateTime } from '@/lib/utils';

interface NewsRow {
  id: string;
  slug: string;
  title_kk: string | null;
  title_ru: string | null;
  status: 'draft' | 'published' | 'archived' | string | null;
  updated_at: string | null;
  published_at: string | null;
}

const PAGE_LIMIT = 25;

function statusLabel(status: string | null | undefined, isKk: boolean): { text: string; cls: string } {
  switch (status) {
    case 'published':
      return { text: isKk ? 'Жарияланды' : 'Опубликовано', cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200' };
    case 'archived':
      return { text: isKk ? 'Мұрағат' : 'Архив', cls: 'bg-gray-100 text-gray-600 border border-gray-200' };
    case 'draft':
    default:
      return { text: isKk ? 'Жоба' : 'Черновик', cls: 'bg-amber-50 text-amber-700 border border-amber-200' };
  }
}

export default async function AdminEditorListPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isKk = locale === 'kk';

  // limit=25, сортировка по updated_at desc; то же, что и /api/news без фильтра.
  const rows = (await db.query('news', undefined, {
    orderBy: 'updated_at',
    order: 'desc',
    limit: PAGE_LIMIT,
  })) as NewsRow[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isKk ? 'Мақала редакторы' : 'Редактор статей'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isKk
              ? 'KK/RU-қосарлы редактор. Соңғы 25 мақала.'
              : 'Двуязычный редактор KK/RU. Последние 25 статей.'}
          </p>
        </div>
        <Link
          href={`/${locale}/admin/editor/new`}
          className="inline-flex items-center justify-center font-medium rounded-lg bg-teal-700 text-white hover:bg-teal-800 px-5 py-2.5 text-sm transition-colors"
        >
          {isKk ? '+ Жаңа мақала' : '+ Создать новую'}
        </Link>
      </div>

      <Card padding="sm">
        {rows.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            {isKk ? 'Мақалалар әлі жоқ' : 'Статей пока нет'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-gray-500 border-b border-gray-100">
                  <th className="px-4 py-3 font-medium">{isKk ? 'Тақырыбы (RU)' : 'Заголовок (RU)'}</th>
                  <th className="px-4 py-3 font-medium">Slug</th>
                  <th className="px-4 py-3 font-medium">{isKk ? 'Күйі' : 'Статус'}</th>
                  <th className="px-4 py-3 font-medium">{isKk ? 'Жаңартылған' : 'Обновлено'}</th>
                  <th className="px-4 py-3 font-medium text-right">{isKk ? 'Әрекеттер' : 'Действия'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((row) => {
                  const st = statusLabel(row.status, isKk);
                  return (
                    <tr key={row.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-900 max-w-xs truncate">
                        {row.title_ru || row.title_kk || '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-500 font-mono text-xs">{row.slug}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${st.cls}`}>
                          {st.text}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {row.updated_at ? formatDateTime(row.updated_at, locale) : '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/${locale}/admin/editor/${row.id}`}
                          className="text-teal-700 hover:text-teal-800 font-medium text-sm"
                        >
                          {isKk ? 'Өңдеу' : 'Редактировать'}
                        </Link>
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
