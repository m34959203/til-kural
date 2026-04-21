-- 005: CMS-блок «История центра» для /about (ТЗ 3.3.2)
-- Таймлайн значимых этапов организации с картинками.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS history_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  year VARCHAR(20),
  title_kk VARCHAR(500) NOT NULL,
  title_ru VARCHAR(500) NOT NULL,
  description_kk TEXT,
  description_ru TEXT,
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_history_blocks_sort_order ON history_blocks(sort_order);
CREATE INDEX IF NOT EXISTS idx_history_blocks_year ON history_blocks(year);

-- Seed: базовые вехи центра (можно редактировать/удалить через админку).
INSERT INTO history_blocks (id, year, title_kk, title_ru, description_kk, description_ru, sort_order)
VALUES
  (
    '00000000-0000-4000-8000-000000000501',
    '2024',
    'Орталықтың негізі қаланды',
    'Основание центра',
    'КМҚК "Тіл-құрал" оқу-әдістемелік орталығы Сәтбаев қаласында ашылды.',
    'В городе Сатпаев открыт КГУ «Учебно-методический центр „Тіл-құрал“».',
    10
  ),
  (
    '00000000-0000-4000-8000-000000000502',
    '2025',
    'KAZTEST дайындық бағдарламасы',
    'Запуск программы подготовки к KAZTEST',
    'Қазақ тілі бойынша KAZTEST емтиханына толыққанды дайындық.',
    'Полноценная подготовка к государственному экзамену KAZTEST.',
    20
  ),
  (
    '00000000-0000-4000-8000-000000000503',
    '2026',
    'AI-бағыты ашылды',
    'Открытие AI-направления',
    'Gemini негізіндегі AI-тәлімгер, фото-тексеру және диалог-жаттықтырушы іске қосылды.',
    'Запущены AI-наставник, фото-проверка и диалог-тренажёр на базе Gemini.',
    30
  )
ON CONFLICT (id) DO NOTHING;
