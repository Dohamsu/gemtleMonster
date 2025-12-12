-- Migration: Fix Alchemy Failure Logic (Updated)
-- Description: Redefines 'perform_alchemy' to handle failures gracefully and allow NULL recipe_id (experimentation).
--              Also relaxes NOT NULL constraint on alchemy_history.recipe_id.
-- Created at: 2025-12-12

-- 1. Relax NOT NULL constraint on alchemy_history.recipe_id
DO $$ 
BEGIN 
    ALTER TABLE alchemy_history ALTER COLUMN recipe_id DROP NOT NULL;
EXCEPTION
    WHEN others THEN NULL; -- Ignore if already nullable or other issues
END $$;

-- 2. Redefine perform_alchemy
CREATE OR REPLACE FUNCTION perform_alchemy(
    p_user_id UUID,
    p_recipe_id TEXT, -- Can be NULL now
    p_ingredients JSONB, -- { "material_id": quantity }
    p_success_rate INTEGER
)
RETURNS JSONB AS $$
DECLARE
    v_recipe RECORD;
    v_player_alchemy RECORD;
    v_current_exp BIGINT;
    v_current_level INTEGER;
    v_new_exp BIGINT;
    v_new_level INTEGER;
    v_exp_gain INTEGER;
    v_is_success BOOLEAN;
    v_fail_count INTEGER;
    v_result_monster_id TEXT;
    v_random_roll INTEGER;
    v_has_materials BOOLEAN;
BEGIN
    -- 1. Get Recipe Info (If ID provided)
    IF p_recipe_id IS NOT NULL THEN
        SELECT * INTO v_recipe FROM recipe WHERE id = p_recipe_id;
        IF NOT FOUND THEN
            RAISE EXCEPTION 'Recipe not found';
        END IF;
    ELSE
        -- No recipe matched -> Guaranteed Failure
        v_recipe := NULL;
    END IF;

    -- 2. Check Material Sufficiency
    v_has_materials := consume_materials(p_user_id, p_ingredients);
    
    IF NOT v_has_materials THEN
         RAISE EXCEPTION 'Insufficient materials';
    END IF;

    -- 3. Determine Success/Failure
    IF p_recipe_id IS NULL THEN
        -- Guaranteed failure if no recipe matched
        v_is_success := FALSE;
    ELSE
        -- Roll for success
        v_random_roll := floor(random() * 100) + 1; -- 1 to 100
        v_is_success := v_random_roll <= p_success_rate;
    END IF;

    -- Get current alchemy stats
    SELECT * INTO v_player_alchemy FROM player_alchemy WHERE user_id = p_user_id;
    IF NOT FOUND THEN
        INSERT INTO player_alchemy (user_id, level, experience) VALUES (p_user_id, 1, 0)
        RETURNING * INTO v_player_alchemy;
    END IF;

    v_current_exp := v_player_alchemy.experience;

    -- 4. Handle Logic based on outcome
    IF v_is_success THEN
        -- SUCCESS LOGIC
        v_exp_gain := v_recipe.exp_gain;
        v_result_monster_id := v_recipe.result_monster_id;

        -- Create Monster
        INSERT INTO player_monster (user_id, monster_id)
        VALUES (p_user_id, v_result_monster_id);

        -- Update Recipe Stats
        INSERT INTO player_recipe (user_id, recipe_id, success_count, craft_count, is_discovered, first_discovered_at)
        VALUES (p_user_id, p_recipe_id, 1, 1, true, NOW())
        ON CONFLICT (user_id, recipe_id)
        DO UPDATE SET 
            success_count = player_recipe.success_count + 1,
            craft_count = player_recipe.craft_count + 1,
            is_discovered = true;

        -- Reset Consecutive Failures
        INSERT INTO player_resource (user_id, resource_id, amount)
        VALUES (p_user_id, 'alchemy_consecutive_failures', 0)
        ON CONFLICT (user_id, resource_id)
        DO UPDATE SET amount = 0;
        
        v_fail_count := 0;

    ELSE
        -- FAILURE LOGIC
        v_result_monster_id := NULL;
        
        -- Calculate partial XP
        IF p_recipe_id IS NOT NULL THEN
            v_exp_gain := GREATEST(FLOOR(v_recipe.exp_gain * 0.1), 1);
            
            -- Update Recipe Stats (Craft Count only)
            INSERT INTO player_recipe (user_id, recipe_id, craft_count, is_discovered)
            VALUES (p_user_id, p_recipe_id, 1, true)
            ON CONFLICT (user_id, recipe_id)
            DO UPDATE SET craft_count = player_recipe.craft_count + 1;
        ELSE
            -- No recipe matched = minimal Failure XP
            v_exp_gain := 5; -- Fixed small amount for experimentation failure
        END IF;

        -- Increment Consecutive Failures
        INSERT INTO player_resource (user_id, resource_id, amount)
        VALUES (p_user_id, 'alchemy_consecutive_failures', 1)
        ON CONFLICT (user_id, resource_id)
        DO UPDATE SET amount = player_resource.amount + 1
        RETURNING amount INTO v_fail_count;

    END IF;

    -- 5. Grant Experience & Level Up
    v_new_exp := v_current_exp + v_exp_gain;
    v_new_level := 1 + FLOOR(v_new_exp / 100);

    UPDATE player_alchemy
    SET experience = v_new_exp,
        level = v_new_level,
        updated_at = NOW()
    WHERE user_id = p_user_id;

    -- 6. Log History
    INSERT INTO alchemy_history (user_id, recipe_id, success, success_rate_used, materials_used, result_monster_id)
    VALUES (p_user_id, p_recipe_id, v_is_success, p_success_rate, p_ingredients, v_result_monster_id);

    -- 7. Return Result
    RETURN jsonb_build_object(
        'success', v_is_success,
        'exp_gain', v_exp_gain,
        'new_level', v_new_level,
        'new_total_exp', v_new_exp,
        'result_monster_id', v_result_monster_id,
        'fail_count', v_fail_count
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
