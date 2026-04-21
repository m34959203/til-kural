import EntityCrudTable, { EntityCrudConfig } from '@/components/admin/EntityCrudTable';

export default async function AdminHistoryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const config: EntityCrudConfig = {
    apiPath: '/api/history',
    listKey: 'history',
    itemKey: 'history',
    titleKk: 'Орталық тарихы',
    titleRu: 'История центра',
    fields: [
      {
        name: 'year',
        label_kk: 'Жыл',
        label_ru: 'Год',
        type: 'text',
        placeholder: '2024',
      },
      { name: 'title_kk', label_kk: 'Тақырып (KK)', label_ru: 'Заголовок (KK)', type: 'text', required: true },
      { name: 'title_ru', label_kk: 'Тақырып (RU)', label_ru: 'Заголовок (RU)', type: 'text', required: true },
      { name: 'description_kk', label_kk: 'Сипаттама (KK)', label_ru: 'Описание (KK)', type: 'textarea' },
      { name: 'description_ru', label_kk: 'Сипаттама (RU)', label_ru: 'Описание (RU)', type: 'textarea' },
      { name: 'image_url', label_kk: 'Сурет URL', label_ru: 'URL изображения', type: 'text', placeholder: '/uploads/...' },
      { name: 'sort_order', label_kk: 'Реті', label_ru: 'Порядок', type: 'number', defaultValue: 0 },
    ],
    columns: [
      { field: 'year', label_kk: 'Жыл', label_ru: 'Год' },
      { field: 'title_ru', label_kk: 'Тақырып', label_ru: 'Заголовок' },
      { field: 'description_ru', label_kk: 'Сипаттама', label_ru: 'Описание', format: 'truncate', truncate: 80 },
      { field: 'sort_order', label_kk: 'Реті', label_ru: 'Порядок' },
    ],
  };

  return <EntityCrudTable locale={locale} config={config} />;
}
