import EntityCrudTable, { EntityCrudConfig } from '@/components/admin/EntityCrudTable';

export default async function AdminGrammarPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const config: EntityCrudConfig = {
    apiPath: '/api/grammar-rules',
    listKey: 'rules',
    itemKey: 'rule',
    titleKk: 'Грамматика ережелері',
    titleRu: 'Правила грамматики',
    fields: [
      { name: 'topic', label_kk: 'Тақырып (slug)', label_ru: 'Тема (slug)', type: 'text', required: true, placeholder: 'vowel-harmony' },
      { name: 'title_kk', label_kk: 'Атауы (KK)', label_ru: 'Название (KK)', type: 'text', required: true },
      { name: 'title_ru', label_kk: 'Атауы (RU)', label_ru: 'Название (RU)', type: 'text', required: true },
      {
        name: 'level',
        label_kk: 'Деңгей (CEFR)',
        label_ru: 'Уровень (CEFR)',
        type: 'select',
        defaultValue: 'A1',
        options: [
          { value: 'A1', label_kk: 'A1', label_ru: 'A1' },
          { value: 'A2', label_kk: 'A2', label_ru: 'A2' },
          { value: 'B1', label_kk: 'B1', label_ru: 'B1' },
          { value: 'B2', label_kk: 'B2', label_ru: 'B2' },
          { value: 'C1', label_kk: 'C1', label_ru: 'C1' },
          { value: 'C2', label_kk: 'C2', label_ru: 'C2' },
        ],
      },
      { name: 'description_kk', label_kk: 'Түсініктеме (KK)', label_ru: 'Описание (KK)', type: 'textarea' },
      { name: 'description_ru', label_kk: 'Түсініктеме (RU)', label_ru: 'Описание (RU)', type: 'textarea' },
      {
        name: 'examples',
        label_kk: 'Мысалдар (JSON)',
        label_ru: 'Примеры (JSON)',
        type: 'textarea',
        placeholder: '[{"kk":"кітап","ru":"книга"}]',
      },
      {
        name: 'exceptions',
        label_kk: 'Ерекшеліктер (JSON)',
        label_ru: 'Исключения (JSON)',
        type: 'textarea',
        placeholder: '[{"kk":"...","ru":"..."}]',
      },
      { name: 'rule_order', label_kk: 'Реті', label_ru: 'Порядок', type: 'number', defaultValue: 0 },
    ],
    columns: [
      { field: 'title_ru', label_kk: 'Атауы', label_ru: 'Название', format: 'truncate', truncate: 80 },
      { field: 'topic', label_kk: 'Тақырып', label_ru: 'Тема' },
      { field: 'level', label_kk: 'Деңгей', label_ru: 'Уровень', format: 'status' },
      { field: 'rule_order', label_kk: 'Реті', label_ru: 'Порядок' },
    ],
  };

  return <EntityCrudTable locale={locale} config={config} />;
}
