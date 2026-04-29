#!/usr/bin/env bash
# Регенерирует sql/006_content_seeds.sql из живой БД.
# Использование: bash scripts/regenerate-content-seeds.sh [container_name]
#
# Логика:
#   1. pg_dump --inserts всех контентных таблиц (lessons, grammar_rules, test_questions, banners).
#   2. Конвертируем `INSERT INTO public.X (...) VALUES (...)` →
#      `INSERT INTO X (...) VALUES (...) ON CONFLICT (id) DO UPDATE SET ... = EXCLUDED.X`.
#   3. Сохраняем DDL-блоки (ALTER TABLE / CREATE TABLE) сверху файла.
#
# После прогона: проверить дифф (`git diff sql/006_content_seeds.sql`) и закоммитить.

set -euo pipefail

CONTAINER="${1:-til-kural-db-1}"
DB_USER="${POSTGRES_USER:-tilkural}"
DB_NAME="${POSTGRES_DB:-tilkural}"
OUT="sql/006_content_seeds.sql"

if ! command -v docker >/dev/null 2>&1; then
  echo "docker not found. Run on host with til-kural db running."
  exit 1
fi

if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER}\$"; then
  echo "Container ${CONTAINER} is not running."
  exit 1
fi

DUMP=$(docker exec "${CONTAINER}" pg_dump -U "${DB_USER}" -d "${DB_NAME}" \
  --data-only --column-inserts --no-owner --no-privileges \
  -t lessons -t grammar_rules -t test_questions -t banners 2>/dev/null)

# Удаляем pg_dump-овые служебные строки и `\restrict`-маркеры:
DUMP=$(echo "${DUMP}" \
  | sed -e '/^\\restrict/d' \
        -e '/^\\unrestrict/d' \
        -e '/^SET /d' \
        -e '/^SELECT pg_catalog/d' \
        -e 's/INSERT INTO public\./INSERT INTO /' \
  )

cat > "${OUT}" <<'HEADER'
-- 006: Seeds для публичного контента (lessons/news/events/banners/grammar_rules)
-- ⚠️  Файл регенерируется из живой БД. Не редактировать вручную:
--    bash scripts/regenerate-content-seeds.sh
-- Все вставки имеют ON CONFLICT (id) DO NOTHING — повторный прогон безопасен,
-- но НЕ обновляет существующие строки. Если нужно обновить prod — выполните
-- TRUNCATE + повторный seed на свежей БД, или применяйте UPDATE напрямую.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- lessons: добавляем mentor_track / required_level / rule_ids, если их ещё нет.
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS mentor_track VARCHAR(50);
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS required_level VARCHAR(5);
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS rule_ids JSONB DEFAULT '[]';

CREATE TABLE IF NOT EXISTS grammar_rules (
  id VARCHAR(64) PRIMARY KEY,
  topic VARCHAR(200) NOT NULL,
  title_kk VARCHAR(500) NOT NULL,
  title_ru VARCHAR(500) NOT NULL,
  level VARCHAR(5),
  description_kk TEXT,
  description_ru TEXT,
  examples JSONB DEFAULT '[]',
  exceptions JSONB DEFAULT '[]',
  rule_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_grammar_rules_order ON grammar_rules(rule_order);

-- ===========================================================================
-- DATA (regenerated from live DB)
-- ===========================================================================
HEADER

# Добавляем dump'ом-полученные INSERT-ы и обвешиваем их ON CONFLICT DO NOTHING.
# (Полная UPDATE-стратегия требует знания всех колонок; для надёжности используем
# DO NOTHING — на свежей БД это сидит контент, на dev-БД повторный запуск ничего
# не ломает. Чтобы реально перезалить — TRUNCATE сначала.)
echo "${DUMP}" \
  | sed -E 's/(INSERT INTO [a-zA-Z_]+ \([^)]*\) VALUES \([^;]+\));/\1 ON CONFLICT (id) DO NOTHING;/' \
  >> "${OUT}"

echo "✅ Regenerated ${OUT}"
wc -l "${OUT}"
