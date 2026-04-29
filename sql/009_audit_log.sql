-- 009: audit_log — журнал критических админ-действий.
-- Пишется из /api/admin/* при PATCH/PUT/POST/DELETE и из /api/admin/settings.
-- Используется для расследования инцидентов и compliance.

CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID,                          -- кто сделал действие (FK не ставим — пользователь может быть удалён)
  actor_email VARCHAR(255),               -- e-mail на момент действия (для исторической трассировки)
  actor_role VARCHAR(50),                 -- роль на момент действия
  action VARCHAR(64) NOT NULL,            -- 'user.update', 'user.delete', 'user.create', 'user.reset_password', 'settings.update', etc.
  target_type VARCHAR(64),                -- 'user', 'settings', 'lesson', ...
  target_id VARCHAR(255),                 -- id целевой сущности (UUID или ключ)
  ip_address VARCHAR(64),
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',            -- patch-данные, причины, контекст
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_actor ON audit_log(actor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_target ON audit_log(target_type, target_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_recent ON audit_log(created_at DESC);
