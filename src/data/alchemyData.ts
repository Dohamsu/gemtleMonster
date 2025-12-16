import type { Material, Recipe, RecipeCondition } from '../types/alchemy'
import type { ConsumableEffect } from '../types/consumable'
import { MONSTER_DATA } from './monsterData'

// 소모품 효과 정의
export const CONSUMABLE_EFFECTS: Record<string, ConsumableEffect> = {
    'potion_hp_small': { type: 'HEAL_HP', value: 50 },
    'potion_mp_small': { type: 'HEAL_HP', value: 30 },  // MP 없으므로 HP로 대체
    'potion_stamina': { type: 'BUFF_ATK', value: 20, duration: 3 },
    'potion_ironskin': { type: 'BUFF_DEF', value: 30, duration: 3 },
    'potion_light': { type: 'CURE_STATUS', value: 0 }  // 상태이상 해제
}
export const MATERIALS: Record<string, Material> = {
    'herb_common': { id: 'herb_common', name: '일반 약초', type: 'PLANT', description: '흔하게 볼 수 있는 약초.', rarity: 'N', iconUrl: '/assets/materials/herb_common.png', sellPrice: 10 },
    'herb_rare': { id: 'herb_rare', name: '희귀 약초', type: 'PLANT', description: '희귀하게 자라는 약초.', rarity: 'R', iconUrl: '/assets/materials/herb_rare.png', sellPrice: 50 },
    'herb_special': { id: 'herb_special', name: '특수 약초', type: 'PLANT', description: '특수 효과를 가진 약초.', rarity: 'SR', iconUrl: '/assets/materials/herb_special.png', sellPrice: 150 },
    'slime_fluid': { id: 'slime_fluid', name: '슬라임 액체', type: 'SLIME', description: '슬라임의 끈적한 액체.', rarity: 'N', iconUrl: '/assets/materials/slime_fluid.png', sellPrice: 5 },
    'slime_gel': { id: 'slime_gel', name: '슬라임 젤', type: 'SLIME', description: '슬라임의 끈적한 젤.', rarity: 'N', iconUrl: '/assets/materials/slime_gel.png' },
    'slime_core': { id: 'slime_core', name: '슬라임 코어', type: 'SLIME', description: '슬라임의 핵.', rarity: 'N', iconUrl: '/assets/materials/slime_core.png', sellPrice: 20 },
    'beast_fang': { id: 'beast_fang', name: '짐승 송곳니', type: 'BEAST', description: '날카로운 이빨.', rarity: 'N', iconUrl: '/assets/materials/beast_fang.png' },
    'ore_iron': { id: 'ore_iron', name: '철광석', type: 'MINERAL', description: '단단한 철광석.', rarity: 'N', iconUrl: '/assets/materials/ore_iron.png', sellPrice: 15 },
    'ore_magic': { id: 'ore_magic', name: '마력 광석', type: 'MINERAL', description: '마력이 깃든 광석.', rarity: 'R', iconUrl: '/assets/materials/ore_magic.png', sellPrice: 80 },
    'gem_fragment': { id: 'gem_fragment', name: '보석 파편', type: 'MINERAL', description: '반짝이는 보석 조각.', rarity: 'R', iconUrl: '/assets/materials/gem_fragment.png', sellPrice: 60 },
    'mushroom_blue': { id: 'mushroom_blue', name: '푸른 버섯', type: 'PLANT', description: '마력이 깃든 신비한 버섯', rarity: 'R', iconUrl: '/assets/materials/mushroom_blue.png' },
    'crack_stone_fragment': { id: 'crack_stone_fragment', name: '균열석 파편', type: 'SPECIAL', description: '차원의 균열에서 나온 돌조각.', rarity: 'SR', iconUrl: '/assets/materials/crack_stone_fragment.png' },
    'ancient_relic_fragment': { id: 'ancient_relic_fragment', name: '고대 유물 파편', type: 'SPECIAL', description: '알 수 없는 고대의 유물 조각.', rarity: 'SR', iconUrl: '/assets/materials/ancient_relic_fragment.png' },
    'spirit_dust': { id: 'spirit_dust', name: '정령 가루', type: 'SPIRIT', description: '반짝이는 가루.', rarity: 'R', iconUrl: '/assets/materials/spirit_dust.png' },
    'dark_crystal': { id: 'dark_crystal', name: '어둠의 결정', type: 'MINERAL', description: '어두운 기운이 감도는 결정.', rarity: 'R', iconUrl: '/assets/materials/dark_crystal.png' },
    'fire_core': { id: 'fire_core', name: '불 던전 코어', type: 'SPECIAL', description: '뜨거운 열기를 내뿜는 코어.', rarity: 'SR', iconUrl: '/assets/materials/fire_core.png' },

    // Decompose System Materials
    'essence': { id: 'essence', name: '몬스터 정수', type: 'SPECIAL', description: '몬스터의 생명력이 응축된 정수.', rarity: 'N', iconUrl: '/assets/materials/essence.png' },
    'shard_fire': { id: 'shard_fire', name: '불의 파편', type: 'MINERAL', description: '불 속성 몬스터의 힘이 담긴 파편.', rarity: 'R', iconUrl: '/assets/materials/shard_fire.png' },
    'shard_water': { id: 'shard_water', name: '물의 파편', type: 'MINERAL', description: '물 속성 몬스터의 힘이 담긴 파편.', rarity: 'R', iconUrl: '/assets/materials/shard_water.png' },
    'shard_earth': { id: 'shard_earth', name: '대지의 파편', type: 'MINERAL', description: '대지 속성 몬스터의 힘이 담긴 파편.', rarity: 'R', iconUrl: '/assets/materials/shard_earth.png' },
    'shard_wind': { id: 'shard_wind', name: '바람의 파편', type: 'MINERAL', description: '바람 속성 몬스터의 힘이 담긴 파편.', rarity: 'R', iconUrl: '/assets/materials/shard_wind.png' },
    'shard_light': { id: 'shard_light', name: '빛의 파편', type: 'MINERAL', description: '빛 속성 몬스터의 힘이 담긴 파편.', rarity: 'R', iconUrl: '/assets/materials/shard_light.png' },
    'shard_dark': { id: 'shard_dark', name: '어둠의 파편', type: 'MINERAL', description: '어둠 속성 몬스터의 힘이 담긴 파편.', rarity: 'R', iconUrl: '/assets/materials/shard_dark.png' },

    // Additional materials
    'seed_ancient': { id: 'seed_ancient', name: '고대의 씨앗', type: 'PLANT', description: '오래된 힘을 간직한 희귀한 씨앗', rarity: 'R', iconUrl: '/assets/materials/seed_ancient.png' },
    'crystal_mana': { id: 'crystal_mana', name: '마력 결정', type: 'MINERAL', description: '순수한 마력이 응축된 결정', rarity: 'R', iconUrl: '/assets/materials/crystal_mana.png' },
    'ore_mythril': { id: 'ore_mythril', name: '미스릴 광석', type: 'MINERAL', description: '전설의 금속 미스릴', rarity: 'R', iconUrl: '/assets/materials/ore_mythril.png' },
    'gem_dark': { id: 'gem_dark', name: '어둠의 보석', type: 'MINERAL', description: '어둠 속성이 담긴 신비한 보석', rarity: 'SR', iconUrl: '/assets/materials/gem_dark.png' },
    'claw_sharp': { id: 'claw_sharp', name: '날카로운 발톱', type: 'BEAST', description: '공격적인 몬스터의 발톱', rarity: 'R', iconUrl: '/assets/materials/claw_sharp.png' },
    // 'hide_tough' merged into 'leather_beast'
    'leather_beast': { id: 'leather_beast', name: '부드러운 가죽', type: 'BEAST', description: '가공되어 부드럽고 질긴 짐승의 가죽', rarity: 'N', iconUrl: '/assets/materials/hide_tough.png' },
    'bear_skin': { id: 'bear_skin', name: '곰 가죽', type: 'BEAST', description: '곰의 두껍고 따뜻한 가죽.', rarity: 'R', iconUrl: '/assets/materials/bear_skin.png' },
    'bone_dragon': { id: 'bone_dragon', name: '용의 뼈', type: 'BEAST', description: '고대 용의 강력한 뼈', rarity: 'SSR', iconUrl: '/assets/materials/bone_dragon.png' },
    'slime_mutant': { id: 'slime_mutant', name: '변이 점액', type: 'SLIME', description: '특이하게 변이한 슬라임의 점액', rarity: 'R', iconUrl: '/assets/materials/slime_mutant.png' },
    'soul_fragment': { id: 'soul_fragment', name: '영혼 파편', type: 'SPIRIT', description: '영혼의 일부가 결정화된 파편', rarity: 'R', iconUrl: '/assets/materials/soul_fragment.png' },
    // 'essence_light' replaced by 'shard_light'
    'rune_world': { id: 'rune_world', name: '세계의 룬', type: 'SPIRIT', description: '세계를 지키는 고대 룬', rarity: 'SSR', iconUrl: '/assets/materials/rune_world.png' },
    'flower_moonlight': { id: 'flower_moonlight', name: '월광 꽃', type: 'PLANT', description: '달빛 아래서만 피는 신비한 꽃', rarity: 'R', iconUrl: '/assets/materials/flower_moonlight.png' },
    'scale_serpent': { id: 'scale_serpent', name: '뱀의 비늘', type: 'BEAST', description: '강인한 뱀 몬스터의 비늘', rarity: 'R', iconUrl: '/assets/materials/scale_serpent.png' },
    'catalyst_time': { id: 'catalyst_time', name: '시간의 촉매', type: 'SPIRIT', description: '시간의 흐름을 담은 신비한 촉매', rarity: 'SSR', iconUrl: '/assets/materials/catalyst_time.png' },
    // Boss/Dungeon Drop Materials
    'crown_fragment': { id: 'crown_fragment', name: '왕관 파편', type: 'SPECIAL', description: '보스 몬스터가 드랍하는 귀중한 왕관 조각', rarity: 'SR', iconUrl: '/assets/materials/crown_fragment.png' },

    // Snow/Ice Materials (눈꽃 재료)
    'snowflake': { id: 'snowflake', name: '눈꽃 결정', type: 'MINERAL', description: '녹지 않는 신비한 눈 결정. 차가운 마력이 깃들어 있다.', rarity: 'N', iconUrl: '/assets/materials/snowflake.png' },
    'ice_shard': { id: 'ice_shard', name: '얼음 파편', type: 'MINERAL', description: '단단하고 날카로운 얼음 조각. 차가운 기운을 발산한다.', rarity: 'N', iconUrl: '/assets/materials/ice_shard.png' },
    'frozen_dew': { id: 'frozen_dew', name: '얼어붙은 이슬', type: 'PLANT', description: '새벽에 얼어붙은 신비한 이슬. 생명력을 품고 있다.', rarity: 'R', iconUrl: '/assets/materials/frozen_dew.png' },
    'frost_essence': { id: 'frost_essence', name: '서리 정수', type: 'SPIRIT', description: '겨울의 정령이 남긴 순수한 서리의 힘.', rarity: 'R', iconUrl: '/assets/materials/frost_essence.png' },

    // New Basic Materials for Diversity (Drops)
    'scrap_leather': { id: 'scrap_leather', name: '자투리 가죽', type: 'BEAST', description: '작은 가죽 조각.', rarity: 'N', iconUrl: '/assets/materials/scrap_leather.png' },
    'scrap_cloth': { id: 'scrap_cloth', name: '옷감 조각', type: 'SPECIAL', description: '낡은 천 조각.', rarity: 'N', iconUrl: '/assets/materials/scrap_cloth.png' },
    'feather_common': { id: 'feather_common', name: '일반 깃털', type: 'BEAST', description: '평범한 새의 깃털.', rarity: 'N', iconUrl: '/assets/materials/feather_common.png' },
    'bone_fragment': { id: 'bone_fragment', name: '뼈 조각', type: 'BEAST', description: '작은 뼈 조각.', rarity: 'N', iconUrl: '/assets/materials/bone_fragment.png' },
    'wood_branch': { id: 'wood_branch', name: '나뭇가지', type: 'PLANT', description: '마력이 깃든 나뭇가지.', rarity: 'N', iconUrl: '/assets/materials/wood_branch.png' },

    // Consumables (Potions)
    'potion_hp_small': { id: 'potion_hp_small', name: '소형 체력 포션', type: 'CONSUMABLE', description: '체력을 50 회복시켜줍니다.', rarity: 'N', iconUrl: '/assets/materials/potion_hp_small.png', sellPrice: 20 },
    'potion_mp_small': { id: 'potion_mp_small', name: '소형 마나 포션', type: 'CONSUMABLE', description: '마나를 30 회복시켜줍니다.', rarity: 'N', iconUrl: '/assets/materials/potion_mp_small.png', sellPrice: 20 },
    'potion_stamina': { id: 'potion_stamina', name: '스태미나 포션', type: 'CONSUMABLE', description: '활력을 불어넣어주는 포션.', rarity: 'N', iconUrl: '/assets/materials/potion_stamina.png', sellPrice: 30 },
    'potion_ironskin': { id: 'potion_ironskin', name: '강철 피부 포션', type: 'CONSUMABLE', description: '피부를 단단하게 만들어주는 포션.', rarity: 'N', iconUrl: '/assets/materials/potion_ironskin.png', sellPrice: 40 },
    'potion_light': { id: 'potion_light', name: '빛의 물약', type: 'CONSUMABLE', description: '어둠을 밝혀주는 빛나는 물약.', rarity: 'R', iconUrl: '/assets/materials/potion_light.png', sellPrice: 60 },

    // Mining Tiers
    'stone': { id: 'stone', name: '돌멩이', type: 'MINERAL', description: '흔히 볼 수 있는 돌멩이입니다. 단단해서 던지면 아픕니다.', rarity: 'N', iconUrl: '/assets/materials/stone.png', sellPrice: 1 },

    // Ingots (Refined from Ores)
    'ingot_copper': { id: 'ingot_copper', name: '구리 주괴', type: 'MINERAL', description: '불순물을 제거하고 제련한 구리 덩어리입니다.', rarity: 'N', iconUrl: '/assets/materials/ingot_copper.png', sellPrice: 120 },
    'ingot_iron': { id: 'ingot_iron', name: '철 주괴', type: 'MINERAL', description: '단단하게 제련된 철 덩어리입니다.', rarity: 'N', iconUrl: '/assets/materials/ingot_iron.png', sellPrice: 200 },
    'ingot_silver': { id: 'ingot_silver', name: '은 주괴', type: 'MINERAL', description: '은은하게 빛나는 순은 덩어리입니다.', rarity: 'R', iconUrl: '/assets/materials/ingot_silver.png', sellPrice: 500 },
    'ingot_gold': { id: 'ingot_gold', name: '금 주괴', type: 'MINERAL', description: '묵직하고 화려한 순금 덩어리입니다.', rarity: 'SR', iconUrl: '/assets/materials/ingot_gold.png', sellPrice: 1500 },
    'ingot_platinum': { id: 'ingot_platinum', name: '백금 주괴', type: 'MINERAL', description: '변하지 않는 빛을 가진 귀한 백금 덩어리입니다.', rarity: 'SSR', iconUrl: '/assets/materials/ingot_platinum.png', sellPrice: 3000 },
    'ore_copper': { id: 'ore_copper', name: '구리 광석', type: 'MINERAL', description: '붉은 빛이 도는 광석.', rarity: 'N', iconUrl: '/assets/materials/ore_copper.png', sellPrice: 10 },
    'ore_silver': { id: 'ore_silver', name: '은 광석', type: 'MINERAL', description: '반짝이는 은빛 광석.', rarity: 'R', iconUrl: '/assets/materials/ore_silver.png', sellPrice: 40 },
    'ore_gold': { id: 'ore_gold', name: '금 광석', type: 'MINERAL', description: '눈부신 황금빛 광석.', rarity: 'SR', iconUrl: '/assets/materials/ore_gold.png', sellPrice: 120 },
    'ore_platinum': { id: 'ore_platinum', name: '백금 광석', type: 'MINERAL', description: '가치 있는 백금 광석.', rarity: 'SSR', iconUrl: '/assets/materials/ore_platinum.png', sellPrice: 400 },
    'diamond': { id: 'diamond', name: '다이아몬드', type: 'MINERAL', description: '가장 단단하고 빛나는 보석.', rarity: 'SSR', iconUrl: '/assets/materials/diamond.png', sellPrice: 5000 },

    // Farming Tiers
    'herb_roots': { id: 'herb_roots', name: '약초 뿌리', type: 'PLANT', description: '약효가 뛰어난 약초의 뿌리.', rarity: 'N', iconUrl: '/assets/materials/herb_roots.png' },
    'herb_mystic': { id: 'herb_mystic', name: '신비의 약초', type: 'PLANT', description: '신비로운 힘을 가진 희귀 약초.', rarity: 'SR', iconUrl: '/assets/materials/herb_mystic.png' },
    'herb_yggdrasil': { id: 'herb_yggdrasil', name: '세계수의 잎', type: 'PLANT', description: '세계수의 생명력을 담은 잎사귀.', rarity: 'SSR', iconUrl: '/assets/materials/herb_yggdrasil.png' },

    // Elemental Essences Removed
    // 'essence_fire', 'essence_water', 'essence_earth', 'essence_wind' replaced by shards

    // ... existing SR materials ...
    'dragon_scale': { id: 'dragon_scale', name: '용의 비늘', type: 'BEAST', description: '드래곤의 단단한 비늘. 화염에도 녹지 않는다.', rarity: 'SSR', iconUrl: '/assets/materials/dragon_scale.png' },
    'dragon_horn': { id: 'dragon_horn', name: '용의 뿔', type: 'BEAST', description: '드래곤의 단단한 뿔.', rarity: 'SSR', iconUrl: '/assets/materials/dragon_horn.png' },
    'angel_feather': { id: 'angel_feather', name: '천사의 깃털', type: 'SPIRIT', description: '천사의 날개에서 떨어진 깃털. 신성한 기운을 뿜는다.', rarity: 'SSR', iconUrl: '/assets/materials/angel_feather.png' },
    'demon_horn': { id: 'demon_horn', name: '악마의 뿔', type: 'BEAST', description: '고위 악마의 뿔. 강력한 마력이 응축되어 있다.', rarity: 'SSR', iconUrl: '/assets/materials/demon_horn.png' },
    'kraken_leg': { id: 'kraken_leg', name: '크라켄 다리', type: 'BEAST', description: '심해의 거대 괴수 크라켄의 다리. 강력한 힘이 꿈틀거린다.', rarity: 'SSR', iconUrl: '/assets/materials/kraken_leg.png' },
    'spectral_ectoplasm': { id: 'spectral_ectoplasm', name: '유령의 기운', type: 'SPIRIT', description: '만질 수 없는 유령의 잔재.', rarity: 'SR', iconUrl: '/assets/materials/spectral_ectoplasm.png' },
    'goblin_totem': { id: 'goblin_totem', name: '고블린 토템', type: 'SPECIAL', description: '고블린 주술사가 사용하는 기이한 토템.', rarity: 'SR', iconUrl: '/assets/materials/goblin_totem.png' },
    'assassin_dagger': { id: 'assassin_dagger', name: '암살자의 단검', type: 'SPECIAL', description: '피 묻은 녹슨 단검.', rarity: 'SR', iconUrl: '/assets/materials/assassin_dagger.png' },
    'phoenix_feather': { id: 'phoenix_feather', name: '불사조의 깃털', type: 'SPIRIT', description: '꺼지지 않는 불씨가 남아있는 깃털.', rarity: 'SR', iconUrl: '/assets/materials/phoenix_feather.png' },
    'yeti_fur': { id: 'yeti_fur', name: '예티의 털', type: 'BEAST', description: '추위를 완벽하게 막아주는 두꺼운 털.', rarity: 'SR', iconUrl: '/assets/materials/yeti_fur.png' },

    // Beast Forest New Materials
    'shell_snail': { id: 'shell_snail', name: '달팽이 껍질', type: 'BEAST', description: '이끼가 낀 단단한 껍질.', rarity: 'N', iconUrl: '/assets/materials/stone.png' },
    'tusk_boar': { id: 'tusk_boar', name: '멧돼지 송곳니', type: 'BEAST', description: '거칠고 날카로운 송곳니.', rarity: 'N', iconUrl: '/assets/materials/beast_fang.png' },
    'silk_spider': { id: 'silk_spider', name: '거미줄', type: 'BEAST', description: '질기고 끈적한 거미줄.', rarity: 'N', iconUrl: '/assets/materials/scrap_cloth.png' },
    'acorn_magic': { id: 'acorn_magic', name: '마력 도토리', type: 'PLANT', description: '마력을 머금어 커진 도토리.', rarity: 'R', iconUrl: '/assets/materials/seed_ancient.png' },
    'leaf_life': { id: 'leaf_life', name: '생명의 나뭇잎', type: 'PLANT', description: '생명력이 넘치는 싱싱한 잎사귀.', rarity: 'R', iconUrl: '/assets/materials/herb_yggdrasil.png' },
}


// DB 시딩용 레시피 데이터 (JSON 형식)
interface DBRecipeSeed {
    id: string
    name?: string // Optional: Derived from monsterData if missing
    description?: string // Optional: Derived from monsterData if missing
    type?: 'MONSTER' | 'ITEM'
    resultMonsterId?: string // "monster_slime_basic" (optional if type is ITEM)
    resultItemId?: string // (optional if type is MONSTER)
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
        value_json?: unknown
        value_text?: string
    }>
}

const DB_RECIPES_SEED: DBRecipeSeed[] = [
    // Potion Recipes (Manual Crafting)
    {
        id: 'recipe_potion_hp_small',
        name: '소형 체력 포션',
        description: '체력을 회복시켜주는 작은 물약.',
        type: 'ITEM',
        resultItemId: 'potion_hp_small',
        resultCount: 1,
        baseSuccessRate: 100, // Potions are easy to make
        craftTimeSec: 3,
        costGold: 10,
        requiredAlchemyLevel: 1,
        expGain: 50,
        isHidden: false,
        priority: 100,
        ingredients: [
            { materialId: 'herb_common', quantity: 2, isCatalyst: false },
            { materialId: 'slime_fluid', quantity: 1, isCatalyst: false }
        ],
        conditions: []
    },
    {
        id: 'recipe_potion_mp_small',
        name: '소형 마나 포션',
        description: '마나를 회복시켜주는 작은 물약.',
        type: 'ITEM',
        resultItemId: 'potion_mp_small',
        resultCount: 1,
        baseSuccessRate: 100,
        craftTimeSec: 5,
        costGold: 20,
        requiredAlchemyLevel: 1, // Restriction removed
        expGain: 80,
        isHidden: false, // Initially visible
        priority: 99,
        ingredients: [
            { materialId: 'herb_common', quantity: 2, isCatalyst: false },
            { materialId: 'crystal_mana', quantity: 1, isCatalyst: false }
        ],
        conditions: []
    },
    {
        id: 'recipe_potion_stamina',
        name: '스태미나 포션',
        description: '약초와 돌을 섞어 만든 활력 포션.',
        type: 'ITEM',
        resultItemId: 'potion_stamina',
        resultCount: 1,
        baseSuccessRate: 95,
        craftTimeSec: 5,
        costGold: 15,
        requiredAlchemyLevel: 1,
        expGain: 60,
        isHidden: false,
        priority: 98,
        ingredients: [
            { materialId: 'herb_common', quantity: 3, isCatalyst: false },
            { materialId: 'stone', quantity: 1, isCatalyst: false }
        ],
        conditions: []
    },
    {
        id: 'recipe_potion_ironskin',
        name: '강철 피부 포션',
        description: '철광석의 성분을 추출한 포션.',
        type: 'ITEM',
        resultItemId: 'potion_ironskin',
        resultCount: 1,
        baseSuccessRate: 90,
        craftTimeSec: 8,
        costGold: 25,
        requiredAlchemyLevel: 1,
        expGain: 80,
        isHidden: false,
        priority: 97,
        ingredients: [
            { materialId: 'herb_common', quantity: 2, isCatalyst: false },
            { materialId: 'ore_iron', quantity: 1, isCatalyst: false }
        ],
        conditions: []
    },
    {
        id: 'recipe_potion_light',
        name: '빛의 물약',
        description: '정령의 가루로 만든 빛나는 물약.',
        type: 'ITEM',
        resultItemId: 'potion_light',
        resultCount: 1,
        baseSuccessRate: 85,
        craftTimeSec: 10,
        costGold: 40,
        requiredAlchemyLevel: 2,
        expGain: 120,
        isHidden: false,
        priority: 96,
        ingredients: [
            { materialId: 'herb_common', quantity: 2, isCatalyst: false },
            { materialId: 'spirit_dust', quantity: 1, isCatalyst: false }
        ],
        conditions: []
    },

    {
        id: 'recipe_slime_basic',
        resultMonsterId: 'monster_slime_basic',
        resultCount: 1,
        baseSuccessRate: 90,
        craftTimeSec: 2,
        costGold: 10,
        requiredAlchemyLevel: 1,
        expGain: 100,
        isHidden: false,
        priority: 100,
        ingredients: [
            { materialId: 'herb_common', quantity: 2, isCatalyst: false }
        ],
        conditions: []
    },
    {
        id: 'recipe_hound_fang',
        resultMonsterId: 'monster_hound_fang',
        resultCount: 1,
        baseSuccessRate: 90,
        craftTimeSec: 5,
        costGold: 50,
        requiredAlchemyLevel: 2,
        expGain: 200,
        isHidden: false,
        priority: 90,
        ingredients: [
            { materialId: 'beast_fang', quantity: 2, isCatalyst: false },
            { materialId: 'scrap_leather', quantity: 1, isCatalyst: false }
        ],
        conditions: []
    },
    {
        id: 'recipe_golem_stone',
        resultMonsterId: 'monster_golem_stone',
        resultCount: 1,
        baseSuccessRate: 90,
        craftTimeSec: 10,
        costGold: 100,
        requiredAlchemyLevel: 3,
        expGain: 300,
        isHidden: false,
        priority: 85,
        ingredients: [
            { materialId: 'stone', quantity: 10, isCatalyst: false },
            { materialId: 'ore_iron', quantity: 1, isCatalyst: false }
        ],
        conditions: []
    },
    {
        id: 'recipe_fairy_spirit',
        resultMonsterId: 'monster_fairy_spirit',
        resultCount: 1,
        baseSuccessRate: 90,
        craftTimeSec: 8,
        costGold: 80,
        requiredAlchemyLevel: 3,
        expGain: 250,
        isHidden: false,
        priority: 88,
        ingredients: [
            { materialId: 'spirit_dust', quantity: 3, isCatalyst: false },
            { materialId: 'shard_wind', quantity: 1, isCatalyst: false }, // Replaced essence_wind with shard_wind
            { materialId: 'flower_moonlight', quantity: 1, isCatalyst: false }
        ],
        conditions: []
    },
    {
        id: 'recipe_wolf_dark',
        resultMonsterId: 'monster_wolf_dark',
        resultCount: 1,
        baseSuccessRate: 90,
        craftTimeSec: 8,
        costGold: 120,
        requiredAlchemyLevel: 4,
        expGain: 350,
        isHidden: false,
        priority: 82,
        ingredients: [
            { materialId: 'beast_fang', quantity: 3, isCatalyst: false },
            { materialId: 'scrap_leather', quantity: 3, isCatalyst: false },
            { materialId: 'shard_dark', quantity: 1, isCatalyst: false } // Replaced essence_dark with shard_dark
        ],
        conditions: []
    },
    {
        id: 'recipe_slime_king',
        resultMonsterId: 'monster_slime_king',
        resultCount: 1,
        baseSuccessRate: 90,
        craftTimeSec: 15,
        costGold: 200,
        requiredAlchemyLevel: 3,
        expGain: 500,
        isHidden: false,
        priority: 75,
        ingredients: [
            { materialId: 'slime_gel', quantity: 10, isCatalyst: false },
            { materialId: 'slime_core', quantity: 5, isCatalyst: false },
            { materialId: 'crown_fragment', quantity: 1, isCatalyst: true } // King needs a crown
        ],
        conditions: []
    },
    {
        id: 'recipe_golem_magma',
        resultMonsterId: 'monster_golem_magma',
        resultCount: 1,
        baseSuccessRate: 90,
        craftTimeSec: 15,
        costGold: 250,
        requiredAlchemyLevel: 6,
        expGain: 600,
        isHidden: false,
        priority: 70,
        ingredients: [
            { materialId: 'ore_iron', quantity: 8, isCatalyst: false },
            { materialId: 'shard_fire', quantity: 3, isCatalyst: false },
            { materialId: 'fire_core', quantity: 1, isCatalyst: true }
        ],
        conditions: []
    },
    {
        id: 'recipe_slime_nightmare',
        resultMonsterId: 'monster_slime_nightmare',
        resultCount: 1,
        baseSuccessRate: 90,
        craftTimeSec: 10,
        costGold: 180,
        requiredAlchemyLevel: 5,
        expGain: 550,
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
        resultMonsterId: 'monster_fairy_dawn',
        resultCount: 1,
        baseSuccessRate: 90,
        craftTimeSec: 10,
        costGold: 150,
        requiredAlchemyLevel: 4,
        expGain: 450,
        isHidden: true,
        priority: 68,
        ingredients: [
            { materialId: 'spirit_dust', quantity: 4, isCatalyst: false },
            { materialId: 'shard_light', quantity: 1, isCatalyst: false },
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
        resultMonsterId: 'monster_guardian_tiger',
        resultCount: 1,
        baseSuccessRate: 90,
        craftTimeSec: 20,
        costGold: 300,
        requiredAlchemyLevel: 7,
        expGain: 800,
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
    },
    {
        id: 'recipe_slime_water',
        resultMonsterId: 'monster_slime_water',
        resultCount: 1,
        baseSuccessRate: 90,
        craftTimeSec: 5,
        costGold: 60,
        requiredAlchemyLevel: 2,
        expGain: 250,
        isHidden: false,
        priority: 89,
        ingredients: [
            { materialId: 'slime_fluid', quantity: 2, isCatalyst: false },
            { materialId: 'shard_water', quantity: 1, isCatalyst: false },
            { materialId: 'herb_common', quantity: 1, isCatalyst: false }
        ],
        conditions: []
    },
    {
        id: 'recipe_slime_dark',
        resultMonsterId: 'monster_slime_dark',
        resultCount: 1,
        baseSuccessRate: 90,
        craftTimeSec: 5,
        costGold: 70,
        requiredAlchemyLevel: 2,
        expGain: 300,
        isHidden: false,
        priority: 88,
        ingredients: [
            { materialId: 'slime_fluid', quantity: 2, isCatalyst: false },
            { materialId: 'shard_dark', quantity: 1, isCatalyst: false },
            { materialId: 'bone_fragment', quantity: 1, isCatalyst: false }
        ],
        conditions: []
    },
    {
        id: 'recipe_golem_wood',
        resultMonsterId: 'monster_golem_wood',
        resultCount: 1,
        baseSuccessRate: 90,
        craftTimeSec: 8,
        costGold: 90,
        requiredAlchemyLevel: 3,
        expGain: 350,
        isHidden: false,
        priority: 86,
        ingredients: [
            { materialId: 'wood_branch', quantity: 10, isCatalyst: false },
            { materialId: 'shard_earth', quantity: 2, isCatalyst: false },
            { materialId: 'spirit_dust', quantity: 3, isCatalyst: false }
        ],
        conditions: []
    },
    {
        id: 'recipe_mushroom',
        resultMonsterId: 'monster_mushroom',
        resultCount: 1,
        baseSuccessRate: 90,
        craftTimeSec: 2,
        costGold: 30,
        requiredAlchemyLevel: 1,
        expGain: 150,
        isHidden: false,
        priority: 95,
        ingredients: [
            { materialId: 'herb_roots', quantity: 3, isCatalyst: false },
            { materialId: 'slime_fluid', quantity: 1, isCatalyst: false }
        ],
        conditions: []
    },
    {
        id: 'recipe_mushroom_dark',
        resultMonsterId: 'monster_mushroom_dark',
        resultCount: 1,
        baseSuccessRate: 90,
        craftTimeSec: 8,
        costGold: 80,
        requiredAlchemyLevel: 3,
        expGain: 300,
        isHidden: false,
        priority: 84,
        ingredients: [
            { materialId: 'herb_common', quantity: 5, isCatalyst: false },
            { materialId: 'slime_core', quantity: 1, isCatalyst: false },
            { materialId: 'crystal_mana', quantity: 1, isCatalyst: false }
        ],
        conditions: []
    },
    {
        id: 'recipe_golem_gem',
        resultMonsterId: 'monster_golem_gem',
        resultCount: 1,
        baseSuccessRate: 90,
        craftTimeSec: 15,
        costGold: 220,
        requiredAlchemyLevel: 5,
        expGain: 550,
        isHidden: false,
        priority: 72,
        ingredients: [
            { materialId: 'ore_iron', quantity: 5, isCatalyst: false },
            { materialId: 'gem_fragment', quantity: 3, isCatalyst: false },
            { materialId: 'crystal_mana', quantity: 2, isCatalyst: false }
        ],
        conditions: []
    },
    // 눈꽃 몬스터 레시피 (Snow/Ice Monster Recipes)
    {
        id: 'recipe_snowflake_sprite',
        resultMonsterId: 'monster_snowflake_sprite',
        resultCount: 1,
        baseSuccessRate: 90,
        craftTimeSec: 2,
        costGold: 15,
        requiredAlchemyLevel: 1,
        expGain: 120,
        isHidden: false,
        priority: 94,
        ingredients: [
            { materialId: 'herb_common', quantity: 2, isCatalyst: false },
            { materialId: 'snowflake', quantity: 1, isCatalyst: false }
        ],
        conditions: []
    },
    {
        id: 'recipe_ice_slime',
        resultMonsterId: 'monster_ice_slime',
        resultCount: 1,
        baseSuccessRate: 90,
        craftTimeSec: 2,
        costGold: 25,
        requiredAlchemyLevel: 1,
        expGain: 150, // Edited by AI
        isHidden: false,
        priority: 93,
        ingredients: [
            { materialId: 'slime_fluid', quantity: 2, isCatalyst: false },
            { materialId: 'ice_shard', quantity: 1, isCatalyst: false }, // Adjusted quantity
            { materialId: 'frozen_dew', quantity: 1, isCatalyst: false } // Added logic
        ],
        conditions: []
    },
    {
        id: 'recipe_frost_bunny',
        resultMonsterId: 'monster_frost_bunny',
        resultCount: 1,
        baseSuccessRate: 90,
        craftTimeSec: 5,
        costGold: 35,
        requiredAlchemyLevel: 1,
        expGain: 180,
        isHidden: false,
        priority: 92,
        ingredients: [
            { materialId: 'herb_common', quantity: 3, isCatalyst: false },
            { materialId: 'snowflake', quantity: 2, isCatalyst: false },
            { materialId: 'beast_fang', quantity: 1, isCatalyst: false }
        ],
        conditions: []
    },
    {
        id: 'recipe_snow_fairy',
        resultMonsterId: 'monster_snow_fairy',
        resultCount: 1,
        baseSuccessRate: 90,
        craftTimeSec: 5,
        costGold: 60,
        requiredAlchemyLevel: 2,
        expGain: 250,
        isHidden: false,
        priority: 87,
        ingredients: [
            { materialId: 'snowflake', quantity: 3, isCatalyst: false },
            { materialId: 'frozen_dew', quantity: 1, isCatalyst: false },
            { materialId: 'spirit_dust', quantity: 1, isCatalyst: false }
        ],
        conditions: []
    },
    // Beast Forest Monsters (짐승의 숲 몬스터)
    {
        id: 'recipe_penguin',
        resultMonsterId: 'monster_penguin',
        resultCount: 1,
        baseSuccessRate: 90,
        craftTimeSec: 5,
        costGold: 40,
        requiredAlchemyLevel: 1,
        expGain: 200,
        isHidden: false,
        priority: 91,
        ingredients: [
            { materialId: 'leather_beast', quantity: 1, isCatalyst: false },
            { materialId: 'ice_shard', quantity: 1, isCatalyst: false },
            { materialId: 'feather_common', quantity: 2, isCatalyst: false }
        ],
        conditions: []
    },
    {
        id: 'recipe_gazelle',
        resultMonsterId: 'monster_gazelle',
        resultCount: 1,
        baseSuccessRate: 90,
        craftTimeSec: 5,
        costGold: 40,
        requiredAlchemyLevel: 1,
        expGain: 200,
        isHidden: false,
        priority: 91,
        ingredients: [
            { materialId: 'leather_beast', quantity: 1, isCatalyst: false },
            { materialId: 'herb_rare', quantity: 1, isCatalyst: false },
            { materialId: 'shard_wind', quantity: 1, isCatalyst: false }
        ],
        conditions: []
    },
    {
        id: 'recipe_scar_bear',
        resultMonsterId: 'monster_scar_bear',
        resultCount: 1,
        baseSuccessRate: 85,
        craftTimeSec: 20,
        costGold: 200,
        requiredAlchemyLevel: 5,
        expGain: 600,
        isHidden: false,
        priority: 75,
        ingredients: [
            { materialId: 'leather_beast', quantity: 3, isCatalyst: false },
            { materialId: 'claw_sharp', quantity: 2, isCatalyst: false },
            { materialId: 'beast_fang', quantity: 5, isCatalyst: false }
        ],
        conditions: []
    },
    // New Beast Forest Monsters
    {
        id: 'recipe_moss_snail',
        resultMonsterId: 'monster_moss_snail',
        resultCount: 1,
        baseSuccessRate: 90,
        craftTimeSec: 5,
        costGold: 30,
        requiredAlchemyLevel: 1,
        expGain: 150,
        isHidden: false,
        priority: 92,
        ingredients: [
            { materialId: 'shell_snail', quantity: 2, isCatalyst: false },
            { materialId: 'slime_fluid', quantity: 1, isCatalyst: false }
        ],
        conditions: []
    },
    {
        id: 'recipe_thorn_boar',
        resultMonsterId: 'monster_thorn_boar',
        resultCount: 1,
        baseSuccessRate: 90,
        craftTimeSec: 8,
        costGold: 50,
        requiredAlchemyLevel: 2,
        expGain: 200,
        isHidden: false,
        priority: 88,
        ingredients: [
            { materialId: 'tusk_boar', quantity: 2, isCatalyst: false },
            { materialId: 'leather_beast', quantity: 1, isCatalyst: false }
        ],
        conditions: []
    },
    {
        id: 'recipe_forest_spider',
        resultMonsterId: 'monster_forest_spider',
        resultCount: 1,
        baseSuccessRate: 90,
        craftTimeSec: 8,
        costGold: 60,
        requiredAlchemyLevel: 2,
        expGain: 220,
        isHidden: false,
        priority: 87,
        ingredients: [
            { materialId: 'silk_spider', quantity: 3, isCatalyst: false },
            { materialId: 'herb_common', quantity: 2, isCatalyst: false }
        ],
        conditions: []
    },
    {
        id: 'recipe_acorn_squirrel',
        resultMonsterId: 'monster_acorn_squirrel',
        resultCount: 1,
        baseSuccessRate: 90,
        craftTimeSec: 6,
        costGold: 45,
        requiredAlchemyLevel: 1,
        expGain: 180,
        isHidden: false,
        priority: 90,
        ingredients: [
            { materialId: 'acorn_magic', quantity: 1, isCatalyst: false },
            { materialId: 'scrap_leather', quantity: 2, isCatalyst: false }
        ],
        conditions: []
    },
    {
        id: 'recipe_leaf_sprite',
        resultMonsterId: 'monster_leaf_sprite',
        resultCount: 1,
        baseSuccessRate: 90,
        craftTimeSec: 10,
        costGold: 80,
        requiredAlchemyLevel: 3,
        expGain: 300,
        isHidden: false,
        priority: 85,
        ingredients: [
            { materialId: 'leaf_life', quantity: 2, isCatalyst: false },
            { materialId: 'spirit_dust', quantity: 1, isCatalyst: false }
        ],
        conditions: []
    },
    // Conditional Monster Recipes
    {
        id: 'recipe_owl_night',
        resultMonsterId: 'monster_owl_night',
        resultCount: 1,
        baseSuccessRate: 90,
        craftTimeSec: 10,
        costGold: 100,
        requiredAlchemyLevel: 3,
        expGain: 400,
        isHidden: true, // Special monsters are hidden by default -> Unlocked by conditions? No, let's make them visible if condition met (handled by UI filtering usually, or just show them)
        // For now, let's keep isHidden false so users can see them if they meet requirements (or see them greyed out)
        // Actually, logic usually hides them if they are 'secret'. Let's make them visible.
        priority: 70,
        ingredients: [
            { materialId: 'herb_special', quantity: 2, isCatalyst: false },
            { materialId: 'gem_dark', quantity: 1, isCatalyst: false }
        ],
        conditions: [
            {
                conditionType: 'real_time_range',
                timeStart: '18:00:00',
                timeEnd: '06:00:00'
            }
        ]
    },
    {
        id: 'recipe_rooster_morning',
        resultMonsterId: 'monster_rooster_morning',
        resultCount: 1,
        baseSuccessRate: 90,
        craftTimeSec: 8,
        costGold: 50,
        requiredAlchemyLevel: 2,
        expGain: 300,
        isHidden: false,
        priority: 71,
        ingredients: [
            { materialId: 'herb_common', quantity: 5, isCatalyst: false },
            { materialId: 'shard_fire', quantity: 1, isCatalyst: false }
        ],
        conditions: [
            {
                conditionType: 'real_time_range',
                timeStart: '05:00:00',
                timeEnd: '10:00:00'
            }
        ]
    },
    {
        id: 'recipe_turtle_weekend',
        resultMonsterId: 'monster_turtle_weekend',
        resultCount: 1,
        baseSuccessRate: 90,
        craftTimeSec: 15,
        costGold: 150,
        requiredAlchemyLevel: 4,
        expGain: 500,
        isHidden: false,
        priority: 69,
        ingredients: [
            { materialId: 'slime_gel', quantity: 5, isCatalyst: false },
            { materialId: 'shard_water', quantity: 2, isCatalyst: false },
            { materialId: 'leather_beast', quantity: 2, isCatalyst: false }
        ],
        conditions: [
            {
                conditionType: 'weekday',
                value_json: [0, 6] // 0: Sun, 6: Sat
            }
        ]
    },
    {
        id: 'recipe_golem_desktop',
        resultMonsterId: 'monster_golem_desktop',
        resultCount: 1,
        baseSuccessRate: 90,
        craftTimeSec: 20,
        costGold: 300,
        requiredAlchemyLevel: 5,
        expGain: 800,
        isHidden: false,
        priority: 60,
        ingredients: [
            { materialId: 'ore_iron', quantity: 10, isCatalyst: false },
            { materialId: 'ore_magic', quantity: 5, isCatalyst: false },
            { materialId: 'crystal_mana', quantity: 2, isCatalyst: false }
        ],
        conditions: [
            {
                conditionType: 'device_type',
                value_text: 'DESKTOP'
            }
        ]
    },
    {
        id: 'recipe_slime_mobile',
        resultMonsterId: 'monster_slime_mobile',
        resultCount: 1,
        baseSuccessRate: 90,
        craftTimeSec: 5,
        costGold: 20,
        requiredAlchemyLevel: 1,
        expGain: 150,
        isHidden: false,
        priority: 95,
        ingredients: [
            { materialId: 'slime_fluid', quantity: 3, isCatalyst: false },
            { materialId: 'essence', quantity: 1, isCatalyst: false }
        ],
        conditions: [
            {
                conditionType: 'device_type',
                value_text: 'MOBILE'
            }
        ]
    },

    // ==========================================
    // New SR/SSR Recipes
    // ==========================================

    // SSR Recipes
    {
        id: 'recipe_dragon_inferno',
        resultMonsterId: 'monster_dragon_inferno',
        resultCount: 1,
        baseSuccessRate: 60,
        craftTimeSec: 60,
        costGold: 1000,
        requiredAlchemyLevel: 8,
        expGain: 2000,
        isHidden: true,
        priority: 50,
        ingredients: [
            { materialId: 'dragon_scale', quantity: 1, isCatalyst: false },
            { materialId: 'ore_mythril', quantity: 5, isCatalyst: false },
            { materialId: 'fire_core', quantity: 3, isCatalyst: true }
        ],
        conditions: []
    },
    {
        id: 'recipe_angel_arch',
        resultMonsterId: 'monster_angel_arch',
        resultCount: 1,
        baseSuccessRate: 60,
        craftTimeSec: 60,
        costGold: 1000,
        requiredAlchemyLevel: 8,
        expGain: 2000,
        isHidden: true,
        priority: 50,
        ingredients: [
            { materialId: 'angel_feather', quantity: 1, isCatalyst: false },
            { materialId: 'shard_light', quantity: 5, isCatalyst: false },
            { materialId: 'rune_world', quantity: 1, isCatalyst: true }
        ],
        conditions: []
    },
    {
        id: 'recipe_demon_lord',
        resultMonsterId: 'monster_demon_lord',
        resultCount: 1,
        baseSuccessRate: 60,
        craftTimeSec: 60,
        costGold: 1000,
        requiredAlchemyLevel: 8,
        expGain: 2000,
        isHidden: true,
        priority: 50,
        ingredients: [
            { materialId: 'demon_horn', quantity: 1, isCatalyst: false },
            { materialId: 'dark_crystal', quantity: 10, isCatalyst: false },
            { materialId: 'soul_fragment', quantity: 5, isCatalyst: true }
        ],
        conditions: []
    },
    {
        id: 'recipe_kraken_abyss',
        resultMonsterId: 'monster_kraken_abyss',
        resultCount: 1,
        baseSuccessRate: 60,
        craftTimeSec: 60,
        costGold: 1000,
        requiredAlchemyLevel: 8,
        expGain: 2000,
        isHidden: true,
        priority: 50,
        ingredients: [
            { materialId: 'kraken_leg', quantity: 1, isCatalyst: false },
            { materialId: 'shard_water', quantity: 10, isCatalyst: false },
            { materialId: 'gem_fragment', quantity: 5, isCatalyst: true }
        ],
        conditions: []
    },

    // SR Recipes
    {
        id: 'recipe_knight_spectral',
        resultMonsterId: 'monster_knight_spectral',
        resultCount: 1,
        baseSuccessRate: 75,
        craftTimeSec: 40,
        costGold: 500,
        requiredAlchemyLevel: 6,
        expGain: 1000,
        isHidden: false,
        priority: 60,
        ingredients: [
            { materialId: 'spectral_ectoplasm', quantity: 2, isCatalyst: false },
            { materialId: 'ore_iron', quantity: 10, isCatalyst: false },
            { materialId: 'shard_dark', quantity: 3, isCatalyst: false }
        ],
        conditions: []
    },
    {
        id: 'recipe_shaman_goblin',
        resultMonsterId: 'monster_shaman_goblin',
        resultCount: 1,
        baseSuccessRate: 75,
        craftTimeSec: 40,
        costGold: 450,
        requiredAlchemyLevel: 6,
        expGain: 900,
        isHidden: false,
        priority: 60,
        ingredients: [
            { materialId: 'goblin_totem', quantity: 1, isCatalyst: false },
            { materialId: 'herb_special', quantity: 3, isCatalyst: false },
            { materialId: 'shard_earth', quantity: 3, isCatalyst: false }
        ],
        conditions: []
    },
    {
        id: 'recipe_assassin_shadow',
        resultMonsterId: 'monster_assassin_shadow',
        resultCount: 1,
        baseSuccessRate: 75,
        craftTimeSec: 40,
        costGold: 500,
        requiredAlchemyLevel: 6,
        expGain: 1000,
        isHidden: false,
        priority: 60,
        ingredients: [
            { materialId: 'assassin_dagger', quantity: 1, isCatalyst: false },
            { materialId: 'gem_dark', quantity: 2, isCatalyst: false },
            { materialId: 'shard_wind', quantity: 2, isCatalyst: false }
        ],
        conditions: []
    },
    {
        id: 'recipe_phoenix_baby',
        resultMonsterId: 'monster_phoenix_baby',
        resultCount: 1,
        baseSuccessRate: 75,
        craftTimeSec: 20,
        costGold: 600,
        requiredAlchemyLevel: 7,
        expGain: 1200,
        isHidden: false,
        priority: 60,
        ingredients: [
            { materialId: 'phoenix_feather', quantity: 1, isCatalyst: false },
            { materialId: 'shard_fire', quantity: 5, isCatalyst: false },
            { materialId: 'herb_special', quantity: 3, isCatalyst: false }
        ],
        conditions: []
    },
    {
        id: 'recipe_yeti_ancient',
        resultMonsterId: 'monster_yeti_ancient',
        resultCount: 1,
        baseSuccessRate: 75,
        craftTimeSec: 20,
        costGold: 600,
        requiredAlchemyLevel: 7,
        expGain: 1200,
        isHidden: false,
        priority: 60,
        ingredients: [
            { materialId: 'yeti_fur', quantity: 1, isCatalyst: false },
            { materialId: 'ice_shard', quantity: 10, isCatalyst: false },
            { materialId: 'ore_iron', quantity: 5, isCatalyst: false }
        ],
        conditions: []
    },
    // New Recipes for Added Monsters
    {
        id: 'recipe_skeleton_soldier',
        resultMonsterId: 'monster_skeleton_soldier',
        resultCount: 1,
        baseSuccessRate: 95,
        craftTimeSec: 5,
        costGold: 30,
        requiredAlchemyLevel: 1,
        expGain: 150,
        isHidden: false,
        priority: 95,
        ingredients: [
            { materialId: 'bone_fragment', quantity: 5, isCatalyst: false },
            { materialId: 'scrap_leather', quantity: 2, isCatalyst: false }
        ],
        conditions: []
    },
    {
        id: 'recipe_scarecrow',
        resultMonsterId: 'monster_scarecrow',
        resultCount: 1,
        baseSuccessRate: 95,
        craftTimeSec: 8,
        costGold: 20,
        requiredAlchemyLevel: 1,
        expGain: 150,
        isHidden: false,
        priority: 96,
        ingredients: [
            { materialId: 'wood_branch', quantity: 5, isCatalyst: false },
            { materialId: 'scrap_cloth', quantity: 3, isCatalyst: false },
            { materialId: 'herb_roots', quantity: 2, isCatalyst: false }
        ],
        conditions: []
    },
    {
        id: 'recipe_copper_golem',
        resultMonsterId: 'monster_copper_golem',
        resultCount: 1,
        baseSuccessRate: 90,
        craftTimeSec: 15,
        costGold: 100,
        requiredAlchemyLevel: 2,
        expGain: 300,
        isHidden: false,
        priority: 90,
        ingredients: [
            { materialId: 'ore_copper', quantity: 8, isCatalyst: false },
            { materialId: 'stone', quantity: 5, isCatalyst: false }
        ],
        conditions: []
    },
    {
        id: 'recipe_silver_wolf',
        resultMonsterId: 'monster_silver_wolf',
        resultCount: 1,
        baseSuccessRate: 85,
        craftTimeSec: 20,
        costGold: 300,
        requiredAlchemyLevel: 4,
        expGain: 500,
        isHidden: false,
        priority: 80,
        ingredients: [
            { materialId: 'ore_silver', quantity: 3, isCatalyst: false },
            { materialId: 'beast_fang', quantity: 5, isCatalyst: false },
            { materialId: 'scrap_leather', quantity: 5, isCatalyst: false }
        ],
        conditions: []
    },
    {
        id: 'recipe_golden_bat',
        resultMonsterId: 'monster_golden_bat',
        resultCount: 1,
        baseSuccessRate: 80,
        craftTimeSec: 40,
        costGold: 800,
        requiredAlchemyLevel: 6,
        expGain: 1000,
        isHidden: false,
        priority: 70,
        ingredients: [
            { materialId: 'ore_gold', quantity: 3, isCatalyst: false },
            { materialId: 'ore_copper', quantity: 5, isCatalyst: false },
            { materialId: 'scrap_cloth', quantity: 5, isCatalyst: false }
        ],
        conditions: []
    }
]

// 런타임용 레시피 (TypeScript 타입)
export const RECIPES: Recipe[] = DB_RECIPES_SEED.map(dbRecipe => {
    const monster = dbRecipe.resultMonsterId ? MONSTER_DATA[dbRecipe.resultMonsterId] : undefined
    return {
        id: dbRecipe.id,
        name: dbRecipe.name || monster?.name || 'Unknown Recipe',
        description: dbRecipe.description || monster?.description || 'No description',
        type: dbRecipe.type || 'MONSTER',
        resultMonsterId: dbRecipe.resultMonsterId?.replace(/^monster_/, ''), // "monster_slime_basic" -> "slime_basic"
        resultItemId: dbRecipe.resultItemId,
        resultCount: dbRecipe.resultCount || 1,
        materials: dbRecipe.ingredients.map(ing => ({
            materialId: ing.materialId,
            count: ing.quantity
        })),
        craftTimeSec: dbRecipe.craftTimeSec,
        successRate: dbRecipe.baseSuccessRate,
        requiredAlchemyLevel: dbRecipe.requiredAlchemyLevel,
        isHidden: dbRecipe.isHidden,
        conditions: dbRecipe.conditions.map(cond => ({
            type: cond.conditionType as RecipeCondition['type'],
            conditionType: cond.conditionType as RecipeCondition['type'],
            value_json: cond.value_json,
            value_text: cond.value_text,
            value: cond.timeStart && cond.timeEnd
                ? { timeStart: cond.timeStart, timeEnd: cond.timeEnd }
                : cond.languageCode
                    ? { languageCode: cond.languageCode }
                    : undefined
        })) as RecipeCondition[]
    }
})

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
            sellPrice: mat.sellPrice || 0,
            source_info: null, // sourceInfo는 필요시 추가
            is_special: isSpecial
        }
    })
}

/**
 * DB 시딩용 레시피 데이터 반환
 */
export function getRecipesForDB() {
    // Hydrate name and description from MONSTER_DATA if missing
    return DB_RECIPES_SEED.map(recipe => {
        const monster = recipe.resultMonsterId ? MONSTER_DATA[recipe.resultMonsterId] : undefined
        return {
            ...recipe,
            name: recipe.name || monster?.name || 'Unknown Recipe',
            description: recipe.description || monster?.description || 'No description'
        }
    })
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