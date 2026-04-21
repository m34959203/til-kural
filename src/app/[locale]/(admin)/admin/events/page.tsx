import EntityCrudTable, { EntityCrudConfig } from '@/components/admin/EntityCrudTable';
import { EventsSchema } from '@/lib/validators';

export default async function AdminEventsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const config: EntityCrudConfig = {
    apiPath: '/api/events',
    listKey: 'events',
    itemKey: 'event',
    schema: EventsSchema,
    titleKk: 'Іс-шараларды басқару',
    titleRu: 'Управление мероприятиями',
    fields: [
      { name: 'title_kk', label_kk: 'Атауы (KK)', label_ru: 'Название (KK)', type: 'text', required: true },
      { name: 'title_ru', label_kk: 'Атауы (RU)', label_ru: 'Название (RU)', type: 'text', required: true },
      { name: 'description_kk', label_kk: 'Сипаттамасы (KK)', label_ru: 'Описание (KK)', type: 'textarea' },
      { name: 'description_ru', label_kk: 'Сипаттамасы (RU)', label_ru: 'Описание (RU)', type: 'textarea' },
      { name: 'start_date', label_kk: 'Басталу күні', label_ru: 'Дата начала', type: 'datetime', required: true },
      { name: 'end_date', label_kk: 'Аяқталу күні', label_ru: 'Дата окончания', type: 'datetime' },
      { name: 'location', label_kk: 'Орны', label_ru: 'Место', type: 'text' },
      { name: 'registration_url', label_kk: 'Тіркеу URL', label_ru: 'URL регистрации', type: 'text' },
      { name: 'image_url', label_kk: 'Сурет URL', label_ru: 'URL изображения', type: 'text' },
      {
        name: 'event_type',
        label_kk: 'Түрі',
        label_ru: 'Тип',
        type: 'select',
        defaultValue: 'event',
        options: [
          { value: 'event', label_kk: 'Іс-шара', label_ru: 'Мероприятие' },
          { value: 'webinar', label_kk: 'Вебинар', label_ru: 'Вебинар' },
          { value: 'workshop', label_kk: 'Шеберхана', label_ru: 'Мастер-класс' },
          { value: 'conference', label_kk: 'Конференция', label_ru: 'Конференция' },
        ],
      },
      {
        name: 'status',
        label_kk: 'Күйі',
        label_ru: 'Статус',
        type: 'select',
        defaultValue: 'upcoming',
        options: [
          { value: 'upcoming', label_kk: 'Келе жатыр', label_ru: 'Предстоящее' },
          { value: 'ongoing', label_kk: 'Жүріп жатыр', label_ru: 'Идёт' },
          { value: 'past', label_kk: 'Өтті', label_ru: 'Прошло' },
          { value: 'cancelled', label_kk: 'Болдырылмады', label_ru: 'Отменено' },
        ],
      },
    ],
    columns: [
      { field: 'title_ru', label_kk: 'Атауы', label_ru: 'Название' },
      { field: 'start_date', label_kk: 'Басталу', label_ru: 'Начало', format: 'datetime' },
      { field: 'location', label_kk: 'Орны', label_ru: 'Место' },
      { field: 'status', label_kk: 'Күйі', label_ru: 'Статус', format: 'status' },
    ],
  };

  return <EntityCrudTable locale={locale} config={config} />;
}
