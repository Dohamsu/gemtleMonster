-- Ensure player_monster table exists
CREATE TABLE IF NOT EXISTS player_monster (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    monster_id TEXT NOT NULL,
    level INTEGER DEFAULT 1 NOT NULL,
    exp INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add awakening_level column to player_monster table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'player_monster'
        AND column_name = 'awakening_level'
    ) THEN
        ALTER TABLE player_monster ADD COLUMN awakening_level INTEGER NOT NULL DEFAULT 0;
        COMMENT ON COLUMN player_monster.awakening_level IS 'Current awakening level (0-5 stars)';
    END IF;
END $$;

-- Add check constraint if it doesn't exist
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'check_awakening_level_non_negative'
    ) THEN
        ALTER TABLE player_monster DROP CONSTRAINT check_awakening_level_non_negative;
    END IF;
END $$;

ALTER TABLE player_monster
ADD CONSTRAINT check_awakening_level_non_negative CHECK (awakening_level >= 0);


