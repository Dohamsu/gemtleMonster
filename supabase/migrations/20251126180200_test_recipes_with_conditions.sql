-- ============================================
-- Test Recipe with Advanced Conditions
-- ============================================
-- This SQL creates example recipes demonstrating
-- the advanced alchemy condition system

-- ============================================
-- 1. Moonlight Slime (Night-time only)
-- ============================================

-- Insert recipe
INSERT INTO recipe (id, name, description, result_monster_id, result_count, base_success_rate, craft_time_sec, required_alchemy_level, exp_gain, is_hidden)
VALUES (
    'recipe_moonlight_slime',
    '문라이트 슬라임',
    '달빛이 비치는 밤에만 만들 수 있는 신비한 슬라임',
    'slime_moonlight',
    1,
    80,
    15,
    3,
    50,
    false
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description;

-- Add ingredients (using existing materials)
INSERT INTO recipe_ingredient (recipe_id, material_id, quantity)
VALUES 
    ('recipe_moonlight_slime', 'slime_core', 2),
    ('recipe_moonlight_slime', 'spirit_dust', 3)
ON CONFLICT DO NOTHING;

-- Add time condition: Only craftable between 22:00-04:00 (real world time)
INSERT INTO recipe_condition (recipe_id, condition_type, value_json, description)
VALUES (
    'recipe_moonlight_slime',
    'REAL_TIME_RANGE',
    '[22, 4]',
    '현실 시간 밤(22시~4시)에만 조합 가능'
)
ON CONFLICT DO NOTHING;

-- ============================================
-- 2. Weekend Slime (Weekend only)
-- ============================================

INSERT INTO recipe (id, name, description, result_monster_id, result_count, base_success_rate, craft_time_sec, required_alchemy_level, exp_gain, is_hidden)
VALUES (
    'recipe_weekend_slime',
    '주말 슬라임',
    '주말에만 만들 수 있는 느긋한 슬라임',
    'slime_weekend',
    1,
    90,
    10,
    1,
    30,
    false
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description;

INSERT INTO recipe_ingredient (recipe_id, material_id, quantity)
VALUES 
    ('recipe_weekend_slime', 'herb_common', 5),
    ('recipe_weekend_slime', 'slime_core', 1)
ON CONFLICT DO NOTHING;

-- Weekend only: Saturday (6) and Sunday (0)
INSERT INTO recipe_condition (recipe_id, condition_type, value_json, description)
VALUES (
    'recipe_weekend_slime',
    'WEEKDAY',
    '[0, 6]',
    '주말(토,일)에만 조합 가능'
)
ON CONFLICT DO NOTHING;

-- ============================================
-- 3. Mobile Slime (Mobile device only)
-- ============================================

INSERT INTO recipe (id, name, description, result_monster_id, result_count, base_success_rate, craft_time_sec, required_alchemy_level, exp_gain, is_hidden)
VALUES (
    'recipe_pocket_slime',
    '포켓 슬라임',
    '모바일 기기에서만 만들 수 있는 휴대용 슬라임',
    'slime_pocket',
    1,
    85,
    8,
    2,
    40,
    false
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description;

INSERT INTO recipe_ingredient (recipe_id, material_id, quantity)
VALUES 
    ('recipe_pocket_slime', 'slime_core', 2),
    ('recipe_pocket_slime', 'ore_iron', 1)
ON CONFLICT DO NOTHING;

-- Mobile device only
INSERT INTO recipe_condition (recipe_id, condition_type, value_text, description)
VALUES (
    'recipe_pocket_slime',
    'DEVICE_TYPE',
    'MOBILE',
    '모바일 기기에서만 조합 가능'
)
ON CONFLICT DO NOTHING;

-- ============================================
-- 4. Lazy Slime (AFK/Idle required)
-- ============================================

INSERT INTO recipe (id, name, description, result_monster_id, result_count, base_success_rate, craft_time_sec, required_alchemy_level, exp_gain, is_hidden)
VALUES (
    'recipe_lazy_slime',
    '게으른 슬라임',
    '5분 이상 방치한 후에만 만들 수 있는 느긋한 슬라임',
    'slime_lazy',
    1,
    95,
    5,
    1,
    35,
    false
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description;

INSERT INTO recipe_ingredient (recipe_id, material_id, quantity)
VALUES 
    ('recipe_lazy_slime', 'herb_common', 3),
    ('recipe_lazy_slime', 'slime_core', 1)
ON CONFLICT DO NOTHING;

-- 5 minutes (300 seconds) of idle time required
INSERT INTO recipe_condition (recipe_id, condition_type, value_int, description)
VALUES (
    'recipe_lazy_slime',
    'TAB_IDLE',
    300,
    '5분 이상 방치 필요'
)
ON CONFLICT DO NOTHING;

-- ============================================
-- 5. Dark Mode Slime (Dark theme only)
-- ============================================

INSERT INTO recipe (id, name, description, result_monster_id, result_count, base_success_rate, craft_time_sec, required_alchemy_level, exp_gain, is_hidden)
VALUES (
    'recipe_dark_slime',
    '다크 슬라임',
    '어두운 테마에서만 만들 수 있는 그림자 슬라임',
    'slime_dark',
    1,
    75,
    12,
    4,
    60,
    false
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description;

INSERT INTO recipe_ingredient (recipe_id, material_id, quantity)
VALUES 
    ('recipe_dark_slime', 'spirit_dust', 5),
    ('recipe_dark_slime', 'slime_core', 3)
ON CONFLICT DO NOTHING;

-- Dark mode enabled
INSERT INTO recipe_condition (recipe_id, condition_type, value_text, description)
VALUES (
    'recipe_dark_slime',
    'UI_PREFERENCE',
    'DARK_MODE',
    '다크 모드 사용 시에만 조합 가능'
)
ON CONFLICT DO NOTHING;

-- ============================================
-- Note: Monster entries would need to be added to the monster table
-- This is just an example showing how recipes with conditions are structured
-- ============================================
