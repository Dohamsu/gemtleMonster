-- Migration: Fix perform_alchemy for Item Recipes
-- Description: Updates perform_alchemy RPC to handle 'ITEM' type recipes correctly by adding to player_material
--              instead of player_monster. Also adds result_item_id to alchemy_history.
-- Created at: 2025-12-15

-- 1. Add result_item_id to alchemy_history
ALTER TABLE alchemy_history ADD COLUMN IF NOT EXISTS result_item_id TEXT;

-- 2. Redefine perform_alchemy
CREATE OR REPLACE FUNCTION perform_alchemy(
    p_user_id UUID,
    p_recipe_id TEXT, -- Can be NULL for experiments
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
    v_result_item_id TEXT;
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
    -- (Assumes consume_materials function handles the actual deduction or check)
    -- Wait, consume_materials in previous migration was likely doing the deduction?
    -- No, consume_materials RPC usually does deduction. Here we call it?
    -- Previous RPC used: v_has_materials := consume_materials(p_user_id, p_ingredients);
    -- This means the materials ARE consumed here inside the transaction.
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
    v_result_monster_id := NULL;
    v_result_item_id := NULL;

    -- 4. Handle Logic based on outcome
    IF v_is_success THEN
        -- SUCCESS LOGIC
        v_exp_gain := v_recipe.exp_gain;
        
        -- Check Logic Type: Item or Monster
        IF v_recipe.result_item_id IS NOT NULL THEN
            -- Item Logic
            v_result_item_id := v_recipe.result_item_id;
            
            -- Add Item to Inventory
            INSERT INTO player_material (user_id, material_id, quantity)
            VALUES (p_user_id, v_result_item_id, COALESCE(v_recipe.result_count, 1))
            ON CONFLICT (user_id, material_id)
            DO UPDATE SET quantity = player_material.quantity + EXCLUDED.quantity;
            
        ELSE
            -- Monster Logic
            v_result_monster_id := v_recipe.result_monster_id;
            
            -- Valid Check
            IF v_result_monster_id IS NOT NULL THEN
                 INSERT INTO player_monster (user_id, monster_id)
                 VALUES (p_user_id, v_result_monster_id);
            END IF;
        END IF;

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
            v_exp_gain := 5; 
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
    INSERT INTO alchemy_history (user_id, recipe_id, success, success_rate_used, materials_used, result_monster_id, result_item_id)
    VALUES (p_user_id, p_recipe_id, v_is_success, p_success_rate, p_ingredients, v_result_monster_id, v_result_item_id);

    -- 7. Return Result
    RETURN jsonb_build_object(
        'success', v_is_success,
        'exp_gain', v_exp_gain,
        'new_level', v_new_level,
        'new_total_exp', v_new_exp,
        'result_monster_id', v_result_monster_id,
        'result_item_id', v_result_item_id,
        'fail_count', v_fail_count
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
