-- ============================================
-- Add sell_price column to material table
-- ============================================

-- Add sell_price column
ALTER TABLE material
ADD COLUMN IF NOT EXISTS sell_price INTEGER NOT NULL DEFAULT 0 CHECK (sell_price >= 0);

-- Update sell prices based on rarity
-- COMMON: 10-20G
UPDATE material SET sell_price = 10 WHERE id = 'herb_common';
UPDATE material SET sell_price = 10 WHERE id = 'ore_iron';
UPDATE material SET sell_price = 12 WHERE id = 'beast_fang';
UPDATE material SET sell_price = 15 WHERE id = 'slime_core';
UPDATE material SET sell_price = 15 WHERE id = 'slime_gel';

-- UNCOMMON: 30-50G
UPDATE material SET sell_price = 35 WHERE id = 'mushroom_blue';
UPDATE material SET sell_price = 40 WHERE id = 'crystal_mana';
UPDATE material SET sell_price = 35 WHERE id = 'claw_sharp';
UPDATE material SET sell_price = 35 WHERE id = 'hide_tough';
UPDATE material SET sell_price = 45 WHERE id = 'spirit_dust';

-- RARE: 80-150G
UPDATE material SET sell_price = 100 WHERE id = 'herb_rare';
UPDATE material SET sell_price = 120 WHERE id = 'seed_ancient';
UPDATE material SET sell_price = 150 WHERE id = 'ore_mythril';
UPDATE material SET sell_price = 130 WHERE id = 'slime_mutant';
UPDATE material SET sell_price = 140 WHERE id = 'soul_fragment';

-- EPIC: 200-400G
UPDATE material SET sell_price = 300 WHERE id = 'herb_special';
UPDATE material SET sell_price = 350 WHERE id = 'gem_dark';
UPDATE material SET sell_price = 320 WHERE id = 'crown_fragment';
UPDATE material SET sell_price = 380 WHERE id = 'essence_light';

-- LEGENDARY: 1000G+
UPDATE material SET sell_price = 1500 WHERE id = 'bone_dragon';
UPDATE material SET sell_price = 2000 WHERE id = 'rune_world';
UPDATE material SET sell_price = 1800 WHERE id = 'catalyst_time';

-- Additional materials
UPDATE material SET sell_price = 350 WHERE id = 'core_fire'; -- EPIC
UPDATE material SET sell_price = 110 WHERE id = 'flower_moonlight'; -- RARE
UPDATE material SET sell_price = 38 WHERE id = 'scale_serpent'; -- UNCOMMON

-- Create index for sell_price
CREATE INDEX IF NOT EXISTS idx_material_sell_price ON material(sell_price);

-- Verify the update
SELECT id, name, rarity, sell_price
FROM material
ORDER BY sell_price DESC, rarity;
