-- ============================================================
-- NeverFades - Migration v4
-- Enforce the 5-view lifetime for every moment.
-- ============================================================

ALTER TABLE moments
  ALTER COLUMN max_views SET DEFAULT 5;

UPDATE moments
SET
  max_views = 5,
  view_count = LEAST(COALESCE(view_count, 0), 5),
  is_active = CASE
    WHEN LEAST(COALESCE(view_count, 0), 5) >= 5 THEN false
    ELSE COALESCE(is_active, true)
  END;

ALTER TABLE moments
  ALTER COLUMN view_count SET NOT NULL,
  ALTER COLUMN max_views SET NOT NULL,
  ALTER COLUMN is_active SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'moments_max_views_is_five'
      AND conrelid = 'moments'::regclass
  ) THEN
    ALTER TABLE moments
      ADD CONSTRAINT moments_max_views_is_five CHECK (max_views = 5);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'moments_view_count_between_zero_and_five'
      AND conrelid = 'moments'::regclass
  ) THEN
    ALTER TABLE moments
      ADD CONSTRAINT moments_view_count_between_zero_and_five CHECK (view_count BETWEEN 0 AND 5);
  END IF;
END;
$$;

ALTER TABLE moments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read moments" ON moments;
CREATE POLICY "Public read moments"
  ON moments FOR SELECT
  USING (is_active = true AND view_count < 5 AND max_views = 5);

DROP POLICY IF EXISTS "Public insert moments" ON moments;
CREATE POLICY "Public insert moments"
  ON moments FOR INSERT
  WITH CHECK (max_views = 5 AND view_count = 0);
