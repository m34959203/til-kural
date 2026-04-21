import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import BilingualArticleForm, { NewsRow } from '@/components/admin/BilingualArticleForm';

export default async function AdminEditorEditPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const isKk = locale === 'kk';

  // /api/news/[id] поддерживает и id, и slug — повторяем ту же логику локально,
  // чтобы не ходить HTTP-ом из SSR.
  const byId = await db.findOne('news', { id });
  const item = (byId || (await db.findOne('news', { slug: id }))) as NewsRow | null;

  if (!item) notFound();

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <div className="text-xs text-gray-500 mb-1">
          <Link href={`/${locale}/admin/editor`} className="hover:text-teal-700">
            {isKk ? '← Тізімге' : '← К списку'}
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          {isKk ? 'Мақаланы өңдеу' : 'Редактировать статью'}
        </h1>
        <p className="text-sm text-gray-500 mt-1 font-mono">{item.slug}</p>
      </div>

      <BilingualArticleForm mode="edit" locale={locale} initialData={item} />
    </div>
  );
}
