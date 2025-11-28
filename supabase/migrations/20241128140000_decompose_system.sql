-- Add is_locked column to player_monster table
ALTER TABLE player_monster 
ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT FALSE;

-- Function to decompose monsters
CREATE OR REPLACE FUNCTION decompose_monsters(
    p_user_id UUID,
    p_monster_uids UUID[]
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_monster RECORD;
    v_rewards JSONB := '{}'::JSONB;
    v_total_essence INT := 0;
    v_deleted_count INT := 0;
    v_monster_id TEXT;
    v_rarity TEXT;
    v_element TEXT;
    v_base_material TEXT;
    v_base_amount INT;
    v_shard_id TEXT;
    v_shard_amount INT;
BEGIN
    -- Loop through each monster UID
    FOR v_monster IN 
        SELECT id, monster_id FROM player_monster 
        WHERE id = ANY(p_monster_uids) 
        AND user_id = p_user_id
        AND (is_locked IS FALSE OR is_locked IS NULL)
    LOOP
        v_monster_id := v_monster.monster_id;
        
        -- Determine rarity from monster_id pattern
        IF v_monster_id LIKE '%legendary%' OR v_monster_id LIKE '%ancient%' THEN
            v_rarity := 'SSR';
        ELSIF v_monster_id LIKE '%epic%' OR v_monster_id LIKE '%elder%' THEN
            v_rarity := 'SR';
        ELSIF v_monster_id LIKE '%rare%' OR v_monster_id LIKE '%warrior%' THEN
            v_rarity := 'R';
        ELSE
            v_rarity := 'N';
        END IF;

        -- Determine element from monster_id
        IF v_monster_id LIKE '%fire%' OR v_monster_id LIKE '%flame%' THEN
            v_element := 'fire';
        ELSIF v_monster_id LIKE '%water%' OR v_monster_id LIKE '%aqua%' THEN
            v_element := 'water';
        ELSIF v_monster_id LIKE '%earth%' OR v_monster_id LIKE '%stone%' THEN
            v_element := 'earth';
        ELSIF v_monster_id LIKE '%wind%' OR v_monster_id LIKE '%air%' THEN
            v_element := 'wind';
        ELSIF v_monster_id LIKE '%light%' OR v_monster_id LIKE '%holy%' THEN
            v_element := 'light';
        ELSIF v_monster_id LIKE '%dark%' OR v_monster_id LIKE '%shadow%' THEN
            v_element := 'dark';
        ELSE
            v_element := NULL;
        END IF;

        -- Calculate rewards based on rarity
        CASE v_rarity
            WHEN 'N' THEN
                v_total_essence := v_total_essence + 1;
                v_base_material := 'slime_fluid';
                v_base_amount := 1 + floor(random() * 2)::INT;
                v_shard_amount := 0;
            WHEN 'R' THEN
                v_total_essence := v_total_essence + 3;
                v_base_material := 'ore_iron';
                v_base_amount := 2 + floor(random() * 2)::INT;
                v_shard_amount := 1;
            WHEN 'SR' THEN
                v_total_essence := v_total_essence + 10;
                v_base_material := 'ore_magic';
                v_base_amount := 2;
                v_shard_amount := 3;
            WHEN 'SSR' THEN
                v_total_essence := v_total_essence + 30;
                v_base_material := 'gem_fragment';
                v_base_amount := 1;
                v_shard_amount := 5;
        END CASE;

        -- Add base material
        INSERT INTO player_material (user_id, material_id, quantity)
        VALUES (p_user_id, v_base_material, v_base_amount)
        ON CONFLICT (user_id, material_id)
        DO UPDATE SET quantity = player_material.quantity + v_base_amount;

        -- Update rewards JSON
        IF v_rewards ? v_base_material THEN
            v_rewards := jsonb_set(v_rewards, ARRAY[v_base_material], 
                to_jsonb((v_rewards->>v_base_material)::INT + v_base_amount));
        ELSE
            v_rewards := v_rewards || jsonb_build_object(v_base_material, v_base_amount);
        END IF;

        -- Add shard if applicable
        IF v_shard_amount > 0 AND v_element IS NOT NULL THEN
            v_shard_id := 'shard_' || v_element;
            
            INSERT INTO player_material (user_id, material_id, quantity)
            VALUES (p_user_id, v_shard_id, v_shard_amount)
            ON CONFLICT (user_id, material_id)
            DO UPDATE SET quantity = player_material.quantity + v_shard_amount;

            IF v_rewards ? v_shard_id THEN
                v_rewards := jsonb_set(v_rewards, ARRAY[v_shard_id], 
                    to_jsonb((v_rewards->>v_shard_id)::INT + v_shard_amount));
            ELSE
                v_rewards := v_rewards || jsonb_build_object(v_shard_id, v_shard_amount);
            END IF;
        END IF;

        v_deleted_count := v_deleted_count + 1;
    END LOOP;

    -- Delete the monsters
    DELETE FROM player_monster 
    WHERE id = ANY(p_monster_uids) 
    AND user_id = p_user_id
    AND (is_locked IS FALSE OR is_locked IS NULL);

    -- Add essence reward
    IF v_total_essence > 0 THEN
        INSERT INTO player_material (user_id, material_id, quantity)
        VALUES (p_user_id, 'essence', v_total_essence)
        ON CONFLICT (user_id, material_id)
        DO UPDATE SET quantity = player_material.quantity + v_total_essence;

        v_rewards := v_rewards || jsonb_build_object('essence', v_total_essence);
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'deleted_count', v_deleted_count,
        'rewards', v_rewards
    );

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION decompose_monsters(UUID, UUID[]) TO authenticated;
