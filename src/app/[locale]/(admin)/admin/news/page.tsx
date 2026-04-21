import EntityCrudTable, { EntityCrudConfig } from '@/components/admin/EntityCrudTable';

export default async function AdminNewsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const config: EntityCrudConfig = {
    apiPath: '/api/news',
    listKey: 'news',
    itemKey: 'news',
    titleKk: 'Жаңалықтарды басқару',
    titleRu: 'Управление новостями',
    fields: [
      { name: 'title_kk', label_kk: 'Тақырыбы (KK)', label_ru: 'Заголовок (KK)', type: 'text', required: true },
      { name: 'title_ru', label_kk: 'Тақырыбы (RU)', label_ru: 'Заголовок (RU)', type: 'text', required: true },
      { name: 'slug', label_kk: 'Slug (URL)', label_ru: 'Slug (URL)', type: 'text', placeholder: 'auto' },
      { name: 'excerpt_kk', label_kk: 'Қысқаша сипаттама (KK)', label_ru: 'Краткое описание (KK)', type: 'textarea' },
      { name: 'excerpt_ru', label_kk: 'Қысқаша сипаттама (RU)', label_ru: 'Краткое описание (RU)', type: 'textarea' },
      { name: 'content_kk', label_kk: 'Мазмұны (KK)', label_ru: 'Содержимое (KK)', type: 'textarea' },
      { name: 'content_ru', label_kk: 'Мазмұны (RU)', label_ru: 'Содержимое (RU)', type: 'textarea' },
      { name: 'image_url', label_kk: 'Сурет URL', label_ru: 'URL изображения', type: 'text' },
      { name: 'video_url', label_kk: 'Видео URL', label_ru: 'URL видео', type: 'text' },
      {
        name: 'status',
        label_kk: 'Күйі',
        label_ru: 'Статус',
        type: 'select',
        defaultValue: 'draft',
        options: [
          { value: 'draft', label_kk: 'Жоба', label_ru: 'Черновик' },
          { value: 'published', label_kk: 'Жарияланды', label_ru: 'Опубликовано' },
        ],
      },
    ],
    columns: [
      { field: 'title_ru', label_kk: 'Тақырыбы', label_ru: 'Заголовок' },
      { field: 'slug', label_kk: 'Slug', label_ru: 'Slug' },
      { field: 'status', label_kk: 'Күйі', label_ru: 'Статус', format: 'status' },
      { field: 'published_at', label_kk: 'Жарияланған күні', label_ru: 'Дата публикации', format: 'date' },
    ],
  };

  return <EntityCrudTable locale={locale} config={config} />;
}
