-- 007: Запланированная публикация news / events.
-- Админ ставит `scheduled_at` (будущая метка) и status='draft' — материал лежит
-- в черновиках. Cron-endpoint /api/cron/publish-scheduled каждую минуту
-- UPDATE-ит записи, у которых scheduled_at <= NOW(), переводя их в
-- published (news) или upcoming (events).
--
-- Индексы частичные (WHERE scheduled_at IS NOT NULL) — у большинства записей
-- это поле NULL, чтобы таблица индекса не росла впустую.

ALTER TABLE news   ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_news_scheduled_at
  ON news (scheduled_at)
  WHERE scheduled_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_events_scheduled_at
  ON events (scheduled_at)
  WHERE scheduled_at IS NOT NULL;

-- Для запланированной публикации events статус 'draft' должен стать допустимым.
-- В 001_init.sql CHECK был ('upcoming','ongoing','completed','cancelled'),
-- в коде используются 'past' и 'draft' — приводим к актуальному множеству.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_name = 'events' AND constraint_name = 'events_status_check'
  ) THEN
    ALTER TABLE events DROP CONSTRAINT events_status_check;
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END$$;

ALTER TABLE events
  ADD CONSTRAINT events_status_check
  CHECK (status IN ('draft', 'upcoming', 'ongoing', 'past', 'completed', 'cancelled'));
