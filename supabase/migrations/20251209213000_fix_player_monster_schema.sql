-- Comprehensive fix for player_monster table
-- Ensures table exists with ALL required columns and RLS policies

-- 1. Create table if it doesn't exist (with all columns)
CREATE TABLE IF NOT EXISTS player_monster (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    monster_id TEXT NOT NULL,
    level INTEGER DEFAULT 1 NOT NULL,
    exp INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    is_locked BOOLEAN DEFAULT FALSE,
    unlocked_skills TEXT[] DEFAULT ARRAY[]::TEXT[],
    awakening_level INTEGER DEFAULT 0 NOT NULL
);

-- 2. Add columns if they are missing (for existing table)
DO $$
BEGIN
    -- awakening_level
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'player_monster' AND column_name = 'awakening_level') THEN
        ALTER TABLE player_monster ADD COLUMN awakening_level INTEGER NOT NULL DEFAULT 0;
    END IF;

    -- is_locked
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'player_monster' AND column_name = 'is_locked') THEN
        ALTER TABLE player_monster ADD COLUMN is_locked BOOLEAN DEFAULT FALSE;
    END IF;

    -- unlocked_skills
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'player_monster' AND column_name = 'unlocked_skills') THEN
        ALTER TABLE player_monster ADD COLUMN unlocked_skills TEXT[] DEFAULT ARRAY[]::TEXT[];
    END IF;
END $$;

-- 3. Add Constraints safely
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_awakening_level_non_negative') THEN
        ALTER TABLE player_monster ADD CONSTRAINT check_awakening_level_non_negative CHECK (awakening_level >= 0);
    END IF;
END $$;

-- 4. Enable RLS
ALTER TABLE player_monster ENABLE ROW LEVEL SECURITY;

-- 5. Add RLS Policies safely
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'player_monster' AND policyname = 'Users can view own monsters') THEN
        CREATE POLICY "Users can view own monsters" ON player_monster FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'player_monster' AND policyname = 'Users can insert own monsters') THEN
        CREATE POLICY "Users can insert own monsters" ON player_monster FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'player_monster' AND policyname = 'Users can update own monsters') THEN
        CREATE POLICY "Users can update own monsters" ON player_monster FOR UPDATE USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'player_monster' AND policyname = 'Users can delete own monsters') THEN
        CREATE POLICY "Users can delete own monsters" ON player_monster FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;
