import EntityCrudTable, { EntityCrudConfig } from '@/components/admin/EntityCrudTable';

export default async function AdminLessonsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const config: EntityCrudConfig = {
    apiPath: '/api/lessons',
    listKey: 'lessons',
    itemKey: 'lesson',
    titleKk: 'Сабақтарды басқару',
    titleRu: 'Управление уроками',
    fields: [
      { name: 'title_kk', label_kk: 'Тақырыбы (KK)', label_ru: 'Название (KK)', type: 'text', required: true },
      { name: 'title_ru', label_kk: 'Тақырыбы (RU)', label_ru: 'Название (RU)', type: 'text', required: true },
      { name: 'description_kk', label_kk: 'Сипаттамасы (KK)', label_ru: 'Описание (KK)', type: 'textarea' },
      { name: 'description_ru', label_kk: 'Сипаттамасы (RU)', label_ru: 'Описание (RU)', type: 'textarea' },
      {
        name: 'topic',
        label_kk: 'Тақырып',
        label_ru: 'Тема',
        type: 'select',
        required: true,
        defaultValue: 'grammar',
        options: [
          { value: 'grammar', label_kk: 'Грамматика', label_ru: 'Грамматика' },
          { value: 'vocabulary', label_kk: 'Сөздік', label_ru: 'Лексика' },
          { value: 'listening', label_kk: 'Тыңдалым', label_ru: 'Аудирование' },
          { value: 'reading', label_kk: 'Оқылым', label_ru: 'Чтение' },
          { value: 'writing', label_kk: 'Жазылым', label_ru: 'Письмо' },
          { value: 'speaking', label_kk: 'Айтылым', label_ru: 'Говорение' },
          { value: 'culture', label_kk: 'Мәдениет', label_ru: 'Культура' },
        ],
      },
      {
        name: 'difficulty',
        label_kk: 'Деңгейі',
        label_ru: 'Уровень',
        type: 'select',
        required: true,
        defaultValue: 'A1',
        options: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((l) => ({ value: l, label_kk: l, label_ru: l })),
      },
      {
        name: 'required_level',
        label_kk: 'Қол жетімділік деңгейі',
        label_ru: 'Уровень доступа (gate)',
        type: 'select',
        defaultValue: '',
        options: [
          { value: '', label_kk: '— ашық —', label_ru: '— открытый —' },
          ...['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((l) => ({ value: l, label_kk: l, label_ru: l })),
        ],
      },
      {
        name: 'mentor_track',
        label_kk: 'Тәлімгер тректі',
        label_ru: 'Трек наставника',
        type: 'select',
        defaultValue: '',
        options: [
          { value: '', label_kk: '— жоқ —', label_ru: '— нет —' },
          { value: 'abai', label_kk: 'Абай', label_ru: 'Абай' },
          { value: 'baitursynuly', label_kk: 'Байтұрсынұлы', label_ru: 'Байтурсынулы' },
          { value: 'auezov', label_kk: 'Әуезов', label_ru: 'Ауэзов' },
        ],
      },
      {
        name: 'rule_ids',
        label_kk: 'Ереже ID-лер (JSON)',
        label_ru: 'ID правил (JSON-массив)',
        type: 'textarea',
      },
      {
        name: 'content',
        label_kk: 'Контент (JSON)',
        label_ru: 'Контент урока (JSON)',
        type: 'textarea',
      },
      { name: 'sort_order', label_kk: 'Реті', label_ru: 'Порядок', type: 'number', defaultValue: 0 },
    ],
    columns: [
      { field: 'title_ru', label_kk: 'Тақырыбы', label_ru: 'Название' },
      { field: 'topic', label_kk: 'Тақырып', label_ru: 'Тема' },
      { field: 'difficulty', label_kk: 'Деңгей', label_ru: 'Уровень' },
      { field: 'sort_order', label_kk: 'Реті', label_ru: 'Порядок' },
    ],
  };

  return <EntityCrudTable locale={locale} config={config} />;
}
