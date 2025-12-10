-- ============================================
-- Add Device Type Conditions for Platform-Specific Recipes
-- ============================================
-- This migration adds DEVICE_TYPE conditions to Mobile Slime and PC Golem recipes
-- that were missing from the recipe_condition table

-- ============================================
-- 1. Mobile Slime (MOBILE only)
-- ============================================

-- Add MOBILE condition for recipe_slime_mobile
INSERT INTO recipe_condition (recipe_id, condition_type, value_text, description)
VALUES (
    'recipe_slime_mobile',
    'DEVICE_TYPE',
    'MOBILE',
    '모바일 기기에서만 조합 가능'
)
ON CONFLICT DO NOTHING;

-- ============================================  
-- 2. PC/Desktop Golem (DESKTOP only)
-- ============================================

-- Add DESKTOP condition for recipe_golem_desktop
INSERT INTO recipe_condition (recipe_id, condition_type, value_text, description)
VALUES (
    'recipe_golem_desktop',
    'DEVICE_TYPE',
    'DESKTOP',
    '데스크톱에서만 조합 가능'
)
ON CONFLICT DO NOTHING;

-- ============================================
-- Verification Query (run manually to check)
-- ============================================
-- SELECT r.name, rc.condition_type, rc.value_text 
-- FROM recipe r 
-- JOIN recipe_condition rc ON r.id = rc.recipe_id 
-- WHERE rc.condition_type = 'DEVICE_TYPE';
