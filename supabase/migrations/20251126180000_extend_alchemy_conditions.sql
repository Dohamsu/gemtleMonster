-- ============================================
-- Advanced Alchemy Conditions Migration
-- ============================================
-- This migration extends the alchemy system to support
-- context-aware conditions as defined in unionRule.md

-- ============================================
-- 1. Add sell_price to material table
-- ============================================

ALTER TABLE material
ADD COLUMN IF NOT EXISTS sell_price INTEGER DEFAULT NULL;

COMMENT ON COLUMN material.sell_price IS '판매 가격 (골드)';

-- ============================================
-- 2. Backup existing recipe_condition data
-- ============================================

CREATE TEMP TABLE recipe_condition_backup AS
SELECT * FROM recipe_condition;

-- ============================================
-- 3. Drop and recreate recipe_condition table
-- ============================================

DROP TABLE IF EXISTS recipe_condition CASCADE;

CREATE TABLE recipe_condition (
    id BIGSERIAL PRIMARY KEY,
    recipe_id TEXT NOT NULL REFERENCES recipe(id) ON DELETE CASCADE,
    
    -- Condition type (expanded to support all unionRule.md types)
    condition_type TEXT NOT NULL,
    
    -- Flexible value storage
    value_int INTEGER,              -- For numeric values (temperature, streak days, fail count, etc.)
    value_float REAL,               -- For decimal values (if needed)
    value_text TEXT,                -- For string values (country code, weather type, platform, etc.)
    value_json JSONB,               -- For complex values (time ranges [22,4], weekday arrays [0,6], etc.)
    value_bool BOOLEAN,             -- For boolean flags
    
    -- Optional description for debugging/UI hints
    description TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_recipe_condition_recipe_id ON recipe_condition(recipe_id);
CREATE INDEX idx_recipe_condition_type ON recipe_condition(condition_type);

-- Add comment
COMMENT ON TABLE recipe_condition IS '레시피 조합 조건 (시간, 날씨, 디바이스, 세션 등)';

-- ============================================
-- 4. Migrate old data to new format
-- ============================================

-- Skipped for dev environment to avoid column errors
-- If you need to migrate data, ensure the source columns exist
-- or manually migrate using a separate script.

/*
-- Migrate time_range conditions
INSERT INTO recipe_condition (recipe_id, condition_type, value_json, description)
SELECT 
    recipe_id,
    'TIME_RANGE' AS condition_type,
    jsonb_build_array(
        EXTRACT(HOUR FROM time_start)::INTEGER,
        EXTRACT(HOUR FROM time_end)::INTEGER
    ) AS value_json,
    '게임 내 시간 범위' AS description
FROM recipe_condition_backup
WHERE condition_type = 'time_range' AND time_start IS NOT NULL;

-- Migrate language conditions
INSERT INTO recipe_condition (recipe_id, condition_type, value_json, description)
SELECT 
    recipe_id,
    'GEO_COUNTRY' AS condition_type,
    jsonb_build_array(language_code) AS value_json,
    '언어/국가 조건' AS description
FROM recipe_condition_backup
WHERE condition_type = 'language' AND language_code IS NOT NULL;

-- Migrate event conditions
INSERT INTO recipe_condition (recipe_id, condition_type, value_text, description)
SELECT 
    recipe_id,
    'EVENT_FLAG' AS condition_type,
    event_flag AS value_text,
    '이벤트 플래그 조건' AS description
FROM recipe_condition_backup
WHERE condition_type = 'event' AND event_flag IS NOT NULL;

-- Migrate alchemy_level conditions
INSERT INTO recipe_condition (recipe_id, condition_type, value_int, description)
SELECT 
    recipe_id,
    'ALCHEMY_LEVEL' AS condition_type,
    min_alchemy_level AS value_int,
    '최소 연금술 레벨 요구' AS description
FROM recipe_condition_backup
WHERE condition_type = 'alchemy_level' AND min_alchemy_level IS NOT NULL;
*/

-- ============================================
-- 5. Example conditions for new types
-- ============================================

-- These are examples showing how to insert new condition types
-- Uncomment and modify as needed for your recipes

/*
-- Example: Night-time only recipe (real world time 22:00 - 04:00)
INSERT INTO recipe_condition (recipe_id, condition_type, value_json, description)
VALUES ('moonlight_slime', 'REAL_TIME_RANGE', '[22, 4]', '현실 시간 밤에만 조합 가능');

-- Example: Rainy weather only
INSERT INTO recipe_condition (recipe_id, condition_type, value_json, description)
VALUES ('rain_slime', 'REAL_WEATHER', '["RAIN", "STORM"]', '비 오는 날에만 조합 가능');

-- Example: Mobile device only
INSERT INTO recipe_condition (recipe_id, condition_type, value_text, description)
VALUES ('pocket_slime', 'DEVICE_TYPE', 'MOBILE', '모바일에서만 조합 가능');

-- Example: Weekend only (Saturday, Sunday)
INSERT INTO recipe_condition (recipe_id, condition_type, value_json, description)
VALUES ('weekend_slime', 'WEEKDAY', '[0, 6]', '주말에만 조합 가능');

-- Example: 5+ login streak
INSERT INTO recipe_condition (recipe_id, condition_type, value_int, description)
VALUES ('loyal_slime', 'LOGIN_STREAK', 5, '5일 이상 연속 접속');

-- Example: Tab idle for 5 minutes
INSERT INTO recipe_condition (recipe_id, condition_type, value_int, description)
VALUES ('lazy_slime', 'TAB_IDLE', 300, '5분 이상 방치');

-- Example: High temperature (over 30°C)
INSERT INTO recipe_condition (recipe_id, condition_type, value_int, description)
VALUES ('heat_slime', 'REAL_TEMPERATURE', 30, '30도 이상 고온');

-- Example: Dark mode enabled
INSERT INTO recipe_condition (recipe_id, condition_type, value_text, description)
VALUES ('dark_slime', 'UI_PREFERENCE', 'DARK_MODE', '다크 모드 사용 중');

-- Example: Recent failures (3+)
INSERT INTO recipe_condition (recipe_id, condition_type, value_int, description)
VALUES ('consolation_slime', 'RECENT_FAIL_COUNT', 3, '최근 3회 이상 실패');
*/

-- ============================================
-- 6. Helper Views (Optional)
-- ============================================

-- View for recipes with time conditions
CREATE OR REPLACE VIEW recipes_with_time_conditions AS
SELECT 
    r.id AS recipe_id,
    r.name AS recipe_name,
    rc.condition_type,
    rc.value_json,
    rc.description
FROM recipe r
JOIN recipe_condition rc ON r.id = rc.recipe_id
WHERE rc.condition_type IN ('TIME_RANGE', 'REAL_TIME_RANGE');

-- View for recipes with location/language conditions
CREATE OR REPLACE VIEW recipes_with_location_conditions AS
SELECT 
    r.id AS recipe_id,
    r.name AS recipe_name,
    rc.condition_type,
    rc.value_json,
    rc.value_text,
    rc.description
FROM recipe r
JOIN recipe_condition rc ON r.id = rc.recipe_id
WHERE rc.condition_type IN ('GEO_COUNTRY', 'PLATFORM');

-- ============================================
-- 7. Validation Function
-- ============================================

CREATE OR REPLACE FUNCTION validate_recipe_condition()
RETURNS TRIGGER AS $$
BEGIN
    -- Ensure at least one value column is set
    IF (NEW.value_int IS NULL AND 
        NEW.value_float IS NULL AND 
        NEW.value_text IS NULL AND 
        NEW.value_json IS NULL AND 
        NEW.value_bool IS NULL) THEN
        RAISE EXCEPTION 'At least one value column must be set for condition type %', NEW.condition_type;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_recipe_condition_before_insert
BEFORE INSERT ON recipe_condition
FOR EACH ROW
EXECUTE FUNCTION validate_recipe_condition();

-- ============================================
-- 8. Drop temp backup table
-- ============================================

DROP TABLE IF EXISTS recipe_condition_backup;

-- ============================================
-- Migration Complete
-- ============================================

-- Update material.sell_price for existing materials (optional, update as needed)
UPDATE material SET sell_price = 10 WHERE id = 'herb_common';
UPDATE material SET sell_price = 25 WHERE id = 'slime_core';
UPDATE material SET sell_price = 30 WHERE id = 'ore_iron';
UPDATE material SET sell_price = 100 WHERE id = 'crystal_mana';
UPDATE material SET sell_price = 80 WHERE id = 'spirit_dust';
UPDATE material SET sell_price = 50 WHERE id = 'mushroom_blue';
