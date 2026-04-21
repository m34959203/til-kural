import EntityCrudTable, { EntityCrudConfig } from '@/components/admin/EntityCrudTable';

export default async function AdminRulesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const config: EntityCrudConfig = {
    apiPath: '/api/rules-docs',
    listKey: 'docs',
    itemKey: 'doc',
    titleKk: 'Нормативтік құжаттар',
    titleRu: 'Нормативные документы',
    fields: [
      { name: 'title_kk', label_kk: 'Тақырыбы (KK)', label_ru: 'Название (KK)', type: 'text', required: true },
      { name: 'title_ru', label_kk: 'Тақырыбы (RU)', label_ru: 'Название (RU)', type: 'text', required: true },
      { name: 'description_kk', label_kk: 'Сипаттамасы (KK)', label_ru: 'Описание (KK)', type: 'textarea' },
      { name: 'description_ru', label_kk: 'Сипаттамасы (RU)', label_ru: 'Описание (RU)', type: 'textarea' },
      { name: 'year', label_kk: 'Жылы', label_ru: 'Год', type: 'text', placeholder: '2023 немесе 2020-2025' },
      {
        name: 'category',
        label_kk: 'Санаты',
        label_ru: 'Категория',
        type: 'select',
        defaultValue: 'laws',
        options: [
          { value: 'laws', label_kk: 'ҚР тіл туралы заңнамасы', label_ru: 'Законы РК о языке' },
          { value: 'methodical', label_kk: 'Әдістемелік құжаттар', label_ru: 'Методические документы' },
          { value: 'internal', label_kk: 'Ішкі ережелер', label_ru: 'Внутренние положения' },
          { value: 'other', label_kk: 'Басқа', label_ru: 'Прочие' },
        ],
      },
      {
        name: 'pdf_url',
        label_kk: 'PDF URL',
        label_ru: 'URL PDF',
        type: 'text',
        placeholder: '/uploads/rules/law-1997.pdf',
      },
      { name: 'sort_order', label_kk: 'Реті', label_ru: 'Порядок', type: 'number', defaultValue: 0 },
    ],
    columns: [
      { field: 'title_ru', label_kk: 'Тақырыбы', label_ru: 'Название' },
      { field: 'category', label_kk: 'Санаты', label_ru: 'Категория' },
      { field: 'year', label_kk: 'Жылы', label_ru: 'Год' },
      { field: 'pdf_url', label_kk: 'PDF', label_ru: 'PDF', format: 'truncate', truncate: 40 },
      { field: 'sort_order', label_kk: 'Реті', label_ru: 'Порядок' },
    ],
  };

  return <EntityCrudTable locale={locale} config={config} />;
}
