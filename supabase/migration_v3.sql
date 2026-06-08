-- ============================================================
-- NeverFades — Migration v3
-- Run this in your Supabase SQL Editor
-- ============================================================
-- 
-- Previously, moment_views enforced UNIQUE(moment_id, session_id).
-- The session_id was persisted in localStorage, so reloading the
-- same browser tab never consumed an extra view.
--
-- As of this migration, the client generates a fresh UUID per page
-- load (no longer stored in localStorage). This makes every visit —
-- including reloads — count as a unique view toward the 5-view cap.
--
-- We drop the unique constraint so the RPC can INSERT duplicate
-- moment_id rows (each with a different per-load session_id UUID).
-- ============================================================

-- Drop the uniqueness constraint that prevented the same browser
-- from consuming more than one view across reloads.
ALTER TABLE moment_views DROP CONSTRAINT IF EXISTS unique_moment_session;

-- Drop the index that backed it (will be replaced below).
DROP INDEX IF EXISTS moment_views_session_idx;

-- Add a plain (non-unique) index for query performance.
CREATE INDEX IF NOT EXISTS moment_views_moment_idx ON moment_views(moment_id);

-- ============================================================
-- Update the RPC so it no longer checks for an existing session;
-- it always inserts a new row and increments the counter.
-- ============================================================
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
  -- Select and lock the moment row
  SELECT * INTO moment_record
  FROM moments
  WHERE moments.slug = moment_slug
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  -- If already expired, return empty (caller treats this as faded)
  IF NOT moment_record.is_active OR moment_record.view_count >= moment_record.max_views THEN
    RETURN;
  END IF;

  -- Record this load as an audit entry (no uniqueness constraint)
  INSERT INTO moment_views (moment_id, session_id, created_at)
  VALUES (moment_record.id, client_session_id, now_time);

  -- Increment view count and update timestamps
  UPDATE moments m
  SET
    view_count     = m.view_count + 1,
    first_viewed_at = COALESCE(m.first_viewed_at, now_time),
    last_viewed_at  = now_time,
    is_active       = CASE WHEN m.view_count + 1 >= m.max_views THEN false ELSE m.is_active END
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
