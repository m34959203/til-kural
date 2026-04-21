import EntityCrudTable, { EntityCrudConfig } from '@/components/admin/EntityCrudTable';

export default async function AdminTestsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const config: EntityCrudConfig = {
    apiPath: '/api/admin/test-questions',
    listKey: 'questions',
    itemKey: 'question',
    titleKk: 'Тест сұрақтарын басқару',
    titleRu: 'Управление тестами',
    fields: [
      {
        name: 'test_type',
        label_kk: 'Тест түрі',
        label_ru: 'Тип теста',
        type: 'select',
        required: true,
        defaultValue: 'level',
        options: [
          { value: 'level', label_kk: 'Деңгей тесті', label_ru: 'Тест уровня' },
          { value: 'thematic', label_kk: 'Тақырыптық', label_ru: 'Тематический' },
          { value: 'kaztest', label_kk: 'КАЗТЕСТ', label_ru: 'КАЗТЕСТ' },
          { value: 'lesson', label_kk: 'Сабақ тесті', label_ru: 'Тест урока' },
        ],
      },
      { name: 'topic', label_kk: 'Тақырыбы', label_ru: 'Тема', type: 'text', required: true, placeholder: 'grammar / vocabulary / …' },
      {
        name: 'difficulty',
        label_kk: 'Деңгейі',
        label_ru: 'Уровень',
        type: 'select',
        required: true,
        defaultValue: 'A1',
        options: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((l) => ({ value: l, label_kk: l, label_ru: l })),
      },
      { name: 'question_kk', label_kk: 'Сұрақ (KK)', label_ru: 'Вопрос (KK)', type: 'textarea', required: true },
      { name: 'question_ru', label_kk: 'Сұрақ (RU)', label_ru: 'Вопрос (RU)', type: 'textarea' },
      { name: 'options', label_kk: 'Нұсқалар (JSON немесе үтір арқылы)', label_ru: 'Варианты (JSON или через запятую)', type: 'textarea', placeholder: '["А","Б","В","Г"] или А, Б, В, Г' },
      { name: 'correct_answer', label_kk: 'Дұрыс жауабы', label_ru: 'Правильный ответ', type: 'text', required: true },
      { name: 'explanation_kk', label_kk: 'Түсініктеме (KK)', label_ru: 'Объяснение (KK)', type: 'textarea' },
      { name: 'explanation_ru', label_kk: 'Түсініктеме (RU)', label_ru: 'Объяснение (RU)', type: 'textarea' },
    ],
    columns: [
      { field: 'test_type', label_kk: 'Түрі', label_ru: 'Тип' },
      { field: 'topic', label_kk: 'Тақырып', label_ru: 'Тема' },
      { field: 'difficulty', label_kk: 'Деңгей', label_ru: 'Уровень' },
      {
        field: 'question_kk',
        label_kk: 'Сұрақ',
        label_ru: 'Вопрос',
        render: (v) => {
          const s = String(v ?? '');
          return s.length > 80 ? s.slice(0, 80) + '…' : s;
        },
      },
      { field: 'correct_answer', label_kk: 'Жауап', label_ru: 'Ответ' },
    ],
  };

  return <EntityCrudTable locale={locale} config={config} />;
}
