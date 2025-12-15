-- Add type column to recipe table
ALTER TABLE recipe ADD COLUMN IF NOT EXISTS type TEXT CHECK (type IN ('MONSTER', 'ITEM')) DEFAULT 'MONSTER';

-- Add result_item_id column
ALTER TABLE recipe ADD COLUMN IF NOT EXISTS result_item_id TEXT;

-- Make result_monster_id nullable (since items don't produce monsters)
ALTER TABLE recipe ALTER COLUMN result_monster_id DROP NOT NULL;

-- Insert Potion Recipes
INSERT INTO recipe (id, name, description, type, result_item_id, result_count, base_success_rate, craft_time_sec, cost_gold, required_alchemy_level, exp_gain, is_hidden, priority)
VALUES 
(
    'recipe_potion_hp_small', 
    '소형 체력 포션', 
    '체력을 회복시켜주는 작은 물약.', 
    'ITEM', 
    'potion_hp_small', 
    1, 
    100, 
    3, 
    10, 
    1, 
    5, 
    false, 
    100
)
ON CONFLICT (id) DO UPDATE SET
    type = EXCLUDED.type,
    result_item_id = EXCLUDED.result_item_id,
    result_monster_id = NULL,
    required_alchemy_level = 1; -- Ensure restrictions are removed as requested

INSERT INTO recipe (id, name, description, type, result_item_id, result_count, base_success_rate, craft_time_sec, cost_gold, required_alchemy_level, exp_gain, is_hidden, priority)
VALUES 
(
    'recipe_potion_mp_small', 
    '소형 마나 포션', 
    '마나를 회복시켜주는 작은 물약.', 
    'ITEM', 
    'potion_mp_small', 
    1, 
    100, 
    5, 
    20, 
    1, -- Lv.1 as requested
    8, 
    false, 
    99
)
ON CONFLICT (id) DO UPDATE SET
    type = EXCLUDED.type,
    result_item_id = EXCLUDED.result_item_id,
    result_monster_id = NULL,
    required_alchemy_level = 1;

-- Insert Ingredients for HP Potion (Common Herb x2, Slime Fluid x1)
-- Assuming recipe_ingredient id is auto-increment
-- We need to check if they exist, or delete and re-insert for the recipe.
DELETE FROM recipe_ingredient WHERE recipe_id IN ('recipe_potion_hp_small', 'recipe_potion_mp_small');

INSERT INTO recipe_ingredient (recipe_id, material_id, quantity)
VALUES
('recipe_potion_hp_small', 'herb_common', 2),
('recipe_potion_hp_small', 'slime_fluid', 1),
('recipe_potion_mp_small', 'herb_common', 2),
('recipe_potion_mp_small', 'crystal_mana', 1);
