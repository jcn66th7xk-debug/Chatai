CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
  user_id UUID PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  join_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reputation_score NUMERIC NOT NULL DEFAULT 0,
  followers_count INT NOT NULL DEFAULT 0,
  following_count INT NOT NULL DEFAULT 0,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS ai_entities (
  ai_id UUID PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  personality_vector JSONB NOT NULL,
  intelligence_level NUMERIC NOT NULL,
  creativity_score NUMERIC NOT NULL,
  aggression_score NUMERIC NOT NULL,
  humor_score NUMERIC NOT NULL,
  posting_frequency NUMERIC NOT NULL,
  memory_context_buffer TEXT,
  alignment_bias NUMERIC NOT NULL,
  specialty_domain TEXT NOT NULL,
  follower_count INT NOT NULL DEFAULT 0,
  influence_score NUMERIC NOT NULL DEFAULT 50,
  faction TEXT DEFAULT 'independent',
  evolution_stage INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS posts (
  post_id UUID PRIMARY KEY,
  author_id UUID NOT NULL,
  author_type TEXT NOT NULL CHECK (author_type IN ('user','ai')),
  content_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  like_count INT NOT NULL DEFAULT 0,
  comment_count INT NOT NULL DEFAULT 0,
  engagement_score NUMERIC NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS comments (
  comment_id UUID PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES posts(post_id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  author_type TEXT NOT NULL CHECK (author_type IN ('user','ai')),
  parent_comment_id UUID REFERENCES comments(comment_id) ON DELETE CASCADE,
  content_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS post_likes (
  post_id UUID NOT NULL REFERENCES posts(post_id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, user_id)
);

CREATE TABLE IF NOT EXISTS follows (
  follower_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  target_id UUID NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('user','ai')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (follower_id, target_id, target_type)
);

CREATE TABLE IF NOT EXISTS direct_messages (
  message_id UUID PRIMARY KEY,
  sender_user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  target_ai_id UUID NOT NULL REFERENCES ai_entities(ai_id) ON DELETE CASCADE,
  content_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS feed_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
  engagement_weight NUMERIC NOT NULL DEFAULT 0.4,
  followed_weight NUMERIC NOT NULL DEFAULT 0.3,
  ai_influence_weight NUMERIC NOT NULL DEFAULT 0.2,
  recency_weight NUMERIC NOT NULL DEFAULT 0.1
);

CREATE TABLE IF NOT EXISTS ai_memory (
  memory_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ai_id UUID NOT NULL REFERENCES ai_entities(ai_id) ON DELETE CASCADE,
  target_id UUID,
  interaction_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_events (
  event_id BIGSERIAL PRIMARY KEY,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS interaction_logs (
  log_id BIGSERIAL PRIMARY KEY,
  actor_id UUID NOT NULL,
  actor_type TEXT NOT NULL,
  action TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS trending_topics (
  topic TEXT PRIMARY KEY,
  score NUMERIC NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_engagement_score ON posts(engagement_score DESC);
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_ai_memory_ai_created ON ai_memory(ai_id, created_at DESC);
