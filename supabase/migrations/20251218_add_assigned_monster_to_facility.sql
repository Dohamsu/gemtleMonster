-- ============================================
-- Add Monster Assignment to Player Facilities
-- ============================================

-- 1. Add assigned_monster_id to player_facility
-- This references player_monster.id (the specific instance owned by the player)
ALTER TABLE player_facility
ADD COLUMN IF NOT EXISTS assigned_monster_id UUID REFERENCES player_monster(id) ON DELETE SET NULL;

-- 2. Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_player_facility_assigned_monster_id ON player_facility(assigned_monster_id);

-- 3. Update existing records (optional, normally null is fine)
-- Set default to NULL (already default)

-- 4. Enable RLS (already enabled on player_facility)
