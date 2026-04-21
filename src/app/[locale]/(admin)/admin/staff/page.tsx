import EntityCrudTable, { EntityCrudConfig } from '@/components/admin/EntityCrudTable';

// StaffSchema подхватывается EntityCrudTable автоматически через SCHEMAS[apiPath].

export default async function AdminStaffPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const config: EntityCrudConfig = {
    apiPath: '/api/staff',
    listKey: 'staff',
    itemKey: 'staff',
    titleKk: 'Қызметкерлерді басқару',
    titleRu: 'Управление сотрудниками',
    fields: [
      { name: 'name_kk', label_kk: 'Аты-жөні (KK)', label_ru: 'ФИО (KK)', type: 'text', required: true },
      { name: 'name_ru', label_kk: 'Аты-жөні (RU)', label_ru: 'ФИО (RU)', type: 'text', required: true },
      { name: 'position_kk', label_kk: 'Лауазымы (KK)', label_ru: 'Должность (KK)', type: 'text' },
      { name: 'position_ru', label_kk: 'Лауазымы (RU)', label_ru: 'Должность (RU)', type: 'text' },
      {
        name: 'department_id',
        label_kk: 'Бөлім ID',
        label_ru: 'ID отдела',
        type: 'text',
        placeholder: 'UUID бөлімнен /admin/departments',
      },
      { name: 'photo_url', label_kk: 'Фото URL', label_ru: 'URL фото', type: 'text', placeholder: '/uploads/...' },
      { name: 'email', label_kk: 'Email', label_ru: 'Email', type: 'text' },
      { name: 'phone', label_kk: 'Телефон', label_ru: 'Телефон', type: 'text' },
      { name: 'bio_kk', label_kk: 'Био (KK)', label_ru: 'Био (KK)', type: 'textarea' },
      { name: 'bio_ru', label_kk: 'Био (RU)', label_ru: 'Био (RU)', type: 'textarea' },
      { name: 'sort_order', label_kk: 'Реті', label_ru: 'Порядок', type: 'number', defaultValue: 0 },
    ],
    columns: [
      { field: 'name_ru', label_kk: 'Аты-жөні', label_ru: 'ФИО' },
      { field: 'position_ru', label_kk: 'Лауазымы', label_ru: 'Должность' },
      { field: 'email', label_kk: 'Email', label_ru: 'Email' },
      { field: 'sort_order', label_kk: 'Реті', label_ru: 'Порядок' },
    ],
  };

  return <EntityCrudTable locale={locale} config={config} />;
}
