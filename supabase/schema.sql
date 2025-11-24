-- ============================================
-- GemtleMonster Database Schema
-- ============================================

-- 1. facility 테이블: 시설 마스터 데이터
CREATE TABLE IF NOT EXISTS facility (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('resource_production', 'crafting', 'combat_auto', 'unit_growth')),
    config_version TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. facility_unlock_condition 테이블: 시설 해금 조건
CREATE TABLE IF NOT EXISTS facility_unlock_condition (
    id BIGSERIAL PRIMARY KEY,
    facility_id TEXT NOT NULL REFERENCES facility(id) ON DELETE CASCADE,
    condition_type TEXT NOT NULL CHECK (condition_type IN ('player_level', 'quest_complete', 'facility_level')),
    min_player_level INTEGER,
    quest_id TEXT,
    required_facility_id TEXT REFERENCES facility(id),
    min_facility_level INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_facility_unlock_condition_facility_id ON facility_unlock_condition(facility_id);

-- 3. facility_level 테이블: 시설 레벨별 스탯/비용 정보
CREATE TABLE IF NOT EXISTS facility_level (
    id BIGSERIAL PRIMARY KEY,
    facility_id TEXT NOT NULL REFERENCES facility(id) ON DELETE CASCADE,
    level INTEGER NOT NULL,
    stats JSONB NOT NULL,
    upgrade_cost JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(facility_id, level)
);

CREATE INDEX idx_facility_level_facility_id ON facility_level(facility_id);

-- 4. player_facility 테이블: 플레이어별 시설 소유 및 레벨
CREATE TABLE IF NOT EXISTS player_facility (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    facility_id TEXT NOT NULL REFERENCES facility(id) ON DELETE CASCADE,
    current_level INTEGER NOT NULL DEFAULT 1,
    last_collected_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, facility_id)
);

CREATE INDEX idx_player_facility_user_id ON player_facility(user_id);
CREATE INDEX idx_player_facility_facility_id ON player_facility(facility_id);

-- 5. player_resource 테이블: 플레이어별 자원
CREATE TABLE IF NOT EXISTS player_resource (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    resource_id TEXT NOT NULL,
    amount BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, resource_id)
);

CREATE INDEX idx_player_resource_user_id ON player_resource(user_id);

-- 6. player_profile 테이블: 플레이어 프로필
CREATE TABLE IF NOT EXISTS player_profile (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    player_level INTEGER NOT NULL DEFAULT 1,
    experience BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS
ALTER TABLE player_facility ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_resource ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_profile ENABLE ROW LEVEL SECURITY;

-- player_facility policies
CREATE POLICY "Users can view their own facilities"
    ON player_facility FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own facilities"
    ON player_facility FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own facilities"
    ON player_facility FOR UPDATE
    USING (auth.uid() = user_id);

-- player_resource policies
CREATE POLICY "Users can view their own resources"
    ON player_resource FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own resources"
    ON player_resource FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own resources"
    ON player_resource FOR UPDATE
    USING (auth.uid() = user_id);

-- player_profile policies
CREATE POLICY "Users can view their own profile"
    ON player_profile FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
    ON player_profile FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
    ON player_profile FOR UPDATE
    USING (auth.uid() = user_id);

-- ============================================
-- Functions
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_facility_updated_at BEFORE UPDATE ON facility
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_player_facility_updated_at BEFORE UPDATE ON player_facility
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_player_resource_updated_at BEFORE UPDATE ON player_resource
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_player_profile_updated_at BEFORE UPDATE ON player_profile
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
