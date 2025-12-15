-- Migration: Update Consumable Family & Fix Constraint
-- Description: Updates the check constraint on material family to allow 'CONSUMABLE',
--              then updates potion items to have family='CONSUMABLE'.
-- Created at: 2025-12-15

-- 1. Drop existing check constraint
ALTER TABLE material DROP CONSTRAINT IF EXISTS material_family_check;

-- 2. Add updated check constraint including 'CONSUMABLE'
ALTER TABLE material ADD CONSTRAINT material_family_check 
    CHECK (family IN ('PLANT', 'MINERAL', 'BEAST', 'SLIME', 'SPIRIT', 'SPECIAL', 'CONSUMABLE'));

-- 3. Update existing potions to CONSUMABLE family
UPDATE material
SET family = 'CONSUMABLE'
WHERE id IN (
    'potion_hp_small',
    'potion_mp_small',
    'potion_stamina',
    'potion_ironskin',
    'potion_light'
);
