-- 012: tts_cache — персистентный кеш TTS-ответов.
-- Гасит большинство повторных вызовов: одна и та же фраза + voice + model
-- → вернуть готовый WAV из БД, без сетевого вызова Gemini.
-- Срок жизни управляется через хук в коде (TTL-инвалидация по created_at).

CREATE TABLE IF NOT EXISTS tts_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cache_key VARCHAR(96) NOT NULL UNIQUE,    -- sha256(model + voice + text)
  model VARCHAR(128) NOT NULL,
  voice VARCHAR(64) NOT NULL,
  text_preview VARCHAR(160) NOT NULL,        -- первые 160 символов для отладки
  audio_base64 TEXT NOT NULL,                -- готовый WAV в base64
  mime_type VARCHAR(64) NOT NULL DEFAULT 'audio/wav',
  hits INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_hit_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tts_cache_created ON tts_cache(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tts_cache_last_hit ON tts_cache(last_hit_at DESC);
