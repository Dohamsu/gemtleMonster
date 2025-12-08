/**
 * Monster Skill Data
 * 몬스터 스킬 정의 및 해금 조건
 */

import type { RoleType } from '../types/alchemy'

// ==========================================
// Types
// ==========================================

export type SkillType = 'ACTIVE' | 'PASSIVE'
export type EffectType = 'DAMAGE' | 'HEAL' | 'BUFF' | 'DEBUFF' | 'SPECIAL'
export type TargetType = 'SELF' | 'ENEMY' | 'ALL_ALLIES' | 'ALL_ENEMIES'

export interface SkillEffect {
    type: EffectType
    value: number         // 효과 수치 (%, 고정값 등)
    target: TargetType
    duration?: number     // 지속 턴 (버프/디버프용)
}

export interface MonsterSkill {
    id: string
    name: string
    description: string
    unlockLevel: number
    type: SkillType
    effect: SkillEffect
    cooldown?: number     // 액티브 스킬 쿨다운 (턴)
    emoji: string
}

// ==========================================
// Role-based Skills (역할별 공통 스킬)
// ==========================================

export const ROLE_SKILLS: Record<RoleType, MonsterSkill[]> = {
    TANK: [
        {
            id: 'tank_guard', // id 유지 (DB 호환성)
            name: '철벽의 태세',
            description: '방패를 들어올려 기본 방어력을 10% 증가시킵니다.',
            unlockLevel: 1,
            type: 'PASSIVE',
            effect: { type: 'BUFF', value: 10, target: 'SELF' },
            emoji: '🛡️'
        },
        {
            id: 'tank_taunt',
            name: '전장의 함성',
            description: '우렁찬 함성으로 적의 주의를 끌어 공격을 자신에게 집중시킵니다.',
            unlockLevel: 10,
            type: 'ACTIVE',
            effect: { type: 'DEBUFF', value: 0, target: 'ENEMY' },
            cooldown: 3,
            emoji: '📣'
        },
        {
            id: 'tank_fortify',
            name: '불굴의 의지',
            description: '어떤 고통도 견뎌내며 받는 피해를 15% 감소시킵니다.',
            unlockLevel: 20,
            type: 'PASSIVE',
            effect: { type: 'BUFF', value: 15, target: 'SELF' },
            emoji: '🔥'
        },
        {
            id: 'tank_iron_wall',
            name: '절대 방어',
            description: '3턴간 강철과 같은 피부로 변하여 방어력이 50% 폭증합니다.',
            unlockLevel: 30,
            type: 'ACTIVE',
            effect: { type: 'BUFF', value: 50, target: 'SELF', duration: 3 },
            cooldown: 6,
            emoji: '🏰'
        }
    ],

    DPS: [
        {
            id: 'dps_strike',
            name: '치명적인 일격',
            description: '적의 급소를 노려 120%의 강력한 피해를 입힙니다.',
            unlockLevel: 1,
            type: 'ACTIVE',
            effect: { type: 'DAMAGE', value: 120, target: 'ENEMY' },
            cooldown: 2,
            emoji: '⚔️'
        },
        {
            id: 'dps_critical',
            name: '약점 간파',
            description: '적의 약점을 파악하여 치명타 확률이 15% 증가합니다.',
            unlockLevel: 10,
            type: 'PASSIVE',
            effect: { type: 'BUFF', value: 15, target: 'SELF' },
            emoji: '👁️'
        },
        {
            id: 'dps_piercing',
            name: '갑옷 뚫기',
            description: '예리한 공격으로 적의 방어력을 20% 무시합니다.',
            unlockLevel: 25,
            type: 'PASSIVE',
            effect: { type: 'DEBUFF', value: 20, target: 'ENEMY' },
            emoji: '🗡️'
        },
        {
            id: 'dps_berserk',
            name: '피의 축제',
            description: '광기에 휩싸여 3턴간 공격력이 50% 증가하지만 받는 피해도 증가합니다.',
            unlockLevel: 40,
            type: 'ACTIVE',
            effect: { type: 'BUFF', value: 50, target: 'SELF', duration: 3 },
            cooldown: 7,
            emoji: '🩸'
        }
    ],

    SUPPORT: [
        {
            id: 'support_heal',
            name: '생명의 손길',
            description: '따스한 빛으로 아군의 HP를 25% 회복합니다.',
            unlockLevel: 1,
            type: 'ACTIVE',
            effect: { type: 'HEAL', value: 25, target: 'ALL_ALLIES' },
            cooldown: 3,
            emoji: '🌿'
        },
        {
            id: 'support_blessing',
            name: '용기의 찬가',
            description: '용기를 북돋아 아군의 모든 스탯을 5% 증가시킵니다.',
            unlockLevel: 10,
            type: 'PASSIVE',
            effect: { type: 'BUFF', value: 5, target: 'ALL_ALLIES' },
            emoji: '🎵'
        },
        {
            id: 'support_barrier',
            name: '신성한 보호막',
            description: '2턴간 신성한 힘으로 아군이 받는 피해를 20% 감소시킵니다.',
            unlockLevel: 25,
            type: 'ACTIVE',
            effect: { type: 'BUFF', value: 20, target: 'ALL_ALLIES', duration: 2 },
            cooldown: 5,
            emoji: '✨'
        },
        {
            id: 'support_revive',
            name: '기적의 소생',
            description: '쓰러진 아군에게 기적을 일으켜 HP 30% 상태로 부활시킵니다.',
            unlockLevel: 50,
            type: 'ACTIVE',
            effect: { type: 'HEAL', value: 30, target: 'ALL_ALLIES' },
            cooldown: 10,
            emoji: '👼'
        }
    ],

    HYBRID: [
        {
            id: 'hybrid_adapt',
            name: '전술적 유연성',
            description: '상황에 맞춰 대처하여 모든 스탯이 5% 증가합니다.',
            unlockLevel: 1,
            type: 'PASSIVE',
            effect: { type: 'BUFF', value: 5, target: 'SELF' },
            emoji: '🔄'
        },
        {
            id: 'hybrid_drain',
            name: '영혼 흡수',
            description: '적에게 100% 피해를 주고 피해량의 일부를 체력으로 흡수합니다.',
            unlockLevel: 15,
            type: 'ACTIVE',
            effect: { type: 'DAMAGE', value: 100, target: 'ENEMY' },
            cooldown: 3,
            emoji: '👻'
        },
        {
            id: 'hybrid_balance',
            name: '완벽한 균형',
            description: '공격과 방어의 극치를 깨달아 공방이 10% 증가합니다.',
            unlockLevel: 30,
            type: 'PASSIVE',
            effect: { type: 'BUFF', value: 10, target: 'SELF' },
            emoji: '⚖️'
        }
    ],

    PRODUCTION: [
        {
            id: 'prod_gather',
            name: '풍요의 손길',
            description: '자연의 섭리를 이해하여 시설 생산량이 5% 증가합니다.',
            unlockLevel: 1,
            type: 'PASSIVE',
            effect: { type: 'SPECIAL', value: 5, target: 'SELF' },
            emoji: '🌾'
        },
        {
            id: 'prod_efficiency',
            name: '장인의 기교',
            description: '놀라운 솜씨로 시설 생산 속도가 10% 빨라집니다.',
            unlockLevel: 15,
            type: 'PASSIVE',
            effect: { type: 'SPECIAL', value: 10, target: 'SELF' },
            emoji: '⚒️'
        },
        {
            id: 'prod_luck',
            name: '행운의 별',
            description: '희귀한 재료를 발견할 확률이 5% 증가합니다.',
            unlockLevel: 30,
            type: 'PASSIVE',
            effect: { type: 'SPECIAL', value: 5, target: 'SELF' },
            emoji: '⭐'
        }
    ]
}

// ==========================================
// Monster-specific Unique Skills (몬스터 고유 스킬)
// ==========================================

export const MONSTER_UNIQUE_SKILLS: Record<string, MonsterSkill[]> = {
    // Basic Slime
    'slime_basic': [
        {
            id: 'skill_slime_sticky',
            name: '끈적한 점액',
            description: '끈적이는 점액을 뱉어 적의 움직임을 둔화시킵니다.',
            unlockLevel: 5,
            type: 'ACTIVE',
            effect: { type: 'DEBUFF', value: 10, target: 'ENEMY', duration: 2 },
            cooldown: 4,
            emoji: '💧'
        }
    ],
    // Hound Fang
    'hound_fang': [
        {
            id: 'skill_hound_bleed',
            name: '출혈의 송곳니',
            description: '날카로운 이빨로 물어뜯어 지속적인 출혈 피해를 줍니다.',
            unlockLevel: 8,
            type: 'ACTIVE',
            effect: { type: 'DAMAGE', value: 80, target: 'ENEMY', duration: 3 },
            cooldown: 3,
            emoji: '🦷'
        },
        {
            id: 'skill_hound_hunt',
            name: '사냥 개시',
            description: '사냥 본능을 일깨워 3턴간 민첩성이 증가합니다.',
            unlockLevel: 25,
            type: 'ACTIVE',
            effect: { type: 'BUFF', value: 20, target: 'SELF', duration: 3 },
            cooldown: 6,
            emoji: '🐾'
        }
    ],
    // Stone Golem
    'golem_stone': [
        {
            id: 'skill_golem_quake',
            name: '대지진',
            description: '땅을 강하게 내리쳐 주변의 모든 적에게 피해를 줍니다.',
            unlockLevel: 15,
            type: 'ACTIVE',
            effect: { type: 'DAMAGE', value: 130, target: 'ALL_ENEMIES' },
            cooldown: 5,
            emoji: '🌋'
        },
        {
            id: 'skill_golem_harden',
            name: '바위 피부',
            description: '피부가 단단한 바위로 변해 기본 방어력이 20% 추가 상승합니다.',
            unlockLevel: 30,
            type: 'PASSIVE',
            effect: { type: 'BUFF', value: 20, target: 'SELF' },
            emoji: '🗿'
        }
    ],
    // Fairy Spirit
    'fairy_spirit': [
        {
            id: 'skill_fairy_wind',
            name: '정화의 바람',
            description: '상쾌한 바람을 일으켜 아군의 상태이상을 해제합니다.',
            unlockLevel: 12,
            type: 'ACTIVE',
            effect: { type: 'SPECIAL', value: 0, target: 'ALL_ALLIES' },
            cooldown: 4,
            emoji: '🍃'
        }
    ],
    // Wolf Dark (SR)
    'wolf_dark': [
        {
            id: 'skill_wolf_shadow',
            name: '그림자 습격',
            description: '어둠 속에서 나타나 치명타 확률이 대폭 증가된 공격을 가합니다.',
            unlockLevel: 20,
            type: 'ACTIVE',
            effect: { type: 'DAMAGE', value: 200, target: 'ENEMY' },
            cooldown: 5,
            emoji: '🌑'
        },
        {
            id: 'skill_wolf_night',
            name: '밤의 지배자',
            description: '밤이 되면 모든 스탯이 10% 증가합니다.',
            unlockLevel: 40,
            type: 'PASSIVE',
            effect: { type: 'BUFF', value: 10, target: 'SELF' },
            emoji: '🌜'
        }
    ],
    // Slime King (SR)
    'slime_king': [
        {
            id: 'skill_king_authority',
            name: '왕의 위엄',
            description: '압도적인 위엄으로 모든 적의 공격력을 20% 감소시킵니다.',
            unlockLevel: 15,
            type: 'PASSIVE',
            effect: { type: 'DEBUFF', value: 20, target: 'ALL_ENEMIES' },
            emoji: '👑'
        },
        {
            id: 'skill_king_press',
            name: '왕의 압박',
            description: '거대한 몸으로 적을 짓눌러 250%의 피해를 입힙니다.',
            unlockLevel: 45,
            type: 'ACTIVE',
            effect: { type: 'DAMAGE', value: 250, target: 'ENEMY' },
            cooldown: 6,
            emoji: '⚖️'
        }
    ],
    // Guardian Tiger (SSR)
    'guardian_tiger': [
        {
            id: 'skill_tiger_roar',
            name: '백호의 포효',
            description: '천지를 뒤흔드는 포효로 적 전체를 공포에 빠뜨려 명중률을 낮춥니다.',
            unlockLevel: 10,
            type: 'ACTIVE',
            effect: { type: 'DEBUFF', value: 30, target: 'ALL_ENEMIES', duration: 2 },
            cooldown: 5,
            emoji: '🐯'
        },
        {
            id: 'skill_tiger_lightning',
            name: '뇌전 발톱',
            description: '번개를 두른 발톱으로 적을 할퀴어 마비시킵니다.',
            unlockLevel: 30,
            type: 'ACTIVE',
            effect: { type: 'DAMAGE', value: 180, target: 'ENEMY' },
            cooldown: 4,
            emoji: '⚡'
        },
        {
            id: 'skill_tiger_god',
            name: '신수 강림',
            description: '신수의 힘을 개방하여 모든 스탯이 30% 증가합니다.',
            unlockLevel: 60,
            type: 'PASSIVE',
            effect: { type: 'BUFF', value: 30, target: 'SELF' },
            emoji: '🌟'
        }
    ],
    // Sky Dragon (SSR)
    'sky_dragon_hatchling': [
        {
            id: 'skill_dragon_breath',
            name: '천공의 브레스',
            description: '하늘의 기운을 모아 강력한 광역 브레스를 뿜어냅니다.',
            unlockLevel: 25,
            type: 'ACTIVE',
            effect: { type: 'DAMAGE', value: 220, target: 'ALL_ENEMIES' },
            cooldown: 7,
            emoji: '🐲'
        },
        {
            id: 'skill_dragon_scale',
            name: '역린',
            description: '공격받으면 일정 확률로 반격합니다.',
            unlockLevel: 50,
            type: 'PASSIVE',
            effect: { type: 'SPECIAL', value: 50, target: 'SELF' },
            emoji: '🛡️'
        }
    ],
    // Volcano Dungeon
    'golem_magma': [
        {
            id: 'skill_magma_punch',
            name: '마그마 펀치',
            description: '불타는 주먹으로 적을 타격하여 화상을 입힙니다.',
            unlockLevel: 20,
            type: 'ACTIVE',
            effect: { type: 'DAMAGE', value: 150, target: 'ENEMY' },
            cooldown: 3,
            emoji: '👊'
        }
    ],
    'fairy_dawn': [
        {
            id: 'skill_dawn_light',
            name: '여명의 빛',
            description: '어둠을 몰아내는 빛으로 아군 전체를 치유하고 디버프를 제거합니다.',
            unlockLevel: 25,
            type: 'ACTIVE',
            effect: { type: 'HEAL', value: 40, target: 'ALL_ALLIES' },
            cooldown: 6,
            emoji: '🌅'
        }
    ],
    'snowball_slime': [
        {
            id: 'skill_snow_roll',
            name: '눈덩이 굴리기',
            description: '몸을 둥글게 말아 적에게 돌진합니다.',
            unlockLevel: 10,
            type: 'ACTIVE',
            effect: { type: 'DAMAGE', value: 80, target: 'ENEMY' },
            cooldown: 3,
            emoji: '⛄'
        }
    ],
    'golem_gem': [
        {
            id: 'skill_gem_reflect',
            name: '프리즘 반사',
            description: '보석 몸체로 마법 공격을 반사합니다.',
            unlockLevel: 35,
            type: 'PASSIVE',
            effect: { type: 'SPECIAL', value: 30, target: 'SELF' },
            emoji: '💎'
        }
    ],
    // Slime Nightmare
    'slime_nightmare': [
        { id: 'skill_nightmare_terror', name: '공포의 시선', description: '악몽을 보여주어 적을 공포에 떨게 합니다.', unlockLevel: 10, type: 'ACTIVE', effect: { type: 'DEBUFF', value: 20, target: 'ENEMY' }, cooldown: 5, emoji: '👻' },
        { id: 'skill_nightmare_eater', name: '꿈 먹기', description: '적의 생명력을 흡수하여 자신의 체력을 회복합니다.', unlockLevel: 30, type: 'ACTIVE', effect: { type: 'HEAL', value: 30, target: 'SELF' }, cooldown: 4, emoji: '💤' }
    ],
    // Slime Water
    'slime_water': [
        { id: 'skill_water_bubble', name: '물방울 감옥', description: '적을 물방울에 가두어 움직임을 봉쇄합니다.', unlockLevel: 8, type: 'ACTIVE', effect: { type: 'DEBUFF', value: 10, target: 'ENEMY' }, cooldown: 4, emoji: '🫧' },
        { id: 'skill_water_flow', name: '유수', description: '물처럼 유연하게 공격을 흘려보내 회피율이 증가합니다.', unlockLevel: 20, type: 'PASSIVE', effect: { type: 'BUFF', value: 15, target: 'SELF' }, emoji: '🌊' }
    ],
    // Slime Dark
    'slime_dark': [
        { id: 'skill_dark_hide', name: '그림자 숨기', description: '어둠 속에 몸을 숨겨 적의 공격을 피합니다.', unlockLevel: 10, type: 'ACTIVE', effect: { type: 'BUFF', value: 20, target: 'SELF', duration: 2 }, cooldown: 5, emoji: '🕶️' },
        { id: 'skill_dark_strike', name: '기습', description: '방심한 적의 뒤를 노려 큰 피해를 입힙니다.', unlockLevel: 25, type: 'ACTIVE', effect: { type: 'DAMAGE', value: 150, target: 'ENEMY' }, cooldown: 3, emoji: '🗡️' }
    ],
    // Golem Wood
    'golem_wood': [
        { id: 'skill_wood_root', name: '뿌리 묶기', description: '땅에서 뿌리를 솟아나게 하여 적을 묶습니다.', unlockLevel: 15, type: 'ACTIVE', effect: { type: 'DEBUFF', value: 20, target: 'ENEMY' }, cooldown: 5, emoji: '🪵' },
        { id: 'skill_wood_regen', name: '자연 치유', description: '자연의 힘으로 매 턴 체력을 조금씩 회복합니다.', unlockLevel: 30, type: 'PASSIVE', effect: { type: 'HEAL', value: 5, target: 'SELF' }, emoji: '🍃' }
    ],
    // Mushroom
    'mushroom': [
        { id: 'skill_shroom_spore', name: '수면 포자', description: '수면 가루를 뿌려 적을 잠재웁니다.', unlockLevel: 5, type: 'ACTIVE', effect: { type: 'DEBUFF', value: 0, target: 'ENEMY', duration: 2 }, cooldown: 6, emoji: '💤' },
        { id: 'skill_shroom_heal', name: '치유의 버섯', description: '맛있는 버섯을 먹어 체력을 회복합니다.', unlockLevel: 15, type: 'ACTIVE', effect: { type: 'HEAL', value: 20, target: 'SELF' }, cooldown: 3, emoji: '🍄' }
    ],
    // Mushroom Dark
    'mushroom_dark': [
        { id: 'skill_dark_spore', name: '맹독 포자', description: '치명적인 독 포자를 뿌려 적을 중독시킵니다.', unlockLevel: 10, type: 'ACTIVE', effect: { type: 'DEBUFF', value: 15, target: 'ENEMY', duration: 3 }, cooldown: 4, emoji: '☠️' },
        { id: 'skill_dark_infect', name: '감염', description: '상처 부위를 감염시켜 치유 효과를 감소시킵니다.', unlockLevel: 25, type: 'PASSIVE', effect: { type: 'DEBUFF', value: 30, target: 'ENEMY' }, emoji: '🦠' }
    ],
    // Snowflake Sprite
    'snowflake_sprite': [
        { id: 'skill_snow_dust', name: '눈가루 뿌리기', description: '차가운 눈가루로 적의 시야를 가립니다.', unlockLevel: 5, type: 'ACTIVE', effect: { type: 'DEBUFF', value: 10, target: 'ENEMY' }, cooldown: 3, emoji: '❄️' },
        { id: 'skill_snow_play', name: '눈싸움', description: '신나게 눈을 뭉쳐 던져 피해를 줍니다.', unlockLevel: 15, type: 'ACTIVE', effect: { type: 'DAMAGE', value: 90, target: 'ENEMY' }, cooldown: 2, emoji: '☃️' }
    ],
    // Ice Slime
    'ice_slime': [
        { id: 'skill_ice_armor', name: '얼음 갑옷', description: '몸을 얼려 방어력을 높입니다.', unlockLevel: 10, type: 'PASSIVE', effect: { type: 'BUFF', value: 20, target: 'SELF' }, emoji: '🧊' },
        { id: 'skill_ice_crash', name: '얼음 몸통박치기', description: '단단한 몸으로 부딪쳐 피해를 줍니다.', unlockLevel: 20, type: 'ACTIVE', effect: { type: 'DAMAGE', value: 110, target: 'ENEMY' }, cooldown: 3, emoji: '💥' }
    ],
    // Frost Bunny
    'frost_bunny': [
        { id: 'skill_bunny_jump', name: '폴짝 뛰기', description: '높이 뛰어올라 적을 내려찍습니다.', unlockLevel: 8, type: 'ACTIVE', effect: { type: 'DAMAGE', value: 100, target: 'ENEMY' }, cooldown: 2, emoji: '🐰' },
        { id: 'skill_bunny_kick', name: '연속 발차기', description: '빠른 발차기로 적을 정신없이 공격합니다.', unlockLevel: 18, type: 'ACTIVE', effect: { type: 'DAMAGE', value: 130, target: 'ENEMY' }, cooldown: 4, emoji: '🦶' }
    ],
    // Snow Fairy
    'snow_fairy': [
        { id: 'skill_snow_bless', name: '설원의 축복', description: '눈의 정령의 힘으로 아군의 방어력을 높입니다.', unlockLevel: 15, type: 'ACTIVE', effect: { type: 'BUFF', value: 20, target: 'ALL_ALLIES', duration: 3 }, cooldown: 5, emoji: '🙌' },
        { id: 'skill_snow_storm', name: '작은 눈보라', description: '휘몰아치는 눈보라로 적 전체를 공격합니다.', unlockLevel: 35, type: 'ACTIVE', effect: { type: 'DAMAGE', value: 120, target: 'ALL_ENEMIES' }, cooldown: 6, emoji: '🌨️' }
    ],
    // Crystal Mite
    'crystal_mite': [
        { id: 'skill_mite_bite', name: '수정 턱', description: '단단한 턱으로 적을 깨물어 부숩니다.', unlockLevel: 5, type: 'ACTIVE', effect: { type: 'DAMAGE', value: 100, target: 'ENEMY' }, cooldown: 2, emoji: '🦷' }
    ],
    // Santa Golem
    'santa_golem': [
        { id: 'skill_santa_gift', name: '선물 투척', description: '무거운 선물 꾸러미를 던져 큰 피해를 줍니다.', unlockLevel: 20, type: 'ACTIVE', effect: { type: 'DAMAGE', value: 180, target: 'ENEMY' }, cooldown: 4, emoji: '🎁' },
        { id: 'skill_santa_laugh', name: '호쾌한 웃음', description: '호탕하게 웃으며 자신의 체력을 회복합니다.', unlockLevel: 40, type: 'ACTIVE', effect: { type: 'HEAL', value: 20, target: 'SELF' }, cooldown: 5, emoji: '🎅' }
    ],
    // Fire Slime
    'fire_slime': [
        { id: 'skill_fire_burn', name: '화염 방사', description: '몸에서 뜨거운 불길을 뿜어냅니다.', unlockLevel: 10, type: 'ACTIVE', effect: { type: 'DAMAGE', value: 110, target: 'ENEMY' }, cooldown: 3, emoji: '🔥' },
        { id: 'skill_fire_body', name: '불타는 몸', description: '공격한 적에게 화상 피해를 입힙니다.', unlockLevel: 25, type: 'PASSIVE', effect: { type: 'SPECIAL', value: 10, target: 'SELF' }, emoji: '🌡️' }
    ],
    // Cloud Slime
    'cloud_slime': [
        { id: 'skill_cloud_hide', name: '안개 속으로', description: '안개를 만들어 모습을 감춥니다.', unlockLevel: 15, type: 'PASSIVE', effect: { type: 'BUFF', value: 15, target: 'SELF' }, emoji: '🌫️' },
        { id: 'skill_cloud_lightning', name: '정전기 방출', description: '몸에 축적된 전기를 방출하여 공격합니다.', unlockLevel: 30, type: 'ACTIVE', effect: { type: 'DAMAGE', value: 140, target: 'ENEMY' }, cooldown: 4, emoji: '⚡' }
    ],
    // Scar Bear
    'scar_bear': [
        { id: 'skill_bear_claw', name: '곰의 발톱', description: '거대한 앞발로 적을 할꿥니다.', unlockLevel: 10, type: 'ACTIVE', effect: { type: 'DAMAGE', value: 150, target: 'ENEMY' }, cooldown: 3, emoji: '🐻' },
        { id: 'skill_bear_roar', name: '맹수의 포효', description: '우렁찬 포효로 적의 기를 꺾습니다.', unlockLevel: 25, type: 'ACTIVE', effect: { type: 'DEBUFF', value: 20, target: 'ALL_ENEMIES' }, cooldown: 5, emoji: '📢' }
    ],
    // Penguin
    'penguin': [
        { id: 'skill_penguin_slide', name: '배치기 슬라이딩', description: '배로 미끄러지며 적에게 돌진합니다.', unlockLevel: 5, type: 'ACTIVE', effect: { type: 'DAMAGE', value: 90, target: 'ENEMY' }, cooldown: 2, emoji: '🐧' }
    ],
    // Gazelle
    'gazelle': [
        { id: 'skill_gazelle_leap', name: '도약', description: '높이 뛰어올라 적의 공격을 피합니다.', unlockLevel: 10, type: 'PASSIVE', effect: { type: 'BUFF', value: 20, target: 'SELF' }, emoji: '🦌' }
    ],
    // Owl
    'owl_night': [
        { id: 'skill_owl_stare', name: '꿰뚫어보기', description: '적의 약점을 찾아내 치명타 확률을 높입니다.', unlockLevel: 10, type: 'PASSIVE', effect: { type: 'BUFF', value: 15, target: 'ALL_ALLIES' }, emoji: '🦉' }
    ],
    // Rooster
    'rooster_morning': [
        { id: 'skill_rooster_crow', name: '새벽의 울음', description: '우렁찬 울음소리로 아군의 공격력을 높입니다.', unlockLevel: 10, type: 'ACTIVE', effect: { type: 'BUFF', value: 15, target: 'ALL_ALLIES', duration: 3 }, cooldown: 5, emoji: '🐓' }
    ],
    // Turtle
    'turtle_weekend': [
        { id: 'skill_turtle_shell', name: '등껍질 숨기', description: '등껍질 속으로 들어가 방어력을 대폭 높입니다.', unlockLevel: 10, type: 'ACTIVE', effect: { type: 'BUFF', value: 50, target: 'SELF', duration: 2 }, cooldown: 6, emoji: '🛡️' }
    ]
}

// ==========================================
// Utility Functions
// ==========================================

export function getUnlockableSkills(
    monsterId: string,
    role: RoleType,
    level: number
): MonsterSkill[] {
    const skills: MonsterSkill[] = []

    const roleSkills = ROLE_SKILLS[role] || []
    skills.push(...roleSkills.filter(s => s.unlockLevel <= level))

    const uniqueSkills = MONSTER_UNIQUE_SKILLS[monsterId] || []
    skills.push(...uniqueSkills.filter(s => s.unlockLevel <= level))

    return skills
}

export function getNewlyUnlockedSkills(
    monsterId: string,
    role: RoleType,
    level: number
): MonsterSkill[] {
    const skills: MonsterSkill[] = []

    const roleSkills = ROLE_SKILLS[role] || []
    skills.push(...roleSkills.filter(s => s.unlockLevel === level))

    const uniqueSkills = MONSTER_UNIQUE_SKILLS[monsterId] || []
    skills.push(...uniqueSkills.filter(s => s.unlockLevel === level))

    return skills
}

export function getSkillTypeColor(type: SkillType): string {
    return type === 'ACTIVE' ? '#ef4444' : '#3b82f6'
}

export function getNextSkillUnlockLevel(
    monsterId: string,
    role: RoleType,
    currentLevel: number
): number | null {
    const allSkills = [
        ...(ROLE_SKILLS[role] || []),
        ...(MONSTER_UNIQUE_SKILLS[monsterId] || [])
    ]

    const futureLevels = allSkills
        .map(s => s.unlockLevel)
        .filter(lv => lv > currentLevel)
        .sort((a, b) => a - b)

    return futureLevels[0] || null
}

export function getSkillById(skillId: string): MonsterSkill | undefined {
    for (const skills of Object.values(ROLE_SKILLS)) {
        const found = skills.find(s => s.id === skillId)
        if (found) return found
    }

    for (const skills of Object.values(MONSTER_UNIQUE_SKILLS)) {
        const found = skills.find(s => s.id === skillId)
        if (found) return found
    }

    return undefined
}
