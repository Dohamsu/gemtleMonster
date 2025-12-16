-- Migration: Add quantity support to perform_alchemy
-- Description: Updates perform_alchemy RPC to accept quantity parameter for batch crafting
-- Created at: 2025-12-16

-- Redefine perform_alchemy with quantity support
CREATE OR REPLACE FUNCTION perform_alchemy(
    p_user_id UUID,
    p_recipe_id TEXT, -- Can be NULL for experiments
    p_ingredients JSONB, -- { "material_id": quantity }
    p_success_rate INTEGER,
    p_quantity INTEGER DEFAULT 1 -- 대용량 제작 수량 (기본 1)
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
    v_total_exp_gain INTEGER;
    v_is_success BOOLEAN;
    v_fail_count INTEGER;
    v_result_monster_id TEXT;
    v_result_item_id TEXT;
    v_random_roll INTEGER;
    v_has_materials BOOLEAN;
    v_actual_quantity INTEGER;
    v_scaled_ingredients JSONB;
    v_key TEXT;
    v_value INTEGER;
BEGIN
    -- 수량 제한 (최대 10개)
    v_actual_quantity := LEAST(GREATEST(p_quantity, 1), 10);

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

    -- 2. Scale Ingredients by Quantity
    v_scaled_ingredients := '{}'::jsonb;
    FOR v_key, v_value IN SELECT key, value::integer FROM jsonb_each_text(p_ingredients)
    LOOP
        v_scaled_ingredients := v_scaled_ingredients || jsonb_build_object(v_key, v_value * v_actual_quantity);
    END LOOP;

    -- 3. Check Material Sufficiency with scaled ingredients
    v_has_materials := consume_materials(p_user_id, v_scaled_ingredients);
    
    IF NOT v_has_materials THEN
         RAISE EXCEPTION 'Insufficient materials';
    END IF;

    -- 4. Determine Success/Failure (소모품은 100% 성공으로 처리됨)
    IF p_recipe_id IS NULL THEN
        v_is_success := FALSE;
    ELSE
        v_random_roll := floor(random() * 100) + 1;
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

    -- 5. Handle Logic based on outcome
    IF v_is_success THEN
        v_exp_gain := v_recipe.exp_gain;
        v_total_exp_gain := v_exp_gain * v_actual_quantity; -- 수량만큼 경험치 획득
        
        IF v_recipe.result_item_id IS NOT NULL THEN
            -- Item Logic: 수량만큼 추가
            v_result_item_id := v_recipe.result_item_id;
            
            INSERT INTO player_material (user_id, material_id, quantity)
            VALUES (p_user_id, v_result_item_id, COALESCE(v_recipe.result_count, 1) * v_actual_quantity)
            ON CONFLICT (user_id, material_id)
            DO UPDATE SET quantity = player_material.quantity + EXCLUDED.quantity;
            
        ELSE
            -- Monster Logic: 몬스터는 1마리씩만 생성 (대용량 제작 미지원)
            v_result_monster_id := v_recipe.result_monster_id;
            v_total_exp_gain := v_exp_gain; -- 몬스터는 1마리 경험치만
            
            IF v_result_monster_id IS NOT NULL THEN
                 INSERT INTO player_monster (user_id, monster_id)
                 VALUES (p_user_id, v_result_monster_id);
            END IF;
        END IF;

        -- Update Recipe Stats
        INSERT INTO player_recipe (user_id, recipe_id, success_count, craft_count, is_discovered, first_discovered_at)
        VALUES (p_user_id, p_recipe_id, v_actual_quantity, v_actual_quantity, true, NOW())
        ON CONFLICT (user_id, recipe_id)
        DO UPDATE SET 
            success_count = player_recipe.success_count + v_actual_quantity,
            craft_count = player_recipe.craft_count + v_actual_quantity,
            is_discovered = true;

        -- Reset Consecutive Failures
        INSERT INTO player_resource (user_id, resource_id, amount)
        VALUES (p_user_id, 'alchemy_consecutive_failures', 0)
        ON CONFLICT (user_id, resource_id)
        DO UPDATE SET amount = 0;
        
        v_fail_count := 0;

    ELSE
        -- FAILURE LOGIC
        v_total_exp_gain := 0;
        
        IF p_recipe_id IS NOT NULL THEN
            v_exp_gain := GREATEST(FLOOR(v_recipe.exp_gain * 0.1), 1);
            v_total_exp_gain := v_exp_gain * v_actual_quantity;
            
            INSERT INTO player_recipe (user_id, recipe_id, craft_count, is_discovered)
            VALUES (p_user_id, p_recipe_id, v_actual_quantity, true)
            ON CONFLICT (user_id, recipe_id)
            DO UPDATE SET craft_count = player_recipe.craft_count + v_actual_quantity;
        ELSE
            v_total_exp_gain := 5 * v_actual_quantity;
        END IF;

        -- Increment Consecutive Failures
        INSERT INTO player_resource (user_id, resource_id, amount)
        VALUES (p_user_id, 'alchemy_consecutive_failures', v_actual_quantity)
        ON CONFLICT (user_id, resource_id)
        DO UPDATE SET amount = player_resource.amount + v_actual_quantity
        RETURNING amount INTO v_fail_count;

    END IF;

    -- 6. Grant Experience & Level Up
    v_new_exp := v_current_exp + v_total_exp_gain;
    v_new_level := 1 + FLOOR(v_new_exp / 100);

    UPDATE player_alchemy
    SET experience = v_new_exp,
        level = v_new_level,
        updated_at = NOW()
    WHERE user_id = p_user_id;

    -- 7. Log History
    INSERT INTO alchemy_history (user_id, recipe_id, success, success_rate_used, materials_used, result_monster_id, result_item_id)
    VALUES (p_user_id, p_recipe_id, v_is_success, p_success_rate, v_scaled_ingredients, v_result_monster_id, v_result_item_id);

    -- 8. Return Result
    RETURN jsonb_build_object(
        'success', v_is_success,
        'exp_gain', v_total_exp_gain,
        'new_level', v_new_level,
        'new_total_exp', v_new_exp,
        'result_monster_id', v_result_monster_id,
        'result_item_id', v_result_item_id,
        'fail_count', v_fail_count,
        'quantity', v_actual_quantity -- 실제 제작 수량 반환
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
