-- 004: Отделы, сотрудники, нормативные документы (УМЦ «Тіл-құрал»)
-- Часть CMS для разделов /about и /rules.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Отделы
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_kk VARCHAR(500) NOT NULL,
  name_ru VARCHAR(500) NOT NULL,
  description_kk TEXT,
  description_ru TEXT,
  head_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_departments_sort_order ON departments(sort_order);

-- Сотрудники
CREATE TABLE IF NOT EXISTS staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_kk VARCHAR(500) NOT NULL,
  name_ru VARCHAR(500) NOT NULL,
  position_kk VARCHAR(500),
  position_ru VARCHAR(500),
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  photo_url TEXT,
  email VARCHAR(255),
  phone VARCHAR(50),
  bio_kk TEXT,
  bio_ru TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staff_department_id ON staff(department_id);
CREATE INDEX IF NOT EXISTS idx_staff_sort_order ON staff(sort_order);

-- Нормативные документы (правила)
CREATE TABLE IF NOT EXISTS rules_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_kk VARCHAR(500) NOT NULL,
  title_ru VARCHAR(500) NOT NULL,
  description_kk TEXT,
  description_ru TEXT,
  year VARCHAR(20),
  pdf_url TEXT,
  category VARCHAR(100),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rules_documents_category ON rules_documents(category);
CREATE INDEX IF NOT EXISTS idx_rules_documents_sort_order ON rules_documents(sort_order);

-- Seed: отдел администрации + директор
INSERT INTO departments (id, name_kk, name_ru, description_kk, description_ru, sort_order)
VALUES (
  '00000000-0000-4000-8000-000000000001',
  'Әкімшілік',
  'Администрация',
  'Орталықтың әкімшілік-басқару тобы.',
  'Административно-управленческая группа центра.',
  0
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO staff (id, name_kk, name_ru, position_kk, position_ru, department_id, sort_order)
VALUES (
  '00000000-0000-4000-8000-000000000101',
  'Игенберлина Мадинат Балтина',
  'Игенберлина Мадинат Балтина',
  'Директор',
  'Директор',
  '00000000-0000-4000-8000-000000000001',
  0
)
ON CONFLICT (id) DO NOTHING;
