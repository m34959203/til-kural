import EntityCrudTable, { EntityCrudConfig } from '@/components/admin/EntityCrudTable';

export default async function AdminUsersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const config: EntityCrudConfig = {
    apiPath: '/api/admin/users',
    listKey: 'users',
    itemKey: 'user',
    titleKk: 'Пайдаланушыларды басқару',
    titleRu: 'Управление пользователями',
    fields: [
      { name: 'name', label_kk: 'Аты-жөні', label_ru: 'Имя', type: 'text' },
      { name: 'phone', label_kk: 'Телефон', label_ru: 'Телефон', type: 'text' },
      {
        name: 'role',
        label_kk: 'Рөлі',
        label_ru: 'Роль',
        type: 'select',
        options: [
          { value: 'user', label_kk: 'Пайдаланушы', label_ru: 'Пользователь' },
          { value: 'editor', label_kk: 'Редактор', label_ru: 'Редактор' },
          { value: 'moderator', label_kk: 'Модератор', label_ru: 'Модератор' },
          { value: 'admin', label_kk: 'Әкімші', label_ru: 'Администратор' },
        ],
      },
      {
        name: 'language_level',
        label_kk: 'Тіл деңгейі',
        label_ru: 'Уровень языка',
        type: 'select',
        options: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((l) => ({ value: l, label_kk: l, label_ru: l })),
      },
    ],
    columns: [
      { field: 'name', label_kk: 'Аты-жөні', label_ru: 'Имя' },
      { field: 'email', label_kk: 'Email', label_ru: 'Email' },
      { field: 'role', label_kk: 'Рөлі', label_ru: 'Роль', format: 'status' },
      { field: 'language_level', label_kk: 'Деңгей', label_ru: 'Уровень' },
      { field: 'xp_points', label_kk: 'XP', label_ru: 'XP' },
      { field: 'current_streak', label_kk: 'Стрик', label_ru: 'Стрик' },
    ],
  };

  return <EntityCrudTable locale={locale} config={config} />;
}
