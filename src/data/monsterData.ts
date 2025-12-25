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
    drops?: Array<{
        materialId: string
        chance: number // 0~100 (%)
        min: number
        max: number
    }>
}

export const MONSTER_DATA: Record<string, MonsterData> = {
    'slime_basic': {
        name: '기본 슬라임',
        description: '연금술 초보도 쉽게 다루는 가장 기본형 슬라임. 느릿하지만 탁월한 회복력으로 전열을 지키는 입문용 몬스터입니다.',
        role: '탱커',
        hp: 150,
        attack: 20,
        defense: 30,
        emoji: '🟢',
        iconUrl: '/assets/monsters/slime_basic.png',
        rarity: 'N',
        factoryTrait: { targetFacility: 'herb_farm', effect: '생산량 증가', value: 5 },
        drops: [
            { materialId: 'slime_fluid', chance: 100, min: 1, max: 2 },
            { materialId: 'slime_gel', chance: 30, min: 1, max: 1 }
        ]
    },
    'hound_fang': {
        name: '송곳니 하운드',
        description: '새하얀 송곳니를 번뜩이며 달려드는 사냥견. 그림자처럼 움직이며 끊임없는 연속 공격을 퍼붓습니다.',
        role: '딜러',
        hp: 100,
        attack: 45,
        defense: 10,
        emoji: '🐕',
        iconUrl: '/assets/monsters/hound_basic.png', // Fallback to basic hound
        rarity: 'N',
        factoryTrait: { targetFacility: 'mine', effect: '채굴 속도 증가', value: 5 },
        drops: [{ materialId: 'beast_fang', chance: 80, min: 1, max: 2 }]
    },
    'golem_stone': {
        name: '돌 골렘',
        description: '고대 성채의 파편으로 빚어낸 돌 골렘. 거대한 몸으로 일행 앞을 막아서 모든 공격을 받아냅니다.',
        role: '탱커',
        hp: 300,
        attack: 40,
        defense: 75,
        emoji: '🗿',
        iconUrl: '/assets/monsters/stoneGolem.png',
        rarity: 'R',
        element: 'earth',
        factoryTrait: { targetFacility: 'mine', effect: '생산량 증가', value: 10 },
        drops: [
            { materialId: 'ore_iron', chance: 100, min: 1, max: 3 },
            { materialId: 'stone', chance: 50, min: 2, max: 5 }
        ]
    },
    'fairy_spirit': {
        name: '정령 요정',
        description: '숲의 바람과 속삭이는 정령 요정. 아군의 상처를 치유하고 능력을 일시적으로 끌어올려 줍니다.',
        role: '서포터',
        hp: 95,
        attack: 20,
        defense: 25,
        emoji: '🧚',
        iconUrl: '/assets/monsters/fairySpirit.png',
        rarity: 'R',
        element: 'wind',
        factoryTrait: { targetFacility: 'spirit_sanctum', effect: '정령 기운 응축', value: 8 }
    },
    'wolf_dark': {
        name: '어둠 늑대',
        description: '달빛조차 스며들지 않는 그림자 속을 달리는 늑대. 어둠 속에서 찌르는 한 방의 치명타로 적을 쓰러뜨립니다.',
        role: '딜러',
        hp: 150,
        attack: 75,
        defense: 35,
        emoji: '🐺',
        iconUrl: '/assets/monsters/hound_basic.png',
        rarity: 'SR',
        element: 'dark',
        factoryTrait: { targetFacility: 'dungeon_dispatch', effect: '그림자 추적', value: 12 }
    },
    'wood_golem': {
        name: '우드 골렘',
        description: '숲의 나뭇가지를 엮어 만든 작은 골렘. 단단한 나무 껍질로 몸을 보호하며 숲의 입구를 지킵니다.',
        role: '탱커',
        hp: 180,
        attack: 25,
        defense: 40,
        emoji: '🪵',
        iconUrl: '/assets/monsters/woodGolem.png',
        rarity: 'N',
        element: 'earth',
        factoryTrait: { targetFacility: 'lumber_mill', effect: '생산량 증가', value: 10 },
        drops: [
            { materialId: 'wood_branch', chance: 100, min: 1, max: 3 },
            { materialId: 'slime_fluid', chance: 40, min: 1, max: 1 }
        ]
    },

    'slime_king': {
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
    'golem_magma': {
        name: '마그마 골렘',
        description: '분화구 깊은 곳에서 깨어난 마그마 골렘. 끊임없이 타오르는 화염 주먹으로 적을 재로 만들어 버립니다.',
        role: '딜러',
        hp: 200,
        attack: 70,
        defense: 40,
        emoji: '🔥',
        iconUrl: '/assets/monsters/ironGolem.png',
        rarity: 'SR',
        element: 'fire',
        factoryTrait: { targetFacility: 'blacksmith', effect: '화염의 열기 보조', value: 12 }
    },
    'slime_nightmare': {
        name: '악몽 슬라임',
        description: '잠든 자의 악몽이 응고되어 탄생한 슬라임. 적에게 각종 약화 효과를 퍼뜨려 전투를 서서히 무너뜨립니다.',
        role: '딜러',
        hp: 180,
        attack: 55,
        defense: 35,
        emoji: '👻',
        iconUrl: '/assets/monsters/monster_slime_nightmare.png',
        rarity: 'R',
        element: 'dark',
        factoryTrait: { targetFacility: 'alchemy_workshop', effect: '악몽 가루 추출', value: 10 }
    },
    'fairy_dawn': {
        name: '새벽 정령',
        description: '해가 떠오르는 찰나에만 모습을 드러내는 새벽의 정령. 아군이 얻는 경험치를 높여 성장을 가속시켜 줍니다.',
        role: '서포터',
        hp: 90,
        attack: 20,
        defense: 25,
        emoji: '✨',
        iconUrl: '/assets/monsters/monster_fairy_dawn.png',
        rarity: 'R',
        element: 'light',
        factoryTrait: { targetFacility: 'training_ground', effect: '성장 경험치 증가', value: 10 }
    },
    'guardian_tiger': {
        name: '호랑이 수호령',
        description: '옛 사당을 지키던 호랑이 수호령이 형상을 드러낸 존재. 번개 같은 발톱으로 적의 급소를 정확히 노립니다.',
        role: '딜러',
        hp: 300,
        attack: 90,
        defense: 50,
        emoji: '🐯',
        iconUrl: '/assets/monsters/monster_guardian_tiger.png',
        rarity: 'SSR',
        element: 'light',
        factoryTrait: { targetFacility: 'training_ground', effect: '훈련 파괴력 증가', value: 15 }
    },
    'slime_water': {
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
        factoryTrait: { targetFacility: 'herb_farm', effect: '수분 공급 효율', value: 10 }
    },
    'slime_dark': {
        name: '다크 슬라임',
        description: '어둠에 잠식된 점액이 모여 만들어진 슬라임. 인기척 없이 다가가 그림자에서 기습을 가합니다.',
        role: '딜러',
        hp: 160,
        attack: 50,
        defense: 20,
        emoji: '🌑',
        iconUrl: '/assets/monsters/slime_dark.png',
        rarity: 'R',
        element: 'dark',
        factoryTrait: { targetFacility: 'dungeon_dispatch', effect: '어둠의 기습', value: 10 }
    },
    'golem_wood': {
        name: '나무 골렘',
        description: '오래된 숲의 수호목이 움직이기 시작한 골렘. 단단한 나무 팔로 통나무를 효율적으로 정리하며 벌목장의 작업을 돕습니다.',
        role: '서포터',
        hp: 180,
        attack: 30,
        defense: 45,
        emoji: '🌳',
        iconUrl: '/assets/monsters/woodGolem.png',
        rarity: 'R',
        element: 'earth',
        factoryTrait: { targetFacility: 'lumber_mill', effect: '통나무 정리 보조', value: 12 },
        drops: [
            { materialId: 'ancient_bamboo', chance: 40, min: 1, max: 2 },
            { materialId: 'wood_branch', chance: 80, min: 2, max: 4 }
        ]
    },
    'mushroom': {
        name: '머쉬룸',
        description: '숲의 기운을 머금고 자라난 거대 버섯. 포자를 퍼뜨려 아군을 치유하거나 적을 혼란스럽게 만듭니다.',
        role: '서포터',
        hp: 110,
        attack: 25,
        defense: 25,
        emoji: '🍄',
        iconUrl: '/assets/monsters/mushroom.png',
        rarity: 'N',
        element: 'earth',
        factoryTrait: { targetFacility: 'herb_farm', effect: '천연 비료 공급', value: 5 }
    },
    'mushroom_dark': {
        name: '다크 머쉬룸',
        description: '음습한 늪지에서 자라난 독버섯. 치명적인 독 포자를 뿜어 적을 서서히 죽음에 이르게 합니다.',
        role: '딜러',
        hp: 130,
        attack: 55,
        defense: 20,
        emoji: '🍄',
        iconUrl: '/assets/monsters/mushroom_dark.png',
        rarity: 'R',
        element: 'dark',
        factoryTrait: { targetFacility: 'alchemy_workshop', effect: '어둠 독소 정제', value: 8 },
        drops: [
            { materialId: 'obsidian', chance: 30, min: 1, max: 1 }
        ]
    },
    'golem_gem': {
        name: '보석 골렘',
        description: '희귀한 보석들로 이루어진 화려한 골렘. 눈부신 광채로 적의 시야를 가리고 단단한 보석 몸체로 공격을 튕겨냅니다.',
        role: '탱커',
        hp: 280,
        attack: 40,
        defense: 80,
        emoji: '💎',
        iconUrl: '/assets/monsters/golem_gem.png',
        rarity: 'SR',
        element: 'earth',
        factoryTrait: { targetFacility: 'mine', effect: '희귀 광석 감별', value: 15 }
    },
    // 눈꽃 몬스터 (Snow/Ice Monsters)
    'snowflake_sprite': {
        name: '눈꽃 정령',
        description: '첫눈이 내릴 때 태어나는 순수한 정령. 차가운 바람과 함께 춤추며 아군의 마음을 치유합니다.',
        role: '서포터',
        hp: 70,
        attack: 15,
        defense: 15,
        emoji: '❄️',
        iconUrl: '/assets/monsters/monster_snowflake_sprite.png',
        rarity: 'N',
        element: 'water',
        factoryTrait: { targetFacility: 'herb_farm', effect: '희귀 약초 확률 증가', value: 3 },
        drops: [
            { materialId: 'fairy_wing', chance: 40, min: 1, max: 1 }
        ]
    },
    'ice_slime': {
        name: '아이스 슬라임',
        description: '얼어붙은 호수에서 태어난 차가운 슬라임. 몸을 얼음처럼 굳혀 적의 공격을 막아냅니다.',
        role: '탱커',
        hp: 180,
        attack: 20,
        defense: 45,
        emoji: '🧊',
        iconUrl: '/assets/monsters/monster_ice_slime.png',
        rarity: 'N',
        element: 'water',
        factoryTrait: { targetFacility: 'mine', effect: '마력 광석 확률 증가', value: 5 }
    },
    'frost_bunny': {
        name: '서리 토끼',
        description: '하얀 털에 서리를 두른 재빠른 토끼. 차가운 발차기로 적을 연속 공격합니다.',
        role: '딜러',
        hp: 90,
        attack: 40,
        defense: 12,
        emoji: '🐇',
        iconUrl: '/assets/monsters/frost_bunny.png',
        rarity: 'N',
        element: 'water',
        drops: [
            { materialId: 'scrap_leather', chance: 60, min: 1, max: 2 }
        ],
        factoryTrait: { targetFacility: 'monster_farm', effect: '행복도 고무', value: 5 }
    },
    'snow_fairy': {
        name: '설화 요정',
        description: '눈보라 속에서 태어난 아름다운 요정. 눈꽃 마법으로 적을 얼리고 아군을 보호합니다.',
        role: '서포터',
        hp: 100,
        attack: 25,
        defense: 30,
        emoji: '🧚‍♀️',
        iconUrl: '/assets/monsters/monster_snow_fairy.png',
        rarity: 'R',
        element: 'water',
        factoryTrait: { targetFacility: 'herb_farm', effect: '생산 속도 증가', value: 8 }
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
        element: 'earth',
        factoryTrait: { targetFacility: 'herb_farm', effect: '기초 비료 비축', value: 3 }
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
        element: 'water',
        factoryTrait: { targetFacility: 'herb_farm', effect: '미세 수분 조절', value: 3 }
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
        element: 'water',
        factoryTrait: { targetFacility: 'spirit_sanctum', effect: '맑은 영혼의 물', value: 10 }
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
        element: 'water',
        factoryTrait: { targetFacility: 'monster_farm', effect: '물놀이 시설 가동', value: 15 }
    },
    'crystal_mite': {
        name: '수정 진드기',
        description: '수정 동굴의 마력을 먹고 자란 진드기. 단단한 수정 껍질로 몸을 보호하며, 날카로운 다리로 공격합니다.',
        role: '딜러',
        hp: 80,
        attack: 18,
        defense: 8,
        emoji: '🕷️',
        iconUrl: '/assets/monsters/gem_ant.png',
        rarity: 'N',
        element: 'earth',
        factoryTrait: { targetFacility: 'mine', effect: '정밀 채굴 보조', value: 8 },
        drops: [
            { materialId: 'star_fragment', chance: 50, min: 1, max: 2 }
        ]
    },
    'mana_spirit': {
        name: '마력의 정령',
        description: '순수한 마력이 뭉쳐 태어난 정령. 마법의 탑에서 흘러나오는 마력을 조절하여 광석의 품질을 높여줍니다.',
        role: '딜러',
        hp: 120,
        attack: 25,
        defense: 15,
        emoji: '✨',
        iconUrl: '/assets/monsters/gem_spirit.png',
        rarity: 'R',
        element: 'light',
        factoryTrait: { targetFacility: 'magic_tower', effect: '마력 평형 유지', value: 12 },
        drops: [
            { materialId: 'moon_stone', chance: 30, min: 1, max: 1 }
        ]
    },
    'crystal_golem': {
        name: '수정 골렘',
        description: '거대한 수정 원석으로 이루어진 골렘. 움직일 때마다 영롱한 빛을 내뿜지만, 그 주먹은 바위보다 단단합니다.',
        role: '탱커',
        hp: 400,
        attack: 45,
        defense: 30,
        emoji: '💎',
        iconUrl: '/assets/monsters/crystal_golem.png',
        rarity: 'SR',
        element: 'earth',
        factoryTrait: { targetFacility: 'mine', effect: '광산 견고함 증대', value: 18 }
    },
    // Christmas Dungeon Enemies (크리스마스 던전 적)
    'snowball_slime': {
        name: '눈덩이 슬라임',
        description: '눈으로 뭉쳐진 귀여운 슬라임. 차가운 몸으로 천천히 굴러다니며 침입자를 쫓아다닙니다.',
        role: '탱커',
        hp: 45,
        attack: 8,
        defense: 5,
        emoji: '⛄',
        iconUrl: '/assets/monsters/monster_ice_slime.png',
        rarity: 'N',
        element: 'water',
        factoryTrait: { targetFacility: 'monster_farm', effect: '겨울 분위기 조성', value: 8 }
    },
    'frost_sprite': {
        name: '서리 요정',
        description: '겨울 숲에서 태어난 작은 요정. 날개에서 눈꽃을 뿌리며 차가운 마법으로 적을 공격합니다.',
        role: '서포터',
        hp: 60,
        attack: 15,
        defense: 8,
        emoji: '❄️',
        iconUrl: '/assets/monsters/monster_snowflake_sprite.png',
        rarity: 'N',
        element: 'water',
        factoryTrait: { targetFacility: 'spirit_sanctum', effect: '서리의 축복', value: 5 }
    },
    'ice_wolf': {
        name: '얼음 늑대',
        description: '서리로 뒤덮인 맹렬한 늑대. 차가운 숨결을 내뿜으며 무리를 지어 사냥합니다.',
        role: '딜러',
        hp: 100,
        attack: 25,
        defense: 12,
        emoji: '🐺',
        iconUrl: '/assets/monsters/ice_wolf.png',
        rarity: 'R',
        element: 'water',
        factoryTrait: { targetFacility: 'dungeon_dispatch', effect: '설원 추적 파견', value: 10 }
    },
    'christmas_tree_ent': {
        name: '크리스마스 트리 엔트',
        description: '크리스마스 장식으로 빛나는 거대한 나무 정령. 겨울 숲의 수호자로서 침입자를 물리칩니다. 🎄',
        role: '탱커',
        hp: 250,
        attack: 35,
        defense: 25,
        emoji: '🎄',
        iconUrl: '/assets/monsters/woodGolem.png',
        rarity: 'SR',
        element: 'earth',
        factoryTrait: { targetFacility: 'herb_farm', effect: '겨울 숲 가꾸기', value: 12 }
    },
    'santa_golem': {
        name: '산타 골렘',
        description: '산타 모자를 쓴 거대한 얼음 골렘. 겨울 축제의 주인공으로서 선물을 나눠주며 아군에게 활력을 줍니다.',
        role: '서포터',
        hp: 500,
        attack: 50,
        defense: 35,
        emoji: '🎅',
        iconUrl: '/assets/monsters/monster_ice_slime.png',
        rarity: 'SR',
        element: 'water',
        factoryTrait: { targetFacility: 'monster_farm', effect: '겨울 축제 주동', value: 20 }
    },
    // Volcano Dungeon Enemies
    'fire_slime': {
        name: '파이어 슬라임',
        description: '용암에서 태어난 뜨거운 슬라임. 몸이 불타고 있어 가까이 가기만 해도 화상을 입을 수 있습니다.',
        role: '탱커',
        hp: 600,
        attack: 60,
        defense: 40,
        emoji: '🔥',
        iconUrl: '/assets/monsters/magma_slime.png',
        rarity: 'N',
        element: 'fire',
        factoryTrait: { targetFacility: 'blacksmith', effect: '용광로 온도 유지', value: 10 }
    },
    'magma_golem': {
        name: '마그마 골렘',
        description: '굳지 않은 용암과 흑요석으로 이루어진 골렘. 분노하면 몸의 열기가 더욱 거세집니다.',
        role: '탱커',
        hp: 1000,
        attack: 80,
        defense: 60,
        emoji: '🌋',
        iconUrl: '/assets/monsters/magma_golem.png',
        rarity: 'SR',
        element: 'fire',
        factoryTrait: { targetFacility: 'blacksmith', effect: '무기 제련 강화', value: 18 }
    },
    // Sky Dungeon Enemies
    'cloud_slime': {
        name: '구름 슬라임',
        description: '뭉게구름처럼 폭신해 보이는 슬라임. 바람을 타고 자유롭게 날아다닙니다.',
        role: '서포터',
        hp: 800,
        attack: 70,
        defense: 45,
        emoji: '☁️',
        iconUrl: '/assets/monsters/cloud_slime.png',
        rarity: 'N',
        element: 'wind',
        factoryTrait: { targetFacility: 'dungeon_dispatch', effect: '공중 정찰 파견', value: 12 }
    },
    'sky_dragon_hatchling': {
        name: '스카이 드래곤 해츨링',
        description: '천공의 탑 둥지에서 갓 깨어난 드래곤. 아직 어리지만 하늘의 제왕다운 위엄과 힘을 가지고 있습니다.',
        role: '딜러',
        hp: 1500,
        attack: 100,
        defense: 80,
        emoji: '🐉',
        iconUrl: '/assets/monsters/sky_dragon.png',
        rarity: 'SSR',
        element: 'wind',
        drops: [
            { materialId: 'dragon_scale', chance: 100, min: 1, max: 1 },
            { materialId: 'shard_wind', chance: 60, min: 2, max: 4 },
            { materialId: 'feather_common', chance: 50, min: 3, max: 5 }, // Hatchling feathers
            { materialId: 'gem_fragment', chance: 30, min: 2, max: 3 }
        ]
    },
    // Beast Forest Monsters (짐승의 숲)
    'scar_bear': {
        name: '상처 입은 곰',
        description: '수많은 전투로 온몸에 흉터가 남은 거대한 곰. 숲의 깊은 곳에서 영역을 지키며, 침입자를 무자비하게 공격합니다.',
        role: '탱커',
        hp: 800,
        attack: 90,
        defense: 60,
        emoji: '🐻',
        iconUrl: '/assets/monsters/scar_bear.png',
        rarity: 'SR',
        element: 'earth',
        drops: [
            { materialId: 'bear_skin', chance: 50, min: 1, max: 1 },
            { materialId: 'claw_sharp', chance: 40, min: 1, max: 2 }
        ],
        factoryTrait: { targetFacility: 'training_ground', effect: '실전 야생 훈련', value: 15 }
    },
    'moss_snail': {
        name: '이끼 달팽이',
        description: '껍질에 이끼가 무성하게 자란 달팽이. 느리지만 단단한 껍질로 자신을 보호하며 숲의 청소부 역할을 합니다.',
        role: '탱커',
        hp: 120,
        attack: 20,
        defense: 40,
        emoji: '🐌',
        iconUrl: '/assets/monsters/monster_moss_snail.png',
        rarity: 'N',
        element: 'earth',
        drops: [
            { materialId: 'shell_snail', chance: 100, min: 1, max: 2 },
            { materialId: 'slime_fluid', chance: 50, min: 1, max: 1 }
        ],
        factoryTrait: { targetFacility: 'herb_farm', effect: '토양 습도 유지', value: 5 }
    },
    'thorn_boar': {
        name: '가시 멧돼지',
        description: '등에 날카로운 가시가 돋아난 멧돼지. 화가 나면 앞뒤 가리지 않고 돌진하여 적을 들이받습니다.',
        role: '딜러',
        hp: 150,
        attack: 50,
        defense: 25,
        emoji: '🐗',
        iconUrl: '/assets/monsters/monster_thorn_boar.png',
        rarity: 'N',
        element: 'earth',
        drops: [
            { materialId: 'tusk_boar', chance: 100, min: 1, max: 1 },
            { materialId: 'leather_beast', chance: 40, min: 1, max: 1 }
        ],
        factoryTrait: { targetFacility: 'dungeon_dispatch', effect: '무력 돌격 파견', value: 8 }
    },
    'forest_spider': {
        name: '숲 거미',
        description: '울창한 나무 사이에 거미줄을 치고 기다리는 사냥꾼. 끈적한 거미줄로 적을 묶고 독니를 드러냅니다.',
        role: '딜러',
        hp: 130,
        attack: 60,
        defense: 15,
        emoji: '🕷️',
        iconUrl: '/assets/monsters/monster_forest_spider.png',
        rarity: 'R',
        element: 'dark',
        drops: [
            { materialId: 'silk_spider', chance: 100, min: 1, max: 2 },
            { materialId: 'herb_common', chance: 30, min: 1, max: 1 }
        ],
        factoryTrait: { targetFacility: 'alchemy_workshop', effect: '거미줄 재료 수급', value: 10 }
    },
    'acorn_squirrel': {
        name: '도토리 다람쥐',
        description: '도토리를 던지는 날렵한 다람쥐. 작지만 빠른 속도로 적을 교란하고 도망칩니다.',
        role: '딜러',
        hp: 90,
        attack: 50,
        defense: 15,
        emoji: '🐿️',
        iconUrl: '/assets/monsters/monster_acorn_squirrel.png',
        rarity: 'N',
        element: 'wind',
        factoryTrait: { targetFacility: 'lumber_mill', effect: '채집 속도 증가', value: 5 },
        drops: [
            { materialId: 'wood_branch', chance: 60, min: 1, max: 2 },
            { materialId: 'beast_fang', chance: 30, min: 1, max: 1 }
        ]
    },
    'leaf_sprite': {
        name: '잎사귀 요정',
        description: '숲을 지키는 작은 요정. 아픈 동물을 치료해주며, 숲의 생명력을 다룹니다.',
        role: '서포터',
        hp: 110,
        attack: 15,
        defense: 20,
        emoji: '🌿',
        iconUrl: '/assets/monsters/monster_leaf_sprite.png',
        rarity: 'N',
        element: 'wind',
        factoryTrait: { targetFacility: 'herb_farm', effect: '생산량 증가', value: 8 },
        drops: [
            { materialId: 'herb_common', chance: 80, min: 1, max: 3 }
        ]
    },

    'penguin': {
        name: '아기 펭귄',
        description: '뒤뚱거리며 걷는 귀여운 펭귄. 차가운 물속을 자유롭게 헤엄치며, 보는 이의 마음을 녹입니다.',
        role: '서포터',
        hp: 100,
        attack: 20,
        defense: 20,
        emoji: '🐧',
        iconUrl: '/assets/monsters/baby_penguin.png',
        rarity: 'N',
        element: 'water',
        factoryTrait: { targetFacility: 'monster_farm', effect: '빙판 놀이터', value: 10 }
    },
    'gazelle': {
        name: '바람 가젤',
        description: '바람처럼 빠르게 달리는 가젤. 날렵한 뿔과 다리로 적의 공격을 피하며 초원을 누빕니다.',
        role: '딜러',
        hp: 120,
        attack: 45,
        defense: 15,
        emoji: '🦌',
        iconUrl: '/assets/monsters/gazzel.png',
        rarity: 'N',
        element: 'wind',
        drops: [
            { materialId: 'scrap_leather', chance: 50, min: 1, max: 2 },
            { materialId: 'bone_fragment', chance: 30, min: 1, max: 1 }
        ],
        factoryTrait: { targetFacility: 'dungeon_dispatch', effect: '바람의 전령', value: 12 }
    },
    // Conditional Monsters
    'owl_night': {
        name: '밤눈 부엉이',
        description: '밤이 깊어질수록 눈빛이 밝게 빛나는 부엉이. 어둠 속에서 진실을 꿰뚫어 봅니다.',
        role: '서포터',
        hp: 130,
        attack: 45,
        defense: 35,
        emoji: '🦉',
        iconUrl: '/assets/monsters/owl_night.png',
        rarity: 'R',
        element: 'wind',
        factoryTrait: { targetFacility: 'dungeon_dispatch', effect: '야간 시야 정찰', value: 15 }
    },
    'rooster_morning': {
        name: '새벽의 닭',
        description: '아침 해가 뜨면 가장 먼저 울어 세상을 깨우는 닭. 그 울음소리는 아군의 사기를 높입니다.',
        role: '딜러',
        hp: 140,
        attack: 80,
        defense: 30,
        emoji: '🐓',
        iconUrl: '/assets/monsters/rooster_morning.png',
        rarity: 'N',
        element: 'fire',
        factoryTrait: { targetFacility: 'training_ground', effect: '새벽 정신 수양', value: 8 }
    },
    'turtle_weekend': {
        name: '주말 거북이',
        description: '평일에는 깊은 잠에 빠져 있다가 주말에만 활동하는 거북이. 여유롭지만 단단한 등껍질을 가지고 있습니다.',
        role: '탱커',
        hp: 200,
        attack: 30,
        defense: 80,
        emoji: '🐢',
        iconUrl: '/assets/monsters/turtle_weekend.png',
        rarity: 'R',
        element: 'water',
        factoryTrait: { targetFacility: 'monster_farm', effect: '주말의 안식', value: 20 }
    },
    'golem_desktop': {
        name: 'PC 골렘',
        description: '복잡한 연산 장치와 회로로 구성된 골렘. 데스크탑 환경의 강력한 리소스를 동력원으로 사용합니다.',
        role: '탱커',
        hp: 250,
        attack: 50,
        defense: 70,
        emoji: '🖥️',
        iconUrl: '/assets/monsters/golem_desktop.png',
        rarity: 'SSR',
        element: 'earth',
        factoryTrait: { targetFacility: 'alchemy_workshop', effect: '고급 연계 연산', value: 25 }
    },
    'slime_mobile': {
        name: '모바일 슬라임',
        description: '작고 가벼워 어디든 데리고 다닐 수 있는 슬라임. 모바일 환경에 최적화되어 있습니다.',
        role: '서포터',
        hp: 100,
        attack: 70,
        defense: 40,
        emoji: '📱',
        iconUrl: '/assets/monsters/slime_mobile.png',
        rarity: 'R',
        element: 'water',
        factoryTrait: { targetFacility: 'dungeon_dispatch', effect: '포터블 빠른 파견', value: 12 }
    },

    // ==========================================
    // New Monsters (Update)
    'panda_monk': {
        name: '판다 수도승',
        description: '대나무 숲에서 수련을 쌓은 판다. 부드러운 외모와 달리 강력한 무술 실력을 겸비하고 있습니다.',
        role: '탱커',
        hp: 400,
        attack: 45,
        defense: 60,
        emoji: '🐼',
        iconUrl: '/assets/monsters/panda_monk.png',
        rarity: 'R',
        element: 'earth',
        factoryTrait: { targetFacility: 'training_ground', effect: '집중적 훈련 효율', value: 15 },
        drops: [
            { materialId: 'ancient_bamboo', chance: 100, min: 1, max: 2 }
        ]
    },
    'moon_rabbit': {
        name: '달토끼',
        description: '달에서 절구를 찧다 내려온 토끼. 신비한 달의 기운으로 연금술을 도와줍니다.',
        role: '서포터',
        hp: 150,
        attack: 30,
        defense: 20,
        emoji: '🐇',
        iconUrl: '/assets/monsters/moon_rabbit.png',
        rarity: 'R',
        element: 'light',
        factoryTrait: { targetFacility: 'alchemy_workshop', effect: '달빛 촉매 작용', value: 12 },
        drops: [
            { materialId: 'moon_stone', chance: 80, min: 1, max: 1 }
        ]
    },
    'star_golem': {
        name: '스타 골렘',
        description: '별의 파편으로 이루어진 골렘. 우주의 에너지를 품고 있어 마법 시설에 큰 도움을 줍니다.',
        role: '딜러',
        hp: 350,
        attack: 65,
        defense: 45,
        emoji: '🗿',
        iconUrl: '/assets/monsters/star_golem.png',
        rarity: 'SR',
        element: 'light',
        factoryTrait: { targetFacility: 'magic_tower', effect: '별빛 에너지 공명', value: 15 },
        drops: [
            { materialId: 'star_fragment', chance: 100, min: 1, max: 2 }
        ]
    },
    // New Additions
    'golem_gold': {
        name: '황금 골렘',
        description: '순금으로 만들어진 번쩍이는 골렘. 엄청난 방어력과 함께 부의 기운을 내뿜습니다.',
        role: '탱커',
        hp: 500,
        attack: 40,
        defense: 90,
        emoji: '🧈',
        iconUrl: '/assets/monsters/golem_gold.png',
        rarity: 'SR',
        element: 'earth',
        factoryTrait: { targetFacility: 'mine', effect: '황금 채굴량 증가', value: 20 },
        drops: [
            { materialId: 'ingot_gold', chance: 50, min: 1, max: 2 },
            { materialId: 'ore_gold', chance: 100, min: 2, max: 4 }
        ]
    },
    'phoenix_chick': {
        name: '피닉스 병아리',
        description: '전설의 불사조의 어린 모습. 작지만 꺼지지 않는 불꽃을 품고 있습니다.',
        role: '딜러',
        hp: 200,
        attack: 80,
        defense: 30,
        emoji: '🐣',
        iconUrl: '/assets/monsters/phoenix_chick.png',
        rarity: 'SR',
        element: 'fire',
        factoryTrait: { targetFacility: 'blacksmith', effect: '성스러운 불꽃', value: 15 },
        drops: [
            { materialId: 'phoenix_feather', chance: 40, min: 1, max: 1 },
            { materialId: 'feather_common', chance: 100, min: 2, max: 5 }
        ]
    },
    'spirit_shadow': {
        name: '그림자 정령',
        description: '빛이 닿지 않는 곳에서 태어난 정령. 은밀하게 움직이며 적의 약점을 파고듭니다.',
        role: '딜러',
        hp: 150,
        attack: 70,
        defense: 25,
        emoji: '👥',
        iconUrl: '/assets/monsters/spirit_shadow.png',
        rarity: 'R',
        element: 'dark',
        factoryTrait: { targetFacility: 'dungeon_dispatch', effect: '그림자 은신', value: 15 },
        drops: [
            { materialId: 'shard_dark', chance: 80, min: 1, max: 2 },
            { materialId: 'spirit_dust', chance: 50, min: 2, max: 3 }
        ]
    },
    'lava_turtle': {
        name: '용암 거북',
        description: '등껍질에서 용암이 흐르는 거북. 대장간의 온도를 높이는 데 탁월한 능력을 발휘합니다.',
        role: '탱커',
        hp: 600,
        attack: 40,
        defense: 90,
        emoji: '🐢',
        iconUrl: '/assets/monsters/lava_turtle.png',
        rarity: 'SR',
        element: 'fire',
        factoryTrait: { targetFacility: 'blacksmith', effect: '고열 전도', value: 15 },
        drops: [
            { materialId: 'obsidian', chance: 80, min: 1, max: 2 }
        ]
    },
    'wind_spirit': {
        name: '바람의 정령',
        description: '자유로운 바람의 형상. 던전 탐험 시 바람을 타고 빠르게 이동할 수 있게 돕습니다.',
        role: '서포터',
        hp: 120,
        attack: 35,
        defense: 25,
        emoji: '🍃',
        iconUrl: '/assets/monsters/wind_spirit.png',
        rarity: 'R',
        element: 'wind',
        factoryTrait: { targetFacility: 'dungeon_dispatch', effect: '순풍의 가호', value: 10 },
        drops: [
            { materialId: 'fairy_wing', chance: 50, min: 1, max: 2 }
        ]
    },

    // ==========================================
    // Desert Dungeon Monsters (사막 유적)
    'slime_sand': {
        name: '샌드 슬라임',
        description: '사막의 모래가 뭉쳐져 만들어진 슬라임. 건조하고 거칠지만 귀여운 외모를 가지고 있습니다.',
        role: '탱커',
        hp: 400,
        attack: 50,
        defense: 50,
        emoji: '🏜️',
        iconUrl: '/assets/monsters/slime_sand.png',
        rarity: 'N',
        element: 'earth',
        factoryTrait: { targetFacility: 'mine', effect: '모래 채취', value: 8 },
        drops: [
            { materialId: 'sand_dust', chance: 100, min: 1, max: 2 },
            { materialId: 'slime_fluid', chance: 40, min: 1, max: 1 }
        ]
    },
    'cactus_warrior': {
        name: '선인장 전사',
        description: '사막의 열기를 견디며 자라난 선인장 전사. 온몸의 가시를 세우고 검을 휘두릅니다.',
        role: '딜러',
        hp: 500,
        attack: 70,
        defense: 30,
        emoji: '🌵',
        iconUrl: '/assets/monsters/cactus_warrior.png',
        rarity: 'N',
        element: 'earth',
        factoryTrait: { targetFacility: 'training_ground', effect: '가시 훈련', value: 10 },
        drops: [
            { materialId: 'cactus_flower', chance: 60, min: 1, max: 1 },
            { materialId: 'wood_branch', chance: 80, min: 1, max: 2 }
        ]
    },
    'scorpion_king': {
        name: '스콜피온 킹',
        description: '황금빛 갑각을 두른 전갈들의 왕. 치명적인 독침으로 적을 마비시킵니다.',
        role: '딜러',
        hp: 700,
        attack: 90,
        defense: 60,
        emoji: '🦂',
        iconUrl: '/assets/monsters/scorpion_king.png',
        rarity: 'R',
        element: 'earth',
        factoryTrait: { targetFacility: 'alchemy_workshop', effect: '독침 추출', value: 15 },
        drops: [
            { materialId: 'scorpion_tail', chance: 80, min: 1, max: 1 },
            { materialId: 'beast_fang', chance: 50, min: 1, max: 2 }
        ]
    },
    'mummy': {
        name: '미라',
        description: '고대 유적을 배회하는 붕대 감긴 언데드. 영원한 안식을 방해하는 자를 저주합니다.',
        role: '탱커',
        hp: 800,
        attack: 60,
        defense: 40,
        emoji: '🤕',
        iconUrl: '/assets/monsters/mummy.png',
        rarity: 'R',
        element: 'dark',
        factoryTrait: { targetFacility: 'dungeon_dispatch', effect: '유적 탐사', value: 12 },
        drops: [
            { materialId: 'ancient_bandage', chance: 90, min: 1, max: 2 },
            { materialId: 'scrap_cloth', chance: 50, min: 1, max: 2 }
        ]
    },
    'sphinx': {
        name: '스핑크스',
        description: '사막의 비밀을 간직한 수수께끼의 수호자. 강력한 마법으로 침입자를 심판합니다.',
        role: '서포터',
        hp: 1200,
        attack: 100,
        defense: 80,
        emoji: '🦁',
        iconUrl: '/assets/monsters/sphinx.png',
        rarity: 'SR',
        element: 'light',
        factoryTrait: { targetFacility: 'spirit_sanctum', effect: '고대의 지혜', value: 20 },
        drops: [
            { materialId: 'golden_scarab', chance: 100, min: 1, max: 1 },
            { materialId: 'gem_fragment', chance: 60, min: 2, max: 4 }
        ]
    },
    'beaver_lumberjack': {
        name: '비버 벌목꾼',
        description: '붉은 체크 셔츠가 잘 어울리는 비버 수인. 예리한 톱질 솜씨로 벌목장의 생산 효율을 비약적으로 높여줍니다.',
        role: '딜러',
        hp: 220,
        attack: 65,
        defense: 30,
        emoji: '🦫',
        iconUrl: '/assets/monsters/beaver_warrior.png',
        rarity: 'SR',
        element: 'earth',
        factoryTrait: { targetFacility: 'lumber_mill', effect: '정밀 벌목 기술', value: 20 },
        drops: [
            { materialId: 'wood_branch', chance: 100, min: 3, max: 5 },
            { materialId: 'beast_fang', chance: 40, min: 1, max: 2 }
        ]
    },
    'wizard_owl': {
        name: '현자 부엉이',
        description: '오랜 시간 마법 도서관을 지켜온 영리한 부엉이. 마법의 탑의 마력 순환 구조를 분석하여 생산 속도를 가속합니다.',
        role: '서포터',
        hp: 180,
        attack: 40,
        defense: 45,
        emoji: '🦉',
        iconUrl: '/assets/monsters/owl_wizard.png',
        rarity: 'SR',
        element: 'wind',
        factoryTrait: { targetFacility: 'magic_tower', effect: '마력 순환 가속', value: 20 },
        drops: [
            { materialId: 'feather_common', chance: 100, min: 2, max: 4 },
            { materialId: 'crystal_mana', chance: 50, min: 1, max: 2 }
        ]
    },

    // New High-Grade Monsters (SR/SSR Expansion)
    // ==========================================

    // SSR Monsters
    'dragon_inferno': {
        name: '인페르노 드래곤',
        description: '지옥의 화염을 휘감은 전설의 드래곤. 입에서 뿜어내는 브레스는 모든 것을 태워버리는 절대적인 위력을 자랑합니다.',
        role: '딜러',
        hp: 450,
        attack: 120,
        defense: 60,
        emoji: '🐲',
        iconUrl: '/assets/monsters/dragon_inferno.png',
        rarity: 'SSR',
        element: 'fire',
        factoryTrait: { targetFacility: 'blacksmith', effect: '제작 속도 대폭 증가', value: 25 },
        drops: [
            { materialId: 'dragon_scale', chance: 100, min: 1, max: 1 },
            { materialId: 'dragon_horn', chance: 50, min: 1, max: 1 },
            { materialId: 'fire_core', chance: 30, min: 1, max: 1 }
        ]
    },
    'angel_arch': {
        name: '아크 엔젤',
        description: '천상의 빛을 머금은 고위 천사. 존재만으로도 아군에게 축복을 내리며, 기적 같은 치유력으로 전장을 구원합니다.',
        role: '서포터',
        hp: 380,
        attack: 50,
        defense: 55,
        emoji: '👼',
        iconUrl: '/assets/monsters/angel_arch.png',
        rarity: 'SSR',
        element: 'light',
        factoryTrait: { targetFacility: 'spirit_sanctum', effect: '천상의 빛 하사', value: 20 },
        drops: [
            { materialId: 'angel_feather', chance: 100, min: 1, max: 1 },
            { materialId: 'shard_light', chance: 50, min: 2, max: 3 },
            { materialId: 'rune_world', chance: 20, min: 1, max: 1 }
        ]
    },
    'demon_lord': {
        name: '마왕',
        description: '심연의 끝에서 돌아온 어둠의 군주. 압도적인 카리스마와 파괴적인 마력으로 적들을 공포에 떨게 합니다.',
        role: '딜러',
        hp: 500,
        attack: 110,
        defense: 70,
        emoji: '😈',
        iconUrl: '/assets/monsters/demon_lord.png',
        rarity: 'SSR',
        element: 'dark',
        drops: [
            { materialId: 'demon_horn', chance: 100, min: 1, max: 1 },
            { materialId: 'dark_crystal', chance: 60, min: 2, max: 4 },
            { materialId: 'soul_fragment', chance: 30, min: 1, max: 2 }
        ],
        factoryTrait: { targetFacility: 'training_ground', effect: '공포의 실전 압축', value: 30 }
    },
    'kraken_abyss': {
        name: '심연의 크라켄',
        description: '깊은 바다 속에서 잠자던 거대 괴수. 수많은 다리로 적을 휘감으며 절대 뚫리지 않는 방벽이 되어줍니다.',
        role: '탱커',
        hp: 600,
        attack: 60,
        defense: 90,
        emoji: '🐙',
        iconUrl: '/assets/monsters/kraken_abyss.png',
        rarity: 'SSR',
        element: 'water',
        drops: [
            { materialId: 'kraken_leg', chance: 100, min: 1, max: 1 },
            { materialId: 'shard_water', chance: 60, min: 5, max: 8 },
            { materialId: 'gem_fragment', chance: 30, min: 2, max: 3 }
        ],
        factoryTrait: { targetFacility: 'dungeon_dispatch', effect: '심해 보물 인양', value: 25 }
    },

    // SR Monsters
    'knight_spectral': {
        name: '유령 기사',
        description: '육체는 사라졌으나 맹세는 남은 기사. 물리적인 공격을 무시하며, 전우를 지키기 위해 영원히 싸웁니다.',
        role: '탱커',
        hp: 280,
        attack: 50,
        defense: 70,
        emoji: '👻',
        iconUrl: '/assets/monsters/knight_spectral.png',
        rarity: 'SR',
        element: 'dark',
        factoryTrait: { targetFacility: 'training_ground', effect: '유령 기사단 규율', value: 18 }
    },
    'shaman_goblin': {
        name: '고블린 대주술사',
        description: '부족의 지혜를 이어받은 늙은 고블린. 기이한 주문으로 아군의 잠재력을 끌어올리는 강력한 서포터입니다.',
        role: '서포터',
        hp: 160,
        attack: 30,
        defense: 30,
        emoji: '👺',
        iconUrl: '/assets/monsters/shaman_goblin.png',
        rarity: 'SR',
        element: 'earth',
        factoryTrait: { targetFacility: 'alchemy_workshop', effect: '주술적 지혜 공유', value: 18 }
    },
    'assassin_shadow': {
        name: '그림자 암살자',
        description: '소리 없이 다가와 적의 숨통을 끊는 암살자. 눈에 보이지 않는 속도로 전장을 누비며 치명타를 날립니다.',
        role: '딜러',
        hp: 140,
        attack: 85,
        defense: 25,
        emoji: '🥷',
        iconUrl: '/assets/monsters/assassin_shadow.png',
        rarity: 'SR',
        element: 'dark',
        factoryTrait: { targetFacility: 'dungeon_dispatch', effect: '그림자 암살 수행', value: 20 }
    },
    'phoenix_baby': {
        name: '아기 불사조',
        description: '영원한 생명을 품은 불사조의 유체. 작지만 따스한 불꽃으로 아군의 체력을 지속적으로 회복시켜 줍니다.',
        role: '서포터',
        hp: 180,
        attack: 40,
        defense: 35,
        emoji: '🐦',
        iconUrl: '/assets/monsters/phoenix_baby.png',
        rarity: 'SR',
        element: 'fire',
        factoryTrait: { targetFacility: 'spirit_sanctum', effect: '불멸의 온기 주입', value: 15 }
    },
    'yeti_ancient': {
        name: '고대 예티',
        description: '설산의 전설로 내려오는 거대한 유인원. 두꺼운 가죽과 얼음 같은 근육으로 어떤 공격도 버텨냅니다.',
        role: '탱커',
        hp: 350,
        attack: 55,
        defense: 60,
        emoji: '🦍',
        iconUrl: '/assets/monsters/yeti_ancient.png',
        rarity: 'SR',
        element: 'water',
        factoryTrait: { targetFacility: 'mine', effect: '극한 지형 채굴', value: 12 }
    },
    // New Craftable Monsters (Using new materials)
    'skeleton_soldier': {
        name: '해골 병사',
        description: '부서진 뼈를 모아 탄생시킨 언데드 병사. 두려움을 모르고 명령에 절대 복종합니다.',
        role: '딜러',
        hp: 90,
        attack: 40,
        defense: 10,
        emoji: '💀',
        iconUrl: '/assets/monsters/skeleton.png',
        rarity: 'N',
        element: 'dark',
        factoryTrait: { targetFacility: 'training_ground', effect: '불멸의 전투 훈련', value: 5 }
    },
    'scarecrow': {
        name: '허수아비',
        description: '나뭇가지와 헌 옷으로 만든 허수아비. 마력이 깃들어 스스로 움직이며 까마귀를 쫓아냅니다.',
        role: '서포터',
        hp: 120,
        attack: 15,
        defense: 15,
        emoji: '🌾',
        iconUrl: '/assets/monsters/scarecrow.png',
        rarity: 'N',
        element: 'earth',
        factoryTrait: { targetFacility: 'herb_farm', effect: '조류 접근 금지', value: 5 }
    },
    'copper_golem': {
        name: '구리 골렘',
        description: '구리로 만들어진 소형 골렘. 녹이 슬기 쉽지만 전이 잘 통해 번개에 강합니다.',
        role: '탱커',
        hp: 180,
        attack: 25,
        defense: 35,
        emoji: '🥉',
        iconUrl: '/assets/monsters/ironGolem.png',
        rarity: 'N',
        element: 'earth',
        factoryTrait: { targetFacility: 'blacksmith', effect: '구리 연성 보조', value: 8 }
    },
    'silver_wolf': {
        name: '은빛 늑대',
        description: '은 광석의 기운을 받아 털이 은빛으로 빛나는 늑대. 달빛 아래서 더욱 빨라집니다.',
        role: '딜러',
        hp: 130,
        attack: 55,
        defense: 20,
        emoji: '🥈',
        iconUrl: '/assets/monsters/ice_wolf.png',
        rarity: 'R',
        element: 'light',
        factoryTrait: { targetFacility: 'dungeon_dispatch', effect: '은빛 정찰 파견', value: 10 }
    },
    'golden_bat': {
        name: '황금 박쥐',
        description: '황금을 탐하다 온몸이 황금으로 변해버린 박쥐. 행운을 불러온다고 알려져 있습니다.',
        role: '서포터',
        hp: 100,
        attack: 30,
        defense: 30,
        emoji: '🦇',
        iconUrl: '/assets/monsters/owl_night.png', // Fallback to owl (winged)
        rarity: 'SR',
        element: 'wind',
        factoryTrait: { targetFacility: 'mine', effect: '황금 광맥 발견', value: 12 }
    },
    // Abyssal Dungeon Monsters
    'jellyfish_abyss': {
        name: '심해 해파리',
        description: '깊은 바닷속에서 스스로 빛을 내는 해파리. 몽환적인 빛으로 먹이를 유인합니다.',
        role: '서포터',
        hp: 80,
        attack: 20,
        defense: 20,
        emoji: '🪼',
        iconUrl: '/assets/monsters/jellyfish_abyss.png',
        rarity: 'N',
        element: 'water',
        factoryTrait: { targetFacility: 'herb_farm', effect: '심해 수분 공급', value: 5 },
        drops: [{ materialId: 'jelly_biolum', chance: 100, min: 1, max: 2 }]
    },
    'starfish_warrior': {
        name: '불가사리 전사',
        description: '단단한 피부를 가진 불가사리 전사. 바닷속의 용맹한 수호자입니다.',
        role: '딜러',
        hp: 100,
        attack: 40,
        defense: 30,
        emoji: '⭐',
        iconUrl: '/assets/monsters/starfish_warrior.png',
        rarity: 'N',
        element: 'water',
        factoryTrait: { targetFacility: 'training_ground', effect: '재생 훈련', value: 8 },
        drops: [
            { materialId: 'starfish_skin', chance: 80, min: 1, max: 2 },
            { materialId: 'scrap_leather', chance: 40, min: 1, max: 1 }
        ]
    },
    'angler_fish': {
        name: '초롱아귀',
        description: '어둠 속에서 빛나는 미끼로 사냥하는 심해의 포식자. 날카로운 이빨을 조심해야 합니다.',
        role: '딜러',
        hp: 150,
        attack: 60,
        defense: 20,
        emoji: '🐟',
        iconUrl: '/assets/monsters/angler_fish.png',
        rarity: 'R',
        element: 'dark',
        factoryTrait: { targetFacility: 'dungeon_dispatch', effect: '심해 탐사', value: 10 },
        drops: [
            { materialId: 'angler_light_bulb', chance: 90, min: 1, max: 1 },
            { materialId: 'beast_fang', chance: 50, min: 1, max: 2 }
        ]
    },
    'golem_coral': {
        name: '산호 골렘',
        description: '아름다운 산호초가 뭉쳐 움직이는 골렘. 바다의 생명력을 품고 있습니다.',
        role: '탱커',
        hp: 250,
        attack: 40,
        defense: 60,
        emoji: '🪸',
        iconUrl: '/assets/monsters/golem_coral.png',
        rarity: 'R',
        element: 'water',
        factoryTrait: { targetFacility: 'mine', effect: '해저 광물 채집', value: 12 },
        drops: [
            { materialId: 'coral_fragment', chance: 100, min: 1, max: 2 },
            { materialId: 'stone', chance: 60, min: 2, max: 4 }
        ]
    },
    'kraken_hatchling': {
        name: '크라켄 새끼',
        description: '심해의 지배자 크라켄의 새끼. 작지만 강력한 힘을 숨기고 있습니다.',
        role: '딜러',
        hp: 130,
        attack: 40,
        defense: 25,
        emoji: '🦑',
        iconUrl: '/assets/monsters/kraken_hatchling.png',
        rarity: 'R',
        element: 'water',
        factoryTrait: { targetFacility: 'mine', effect: '심해 채굴', value: 15 },
        drops: [
            { materialId: 'kraken_leg', chance: 60, min: 1, max: 1 },
            { materialId: 'essence', chance: 30, min: 1, max: 2 }
        ]
    },
    'moss_golem': {
        name: '이끼 골렘',
        description: '오랜 세월 숲속에 방치되어 이끼가 뒤덮인 골렘. 자연과 하나가 되어 숲을 수호합니다.',
        role: '탱커',
        hp: 350,
        attack: 30,
        defense: 70,
        emoji: '🗿',
        iconUrl: '/assets/monsters/moss_monster.png',
        rarity: 'N',
        element: 'earth',
        factoryTrait: { targetFacility: 'herb_farm', effect: '자연의 품', value: 12 },
        drops: [
            { materialId: 'stone', chance: 100, min: 2, max: 4 },
            { materialId: 'herb_common', chance: 50, min: 1, max: 2 }
        ]
    },
    'shadow_unicorn': {
        name: '그림자 유니콘',
        description: '어둠 속을 달리는 신비한 유니콘. 그 뿔은 그림자를 찢고 빛을 삼킵니다.',
        role: '딜러',
        hp: 180,
        attack: 65,
        defense: 30,
        emoji: '🦄',
        iconUrl: '/assets/monsters/black_unicon.png',
        rarity: 'R',
        element: 'dark',
        factoryTrait: { targetFacility: 'dungeon_dispatch', effect: '어둠의 질주', value: 15 },
        drops: [
            { materialId: 'beast_fang', chance: 70, min: 1, max: 2 },
            { materialId: 'dark_crystal', chance: 40, min: 1, max: 1 }
        ]
    },
    'mystic_fox': {
        name: '신비한 여우',
        description: '신비로운 기운을 뿜어내는 붉은 여우. 영리하고 재빠르며, 주인을 위해 행운을 가져다줍니다.',
        role: '서포터',
        hp: 140,
        attack: 45,
        defense: 35,
        emoji: '🦊',
        iconUrl: '/assets/monsters/pink_fox.png',
        rarity: 'R',
        element: 'fire',
        factoryTrait: { targetFacility: 'spirit_sanctum', effect: '여우불', value: 10 },
        drops: [
            { materialId: 'spirit_dust', chance: 60, min: 1, max: 3 },
            { materialId: 'beast_fang', chance: 50, min: 1, max: 1 }
        ]
    },
    'red_mane_wolf': {
        name: '붉은 갈기 늑대',
        description: '불타는 듯한 붉은 갈기를 가진 늑대. 용맹한 전사처럼 적을 향해 돌진합니다.',
        role: '딜러',
        hp: 110,
        attack: 55,
        defense: 20,
        emoji: '🐕',
        iconUrl: '/assets/monsters/hound_basic.png', // Placeholder
        rarity: 'N',
        element: 'fire',
        factoryTrait: { targetFacility: 'training_ground', effect: '전투 본능 자극', value: 8 },
        drops: [
            { materialId: 'beast_fang', chance: 80, min: 1, max: 2 },
            { materialId: 'shard_fire', chance: 30, min: 1, max: 1 }
        ]
    },
    'iron_beetle': {
        name: '강철 딱정벌레',
        description: '강철처럼 단단한 등딱지를 가진 곤충. 웬만한 공격에는 끄떡도 하지 않습니다.',
        role: '탱커',
        hp: 150,
        attack: 25,
        defense: 60,
        emoji: '🪲',
        iconUrl: '/assets/monsters/gem_ant.png', // Placeholder
        rarity: 'N',
        element: 'earth',
        factoryTrait: { targetFacility: 'mine', effect: '단단한 지반 고정', value: 10 },
        drops: [
            { materialId: 'ore_iron', chance: 70, min: 1, max: 2 },
            { materialId: 'stone', chance: 50, min: 2, max: 4 }
        ]
    },
    'ember_fox': {
        name: '엠버 폭스',
        description: '온몸이 불꽃으로 이루어진 여우. 지나간 자리는 검게 그을리며, 불꽃 꼬리로 적을 위협합니다.',
        role: '딜러',
        hp: 120,
        attack: 65,
        defense: 25,
        emoji: '🦊',
        iconUrl: '/assets/monsters/ember_fox.png',
        rarity: 'R',
        element: 'fire',
        factoryTrait: { targetFacility: 'blacksmith', effect: '불꽃 제련', value: 10 },
        drops: [
            { materialId: 'beast_fang', chance: 80, min: 1, max: 2 },
            { materialId: 'shard_fire', chance: 40, min: 1, max: 1 }
        ]
    },
    'aqua_turtle': {
        name: '아쿠아 터틀',
        description: '등껍질이 물로 이루어진 거북이. 충격을 물결처럼 흡수하여 흘려보냅니다.',
        role: '탱커',
        hp: 160,
        attack: 20,
        defense: 50,
        emoji: '🐢',
        iconUrl: '/assets/monsters/aqua_turtle.png',
        rarity: 'N',
        element: 'water',
        factoryTrait: { targetFacility: 'herb_farm', effect: '수분 공급', value: 8 },
        drops: [
            { materialId: 'shell_snail', chance: 70, min: 1, max: 2 },
            { materialId: 'shard_water', chance: 30, min: 1, max: 1 }
        ]
    },
    'breeze_hawk': {
        name: '브리즈 호크',
        description: '바람을 다루는 매. 날개짓으로 돌풍을 일으켜 아군의 속도를 높여줍니다.',
        role: '서포터',
        hp: 90,
        attack: 45,
        defense: 20,
        emoji: '🦅',
        iconUrl: '/assets/monsters/breeze_hawk.png',
        rarity: 'R',
        element: 'wind',
        factoryTrait: { targetFacility: 'dungeon_dispatch', effect: '순풍 지원', value: 12 },
        drops: [
            { materialId: 'feather_common', chance: 80, min: 1, max: 3 },
            { materialId: 'shard_wind', chance: 40, min: 1, max: 1 }
        ]
    },
    'iron_hedgehog': {
        name: '아이언 고슴도치',
        description: '가시 대신 강철 바늘이 돋아난 고슴도치. 몸을 웅크리면 완벽한 철옹성이 됩니다.',
        role: '탱커',
        hp: 140,
        attack: 30,
        defense: 55,
        emoji: '🦔',
        iconUrl: '/assets/monsters/iron_hedgehog.png',
        rarity: 'N',
        element: 'earth',
        factoryTrait: { targetFacility: 'mine', effect: '철광맥 탐지', value: 8 },
        drops: [
            { materialId: 'ore_iron', chance: 60, min: 1, max: 2 },
            { materialId: 'beast_fang', chance: 40, min: 1, max: 2 }
        ]
    },
    'light_wisp': {
        name: '라이트 위스프',
        description: '어둠을 밝히는 작은 빛의 정령. 따뜻한 빛으로 아군의 기운을 북돋아 줍니다.',
        role: '서포터',
        hp: 70,
        attack: 15,
        defense: 15,
        emoji: '💡',
        iconUrl: '/assets/monsters/light_wisp.png',
        rarity: 'N',
        element: 'light',
        factoryTrait: { targetFacility: 'spirit_sanctum', effect: '빛의 인도', value: 8 },
        drops: [
            { materialId: 'spirit_dust', chance: 60, min: 1, max: 2 },
            { materialId: 'shard_light', chance: 30, min: 1, max: 1 }
        ]
    },
    'shadow_bat': {
        name: '섀도우 배트',
        description: '그림자 속에 숨어 사는 박쥐. 소리 없이 다가가 날카로운 이빨로 적을 공격합니다.',
        role: '딜러',
        hp: 100,
        attack: 50,
        defense: 15,
        emoji: '🦇',
        iconUrl: '/assets/monsters/shadow_bat.png',
        rarity: 'N',
        element: 'dark',
        factoryTrait: { targetFacility: 'dungeon_dispatch', effect: '야간 비행', value: 10 },
        drops: [
            { materialId: 'scrap_leather', chance: 60, min: 1, max: 2 },
            { materialId: 'shard_dark', chance: 30, min: 1, max: 1 }
        ]
    },
    'wind_pixie': {
        name: '바람의 픽시',
        description: '바람을 타고 다니는 장난꾸러기 픽시. 아군의 속도를 높여주고 분위기를 띄웁니다.',
        role: '서포터',
        hp: 80,
        attack: 20,
        defense: 15,
        emoji: '🧚',
        iconUrl: '/assets/monsters/fairySpirit.png', // Placeholder
        rarity: 'N',
        element: 'wind',
        factoryTrait: { targetFacility: 'lumber_mill', effect: '바람의 속삭임', value: 8 },
        drops: [
            { materialId: 'herb_common', chance: 60, min: 1, max: 3 },
            { materialId: 'shard_wind', chance: 30, min: 1, max: 1 }
        ]
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
    // MONSTER_DATA keys are already prefix-less now.
    const shortKey = key

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
