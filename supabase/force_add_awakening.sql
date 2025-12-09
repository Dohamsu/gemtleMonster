-- Force add awakening_level column
-- Run this in Supabase SQL Editor

ALTER TABLE player_monster 
ADD COLUMN IF NOT EXISTS awakening_level INTEGER NOT NULL DEFAULT 0;

COMMENT ON COLUMN player_monster.awakening_level IS 'Current awakening level (0-5 stars)';
