-- Create player_monster table for storing crafted monsters
CREATE TABLE IF NOT EXISTS public.player_monster (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    monster_id TEXT NOT NULL,
    level INTEGER DEFAULT 1 NOT NULL,
    exp INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_player_monster_user_id ON public.player_monster(user_id);
CREATE INDEX IF NOT EXISTS idx_player_monster_monster_id ON public.player_monster(monster_id);
CREATE INDEX IF NOT EXISTS idx_player_monster_created_at ON public.player_monster(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.player_monster ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only view their own monsters
CREATE POLICY "Users can view own monsters"
    ON public.player_monster
    FOR SELECT
    USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own monsters
CREATE POLICY "Users can insert own monsters"
    ON public.player_monster
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own monsters
CREATE POLICY "Users can update own monsters"
    ON public.player_monster
    FOR UPDATE
    USING (auth.uid() = user_id);

-- RLS Policy: Users can delete their own monsters
CREATE POLICY "Users can delete own monsters"
    ON public.player_monster
    FOR DELETE
    USING (auth.uid() = user_id);

-- Add comment
COMMENT ON TABLE public.player_monster IS 'Stores monsters crafted by players through alchemy';
