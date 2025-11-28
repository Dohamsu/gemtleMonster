import type { Material, Monster, Recipe, RecipeCondition } from '../types/alchemy'

export const MATERIALS: Record<string, Material> = {
    'herb_common': { id: 'herb_common', name: '일반 약초', type: 'PLANT', description: '흔하게 볼 수 있는 약초.', rarity: 'N', iconUrl: '/assets/materials/herb_common.png' },
    'herb_rare': { id: 'herb_rare', name: '희귀 약초', type: 'PLANT', description: '희귀하게 자라는 약초.', rarity: 'R', iconUrl: '/assets/materials/herb_rare.png' },
    'herb_special': { id: 'herb_special', name: '특수 약초', type: 'PLANT', description: '특수 효과를 가진 약초.', rarity: 'SR', iconUrl: '/assets/materials/herb_special.png' },
    'slime_fluid': { id: 'slime_fluid', name: '슬라임 액체', type: 'SLIME', description: '슬라임의 끈적한 액체.', rarity: 'N', iconUrl: '/assets/materials/slime_fluid.png' },
    'slime_gel': { id: 'slime_gel', name: '슬라임 젤', type: 'SLIME', description: '슬라임의 끈적한 젤.', rarity: 'N', iconUrl: '/assets/materials/slime_gel.png' },
    'slime_core': { id: 'slime_core', name: '슬라임 코어', type: 'SLIME', description: '슬라임의 핵.', rarity: 'N', iconUrl: '/assets/materials/slime_core.png' },
    'beast_fang': { id: 'beast_fang', name: '짐승 송곳니', type: 'BEAST', description: '날카로운 이빨.', rarity: 'N', iconUrl: '/assets/materials/beast_fang.png' },
    'ore_iron': { id: 'ore_iron', name: '철광석', type: 'MINERAL', description: '단단한 철광석.', rarity: 'N', iconUrl: '/assets/materials/ore_iron.png' },
    'ore_magic': { id: 'ore_magic', name: '마력 광석', type: 'MINERAL', description: '마력이 깃든 광석.', rarity: 'R', iconUrl: '/assets/materials/ore_magic.png' },
    'gem_fragment': { id: 'gem_fragment', name: '보석 파편', type: 'MINERAL', description: '반짝이는 보석 조각.', rarity: 'R', iconUrl: '/assets/materials/gem_fragment.png' },
    'mushroom_blue': { id: 'mushroom_blue', name: '푸른 버섯', type: 'PLANT', description: '마력이 깃든 신비한 버섯', rarity: 'R', iconUrl: '/assets/materials/mushroom_blue.png' },
    'crack_stone_fragment': { id: 'crack_stone_fragment', name: '균열석 파편', type: 'SPECIAL', description: '차원의 균열에서 나온 돌조각.', rarity: 'SR', iconUrl: '/assets/materials/crack_stone_fragment.png' },
    'ancient_relic_fragment': { id: 'ancient_relic_fragment', name: '고대 유물 파편', type: 'SPECIAL', description: '알 수 없는 고대의 유물 조각.', rarity: 'SR', iconUrl: '/assets/materials/ancient_relic_fragment.png' },
    'magic_ore': { id: 'magic_ore', name: '마력 광석(구)', type: 'MINERAL', description: '마력이 깃든 광석.', rarity: 'R', iconUrl: '/assets/materials/ore_magic.png' },
    'spirit_dust': { id: 'spirit_dust', name: '정령 가루', type: 'SPIRIT', description: '반짝이는 가루.', rarity: 'R', iconUrl: '✨' },
    'dark_crystal': { id: 'dark_crystal', name: '어둠의 결정', type: 'MINERAL', description: '어두운 기운이 감도는 결정.', rarity: 'R', iconUrl: '🔮' },
    'crown_shard': { id: 'crown_shard', name: '왕관 파편', type: 'SPECIAL', description: '부서진 왕관의 조각.', rarity: 'SR', iconUrl: '👑' },
    'fire_core': { id: 'fire_core', name: '불 던전 코어', type: 'SPECIAL', description: '뜨거운 열기를 내뿜는 코어.', rarity: 'SR', iconUrl: '🔥' },

    // Decompose System Materials
    'essence': { id: 'essence', name: '몬스터 정수', type: 'SPECIAL', description: '몬스터의 생명력이 응축된 정수.', rarity: 'N', iconUrl: '/assets/materials/essence.png' },
    'shard_fire': { id: 'shard_fire', name: '불의 파편', type: 'MINERAL', description: '불 속성 몬스터의 힘이 담긴 파편.', rarity: 'R', iconUrl: '🔴' },
    'shard_water': { id: 'shard_water', name: '물의 파편', type: 'MINERAL', description: '물 속성 몬스터의 힘이 담긴 파편.', rarity: 'R', iconUrl: '🔵' },
    'shard_earth': { id: 'shard_earth', name: '대지의 파편', type: 'MINERAL', description: '대지 속성 몬스터의 힘이 담긴 파편.', rarity: 'R', iconUrl: '🟤' },
    'shard_wind': { id: 'shard_wind', name: '바람의 파편', type: 'MINERAL', description: '바람 속성 몬스터의 힘이 담긴 파편.', rarity: 'R', iconUrl: '🟢' },
    'shard_light': { id: 'shard_light', name: '빛의 파편', type: 'MINERAL', description: '빛 속성 몬스터의 힘이 담긴 파편.', rarity: 'R', iconUrl: '🟡' },
    'shard_dark': { id: 'shard_dark', name: '어둠의 파편', type: 'MINERAL', description: '어둠 속성 몬스터의 힘이 담긴 파편.', rarity: 'R', iconUrl: '🟣' },

    // Additional materials
    'seed_ancient': { id: 'seed_ancient', name: '고대의 씨앗', type: 'PLANT', description: '오래된 힘을 간직한 희귀한 씨앗', rarity: 'R', iconUrl: '/assets/materials/seed_ancient.png' },
    'crystal_mana': { id: 'crystal_mana', name: '마력 결정', type: 'MINERAL', description: '순수한 마력이 응축된 결정', rarity: 'R', iconUrl: '/assets/materials/crystal_mana.png' },
    'ore_mythril': { id: 'ore_mythril', name: '미스릴 광석', type: 'MINERAL', description: '전설의 금속 미스릴', rarity: 'R', iconUrl: '/assets/materials/ore_mythril.png' },
    'gem_dark': { id: 'gem_dark', name: '어둠의 보석', type: 'MINERAL', description: '어둠 속성이 담긴 신비한 보석', rarity: 'SR', iconUrl: '/assets/materials/gem_dark.png' },
    'claw_sharp': { id: 'claw_sharp', name: '날카로운 발톱', type: 'BEAST', description: '공격적인 몬스터의 발톱', rarity: 'R', iconUrl: '/assets/materials/claw_sharp.png' },
    'hide_tough': { id: 'hide_tough', name: '질긴 가죽', type: 'BEAST', description: '두껍고 질긴 몬스터 가죽', rarity: 'R', iconUrl: '/assets/materials/hide_tough.png' },
    'bone_dragon': { id: 'bone_dragon', name: '용의 뼈', type: 'BEAST', description: '고대 용의 강력한 뼈', rarity: 'SSR', iconUrl: '/assets/materials/bone_dragon.png' },
    'slime_mutant': { id: 'slime_mutant', name: '변이 점액', type: 'SLIME', description: '특이하게 변이한 슬라임의 점액', rarity: 'R', iconUrl: '/assets/materials/slime_mutant.png' },
    'crown_fragment': { id: 'crown_fragment', name: '왕관 파편', type: 'SLIME', description: '고대 왕의 왕관 조각', rarity: 'SR', iconUrl: '/assets/materials/crown_fragment.png' },
    'soul_fragment': { id: 'soul_fragment', name: '영혼 파편', type: 'SPIRIT', description: '영혼의 일부가 결정화된 파편', rarity: 'R', iconUrl: '/assets/materials/soul_fragment.png' },
    'essence_light': { id: 'essence_light', name: '빛의 정수', type: 'SPIRIT', description: '순수한 빛의 힘', rarity: 'SR', iconUrl: '/assets/materials/essence_light.png' },
    'rune_world': { id: 'rune_world', name: '세계의 룬', type: 'SPIRIT', description: '세계를 지키는 고대 룬', rarity: 'SSR', iconUrl: '/assets/materials/rune_world.png' },
    'core_fire': { id: 'core_fire', name: '불 던전 코어', type: 'MINERAL', description: '불 속성 던전의 핵심 마력', rarity: 'SR', iconUrl: '/assets/materials/core_fire.png' },
    'flower_moonlight': { id: 'flower_moonlight', name: '월광 꽃', type: 'PLANT', description: '달빛 아래서만 피는 신비한 꽃', rarity: 'R', iconUrl: '/assets/materials/flower_moonlight.png' },
    'scale_serpent': { id: 'scale_serpent', name: '뱀의 비늘', type: 'BEAST', description: '강인한 뱀 몬스터의 비늘', rarity: 'R', iconUrl: '/assets/materials/scale_serpent.png' },
    'catalyst_time': { id: 'catalyst_time', name: '시간의 촉매', type: 'SPIRIT', description: '시간의 흐름을 담은 신비한 촉매', rarity: 'SSR', iconUrl: '/assets/materials/catalyst_time.png' },
}

export const MONSTERS: Record<string, Monster> = {
    'slime_basic': {
        id: 'slime_basic',
        name: '젤리 슬라임',
        role: 'TANK',
        element: 'WATER',
        rarity: 'N',
        description: '말랑말랑한 기본 슬라임.',
        baseStats: { hp: 100, atk: 10, def: 5 },
        factoryTrait: { targetFacility: 'herb_farm', effect: '생산량 증가', value: 5 },
        iconUrl: '/assets/monsters/slime_basic.png'
    },
    'hound_basic': {
        id: 'hound_basic',
        name: '송곳니 하운드',
        role: 'DPS',
        element: 'EARTH',
        rarity: 'N',
        description: '빠른 속도로 공격하는 사냥개.',
        baseStats: { hp: 80, atk: 20, def: 3 },
        iconUrl: '/assets/monsters/hound_basic.png'
    },
    'golem_stone': {
        id: 'golem_stone',
        name: '돌 골렘',
        role: 'TANK',
        element: 'EARTH',
        rarity: 'R',
        description: '단단한 돌로 만들어진 골렘.',
        baseStats: { hp: 200, atk: 15, def: 20 },
        factoryTrait: { targetFacility: 'mine', effect: '생산량 증가', value: 10 }
    },
    'fairy_spirit': {
        id: 'fairy_spirit',
        name: '정령 요정',
        role: 'SUPPORT',
        element: 'LIGHT',
        rarity: 'R',
        description: '치유의 힘을 가진 요정.',
        baseStats: { hp: 60, atk: 10, def: 5 }
    },
    'wolf_dark': {
        id: 'wolf_dark',
        name: '어둠 늑대',
        role: 'DPS',
        element: 'DARK',
        rarity: 'R',
        description: '어둠 속에서 습격하는 늑대.',
        baseStats: { hp: 90, atk: 25, def: 5 }
    },
    'slime_king': {
        id: 'slime_king',
        name: '왕슬라임',
        role: 'TANK',
        element: 'WATER',
        rarity: 'SR',
        description: '거대한 왕관을 쓴 슬라임.',
        baseStats: { hp: 500, atk: 30, def: 30 },
        factoryTrait: { targetFacility: 'herb_farm', effect: '생산량 대폭 증가', value: 20 }
    },
    'golem_magma': {
        id: 'golem_magma',
        name: '마그마 골렘',
        role: 'HYBRID',
        element: 'FIRE',
        rarity: 'SR',
        description: '용암으로 이루어진 골렘.',
        baseStats: { hp: 400, atk: 40, def: 25 }
    }
}

// DB 시딩용 레시피 데이터 (JSON 형식)
interface DBRecipeSeed {
    id: string
    name: string
    description: string
    resultMonsterId: string // "monster_slime_basic" 형식
    resultCount: number
    baseSuccessRate: number
    craftTimeSec: number
    costGold: number
    requiredAlchemyLevel: number
    expGain: number
    isHidden: boolean
    priority: number
    ingredients: Array<{
        materialId: string
        quantity: number
        isCatalyst: boolean
    }>
    conditions: Array<{
        conditionType: string
        timeStart?: string
        timeEnd?: string
        languageCode?: string
    }>
}

const DB_RECIPES_SEED: DBRecipeSeed[] = [
    {
        id: 'recipe_slime_basic',
        name: '기본 슬라임',
        description: '가장 기초적인 슬라임 몬스터',
        resultMonsterId: 'monster_slime_basic',
        resultCount: 1,
        baseSuccessRate: 100,
        craftTimeSec: 5,
        costGold: 10,
        requiredAlchemyLevel: 1,
        expGain: 10,
        isHidden: false,
        priority: 100,
        ingredients: [
            { materialId: 'slime_core', quantity: 1, isCatalyst: false },
            { materialId: 'herb_common', quantity: 2, isCatalyst: false }
        ],
        conditions: []
    },
    {
        id: 'recipe_hound_fang',
        name: '송곳니 하운드',
        description: '민첩한 공격형 몬스터',
        resultMonsterId: 'monster_hound_fang',
        resultCount: 1,
        baseSuccessRate: 85,
        craftTimeSec: 10,
        costGold: 50,
        requiredAlchemyLevel: 2,
        expGain: 20,
        isHidden: false,
        priority: 90,
        ingredients: [
            { materialId: 'beast_fang', quantity: 3, isCatalyst: false },
            { materialId: 'herb_common', quantity: 1, isCatalyst: false }
        ],
        conditions: []
    },
    {
        id: 'recipe_golem_stone',
        name: '돌 골렘',
        description: '단단한 방어형 골렘',
        resultMonsterId: 'monster_golem_stone',
        resultCount: 1,
        baseSuccessRate: 75,
        craftTimeSec: 20,
        costGold: 100,
        requiredAlchemyLevel: 3,
        expGain: 30,
        isHidden: false,
        priority: 85,
        ingredients: [
            { materialId: 'ore_iron', quantity: 5, isCatalyst: false },
            { materialId: 'slime_core', quantity: 2, isCatalyst: false },
            { materialId: 'crystal_mana', quantity: 1, isCatalyst: false }
        ],
        conditions: []
    },
    {
        id: 'recipe_fairy_spirit',
        name: '정령 요정',
        description: '회복과 버프를 제공하는 서포트 몬스터',
        resultMonsterId: 'monster_fairy_spirit',
        resultCount: 1,
        baseSuccessRate: 80,
        craftTimeSec: 15,
        costGold: 80,
        requiredAlchemyLevel: 3,
        expGain: 25,
        isHidden: false,
        priority: 88,
        ingredients: [
            { materialId: 'spirit_dust', quantity: 3, isCatalyst: false },
            { materialId: 'herb_common', quantity: 2, isCatalyst: false },
            { materialId: 'mushroom_blue', quantity: 1, isCatalyst: false }
        ],
        conditions: []
    },
    {
        id: 'recipe_wolf_dark',
        name: '어둠 늑대',
        description: '어둠 속성의 강력한 딜러',
        resultMonsterId: 'monster_wolf_dark',
        resultCount: 1,
        baseSuccessRate: 70,
        craftTimeSec: 18,
        costGold: 120,
        requiredAlchemyLevel: 4,
        expGain: 35,
        isHidden: false,
        priority: 82,
        ingredients: [
            { materialId: 'beast_fang', quantity: 4, isCatalyst: false },
            { materialId: 'gem_dark', quantity: 1, isCatalyst: false },
            { materialId: 'claw_sharp', quantity: 2, isCatalyst: false }
        ],
        conditions: []
    },
    {
        id: 'recipe_slime_king',
        name: '왕슬라임',
        description: '슬라임의 왕, 강력한 탱커',
        resultMonsterId: 'monster_slime_king',
        resultCount: 1,
        baseSuccessRate: 60,
        craftTimeSec: 30,
        costGold: 200,
        requiredAlchemyLevel: 5,
        expGain: 50,
        isHidden: false,
        priority: 75,
        ingredients: [
            { materialId: 'slime_core', quantity: 5, isCatalyst: false },
            { materialId: 'slime_gel', quantity: 10, isCatalyst: false },
            { materialId: 'crown_fragment', quantity: 1, isCatalyst: true }
        ],
        conditions: []
    },
    {
        id: 'recipe_golem_magma',
        name: '마그마 골렘',
        description: '불 속성의 공격형 골렘',
        resultMonsterId: 'monster_golem_magma',
        resultCount: 1,
        baseSuccessRate: 55,
        craftTimeSec: 35,
        costGold: 250,
        requiredAlchemyLevel: 6,
        expGain: 60,
        isHidden: false,
        priority: 70,
        ingredients: [
            { materialId: 'ore_iron', quantity: 8, isCatalyst: false },
            { materialId: 'crystal_mana', quantity: 3, isCatalyst: false },
            { materialId: 'core_fire', quantity: 1, isCatalyst: true }
        ],
        conditions: []
    },
    {
        id: 'recipe_slime_nightmare',
        name: '악몽 슬라임',
        description: '심야에만 만들 수 있는 디버프 특화 몬스터',
        resultMonsterId: 'monster_slime_nightmare',
        resultCount: 1,
        baseSuccessRate: 50,
        craftTimeSec: 25,
        costGold: 180,
        requiredAlchemyLevel: 5,
        expGain: 55,
        isHidden: true,
        priority: 65,
        ingredients: [
            { materialId: 'slime_core', quantity: 3, isCatalyst: false },
            { materialId: 'gem_dark', quantity: 2, isCatalyst: false },
            { materialId: 'flower_moonlight', quantity: 1, isCatalyst: false }
        ],
        conditions: [
            {
                conditionType: 'time_range',
                timeStart: '00:00:00',
                timeEnd: '03:00:00'
            }
        ]
    },
    {
        id: 'recipe_fairy_dawn',
        name: '새벽 정령',
        description: '새벽에만 소환 가능한 경험치 버프 정령',
        resultMonsterId: 'monster_fairy_dawn',
        resultCount: 1,
        baseSuccessRate: 65,
        craftTimeSec: 20,
        costGold: 150,
        requiredAlchemyLevel: 4,
        expGain: 45,
        isHidden: true,
        priority: 68,
        ingredients: [
            { materialId: 'spirit_dust', quantity: 4, isCatalyst: false },
            { materialId: 'essence_light', quantity: 1, isCatalyst: false },
            { materialId: 'herb_common', quantity: 3, isCatalyst: false }
        ],
        conditions: [
            {
                conditionType: 'time_range',
                timeStart: '04:00:00',
                timeEnd: '06:00:00'
            }
        ]
    },
    {
        id: 'recipe_guardian_tiger_ko',
        name: '호랑이 수호령 (한국)',
        description: '한국 언어에서만 생성되는 치명타 특화 수호령',
        resultMonsterId: 'monster_guardian_tiger',
        resultCount: 1,
        baseSuccessRate: 45,
        craftTimeSec: 40,
        costGold: 300,
        requiredAlchemyLevel: 7,
        expGain: 80,
        isHidden: true,
        priority: 60,
        ingredients: [
            { materialId: 'spirit_dust', quantity: 5, isCatalyst: false },
            { materialId: 'crystal_mana', quantity: 3, isCatalyst: false },
            { materialId: 'rune_world', quantity: 1, isCatalyst: true }
        ],
        conditions: [
            {
                conditionType: 'language',
                languageCode: 'ko'
            }
        ]
    }
]

// 런타임용 레시피 (TypeScript 타입)
export const RECIPES: Recipe[] = DB_RECIPES_SEED.map(dbRecipe => ({
    id: dbRecipe.id,
    name: dbRecipe.name,
    description: dbRecipe.description,
    resultMonsterId: dbRecipe.resultMonsterId.replace(/^monster_/, ''), // "monster_slime_basic" -> "slime_basic"
    materials: dbRecipe.ingredients.map(ing => ({
        materialId: ing.materialId,
        count: ing.quantity
    })),
    craftTimeSec: dbRecipe.craftTimeSec,
    successRate: dbRecipe.baseSuccessRate,
    requiredAlchemyLevel: dbRecipe.requiredAlchemyLevel,
    isHidden: dbRecipe.isHidden,
    conditions: dbRecipe.conditions.map(cond => ({
        type: cond.conditionType as any,
        conditionType: cond.conditionType as any,
        value: cond.timeStart && cond.timeEnd
            ? { timeStart: cond.timeStart, timeEnd: cond.timeEnd }
            : cond.languageCode
            ? { languageCode: cond.languageCode }
            : undefined
    })) as RecipeCondition[]
}))

// ============================================
// DB 시딩용 변환 함수
// ============================================

/**
 * TypeScript Material 타입을 DB 시딩용 형식으로 변환
 */
export function getMaterialsForDB() {
    const RARITY_MAP: Record<string, string> = {
        'N': 'COMMON',
        'R': 'RARE',
        'SR': 'EPIC',
        'SSR': 'LEGENDARY',
        'UR': 'LEGENDARY'
    }

    const FAMILY_MAP: Record<string, string> = {
        'PLANT': 'PLANT',
        'MINERAL': 'MINERAL',
        'BEAST': 'BEAST',
        'SLIME': 'SLIME',
        'SPIRIT': 'SPIRIT',
        'SPECIAL': 'MINERAL' // SPECIAL은 MINERAL로 매핑하고 is_special=true로 설정
    }

    return Object.values(MATERIALS).map(mat => {
        const family = FAMILY_MAP[mat.type] || 'MINERAL'
        const rarity = RARITY_MAP[mat.rarity] || 'COMMON'
        const isSpecial = mat.type === 'SPECIAL'

        return {
            id: mat.id,
            name: mat.name,
            description: mat.description || null,
            family: family,
            rarity: rarity,
            icon_url: mat.iconUrl || null,
            source_info: null, // sourceInfo는 필요시 추가
            is_special: isSpecial
        }
    })
}

/**
 * DB 시딩용 레시피 데이터 반환
 */
export function getRecipesForDB() {
    return DB_RECIPES_SEED
}

/**
 * 전체 DB 시딩용 데이터 반환 (JSON 형식과 호환)
 */
export function getAlchemyDataForDB() {
    return {
        version: '1.0.0',
        materials: getMaterialsForDB(),
        recipes: getRecipesForDB()
    }
}
