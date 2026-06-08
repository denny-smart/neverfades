-- ============================================================
-- NeverFades - Supabase SQL Schema
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- Core moments table
CREATE TABLE IF NOT EXISTS moments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR UNIQUE NOT NULL,
  partner_name VARCHAR NOT NULL,
  sender_name VARCHAR NOT NULL,
  message TEXT NOT NULL,
  theme_id VARCHAR NOT NULL,
  view_count INT NOT NULL DEFAULT 0,
  max_views INT NOT NULL DEFAULT 5,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  first_viewed_at TIMESTAMP WITH TIME ZONE,
  last_viewed_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT moments_max_views_is_five CHECK (max_views = 5),
  CONSTRAINT moments_view_count_between_zero_and_five CHECK (view_count BETWEEN 0 AND 5)
);

-- Indexes for fast lookups and analytics
CREATE INDEX IF NOT EXISTS moments_slug_idx ON moments(slug);

CREATE TABLE IF NOT EXISTS moment_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  moment_id UUID NOT NULL REFERENCES moments(id) ON DELETE CASCADE,
  session_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS moment_views_moment_idx ON moment_views(moment_id);

-- Atomic view increment. Each page load sends a fresh UUID, so every load
-- consumes one view until the moment reaches its 5-view lifetime.
CREATE OR REPLACE FUNCTION increment_view_count(moment_slug VARCHAR, client_session_id UUID)
RETURNS TABLE (
  id UUID,
  slug VARCHAR,
  partner_name VARCHAR,
  sender_name VARCHAR,
  message TEXT,
  theme_id VARCHAR,
  view_count INT,
  max_views INT,
  is_active BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  first_viewed_at TIMESTAMP WITH TIME ZONE,
  last_viewed_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
AS $$
DECLARE
  moment_record moments%ROWTYPE;
  now_time TIMESTAMP WITH TIME ZONE := timezone('utc'::text, now());
BEGIN
  SELECT * INTO moment_record
  FROM moments
  WHERE moments.slug = moment_slug
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  IF NOT moment_record.is_active OR moment_record.view_count >= 5 THEN
    RETURN;
  END IF;

  INSERT INTO moment_views (moment_id, session_id, created_at)
  VALUES (moment_record.id, client_session_id, now_time);

  UPDATE moments m
  SET
    view_count = LEAST(m.view_count + 1, 5),
    first_viewed_at = COALESCE(m.first_viewed_at, now_time),
    last_viewed_at = now_time,
    is_active = CASE WHEN m.view_count + 1 >= 5 THEN false ELSE m.is_active END
  WHERE m.id = moment_record.id
  RETURNING m.* INTO moment_record;

  RETURN QUERY SELECT
    moment_record.id,
    moment_record.slug,
    moment_record.partner_name,
    moment_record.sender_name,
    moment_record.message,
    moment_record.theme_id,
    moment_record.view_count,
    moment_record.max_views,
    moment_record.is_active,
    moment_record.created_at,
    moment_record.first_viewed_at,
    moment_record.last_viewed_at;
END;
$$;

-- Enable Row Level Security
ALTER TABLE moments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read moments" ON moments;
CREATE POLICY "Public read moments"
  ON moments FOR SELECT
  USING (is_active = true AND view_count < 5 AND max_views = 5);

DROP POLICY IF EXISTS "Public insert moments" ON moments;
CREATE POLICY "Public insert moments"
  ON moments FOR INSERT
  WITH CHECK (max_views = 5 AND view_count = 0);

ALTER TABLE moment_views ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Future-ready tables (structure only - do not implement yet)
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email VARCHAR UNIQUE NOT NULL,
  tier VARCHAR DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS couples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_one_id UUID REFERENCES users(id),
  user_two_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  moment_id UUID REFERENCES moments(id) ON DELETE CASCADE,
  asset_type VARCHAR NOT NULL,
  storage_url TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE
);
