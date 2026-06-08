-- ============================================================
-- NeverFades — Supabase SQL Schema
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
  view_count INT DEFAULT 0,
  max_views INT DEFAULT 10,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for fast slug lookups
CREATE INDEX IF NOT EXISTS moments_slug_idx ON moments(slug);

-- RPC function for atomic view increment (prevents race conditions)
CREATE OR REPLACE FUNCTION increment_view_count(moment_slug VARCHAR)
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
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
AS $$
DECLARE
  moment_record moments%ROWTYPE;
BEGIN
  -- Lock the row and increment
  UPDATE moments m
  SET
    view_count = m.view_count + 1,
    is_active = CASE WHEN m.view_count + 1 >= m.max_views THEN false ELSE m.is_active END
  WHERE m.slug = moment_slug
    AND m.is_active = true
    AND m.view_count < m.max_views
  RETURNING m.* INTO moment_record;

  -- Return the updated row
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
    moment_record.created_at;
END;
$$;

-- Enable Row Level Security
ALTER TABLE moments ENABLE ROW LEVEL SECURITY;

-- Policy: anyone can read moments (for public reveal pages)
CREATE POLICY "Public read moments"
  ON moments FOR SELECT
  USING (true);

-- Policy: anyone can insert moments (anonymous creation)
CREATE POLICY "Public insert moments"
  ON moments FOR INSERT
  WITH CHECK (true);

-- ============================================================
-- Future-ready tables (structure only — do not implement yet)
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
