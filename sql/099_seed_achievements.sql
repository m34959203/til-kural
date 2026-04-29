-- Каталог базовых достижений (idempotent через ON CONFLICT по code)
INSERT INTO achievements (code, title_kk, title_ru, description_kk, description_ru, icon, condition) VALUES
  ('first_lesson', 'Алғашқы қадам', 'Первый шаг',
   'Бірінші сабақты аяқтаңыз', 'Завершите первый урок',
   'star', '{"type":"lessons_completed","value":1}'::jsonb),

  ('lessons_10', 'Үздік оқушы', 'Усердный ученик',
   '10 сабақты аяқтаңыз', 'Завершите 10 уроков',
   'book-open', '{"type":"lessons_completed","value":10}'::jsonb),

  ('lessons_50', 'Шебер', 'Мастер',
   '50 сабақты аяқтаңыз', 'Завершите 50 уроков',
   'graduation-cap', '{"type":"lessons_completed","value":50}'::jsonb),

  ('first_test', 'Тестілеуші', 'Тестировщик',
   'Бірінші тестті өтіңіз', 'Пройдите первый тест',
   'clipboard-check', '{"type":"tests_completed","value":1}'::jsonb),

  ('tests_10', 'Тест чемпионы', 'Чемпион тестов',
   '10 тестті өтіңіз', 'Пройдите 10 тестов',
   'trophy', '{"type":"tests_completed","value":10}'::jsonb),

  ('placement_done', 'Деңгейді анықтадыңыз', 'Уровень определён',
   'Деңгейді анықтайтын тестті өтіңіз', 'Пройдите тест на определение уровня',
   'compass', '{"type":"placement_done"}'::jsonb),

  ('first_writing', 'Жазушы', 'Писатель',
   'Бірінші жазба жұмысты тексеріңіз', 'Проверьте первую письменную работу',
   'pen-tool', '{"type":"writing_checks","value":1}'::jsonb),

  ('first_photo', 'Зерттеуші', 'Исследователь',
   'Бірінші фотосуретті тексеріңіз', 'Проверьте первое фото',
   'camera', '{"type":"photo_checks","value":1}'::jsonb),

  ('streak_7', 'Апта от', 'Неделя огня',
   '7 күн қатарынан кіріңіз', 'Заходите 7 дней подряд',
   'flame', '{"type":"streak_days","value":7}'::jsonb),

  ('streak_30', 'Ай табандылығы', 'Месяц упорства',
   '30 күн қатарынан кіріңіз', 'Заходите 30 дней подряд',
   'flame', '{"type":"streak_days","value":30}'::jsonb),

  ('streak_100', 'Жүз күн', 'Сотня дней',
   '100 күн қатарынан кіріңіз', 'Заходите 100 дней подряд',
   'crown', '{"type":"streak_days","value":100}'::jsonb),

  ('level_5', 'Жоғары деңгей', 'Высокий уровень',
   '5-деңгейге жетіңіз', 'Достигните 5 уровня',
   'medal', '{"type":"level","value":5}'::jsonb),

  ('level_10', 'Үздік', 'Великолепный',
   '10-деңгейге жетіңіз', 'Достигните 10 уровня',
   'medal', '{"type":"level","value":10}'::jsonb)
ON CONFLICT (code) DO NOTHING;
