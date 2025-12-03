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
        description: '연금술 초보도 쉽게 다루는 가장 기본형 슬라임. 느릿하지만 탁월한 회복력으로 전열을 지키는 입문용 몬스터입니다.',
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
        description: '새하얀 송곳니를 번뜩이며 달려드는 사냥견. 그림자처럼 움직이며 끊임없는 연속 공격을 퍼붓습니다.',
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
        description: '고대 성채의 파편으로 빚어낸 돌 골렘. 거대한 몸으로 일행 앞을 막아서 모든 공격을 받아냅니다.',
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
        description: '숲의 바람과 속삭이는 정령 요정. 아군의 상처를 치유하고 능력을 일시적으로 끌어올려 줍니다.',
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
        description: '달빛조차 스며들지 않는 그림자 속을 달리는 늑대. 어둠 속에서 찌르는 한 방의 치명타로 적을 쓰러뜨립니다.',
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
        description: '모든 슬라임을 다스리는 점액의 군주. 둔중하지만 압도적인 체력과 방어력으로 전장을 지배합니다.',
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
        description: '분화구 깊은 곳에서 깨어난 마그마 골렘. 끊임없이 타오르는 화염 주먹으로 적을 재로 만들어 버립니다.',
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
        description: '잠든 자의 악몽이 응고되어 탄생한 슬라임. 적에게 각종 약화 효과를 퍼뜨려 전투를 서서히 무너뜨립니다.',
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
        description: '해가 떠오르는 찰나에만 모습을 드러내는 새벽의 정령. 아군이 얻는 경험치를 높여 성장을 가속시켜 줍니다.',
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
        description: '옛 사당을 지키던 호랑이 수호령이 형상을 드러낸 존재. 번개 같은 발톱으로 적의 급소를 정확히 노립니다.',
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
        description: '맑고 차가운 물기만으로 이루어진 슬라임. 물리 공격을 상쇄하며 흐르는 방어막처럼 아군을 지켜줍니다.',
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
        description: '어둠에 잠식된 점액이 모여 만들어진 슬라임. 인기척 없이 다가가 그림자에서 기습을 가합니다.',
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
        description: '오래된 숲의 수호목이 움직이기 시작한 골렘. 자연의 수호력을 빌려 아군을 단단히 감싸 보호합니다.',
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
        description: '전역 어디에서나 발견되는 초록색 슬라임. 약하지만 무리를 지어 나타나 모험가를 성가시게 합니다.',
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
        description: '호수와 강가에 서식하는 푸른 슬라임. 약한 마력을 머금어 물 속성과 관련된 공격을 시전합니다.',
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
        description: '고요한 호수 수면 위를 떠도는 작은 요정. 외지인을 경계하지만, 인정받은 자에게는 물의 축복을 나눠 줍니다.',
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
        description: '다수의 워터 슬라임이 뒤엉켜 하나가 된 거대 개체. 거대한 몸체로 솟구치는 수압 공격을 내리꽂습니다.',
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
