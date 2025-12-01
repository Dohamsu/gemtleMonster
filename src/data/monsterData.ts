import type { Monster, RoleType, ElementType, RarityType } from '../types/alchemy'

// Shared monster data for the entire app
export interface MonsterData {
    name: string
    description: string
    role: string
    hp: number
    attack: number
    defense: number
    emoji: string
    iconUrl?: string
    rarity?: 'N' | 'R' | 'SR' | 'SSR'
    element?: 'fire' | 'water' | 'earth' | 'wind' | 'light' | 'dark'
    factoryTrait?: {
        targetFacility: string
        effect: string
        value: number
    }
}

export const MONSTER_DATA: Record<string, MonsterData> = {
    'monster_slime_basic': {
        name: '기본 슬라임',
        description: '가장 기초적인 슬라임 몬스터. 던전 입문에 적합합니다.',
        role: '탱커',
        hp: 150,
        attack: 20,
        defense: 30,
        emoji: '🟢',
        iconUrl: '/assets/monsters/slime_basic.png',
        rarity: 'N',
        factoryTrait: { targetFacility: 'herb_farm', effect: '생산량 증가', value: 5 }
    },
    'monster_hound_fang': {
        name: '송곳니 하운드',
        description: '민첩한 공격형 몬스터. 빠른 공격이 특징입니다.',
        role: '딜러',
        hp: 100,
        attack: 45,
        defense: 15,
        emoji: '🐺',
        iconUrl: '/assets/monsters/hound_basic.png',
        rarity: 'N'
    },
    'monster_golem_stone': {
        name: '돌 골렘',
        description: '단단한 방어형 골렘. 높은 방어력으로 팀을 지킵니다.',
        role: '탱커',
        hp: 250,
        attack: 25,
        defense: 60,
        emoji: '🗿',
        iconUrl: '/assets/monsters/stoneGolem.png',
        rarity: 'R',
        element: 'earth',
        factoryTrait: { targetFacility: 'mine', effect: '생산량 증가', value: 10 }
    },
    'monster_fairy_spirit': {
        name: '정령 요정',
        description: '회복과 버프를 제공하는 서포트 몬스터.',
        role: '서포터',
        hp: 80,
        attack: 15,
        defense: 20,
        emoji: '🧚',
        iconUrl: '/assets/monsters/fairySpirit.png',
        rarity: 'R',
        element: 'wind'
    },
    'monster_wolf_dark': {
        name: '어둠 늑대',
        description: '어둠 속성의 강력한 딜러. 치명타에 특화되어 있습니다.',
        role: '딜러',
        hp: 120,
        attack: 60,
        defense: 25,
        emoji: '🐺',
        rarity: 'SR',
        element: 'dark'
    },
    'monster_slime_king': {
        name: '왕슬라임',
        description: '슬라임의 왕. 강력한 탱커이자 리더입니다.',
        role: '탱커',
        hp: 350,
        attack: 35,
        defense: 70,
        emoji: '👑',
        iconUrl: '/assets/monsters/slime_king.png',
        rarity: 'SR',
        element: 'water',
        factoryTrait: { targetFacility: 'herb_farm', effect: '생산량 대폭 증가', value: 20 }
    },
    'monster_golem_magma': {
        name: '마그마 골렘',
        description: '불 속성의 공격형 골렘. 화염 공격으로 적을 태웁니다.',
        role: '딜러',
        hp: 200,
        attack: 70,
        defense: 40,
        emoji: '🔥',
        iconUrl: '/assets/monsters/ironGolem.png',
        rarity: 'SR',
        element: 'fire'
    },
    'monster_slime_nightmare': {
        name: '악몽 슬라임',
        description: '심야에만 만들 수 있는 디버프 특화 몬스터.',
        role: '딜러',
        hp: 180,
        attack: 55,
        defense: 35,
        emoji: '👻',
        rarity: 'R',
        element: 'dark'
    },
    'monster_fairy_dawn': {
        name: '새벽 정령',
        description: '새벽에만 소환 가능한 경험치 버프 정령.',
        role: '서포터',
        hp: 90,
        attack: 20,
        defense: 25,
        emoji: '✨',
        rarity: 'R',
        element: 'light'
    },
    'monster_guardian_tiger': {
        name: '호랑이 수호령',
        description: '한국 전통의 수호령. 치명타에 특화된 전설급 몬스터입니다.',
        role: '딜러',
        hp: 300,
        attack: 90,
        defense: 50,
        emoji: '🐯',
        rarity: 'SSR',
        element: 'light'
    },
    'monster_slime_water': {
        name: '워터 슬라임',
        description: '맑은 물로 이루어진 슬라임. 물리 공격에 강한 내성을 가집니다.',
        role: '탱커',
        hp: 200,
        attack: 25,
        defense: 40,
        emoji: '💧',
        iconUrl: '/assets/monsters/slime_water.png',
        rarity: 'R',
        element: 'water',
        factoryTrait: { targetFacility: 'water_purifier', effect: '정화 속도 증가', value: 10 }
    },
    'monster_slime_dark': {
        name: '다크 슬라임',
        description: '어둠에 물든 슬라임. 은밀하게 접근하여 적을 공격합니다.',
        role: '딜러',
        hp: 160,
        attack: 50,
        defense: 20,
        emoji: '🌑',
        iconUrl: '/assets/monsters/slime_dark.png',
        rarity: 'R',
        element: 'dark'
    },
    'monster_golem_wood': {
        name: '나무 골렘',
        description: '숲의 정령이 깃든 골렘. 자연의 힘으로 아군을 보호합니다.',
        role: '서포터',
        hp: 180,
        attack: 30,
        defense: 45,
        emoji: '🌳',
        iconUrl: '/assets/monsters/woodGolem.png',
        rarity: 'R',
        element: 'earth'
    },
    // Dungeon Enemies (Synced from dungeonData.ts)
    'slime_green': {
        name: '초록 슬라임',
        description: '가장 흔하게 볼 수 있는 초록색 슬라임.',
        role: '탱커',
        hp: 30,
        attack: 5,
        defense: 1,
        emoji: '🟢',
        iconUrl: '/assets/monsters/slime_basic.png', // Placeholder
        rarity: 'N',
        element: 'earth'
    },
    'slime_blue': {
        name: '파랑 슬라임',
        description: '약간의 마력을 머금은 파란색 슬라임.',
        role: '탱커',
        hp: 50,
        attack: 8,
        defense: 2,
        emoji: '🔵',
        iconUrl: '/assets/monsters/slime_water.png', // Placeholder
        rarity: 'N',
        element: 'water'
    },
    'lake_fairy': {
        name: '호수의 요정',
        description: '호수를 지키는 작은 요정.',
        role: '서포터',
        hp: 50,
        attack: 15,
        defense: 5,
        emoji: '🧚‍♀️',
        iconUrl: '/assets/monsters/fairySpirit.png', // Placeholder
        rarity: 'R',
        element: 'water'
    },
    'slime_water_giant': {
        name: '거대 워터 슬라임',
        description: '거대해진 워터 슬라임. 강력한 수압으로 공격합니다.',
        role: '탱커',
        hp: 300,
        attack: 35,
        defense: 10,
        emoji: '🌊',
        iconUrl: '/assets/monsters/slime_water_big.png',
        rarity: 'SR',
        element: 'water'
    }
}

export const getMonsterName = (monsterId: string): string => {
    return MONSTER_DATA[monsterId]?.name || monsterId
}

export const getMonsterData = (monsterId: string): MonsterData | undefined => {
    return MONSTER_DATA[monsterId]
}

// ==========================================
// Game Logic Adapter (Legacy Compatibility)
// ==========================================

const ROLE_MAP: Record<string, RoleType> = {
    '탱커': 'TANK',
    '딜러': 'DPS',
    '서포터': 'SUPPORT',
    '하이브리드': 'HYBRID',
    '생산': 'PRODUCTION'
}

export const GAME_MONSTERS: Record<string, Monster> = Object.entries(MONSTER_DATA).reduce((acc, [key, data]) => {
    // Remove 'monster_' prefix for game logic keys if needed, 
    // BUT current game logic seems to use keys like 'slime_basic' (without prefix) 
    // or 'monster_slime_basic' (with prefix).
    // Let's check alchemyData.ts again. It uses keys like 'slime_basic'.
    // So we need to strip 'monster_' prefix.
    const shortKey = key.replace(/^monster_/, '')

    acc[shortKey] = {
        id: shortKey,
        name: data.name,
        role: ROLE_MAP[data.role] || 'TANK',
        element: (data.element?.toUpperCase() || 'EARTH') as ElementType,
        rarity: (data.rarity || 'N') as RarityType,
        description: data.description,
        iconUrl: data.iconUrl,
        baseStats: {
            hp: data.hp,
            atk: data.attack,
            def: data.defense
        },
        factoryTrait: data.factoryTrait
    }
    return acc
}, {} as Record<string, Monster>)

