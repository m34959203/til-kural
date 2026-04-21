import EntityCrudTable, { EntityCrudConfig } from '@/components/admin/EntityCrudTable';

export default async function AdminBannersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const config: EntityCrudConfig = {
    apiPath: '/api/banners',
    listKey: 'banners',
    itemKey: 'banner',
    titleKk: 'Баннерлерді басқару',
    titleRu: 'Управление баннерами',
    fields: [
      { name: 'title', label_kk: 'Тақырыбы', label_ru: 'Заголовок', type: 'text' },
      { name: 'subtitle_kk', label_kk: 'Қосымша мәтін (KK)', label_ru: 'Подпись (KK)', type: 'textarea' },
      { name: 'subtitle_ru', label_kk: 'Қосымша мәтін (RU)', label_ru: 'Подпись (RU)', type: 'textarea' },
      { name: 'image_url', label_kk: 'Сурет URL', label_ru: 'URL изображения', type: 'text', required: true },
      { name: 'link_url', label_kk: 'Сілтеме URL', label_ru: 'URL ссылки', type: 'text' },
      {
        name: 'position',
        label_kk: 'Орналасуы',
        label_ru: 'Расположение',
        type: 'select',
        defaultValue: 'hero',
        options: [
          { value: 'hero', label_kk: 'Басты (hero)', label_ru: 'Главный (hero)' },
          { value: 'sidebar', label_kk: 'Бүйір панель', label_ru: 'Боковая панель' },
          { value: 'footer', label_kk: 'Төменгі аймақ', label_ru: 'Подвал' },
          { value: 'popup', label_kk: 'Попап', label_ru: 'Попап' },
        ],
      },
      { name: 'sort_order', label_kk: 'Реті', label_ru: 'Порядок', type: 'number', defaultValue: 0 },
      { name: 'is_active', label_kk: 'Белсенді', label_ru: 'Активный', type: 'checkbox', defaultValue: true },
    ],
    columns: [
      { field: 'title', label_kk: 'Тақырыбы', label_ru: 'Заголовок' },
      { field: 'position', label_kk: 'Орны', label_ru: 'Позиция' },
      { field: 'sort_order', label_kk: 'Реті', label_ru: 'Порядок' },
      {
        field: 'is_active',
        label_kk: 'Белсенді',
        label_ru: 'Активный',
        render: (v) => (
          <span className={`px-2 py-0.5 rounded-full text-xs ${v ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
            {v ? '✓' : '—'}
          </span>
        ),
      },
    ],
  };

  return <EntityCrudTable locale={locale} config={config} />;
}
