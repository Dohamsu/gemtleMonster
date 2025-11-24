-- ============================================
-- 연금술 시스템 Database Schema
-- ============================================

-- 1. material 테이블: 재료 마스터 데이터
CREATE TABLE IF NOT EXISTS material (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    family TEXT NOT NULL CHECK (family IN ('PLANT', 'MINERAL', 'BEAST', 'SLIME', 'SPIRIT')),
    rarity TEXT NOT NULL CHECK (rarity IN ('COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY')),
    icon_url TEXT,
    source_info JSONB, -- 획득처 정보 { "dungeonDrop": ["dungeon_1"], "factoryProduction": ["herb_farm"] }
    is_special BOOLEAN DEFAULT FALSE, -- 특수 재료 여부
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_material_family ON material(family);
CREATE INDEX idx_material_rarity ON material(rarity);

-- 2. recipe 테이블: 연금 레시피 마스터 데이터
CREATE TABLE IF NOT EXISTS recipe (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    result_monster_id TEXT NOT NULL, -- 결과 몬스터 ID (추후 monster 테이블과 연동)
    result_count INTEGER DEFAULT 1,
    base_success_rate INTEGER NOT NULL DEFAULT 70 CHECK (base_success_rate >= 0 AND base_success_rate <= 100),
    craft_time_sec INTEGER NOT NULL DEFAULT 10,
    cost_gold INTEGER NOT NULL DEFAULT 0,
    required_alchemy_level INTEGER DEFAULT 1,
    exp_gain INTEGER DEFAULT 10,
    is_hidden BOOLEAN DEFAULT FALSE, -- 숨겨진 레시피 여부
    is_discovered BOOLEAN DEFAULT FALSE, -- 발견 여부 (플레이어별로 관리되어야 함)
    priority INTEGER DEFAULT 0, -- 레시피 우선순위 (높을수록 우선)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_recipe_hidden ON recipe(is_hidden);
CREATE INDEX idx_recipe_priority ON recipe(priority DESC);

-- 3. recipe_ingredient 테이블: 레시피별 필요 재료
CREATE TABLE IF NOT EXISTS recipe_ingredient (
    id BIGSERIAL PRIMARY KEY,
    recipe_id TEXT NOT NULL REFERENCES recipe(id) ON DELETE CASCADE,
    material_id TEXT NOT NULL REFERENCES material(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    is_catalyst BOOLEAN DEFAULT FALSE, -- 촉매 여부
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_recipe_ingredient_recipe_id ON recipe_ingredient(recipe_id);
CREATE INDEX idx_recipe_ingredient_material_id ON recipe_ingredient(material_id);

-- 4. recipe_condition 테이블: 레시피 특수 조건
CREATE TABLE IF NOT EXISTS recipe_condition (
    id BIGSERIAL PRIMARY KEY,
    recipe_id TEXT NOT NULL REFERENCES recipe(id) ON DELETE CASCADE,
    condition_type TEXT NOT NULL CHECK (condition_type IN ('time_range', 'language', 'catalyst', 'event', 'alchemy_level')),
    time_start TIME, -- 시간대 조건 시작
    time_end TIME, -- 시간대 조건 종료
    language_code TEXT, -- 언어 조건 (ko, en, ja 등)
    required_catalyst_id TEXT REFERENCES material(id), -- 필요 촉매
    event_flag TEXT, -- 이벤트 플래그
    min_alchemy_level INTEGER, -- 최소 연금술 레벨
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_recipe_condition_recipe_id ON recipe_condition(recipe_id);
CREATE INDEX idx_recipe_condition_type ON recipe_condition(condition_type);

-- 5. player_material 테이블: 플레이어별 재료 보유량
CREATE TABLE IF NOT EXISTS player_material (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    material_id TEXT NOT NULL REFERENCES material(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, material_id)
);

CREATE INDEX idx_player_material_user_id ON player_material(user_id);
CREATE INDEX idx_player_material_material_id ON player_material(material_id);

-- 6. player_recipe 테이블: 플레이어별 레시피 발견 여부
CREATE TABLE IF NOT EXISTS player_recipe (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recipe_id TEXT NOT NULL REFERENCES recipe(id) ON DELETE CASCADE,
    is_discovered BOOLEAN DEFAULT FALSE,
    first_discovered_at TIMESTAMPTZ,
    craft_count INTEGER DEFAULT 0, -- 제작 횟수
    success_count INTEGER DEFAULT 0, -- 성공 횟수
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, recipe_id)
);

CREATE INDEX idx_player_recipe_user_id ON player_recipe(user_id);
CREATE INDEX idx_player_recipe_recipe_id ON player_recipe(recipe_id);

-- 7. player_alchemy 테이블: 플레이어 연금술 정보
CREATE TABLE IF NOT EXISTS player_alchemy (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    level INTEGER NOT NULL DEFAULT 1,
    experience INTEGER NOT NULL DEFAULT 0,
    workshop_level INTEGER DEFAULT 1,
    global_success_bonus INTEGER DEFAULT 0, -- 글로벌 성공률 보너스 (%)
    global_time_reduction INTEGER DEFAULT 0, -- 글로벌 제작 시간 감소 (%)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. alchemy_history 테이블: 연금 기록 (옵션)
CREATE TABLE IF NOT EXISTS alchemy_history (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recipe_id TEXT NOT NULL REFERENCES recipe(id) ON DELETE CASCADE,
    success BOOLEAN NOT NULL,
    success_rate_used INTEGER,
    materials_used JSONB, -- { "material_id": quantity }
    result_monster_id TEXT,
    crafted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_alchemy_history_user_id ON alchemy_history(user_id);
CREATE INDEX idx_alchemy_history_recipe_id ON alchemy_history(recipe_id);
CREATE INDEX idx_alchemy_history_crafted_at ON alchemy_history(crafted_at DESC);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS
ALTER TABLE player_material ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_recipe ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_alchemy ENABLE ROW LEVEL SECURITY;
ALTER TABLE alchemy_history ENABLE ROW LEVEL SECURITY;

-- player_material policies
CREATE POLICY "Users can view their own materials"
    ON player_material FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own materials"
    ON player_material FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own materials"
    ON player_material FOR UPDATE
    USING (auth.uid() = user_id);

-- player_recipe policies
CREATE POLICY "Users can view their own recipes"
    ON player_recipe FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recipes"
    ON player_recipe FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recipes"
    ON player_recipe FOR UPDATE
    USING (auth.uid() = user_id);

-- player_alchemy policies
CREATE POLICY "Users can view their own alchemy data"
    ON player_alchemy FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own alchemy data"
    ON player_alchemy FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own alchemy data"
    ON player_alchemy FOR UPDATE
    USING (auth.uid() = user_id);

-- alchemy_history policies
CREATE POLICY "Users can view their own alchemy history"
    ON alchemy_history FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own alchemy history"
    ON alchemy_history FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ============================================
-- Functions
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_alchemy_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_material_updated_at BEFORE UPDATE ON material
    FOR EACH ROW EXECUTE FUNCTION update_alchemy_updated_at();

CREATE TRIGGER update_recipe_updated_at BEFORE UPDATE ON recipe
    FOR EACH ROW EXECUTE FUNCTION update_alchemy_updated_at();

CREATE TRIGGER update_player_material_updated_at BEFORE UPDATE ON player_material
    FOR EACH ROW EXECUTE FUNCTION update_alchemy_updated_at();

CREATE TRIGGER update_player_recipe_updated_at BEFORE UPDATE ON player_recipe
    FOR EACH ROW EXECUTE FUNCTION update_alchemy_updated_at();

CREATE TRIGGER update_player_alchemy_updated_at BEFORE UPDATE ON player_alchemy
    FOR EACH ROW EXECUTE FUNCTION update_alchemy_updated_at();

-- ============================================
-- Helper Functions
-- ============================================

-- 재료 소모 함수
CREATE OR REPLACE FUNCTION consume_materials(
    p_user_id UUID,
    p_materials JSONB -- { "material_id": quantity }
)
RETURNS BOOLEAN AS $$
DECLARE
    material_entry RECORD;
    current_quantity INTEGER;
BEGIN
    -- 모든 재료에 대해 충분한 수량이 있는지 먼저 확인
    FOR material_entry IN SELECT key as material_id, value::INTEGER as quantity FROM jsonb_each_text(p_materials)
    LOOP
        SELECT quantity INTO current_quantity
        FROM player_material
        WHERE user_id = p_user_id AND material_id = material_entry.material_id;

        IF current_quantity IS NULL OR current_quantity < material_entry.quantity THEN
            RETURN FALSE;
        END IF;
    END LOOP;

    -- 모든 재료 소모
    FOR material_entry IN SELECT key as material_id, value::INTEGER as quantity FROM jsonb_each_text(p_materials)
    LOOP
        UPDATE player_material
        SET quantity = quantity - material_entry.quantity
        WHERE user_id = p_user_id AND material_id = material_entry.material_id;
    END LOOP;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 재료 지급 함수
CREATE OR REPLACE FUNCTION add_materials(
    p_user_id UUID,
    p_material_id TEXT,
    p_quantity INTEGER
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO player_material (user_id, material_id, quantity)
    VALUES (p_user_id, p_material_id, p_quantity)
    ON CONFLICT (user_id, material_id)
    DO UPDATE SET quantity = player_material.quantity + p_quantity;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
