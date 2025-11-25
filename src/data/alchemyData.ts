import type { Material, Monster } from '../types/alchemy'

export const MATERIALS: Record<string, Material> = {
    'herb_common': { id: 'herb_common', name: '일반 약초', type: 'PLANT', description: '흔하게 볼 수 있는 약초.', rarity: 'N', iconUrl: '/assets/materials/herb_common.png' },
    'herb_rare': { id: 'herb_rare', name: '희귀 약초', type: 'PLANT', description: '희귀하게 자라는 약초.', rarity: 'R', iconUrl: '/assets/materials/herb_rare.png' },
    'herb_special': { id: 'herb_special', name: '특수 약초', type: 'PLANT', description: '특수 효과를 가진 약초.', rarity: 'SR', iconUrl: '/assets/materials/herb_special.png' },
    'slime_core': { id: 'slime_core', name: '슬라임 코어', type: 'SLIME', description: '슬라임의 핵.', rarity: 'N', iconUrl: '/assets/materials/slime_core.png' },
    'beast_fang': { id: 'beast_fang', name: '짐승 송곳니', type: 'BEAST', description: '날카로운 이빨.', rarity: 'N', iconUrl: '/assets/materials/beast_fang.png' },
    'magic_ore': { id: 'magic_ore', name: '마력 광석', type: 'MINERAL', description: '마력이 깃든 광석.', rarity: 'R' },
    'spirit_dust': { id: 'spirit_dust', name: '정령 가루', type: 'SPIRIT', description: '반짝이는 가루.', rarity: 'R' },
    'dark_crystal': { id: 'dark_crystal', name: '어둠의 결정', type: 'MINERAL', description: '어두운 기운이 감도는 결정.', rarity: 'R' },
    'crown_shard': { id: 'crown_shard', name: '왕관 파편', type: 'SPECIAL', description: '부서진 왕관의 조각.', rarity: 'SR' },
    'fire_core': { id: 'fire_core', name: '불 던전 코어', type: 'SPECIAL', description: '뜨거운 열기를 내뿜는 코어.', rarity: 'SR' },
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
