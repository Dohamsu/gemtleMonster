import type { Material, Monster } from '../types/alchemy'

export const MATERIALS: Record<string, Material> = {
    'herb_common': { id: 'herb_common', name: '일반 약초', type: 'PLANT', description: '흔하게 볼 수 있는 약초.', rarity: 'N', iconUrl: '/assets/materials/herb_common.png' },
    'herb_rare': { id: 'herb_rare', name: '희귀 약초', type: 'PLANT', description: '희귀하게 자라는 약초.', rarity: 'R', iconUrl: '/assets/materials/herb_rare.png' },
    'herb_special': { id: 'herb_special', name: '특수 약초', type: 'PLANT', description: '특수 효과를 가진 약초.', rarity: 'SR', iconUrl: '/assets/materials/herb_special.png' },
    'slime_fluid': { id: 'slime_fluid', name: '슬라임 액체', type: 'SLIME', description: '슬라임의 끈적한 액체.', rarity: 'N', iconUrl: '/assets/materials/slime_fluid.png' },
    'slime_core': { id: 'slime_core', name: '슬라임 코어', type: 'SLIME', description: '슬라임의 핵.', rarity: 'N', iconUrl: '/assets/materials/slime_core.png' },
    'beast_fang': { id: 'beast_fang', name: '짐승 송곳니', type: 'BEAST', description: '날카로운 이빨.', rarity: 'N', iconUrl: '/assets/materials/beast_fang.png' },
    'ore_iron': { id: 'ore_iron', name: '철광석', type: 'MINERAL', description: '단단한 철광석.', rarity: 'N', iconUrl: '/assets/materials/ore_iron.png' },
    'ore_magic': { id: 'ore_magic', name: '마력 광석', type: 'MINERAL', description: '마력이 깃든 광석.', rarity: 'R', iconUrl: '/assets/materials/ore_magic.png' },
    'gem_fragment': { id: 'gem_fragment', name: '보석 파편', type: 'MINERAL', description: '반짝이는 보석 조각.', rarity: 'R', iconUrl: '/assets/materials/gem_fragment.png' },
    'crack_stone_fragment': { id: 'crack_stone_fragment', name: '균열석 파편', type: 'SPECIAL', description: '차원의 균열에서 나온 돌조각.', rarity: 'SR', iconUrl: '/assets/materials/crack_stone_fragment.png' },
    'ancient_relic_fragment': { id: 'ancient_relic_fragment', name: '고대 유물 파편', type: 'SPECIAL', description: '알 수 없는 고대의 유물 조각.', rarity: 'SR', iconUrl: '/assets/materials/ancient_relic_fragment.png' },
    'magic_ore': { id: 'magic_ore', name: '마력 광석(구)', type: 'MINERAL', description: '마력이 깃든 광석.', rarity: 'R', iconUrl: '/assets/materials/ore_magic.png' },
    'spirit_dust': { id: 'spirit_dust', name: '정령 가루', type: 'SPIRIT', description: '반짝이는 가루.', rarity: 'R', iconUrl: '✨' },
    'dark_crystal': { id: 'dark_crystal', name: '어둠의 결정', type: 'MINERAL', description: '어두운 기운이 감도는 결정.', rarity: 'R', iconUrl: '🔮' },
    'crown_shard': { id: 'crown_shard', name: '왕관 파편', type: 'SPECIAL', description: '부서진 왕관의 조각.', rarity: 'SR', iconUrl: '👑' },
    'fire_core': { id: 'fire_core', name: '불 던전 코어', type: 'SPECIAL', description: '뜨거운 열기를 내뿜는 코어.', rarity: 'SR', iconUrl: '🔥' },

    // Decompose System Materials
    'essence': { id: 'essence', name: '몬스터 정수', type: 'SPECIAL', description: '몬스터의 생명력이 응축된 정수.', rarity: 'N', iconUrl: '💧' },
    'shard_fire': { id: 'shard_fire', name: '불의 파편', type: 'MINERAL', description: '불 속성 몬스터의 힘이 담긴 파편.', rarity: 'R', iconUrl: '🔴' },
    'shard_water': { id: 'shard_water', name: '물의 파편', type: 'MINERAL', description: '물 속성 몬스터의 힘이 담긴 파편.', rarity: 'R', iconUrl: '🔵' },
    'shard_earth': { id: 'shard_earth', name: '대지의 파편', type: 'MINERAL', description: '대지 속성 몬스터의 힘이 담긴 파편.', rarity: 'R', iconUrl: '🟤' },
    'shard_wind': { id: 'shard_wind', name: '바람의 파편', type: 'MINERAL', description: '바람 속성 몬스터의 힘이 담긴 파편.', rarity: 'R', iconUrl: '🟢' },
    'shard_light': { id: 'shard_light', name: '빛의 파편', type: 'MINERAL', description: '빛 속성 몬스터의 힘이 담긴 파편.', rarity: 'R', iconUrl: '🟡' },
    'shard_dark': { id: 'shard_dark', name: '어둠의 파편', type: 'MINERAL', description: '어둠 속성 몬스터의 힘이 담긴 파편.', rarity: 'R', iconUrl: '🟣' },
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
