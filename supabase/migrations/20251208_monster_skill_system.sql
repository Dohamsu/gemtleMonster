-- ============================================
-- Monster Skill System Migration
-- 몬스터 스킬 시스템 추가
-- ============================================

-- 1. monster_skill 테이블 생성 (마스터 데이터)
CREATE TABLE IF NOT EXISTS monster_skill (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    unlock_level INTEGER NOT NULL DEFAULT 1,
    skill_type TEXT NOT NULL CHECK (skill_type IN ('ACTIVE', 'PASSIVE')),
    effect_type TEXT NOT NULL CHECK (effect_type IN ('DAMAGE', 'HEAL', 'BUFF', 'DEBUFF', 'SPECIAL')),
    effect_value NUMERIC NOT NULL DEFAULT 0,
    effect_target TEXT NOT NULL CHECK (effect_target IN ('SELF', 'ENEMY', 'ALL_ALLIES', 'ALL_ENEMIES')),
    effect_duration INTEGER,
    cooldown INTEGER,
    emoji TEXT,
    
    -- 역할 기반 스킬이면 role 지정, 특정 몬스터 전용이면 monster_id 지정
    role TEXT CHECK (role IN ('TANK', 'DPS', 'SUPPORT', 'HYBRID', 'PRODUCTION')),
    monster_id TEXT REFERENCES monster(id) ON DELETE CASCADE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_monster_skill_role ON monster_skill(role);
CREATE INDEX IF NOT EXISTS idx_monster_skill_monster ON monster_skill(monster_id);
CREATE INDEX IF NOT EXISTS idx_monster_skill_unlock ON monster_skill(unlock_level);

-- 2. player_monster에 unlocked_skills 컬럼 추가
ALTER TABLE player_monster
ADD COLUMN IF NOT EXISTS unlocked_skills TEXT[] DEFAULT '{}';

-- 3. 역할별 기본 스킬 시드 데이터

-- TANK 스킬
INSERT INTO monster_skill (id, name, description, unlock_level, skill_type, effect_type, effect_value, effect_target, cooldown, emoji, role)
VALUES
    ('tank_guard', '수호', '기본 방어력이 10% 증가합니다.', 1, 'PASSIVE', 'BUFF', 10, 'SELF', NULL, '🛡️', 'TANK'),
    ('tank_taunt', '도발', '적의 공격을 자신에게 집중시킵니다.', 10, 'ACTIVE', 'DEBUFF', 0, 'ENEMY', 3, '😤', 'TANK'),
    ('tank_fortify', '강인함', '받는 피해가 15% 감소합니다.', 20, 'PASSIVE', 'BUFF', 15, 'SELF', NULL, '💪', 'TANK'),
    ('tank_iron_wall', '철벽', '3턴간 방어력이 50% 증가합니다.', 30, 'ACTIVE', 'BUFF', 50, 'SELF', 6, '🏰', 'TANK')
ON CONFLICT (id) DO NOTHING;

-- DPS 스킬
INSERT INTO monster_skill (id, name, description, unlock_level, skill_type, effect_type, effect_value, effect_target, cooldown, emoji, role)
VALUES
    ('dps_strike', '강타', '적에게 120%의 피해를 입힙니다.', 1, 'ACTIVE', 'DAMAGE', 120, 'ENEMY', 2, '⚔️', 'DPS'),
    ('dps_critical', '급소 공격', '치명타 확률이 15% 증가합니다.', 10, 'PASSIVE', 'BUFF', 15, 'SELF', NULL, '🎯', 'DPS'),
    ('dps_piercing', '관통', '적의 방어력을 20% 무시합니다.', 25, 'PASSIVE', 'DEBUFF', 20, 'ENEMY', NULL, '🗡️', 'DPS'),
    ('dps_berserk', '광폭화', '3턴간 공격력이 50% 증가합니다.', 40, 'ACTIVE', 'BUFF', 50, 'SELF', 7, '💢', 'DPS')
ON CONFLICT (id) DO NOTHING;

-- SUPPORT 스킬
INSERT INTO monster_skill (id, name, description, unlock_level, skill_type, effect_type, effect_value, effect_target, cooldown, emoji, role)
VALUES
    ('support_heal', '치유', '아군의 HP를 25% 회복합니다.', 1, 'ACTIVE', 'HEAL', 25, 'ALL_ALLIES', 3, '💚', 'SUPPORT'),
    ('support_blessing', '축복', '아군의 모든 스탯이 5% 증가합니다.', 10, 'PASSIVE', 'BUFF', 5, 'ALL_ALLIES', NULL, '✨', 'SUPPORT'),
    ('support_barrier', '결계', '2턴간 아군이 받는 피해가 20% 감소합니다.', 25, 'ACTIVE', 'BUFF', 20, 'ALL_ALLIES', 5, '🔮', 'SUPPORT'),
    ('support_revive', '부활의 빛', '전투 불능 아군을 HP 30%로 부활시킵니다.', 50, 'ACTIVE', 'HEAL', 30, 'ALL_ALLIES', 10, '🌟', 'SUPPORT')
ON CONFLICT (id) DO NOTHING;

-- HYBRID 스킬
INSERT INTO monster_skill (id, name, description, unlock_level, skill_type, effect_type, effect_value, effect_target, cooldown, emoji, role)
VALUES
    ('hybrid_adapt', '적응', '모든 스탯이 5% 증가합니다.', 1, 'PASSIVE', 'BUFF', 5, 'SELF', NULL, '🔄', 'HYBRID'),
    ('hybrid_drain', '흡수', '적에게 피해를 주고 그 일부를 HP로 회복합니다.', 15, 'ACTIVE', 'DAMAGE', 100, 'ENEMY', 3, '🩸', 'HYBRID'),
    ('hybrid_balance', '균형', '공격력과 방어력이 10% 증가합니다.', 30, 'PASSIVE', 'BUFF', 10, 'SELF', NULL, '⚖️', 'HYBRID')
ON CONFLICT (id) DO NOTHING;

-- PRODUCTION 스킬
INSERT INTO monster_skill (id, name, description, unlock_level, skill_type, effect_type, effect_value, effect_target, cooldown, emoji, role)
VALUES
    ('prod_gather', '채집', '시설 생산량이 5% 증가합니다.', 1, 'PASSIVE', 'SPECIAL', 5, 'SELF', NULL, '🌾', 'PRODUCTION'),
    ('prod_efficiency', '효율', '시설 생산 속도가 10% 증가합니다.', 15, 'PASSIVE', 'SPECIAL', 10, 'SELF', NULL, '⚡', 'PRODUCTION'),
    ('prod_luck', '행운', '희귀 재료 드롭률이 5% 증가합니다.', 30, 'PASSIVE', 'SPECIAL', 5, 'SELF', NULL, '🍀', 'PRODUCTION')
ON CONFLICT (id) DO NOTHING;

-- 4. 몬스터 고유 스킬
INSERT INTO monster_skill (id, name, description, unlock_level, skill_type, effect_type, effect_value, effect_target, cooldown, emoji, monster_id)
VALUES
    ('slime_king_split', '분열', '분열하여 슬라임 분신을 소환합니다.', 25, 'ACTIVE', 'SPECIAL', 0, 'SELF', 8, '👑', 'monster_slime_king'),
    ('magma_eruption', '화염 폭발', '모든 적에게 150% 화염 피해를 입힙니다.', 30, 'ACTIVE', 'DAMAGE', 150, 'ALL_ENEMIES', 6, '🌋', 'monster_golem_magma'),
    ('tiger_roar', '호랑이 포효', '적 전체를 위협하여 공격력을 30% 감소시킵니다.', 20, 'ACTIVE', 'DEBUFF', 30, 'ALL_ENEMIES', 5, '🐯', 'monster_guardian_tiger'),
    ('dawn_blessing', '새벽의 축복', '전투 후 획득 경험치가 20% 증가합니다.', 15, 'PASSIVE', 'SPECIAL', 20, 'ALL_ALLIES', NULL, '🌅', 'monster_fairy_dawn')
ON CONFLICT (id) DO NOTHING;

-- 5. RLS 설정 (스킬은 공개 데이터)
ALTER TABLE monster_skill ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Monster skills are viewable by everyone"
    ON monster_skill FOR SELECT
    USING (true);

-- 6. 트리거 (업데이트 시간)
CREATE TRIGGER update_monster_skill_updated_at
    BEFORE UPDATE ON monster_skill
    FOR EACH ROW
    EXECUTE FUNCTION update_alchemy_updated_at();

COMMENT ON TABLE monster_skill IS '몬스터 스킬 마스터 데이터';
COMMENT ON COLUMN player_monster.unlocked_skills IS '해금된 스킬 ID 배열';
