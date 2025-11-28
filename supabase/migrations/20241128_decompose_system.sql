-- Add is_locked column to player_monster table
ALTER TABLE player_monster 
ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT FALSE;

-- Function to decompose monsters
CREATE OR REPLACE FUNCTION decompose_monsters(
    p_user_id UUID,
    p_monster_uids BIGINT[]
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_monster RECORD;
    v_monster_def RECORD;
    v_rewards JSONB := '{}'::JSONB;
    v_total_essence INT := 0;
    v_material_updates JSONB := '[]'::JSONB;
    v_deleted_count INT := 0;
    v_result JSONB;
BEGIN
    -- Loop through each monster UID
    FOR v_monster IN 
        SELECT * FROM player_monster 
        WHERE id = ANY(p_monster_uids) 
        AND user_id = p_user_id
        AND (is_locked IS FALSE OR is_locked IS NULL)
    LOOP
        -- Get monster definition
        SELECT * INTO v_monster_def FROM monster WHERE id = v_monster.monster_id;
        
        IF FOUND THEN
            -- Calculate Essence based on Rarity
            IF v_monster_def.rarity = 'N' THEN
                v_total_essence := v_total_essence + 1;
            ELSIF v_monster_def.rarity = 'R' THEN
                v_total_essence := v_total_essence + 3;
            ELSIF v_monster_def.rarity = 'SR' THEN
                v_total_essence := v_total_essence + 8;
            ELSIF v_monster_def.rarity = 'SSR' THEN
                v_total_essence := v_total_essence + 20;
            END IF;

            -- Calculate Shards based on Element (Example logic)
            -- Assuming we have element in monster definition or infer from type
            -- For now, giving a generic shard or specific if known. 
            -- Since element column might not exist on monster table yet, we use a simple mapping or skip.
            -- Let's assume we give 'shard_fire' for now as a placeholder or based on name check if element is missing.
            -- Ideally, monster table should have 'element'. If not, we skip shards or give random.
            -- Let's give 'spirit_dust' as a common fallback for now if element is unknown.
            
            -- TODO: Enhance this with actual element check when available.
            
            v_deleted_count := v_deleted_count + 1;
        END IF;
    END LOOP;

    -- Delete the monsters
    DELETE FROM player_monster 
    WHERE id = ANY(p_monster_uids) 
    AND user_id = p_user_id
    AND (is_locked IS FALSE OR is_locked IS NULL);

    -- Give Essence Reward
    IF v_total_essence > 0 THEN
        PERFORM add_materials(p_user_id, ARRAY[jsonb_build_object('id', 'essence', 'amount', v_total_essence)]);
    END IF;

    -- Construct Result
    v_result := jsonb_build_object(
        'success', true,
        'deleted_count', v_deleted_count,
        'rewards', jsonb_build_object('essence', v_total_essence)
    );

    RETURN v_result;

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;
