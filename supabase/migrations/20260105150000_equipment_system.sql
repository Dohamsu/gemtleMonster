-- ============================================
-- Equipment System Schema
-- ============================================

-- 1. Equipment Master Table
CREATE TABLE IF NOT EXISTS equipment (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    slot TEXT NOT NULL CHECK (slot IN ('WEAPON', 'ARMOR', 'ACCESSORY')),
    rarity TEXT NOT NULL CHECK (rarity IN ('N', 'R', 'SR', 'SSR', 'UR', 'LR')),
    icon_url TEXT,
    stats JSONB NOT NULL DEFAULT '{}'::jsonb, -- { "attack": 10, "defense": 5 }
    is_special BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_equipment_slot ON equipment(slot);
CREATE INDEX idx_equipment_rarity ON equipment(rarity);

-- 2. Player Equipment Table (Instances)
CREATE TABLE IF NOT EXISTS player_equipment (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    equipment_id TEXT NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    is_equipped BOOLEAN DEFAULT FALSE,
    equipped_monster_id UUID REFERENCES player_monster(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_player_equipment_user_id ON player_equipment(user_id);
CREATE INDEX idx_player_equipment_equipped_monster_id ON player_equipment(equipped_monster_id);

-- 3. RLS Policies
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_equipment ENABLE ROW LEVEL SECURITY;

-- Equipment is readable by everyone
CREATE POLICY "Equipment is viewable by everyone"
    ON equipment FOR SELECT
    USING (true);

-- Player Equipment policies
CREATE POLICY "Users can view their own equipment"
    ON player_equipment FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own equipment" -- Usually done by system, but helpful for testing
    ON player_equipment FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own equipment"
    ON player_equipment FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own equipment"
    ON player_equipment FOR DELETE
    USING (auth.uid() = user_id);

-- 4. Triggers for updated_at
CREATE OR REPLACE FUNCTION update_equipment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_equipment_tm
    BEFORE UPDATE ON equipment
    FOR EACH ROW EXECUTE FUNCTION update_equipment_updated_at();

CREATE TRIGGER update_player_equipment_tm
    BEFORE UPDATE ON player_equipment
    FOR EACH ROW EXECUTE FUNCTION update_equipment_updated_at();

-- 5. Helper Functions

-- Function to equip an item
-- Handles unequip of existing item in the same slot automatically
CREATE OR REPLACE FUNCTION equip_item(
    p_player_equipment_id UUID,
    p_player_monster_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID;
    v_equipment_id TEXT;
    v_slot TEXT;
    v_old_equipment_id UUID;
    v_monster_owner UUID;
BEGIN
    v_user_id := auth.uid();
    
    -- Check ownership of equipment
    SELECT user_id, equipment_id INTO v_user_id, v_equipment_id
    FROM player_equipment
    WHERE id = p_player_equipment_id;
    
    IF v_user_id IS NULL OR v_user_id != auth.uid() THEN
        RETURN jsonb_build_object('success', false, 'message', 'Equipment not found or not owned');
    END IF;

    -- Check ownership of monster
    SELECT user_id INTO v_monster_owner
    FROM player_monster
    WHERE id = p_player_monster_id;

    IF v_monster_owner IS NULL OR v_monster_owner != auth.uid() THEN
        RETURN jsonb_build_object('success', false, 'message', 'Monster not found or not owned');
    END IF;

    -- Get slot type
    SELECT slot INTO v_slot
    FROM equipment
    WHERE id = v_equipment_id;

    -- Find any item currently equipped in this slot on this monster
    -- We need to check the equipment table for the slot
    SELECT pe.id INTO v_old_equipment_id
    FROM player_equipment pe
    JOIN equipment e ON pe.equipment_id = e.id
    WHERE pe.equipped_monster_id = p_player_monster_id
    AND e.slot = v_slot
    AND pe.id != p_player_equipment_id; -- Don't count self if already equipped (though logic handles it)

    -- Unequip old item if exists
    IF v_old_equipment_id IS NOT NULL THEN
        UPDATE player_equipment
        SET is_equipped = FALSE, equipped_monster_id = NULL
        WHERE id = v_old_equipment_id;
    END IF;

    -- Equip new item
    UPDATE player_equipment
    SET is_equipped = TRUE, equipped_monster_id = p_player_monster_id
    WHERE id = p_player_equipment_id;

    RETURN jsonb_build_object('success', true, 'unequipped_id', v_old_equipment_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to unequip an item
CREATE OR REPLACE FUNCTION unequip_item(
    p_player_equipment_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID;
BEGIN
    SELECT user_id INTO v_user_id
    FROM player_equipment
    WHERE id = p_player_equipment_id;

    IF v_user_id IS NULL OR v_user_id != auth.uid() THEN
        RETURN jsonb_build_object('success', false, 'message', 'Equipment not found or not owned');
    END IF;

    UPDATE player_equipment
    SET is_equipped = FALSE, equipped_monster_id = NULL
    WHERE id = p_player_equipment_id;

    RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
