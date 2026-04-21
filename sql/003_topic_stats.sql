-- Adaptive recommender: per-user topic stats for global weakness scoring.

CREATE TABLE IF NOT EXISTS user_topic_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic_slug VARCHAR(100) NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  correct INTEGER NOT NULL DEFAULT 0,
  avg_score NUMERIC(5, 2) NOT NULL DEFAULT 0,
  weakness_score NUMERIC(6, 2) NOT NULL DEFAULT 50,
  last_attempt_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, topic_slug)
);

CREATE INDEX IF NOT EXISTS idx_user_topic_stats_user
  ON user_topic_stats (user_id, weakness_score DESC);

CREATE INDEX IF NOT EXISTS idx_user_topic_stats_topic
  ON user_topic_stats (topic_slug);
