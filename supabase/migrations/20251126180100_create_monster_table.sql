-- ============================================
-- Create Monster Master Table
-- ============================================
-- This migration creates the monster master data table
-- with support for images and detailed stats

-- 1. Create monster table
CREATE TABLE IF NOT EXISTS monster (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    element TEXT NOT NULL CHECK (element IN ('FIRE', 'WATER', 'EARTH', 'WIND', 'LIGHT', 'DARK', 'CHAOS')),
    role TEXT NOT NULL CHECK (role IN ('TANK', 'DPS', 'SUPPORT', 'HYBRID', 'PRODUCTION')),
    rarity TEXT NOT NULL CHECK (rarity IN ('N', 'R', 'SR', 'SSR')),
    
    -- Image/Icon
    icon_url TEXT,
    
    -- Base Stats
    base_hp INTEGER NOT NULL DEFAULT 100,
    base_atk INTEGER NOT NULL DEFAULT 10,
    base_def INTEGER NOT NULL DEFAULT 10,
    
    -- Factory Trait (for production monsters)
    factory_trait_target TEXT, -- facility ID
    factory_trait_effect TEXT, -- e.g., 'production_speed', 'output_multiplier'
    factory_trait_value NUMERIC, -- multiplier or bonus value
    
    -- Meta
    is_special BOOLEAN DEFAULT FALSE, -- Special/Limited monsters
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_monster_element ON monster(element);
CREATE INDEX idx_monster_role ON monster(role);
CREATE INDEX idx_monster_rarity ON monster(rarity);

-- ============================================
-- Seed some example monsters (Moved before FK constraint)
-- ============================================

-- Existing Monsters (from monsterData.ts) - Required for FK integrity
INSERT INTO monster (id, name, description, element, role, rarity, base_hp, base_atk, base_def, icon_url)
VALUES 
    ('monster_slime_basic', '기본 슬라임', '가장 기초적인 슬라임 몬스터. 던전 입문에 적합합니다.', 'EARTH', 'TANK', 'N', 150, 20, 30, '/assets/monsters/slime_basic.png'),
    ('monster_hound_fang', '송곳니 하운드', '민첩한 공격형 몬스터. 빠른 공격이 특징입니다.', 'WIND', 'DPS', 'N', 100, 45, 15, '/assets/monsters/hound_basic.png'),
    ('monster_golem_stone', '돌 골렘', '단단한 방어형 골렘. 높은 방어력으로 팀을 지킵니다.', 'EARTH', 'TANK', 'N', 250, 25, 60, '/assets/stoneGolem.png'),
    ('monster_fairy_spirit', '정령 요정', '회복과 버프를 제공하는 서포트 몬스터.', 'LIGHT', 'SUPPORT', 'N', 80, 15, 20, '/assets/monsters/fairySpirit.png'),
    ('monster_wolf_dark', '어둠 늑대', '어둠 속성의 강력한 딜러. 치명타에 특화되어 있습니다.', 'DARK', 'DPS', 'N', 120, 60, 25, '/assets/monsters/wolf_dark.png'),
    ('monster_slime_king', '왕슬라임', '슬라임의 왕. 강력한 탱커이자 리더입니다.', 'EARTH', 'TANK', 'R', 350, 35, 70, '/assets/monsters/slime_king.png'),
    ('monster_golem_magma', '마그마 골렘', '불 속성의 공격형 골렘. 화염 공격으로 적을 태웁니다.', 'FIRE', 'DPS', 'R', 200, 70, 40, '/assets/ironGolem.png'),
    ('monster_slime_nightmare', '악몽 슬라임', '심야에만 만들 수 있는 디버프 특화 몬스터.', 'DARK', 'DPS', 'R', 180, 55, 35, '/assets/monsters/slime_nightmare.png'),
    ('monster_fairy_dawn', '새벽 정령', '새벽에만 소환 가능한 경험치 버프 정령.', 'LIGHT', 'SUPPORT', 'R', 90, 20, 25, '/assets/monsters/fairy_dawn.png'),
    ('monster_guardian_tiger', '호랑이 수호령', '한국 언어에서만 생성되는 치명타 특화 수호령.', 'WIND', 'DPS', 'SR', 300, 85, 50, '/assets/monsters/guardian_tiger.png'),
    ('monster_golem_wood', '나무 골렘', '숲의 정령이 깃든 골렘. 자연의 힘으로 아군을 보호합니다.', 'EARTH', 'SUPPORT', 'R', 180, 30, 45, '/assets/woodGolem.png')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon_url = EXCLUDED.icon_url;

-- Basic Slimes
INSERT INTO monster (id, name, description, element, role, rarity, base_hp, base_atk, base_def, icon_url)
VALUES 
    ('slime_fire', '파이어 슬라임', '불꽃을 품은 작은 슬라임', 'FIRE', 'DPS', 'N', 100, 15, 5, '/assets/monsters/slime_basic.png'),
    ('slime_water', '워터 슬라임', '물방울처럼 촉촉한 슬라임', 'WATER', 'SUPPORT', 'N', 120, 8, 10, '/assets/monsters/slime_basic.png'),
    ('slime_earth', '어스 슬라임', '돌처럼 단단한 슬라임', 'EARTH', 'TANK', 'N', 150, 10, 20, '/assets/monsters/slime_basic.png')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon_url = EXCLUDED.icon_url;

-- Special condition-based monsters (from test recipes)
INSERT INTO monster (id, name, description, element, role, rarity, base_hp, base_atk, base_def, icon_url)
VALUES 
    ('slime_moonlight', '문라이트 슬라임', '달빛을 받아 태어난 신비한 슬라임', 'LIGHT', 'SUPPORT', 'R', 130, 12, 12, '/assets/monsters/slime_basic.png'),
    ('slime_weekend', '주말 슬라임', '여유로운 주말의 기운을 가진 슬라임', 'EARTH', 'HYBRID', 'N', 110, 10, 10, '/assets/monsters/slime_basic.png'),
    ('slime_pocket', '포켓 슬라임', '작고 귀여운 휴대용 슬라임', 'WIND', 'PRODUCTION', 'R', 80, 8, 8, '/assets/monsters/slime_basic.png'),
    ('slime_lazy', '게으른 슬라임', '느릿느릿 움직이는 슬라임', 'EARTH', 'TANK', 'N', 140, 5, 15, '/assets/monsters/slime_basic.png'),
    ('slime_dark', '다크 슬라임', '어둠의 힘을 가진 슬라임', 'DARK', 'DPS', 'SR', 110, 18, 8, '/assets/monsters/slime_basic.png')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon_url = EXCLUDED.icon_url;

-- Production monsters with factory traits
INSERT INTO monster (id, name, description, element, role, rarity, base_hp, base_atk, base_def, factory_trait_target, factory_trait_effect, factory_trait_value, icon_url)
VALUES 
    ('slime_farmer', '농부 슬라임', '허브 농장을 도와주는 슬라임', 'EARTH', 'PRODUCTION', 'R', 100, 8, 10, 'herb_farm', 'production_speed', 1.2, '/assets/monsters/slime_basic.png'),
    ('slime_miner', '광부 슬라임', '광산 작업을 도와주는 슬라임', 'EARTH', 'PRODUCTION', 'R', 120, 10, 15, 'ore_mine', 'output_multiplier', 1.15, '/assets/monsters/slime_basic.png')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    factory_trait_target = EXCLUDED.factory_trait_target,
    factory_trait_effect = EXCLUDED.factory_trait_effect,
    factory_trait_value = EXCLUDED.factory_trait_value,
    icon_url = EXCLUDED.icon_url;

-- 2. Update player_monster to reference monster table
ALTER TABLE player_monster
DROP CONSTRAINT IF EXISTS player_monster_monster_id_fkey;

ALTER TABLE player_monster
ADD CONSTRAINT player_monster_monster_id_fkey
FOREIGN KEY (monster_id) REFERENCES monster(id) ON DELETE CASCADE;

-- 3. Update triggers
CREATE TRIGGER update_monster_updated_at BEFORE UPDATE ON monster
    FOR EACH ROW EXECUTE FUNCTION update_alchemy_updated_at();

-- 4. Add RLS (if needed - monsters are public data usually)
-- Monsters are typically public, so we don't need RLS
-- But we can enable it for future extensibility
ALTER TABLE monster ENABLE ROW LEVEL SECURITY;

-- Everyone can view monsters
CREATE POLICY "Monsters are viewable by everyone"
    ON monster FOR SELECT
    USING (true);

-- Only admins can insert/update monsters (requires service role)
-- No policy here means only service_role can modify
