-- migration_v5.sql
-- Reduce default max_views from 5 to 3 for all existing moments
-- Applied: 2026-06-14

UPDATE moments
SET max_views = 3
WHERE max_views = 5;
