import EntityCrudTable, { EntityCrudConfig } from '@/components/admin/EntityCrudTable';

export default async function AdminDepartmentsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const config: EntityCrudConfig = {
    apiPath: '/api/departments',
    listKey: 'departments',
    itemKey: 'department',
    titleKk: 'Бөлімдерді басқару',
    titleRu: 'Управление отделами',
    fields: [
      { name: 'name_kk', label_kk: 'Атауы (KK)', label_ru: 'Название (KK)', type: 'text', required: true },
      { name: 'name_ru', label_kk: 'Атауы (RU)', label_ru: 'Название (RU)', type: 'text', required: true },
      { name: 'description_kk', label_kk: 'Сипаттамасы (KK)', label_ru: 'Описание (KK)', type: 'textarea' },
      { name: 'description_ru', label_kk: 'Сипаттамасы (RU)', label_ru: 'Описание (RU)', type: 'textarea' },
      { name: 'sort_order', label_kk: 'Реті', label_ru: 'Порядок', type: 'number', defaultValue: 0 },
    ],
    columns: [
      { field: 'name_ru', label_kk: 'Атауы', label_ru: 'Название' },
      { field: 'description_ru', label_kk: 'Сипаттама', label_ru: 'Описание', format: 'truncate', truncate: 60 },
      { field: 'sort_order', label_kk: 'Реті', label_ru: 'Порядок' },
    ],
  };

  return <EntityCrudTable locale={locale} config={config} />;
}
