-- ============================================================
-- NeverFades — Upgrade Migration Schema (Phase 1.5)
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Add analytics columns to moments table
ALTER TABLE moments ADD COLUMN IF NOT EXISTS first_viewed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE moments ADD COLUMN IF NOT EXISTS last_viewed_at TIMESTAMP WITH TIME ZONE;

-- 2. Create the moment_views table for unique session tracking
CREATE TABLE IF NOT EXISTS moment_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  moment_id UUID NOT NULL REFERENCES moments(id) ON DELETE CASCADE,
  session_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_moment_session UNIQUE (moment_id, session_id)
);

-- Index for session lookups
CREATE INDEX IF NOT EXISTS moment_views_session_idx ON moment_views(moment_id, session_id);

-- 3. Update the RPC function to run atomically with session checks and analytics
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
  session_exists BOOLEAN;
  now_time TIMESTAMP WITH TIME ZONE := timezone('utc'::text, now());
BEGIN
  -- Select moment and lock it
  SELECT * INTO moment_record FROM moments WHERE moments.slug = moment_slug;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  -- If moment is already expired, just return it as is (no increment)
  IF NOT moment_record.is_active OR moment_record.view_count >= moment_record.max_views THEN
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
    RETURN;
  END IF;

  -- Check if session already viewed
  SELECT EXISTS(
    SELECT 1 FROM moment_views
    WHERE moment_views.moment_id = moment_record.id AND moment_views.session_id = client_session_id
  ) INTO session_exists;

  IF NOT session_exists THEN
    -- Record this session view
    INSERT INTO moment_views (moment_id, session_id, created_at)
    VALUES (moment_record.id, client_session_id, now_time);

    -- Increment and update first/last viewed dates
    UPDATE moments m
    SET
      view_count = m.view_count + 1,
      first_viewed_at = COALESCE(m.first_viewed_at, now_time),
      last_viewed_at = now_time,
      is_active = CASE WHEN m.view_count + 1 >= m.max_views THEN false ELSE m.is_active END
    WHERE m.id = moment_record.id
    RETURNING m.* INTO moment_record;
  ELSE
    -- Re-viewing from the same session does not increment, but updates last_viewed_at
    UPDATE moments m
    SET
      last_viewed_at = now_time
    WHERE m.id = moment_record.id
    RETURNING m.* INTO moment_record;
  END IF;

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

-- 4. Harden Row Level Security (RLS) on moments
ALTER TABLE moments ENABLE ROW LEVEL SECURITY;

-- Remove old read policy
DROP POLICY IF EXISTS "Public read moments" ON moments;

-- Re-create read policy: Anyone can select a moment but ONLY if it is still active and not fully viewed
CREATE POLICY "Public read moments"
  ON moments FOR SELECT
  USING (is_active = true AND view_count < max_views);
