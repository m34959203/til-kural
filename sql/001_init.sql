-- Тіл-құрал Database Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  language_level VARCHAR(5) CHECK (language_level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  xp_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  mentor_avatar VARCHAR(50) DEFAULT 'abai',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lessons
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_kk VARCHAR(500) NOT NULL,
  title_ru VARCHAR(500) NOT NULL,
  description_kk TEXT,
  description_ru TEXT,
  topic VARCHAR(100) NOT NULL,
  difficulty VARCHAR(5) CHECK (difficulty IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  content JSONB NOT NULL DEFAULT '{}',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User lesson progress
CREATE TABLE user_lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  score INTEGER DEFAULT 0,
  weak_points JSONB DEFAULT '[]',
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, lesson_id)
);

-- Test questions bank
CREATE TABLE test_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_type VARCHAR(50) NOT NULL,
  topic VARCHAR(100) NOT NULL,
  difficulty VARCHAR(5) CHECK (difficulty IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  question_kk TEXT NOT NULL,
  question_ru TEXT,
  options JSONB NOT NULL DEFAULT '[]',
  correct_answer VARCHAR(255) NOT NULL,
  explanation_kk TEXT,
  explanation_ru TEXT
);

-- Test sessions
CREATE TABLE test_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  test_type VARCHAR(50) NOT NULL,
  topic VARCHAR(100),
  questions JSONB NOT NULL DEFAULT '[]',
  answers JSONB DEFAULT '[]',
  score INTEGER,
  level_result VARCHAR(5),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Certificates
CREATE TABLE certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  test_session_id UUID REFERENCES test_sessions(id) ON DELETE SET NULL,
  level VARCHAR(5) NOT NULL,
  score INTEGER NOT NULL,
  certificate_number VARCHAR(50) UNIQUE NOT NULL,
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Photo checks
CREATE TABLE photo_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  recognized_text TEXT,
  errors JSONB DEFAULT '[]',
  overall_score INTEGER,
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dialog sessions
CREATE TABLE dialog_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  topic VARCHAR(255),
  messages JSONB DEFAULT '[]',
  corrections JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Writing checks
CREATE TABLE writing_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  input_text TEXT NOT NULL,
  corrections JSONB DEFAULT '[]',
  score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quests
CREATE TABLE quests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_kk VARCHAR(500) NOT NULL,
  title_ru VARCHAR(500) NOT NULL,
  description_kk TEXT,
  description_ru TEXT,
  quest_type VARCHAR(50) NOT NULL,
  tasks JSONB NOT NULL DEFAULT '[]',
  xp_reward INTEGER DEFAULT 100,
  duration_days INTEGER DEFAULT 7,
  is_active BOOLEAN DEFAULT TRUE
);

-- User quest progress
CREATE TABLE user_quests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  quest_id UUID REFERENCES quests(id) ON DELETE CASCADE,
  progress JSONB DEFAULT '{}',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, quest_id)
);

-- Achievements
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(100) UNIQUE NOT NULL,
  title_kk VARCHAR(500) NOT NULL,
  title_ru VARCHAR(500) NOT NULL,
  description_kk TEXT,
  description_ru TEXT,
  icon VARCHAR(50) DEFAULT 'star',
  condition JSONB DEFAULT '{}'
);

-- User achievements
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Adaptive exercises
CREATE TABLE adaptive_exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  topic VARCHAR(100),
  exercise_type VARCHAR(50),
  question TEXT NOT NULL,
  answer TEXT,
  is_correct BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- News
CREATE TABLE news (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  title_kk VARCHAR(500) NOT NULL,
  title_ru VARCHAR(500) NOT NULL,
  content_kk TEXT,
  content_ru TEXT,
  image_url TEXT,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMP WITH TIME ZONE
);

-- Events
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_kk VARCHAR(500) NOT NULL,
  title_ru VARCHAR(500) NOT NULL,
  description_kk TEXT,
  description_ru TEXT,
  image_url TEXT,
  event_type VARCHAR(50),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  location VARCHAR(500),
  status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled'))
);

-- Banners
CREATE TABLE banners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(500),
  image_url TEXT NOT NULL,
  link_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0
);

-- Site settings
CREATE TABLE site_settings (
  key VARCHAR(255) PRIMARY KEY,
  value TEXT
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_test_questions_type ON test_questions(test_type, difficulty);
CREATE INDEX idx_test_sessions_user ON test_sessions(user_id);
CREATE INDEX idx_news_slug ON news(slug);
CREATE INDEX idx_news_status ON news(status);
CREATE INDEX idx_events_dates ON events(start_date, end_date);
CREATE INDEX idx_user_quests_user ON user_quests(user_id);
CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
