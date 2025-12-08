-- ============================================
-- Update Monster Skills (Advanced) - Fixed v2
-- 스킬 데이터 고도화 및 고유 스킬 추가
-- ============================================

-- 0. 누락된 몬스터 데이터 확인 및 추가 (외래키 오류 방지)
-- monsterData.ts에 정의되어 있지만 DB에 없을 수 있는 몬스터들을 추가합니다.
-- element와 role은 대문자 영문이어야 합니다 (CHECK 제약조건 준수)
INSERT INTO monster (id, name, role, element, rarity, base_hp, base_atk, base_def) VALUES
('sky_dragon_hatchling', '스카이 드래곤 유치', 'DPS', 'WIND', 'SSR', 1500, 100, 80),
('magma_golem', '마그마 골렘', 'DPS', 'FIRE', 'SR', 1000, 80, 60), -- 원본 데이터상 딜러(DPS)임
('snowball_slime', '눈덩이 슬라임', 'TANK', 'WATER', 'N', 45, 8, 5)
ON CONFLICT (id) DO NOTHING;


-- 1. 기존 데이터 정리
TRUNCATE TABLE monster_skill CASCADE;

-- 2. 역할별 공통 스킬 (Fantasy Naming) --

-- TANK
INSERT INTO monster_skill (id, name, description, unlock_level, skill_type, effect_type, effect_value, effect_target, cooldown, emoji, role) VALUES
('tank_guard', '철벽의 태세', '방패를 들어올려 기본 방어력을 10% 증가시킵니다.', 1, 'PASSIVE', 'BUFF', 10, 'SELF', NULL, '🛡️', 'TANK'),
('tank_taunt', '전장의 함성', '우렁찬 함성으로 적의 주의를 끌어 공격을 자신에게 집중시킵니다.', 10, 'ACTIVE', 'DEBUFF', 0, 'ENEMY', 3, '📣', 'TANK'),
('tank_fortify', '불굴의 의지', '어떤 고통도 견뎌내며 받는 피해를 15% 감소시킵니다.', 20, 'PASSIVE', 'BUFF', 15, 'SELF', NULL, '🔥', 'TANK'),
('tank_iron_wall', '절대 방어', '3턴간 강철과 같은 피부로 변하여 방어력이 50% 폭증합니다.', 30, 'ACTIVE', 'BUFF', 50, 'SELF', 6, '🏰', 'TANK');

-- DPS
INSERT INTO monster_skill (id, name, description, unlock_level, skill_type, effect_type, effect_value, effect_target, cooldown, emoji, role) VALUES
('dps_strike', '치명적인 일격', '적의 급소를 노려 120%의 강력한 피해를 입힙니다.', 1, 'ACTIVE', 'DAMAGE', 120, 'ENEMY', 2, '⚔️', 'DPS'),
('dps_critical', '약점 간파', '적의 약점을 파악하여 치명타 확률이 15% 증가합니다.', 10, 'PASSIVE', 'BUFF', 15, 'SELF', NULL, '👁️', 'DPS'),
('dps_piercing', '갑옷 뚫기', '예리한 공격으로 적의 방어력을 20% 무시합니다.', 25, 'PASSIVE', 'DEBUFF', 20, 'ENEMY', NULL, '🗡️', 'DPS'),
('dps_berserk', '피의 축제', '광기에 휩싸여 3턴간 공격력이 50% 증가하지만 받는 피해도 증가합니다.', 40, 'ACTIVE', 'BUFF', 50, 'SELF', 7, '🩸', 'DPS');

-- SUPPORT
INSERT INTO monster_skill (id, name, description, unlock_level, skill_type, effect_type, effect_value, effect_target, cooldown, emoji, role) VALUES
('support_heal', '생명의 손길', '따스한 빛으로 아군의 HP를 25% 회복합니다.', 1, 'ACTIVE', 'HEAL', 25, 'ALL_ALLIES', 3, '🌿', 'SUPPORT'),
('support_blessing', '용기의 찬가', '용기를 북돋아 아군의 모든 스탯을 5% 증가시킵니다.', 10, 'PASSIVE', 'BUFF', 5, 'ALL_ALLIES', NULL, '🎵', 'SUPPORT'),
('support_barrier', '신성한 보호막', '2턴간 신성한 힘으로 아군이 받는 피해를 20% 감소시킵니다.', 25, 'ACTIVE', 'BUFF', 20, 'ALL_ALLIES', 5, '✨', 'SUPPORT'),
('support_revive', '기적의 소생', '쓰러진 아군에게 기적을 일으켜 HP 30% 상태로 부활시킵니다.', 50, 'ACTIVE', 'HEAL', 30, 'ALL_ALLIES', 10, '👼', 'SUPPORT');

-- HYBRID
INSERT INTO monster_skill (id, name, description, unlock_level, skill_type, effect_type, effect_value, effect_target, cooldown, emoji, role) VALUES
('hybrid_adapt', '전술적 유연성', '상황에 맞춰 대처하여 모든 스탯이 5% 증가합니다.', 1, 'PASSIVE', 'BUFF', 5, 'SELF', NULL, '🔄', 'HYBRID'),
('hybrid_drain', '영혼 흡수', '적에게 100% 피해를 주고 피해량의 일부를 체력으로 흡수합니다.', 15, 'ACTIVE', 'DAMAGE', 100, 'ENEMY', 3, '👻', 'HYBRID'),
('hybrid_balance', '완벽한 균형', '공격과 방어의 극치를 깨달아 공방이 10% 증가합니다.', 30, 'PASSIVE', 'BUFF', 10, 'SELF', NULL, '⚖️', 'HYBRID');

-- PRODUCTION
INSERT INTO monster_skill (id, name, description, unlock_level, skill_type, effect_type, effect_value, effect_target, cooldown, emoji, role) VALUES
('prod_gather', '풍요의 손길', '자연의 섭리를 이해하여 시설 생산량이 5% 증가합니다.', 1, 'PASSIVE', 'SPECIAL', 5, 'SELF', NULL, '🌾', 'PRODUCTION'),
('prod_efficiency', '장인의 기교', '놀라운 솜씨로 시설 생산 속도가 10% 빨라집니다.', 15, 'PASSIVE', 'SPECIAL', 10, 'SELF', NULL, '⚒️', 'PRODUCTION'),
('prod_luck', '행운의 별', '희귀한 재료를 발견할 확률이 5% 증가합니다.', 30, 'PASSIVE', 'SPECIAL', 5, 'SELF', NULL, '⭐', 'PRODUCTION');


-- 3. 몬스터별 고유 스킬 (Unique Skills) --

-- Basic Slime
INSERT INTO monster_skill (id, name, description, unlock_level, skill_type, effect_type, effect_value, effect_target, cooldown, emoji, monster_id) VALUES
('skill_slime_sticky', '끈적한 점액', '끈적이는 점액을 뱉어 적의 움직임을 둔화시킵니다.', 5, 'ACTIVE', 'DEBUFF', 10, 'ENEMY', 4, '💧', 'monster_slime_basic');

-- Hound Fang
INSERT INTO monster_skill (id, name, description, unlock_level, skill_type, effect_type, effect_value, effect_target, cooldown, emoji, monster_id) VALUES
('skill_hound_bleed', '출혈의 송곳니', '날카로운 이빨로 물어뜯어 지속적인 출혈 피해를 줍니다.', 8, 'ACTIVE', 'DAMAGE', 80, 'ENEMY', 3, '🦷', 'monster_hound_fang'),
('skill_hound_hunt', '사냥 개시', '사냥 본능을 일깨워 3턴간 민첩성이 증가합니다.', 25, 'ACTIVE', 'BUFF', 20, 'SELF', 6, '🐾', 'monster_hound_fang');

-- Stone Golem
INSERT INTO monster_skill (id, name, description, unlock_level, skill_type, effect_type, effect_value, effect_target, cooldown, emoji, monster_id) VALUES
('skill_golem_quake', '대지진', '땅을 강하게 내리쳐 주변의 모든 적에게 피해를 줍니다.', 15, 'ACTIVE', 'DAMAGE', 130, 'ALL_ENEMIES', 5, '🌋', 'monster_golem_stone'),
('skill_golem_harden', '바위 피부', '피부가 단단한 바위로 변해 기본 방어력이 20% 추가 상승합니다.', 30, 'PASSIVE', 'BUFF', 20, 'SELF', NULL, '🗿', 'monster_golem_stone');

-- Fairy Spirit
INSERT INTO monster_skill (id, name, description, unlock_level, skill_type, effect_type, effect_value, effect_target, cooldown, emoji, monster_id) VALUES
('skill_fairy_wind', '정화의 바람', '상쾌한 바람을 일으켜 아군의 상태이상을 해제합니다.', 12, 'ACTIVE', 'SPECIAL', 0, 'ALL_ALLIES', 4, '🍃', 'monster_fairy_spirit');

-- Wolf Dark
INSERT INTO monster_skill (id, name, description, unlock_level, skill_type, effect_type, effect_value, effect_target, cooldown, emoji, monster_id) VALUES
('skill_wolf_shadow', '그림자 습격', '어둠 속에서 나타나 치명타 확률이 대폭 증가된 공격을 가합니다.', 20, 'ACTIVE', 'DAMAGE', 200, 'ENEMY', 5, '🌑', 'monster_wolf_dark'),
('skill_wolf_night', '밤의 지배자', '밤이 되면 모든 스탯이 10% 증가합니다.', 40, 'PASSIVE', 'BUFF', 10, 'SELF', NULL, '🌜', 'monster_wolf_dark');

-- Slime King
INSERT INTO monster_skill (id, name, description, unlock_level, skill_type, effect_type, effect_value, effect_target, cooldown, emoji, monster_id) VALUES
('skill_king_authority', '왕의 위엄', '압도적인 위엄으로 모든 적의 공격력을 20% 감소시킵니다.', 15, 'PASSIVE', 'DEBUFF', 20, 'ALL_ENEMIES', NULL, '👑', 'monster_slime_king'),
('skill_king_press', '왕의 압박', '거대한 몸으로 적을 짓눌러 250%의 피해를 입힙니다.', 45, 'ACTIVE', 'DAMAGE', 250, 'ENEMY', 6, '⚖️', 'monster_slime_king');

-- Guardian Tiger
INSERT INTO monster_skill (id, name, description, unlock_level, skill_type, effect_type, effect_value, effect_target, cooldown, emoji, monster_id) VALUES
('skill_tiger_roar', '백호의 포효', '천지를 뒤흔드는 포효로 적 전체를 공포에 빠뜨려 명중률을 낮춥니다.', 10, 'ACTIVE', 'DEBUFF', 30, 'ALL_ENEMIES', 5, '🐯', 'monster_guardian_tiger'),
('skill_tiger_lightning', '뇌전 발톱', '번개를 두른 발톱으로 적을 할퀴어 마비시킵니다.', 30, 'ACTIVE', 'DAMAGE', 180, 'ENEMY', 4, '⚡', 'monster_guardian_tiger'),
('skill_tiger_god', '신수 강림', '신수의 힘을 개방하여 모든 스탯이 30% 증가합니다.', 60, 'PASSIVE', 'BUFF', 30, 'SELF', NULL, '🌟', 'monster_guardian_tiger');

-- Sky Dragon (ID 주의: sky_dragon_hatchling)
INSERT INTO monster_skill (id, name, description, unlock_level, skill_type, effect_type, effect_value, effect_target, cooldown, emoji, monster_id) VALUES
('skill_dragon_breath', '천공의 브레스', '하늘의 기운을 모아 강력한 광역 브레스를 뿜어냅니다.', 25, 'ACTIVE', 'DAMAGE', 220, 'ALL_ENEMIES', 7, '🐲', 'sky_dragon_hatchling'),
('skill_dragon_scale', '역린', '공격받으면 일정 확률로 반격합니다.', 50, 'PASSIVE', 'SPECIAL', 50, 'SELF', NULL, '🛡️', 'sky_dragon_hatchling');

-- Magma Golem (ID 주의: magma_golem)
INSERT INTO monster_skill (id, name, description, unlock_level, skill_type, effect_type, effect_value, effect_target, cooldown, emoji, monster_id) VALUES
('skill_magma_punch', '마그마 펀치', '불타는 주먹으로 적을 타격하여 화상을 입힙니다.', 20, 'ACTIVE', 'DAMAGE', 150, 'ENEMY', 3, '👊', 'magma_golem');

-- Fairy Dawn
INSERT INTO monster_skill (id, name, description, unlock_level, skill_type, effect_type, effect_value, effect_target, cooldown, emoji, monster_id) VALUES
('skill_dawn_light', '여명의 빛', '어둠을 몰아내는 빛으로 아군 전체를 치유하고 디버프를 제거합니다.', 25, 'ACTIVE', 'HEAL', 40, 'ALL_ALLIES', 6, '🌅', 'monster_fairy_dawn');

-- Golem Gem (ID 주의: monster_golem_gem)
INSERT INTO monster_skill (id, name, description, unlock_level, skill_type, effect_type, effect_value, effect_target, cooldown, emoji, monster_id) VALUES
('skill_gem_reflect', '프리즘 반사', '보석 몸체로 마법 공격을 반사합니다.', 35, 'PASSIVE', 'SPECIAL', 30, 'SELF', NULL, '💎', 'monster_golem_gem');

-- Snowball Slime (ID 주의: snowball_slime)
INSERT INTO monster_skill (id, name, description, unlock_level, skill_type, effect_type, effect_value, effect_target, cooldown, emoji, monster_id) VALUES
('skill_snow_roll', '눈덩이 굴리기', '몸을 둥글게 말아 적에게 돌진합니다.', 10, 'ACTIVE', 'DAMAGE', 80, 'ENEMY', 3, '⛄', 'snowball_slime');
