import Link from 'next/link';
import BilingualArticleForm from '@/components/admin/BilingualArticleForm';

export default async function AdminEditorNewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isKk = locale === 'kk';

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-gray-500 mb-1">
            <Link href={`/${locale}/admin/editor`} className="hover:text-teal-700">
              {isKk ? '← Тізімге' : '← К списку'}
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isKk ? 'Жаңа мақала' : 'Новая статья'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isKk
              ? 'KK/RU мазмұнын бір парақта толтырыңыз. Жалпы параметрлер бір рет енгізіледі.'
              : 'Заполните KK/RU на одной странице. Общие поля вводятся один раз.'}
          </p>
        </div>
      </div>

      <BilingualArticleForm mode="create" locale={locale} />
    </div>
  );
}
