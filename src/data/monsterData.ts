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
        hp: 300,
        attack: 40,
        defense: 75,
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
        hp: 95,
        attack: 20,
        defense: 25,
        emoji: '🧚',
        iconUrl: '/assets/monsters/fairySpirit.png',
        rarity: 'R',
        element: 'wind'
    },
    'monster_wolf_dark': {
        name: '어둠 늑대',
        description: '달빛조차 스며들지 않는 그림자 속을 달리는 늑대. 어둠 속에서 찌르는 한 방의 치명타로 적을 쓰러뜨립니다.',
        role: '딜러',
        hp: 150,
        attack: 75,
        defense: 35,
        emoji: '🐺',
        iconUrl: '/assets/monsters/hound_basic.png',
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
        iconUrl: '/assets/monsters/monster_slime_nightmare.png',
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
        iconUrl: '/assets/monsters/monster_fairy_dawn.png',
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
        iconUrl: '/assets/monsters/monster_guardian_tiger.png',
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
    'monster_mushroom': {
        name: '머쉬룸',
        description: '숲의 기운을 머금고 자라난 거대 버섯. 포자를 퍼뜨려 아군을 치유하거나 적을 혼란스럽게 만듭니다.',
        role: '서포터',
        hp: 110,
        attack: 25,
        defense: 25,
        emoji: '🍄',
        iconUrl: '/assets/monsters/mushroom.png',
        rarity: 'N',
        element: 'earth'
    },
    'monster_mushroom_dark': {
        name: '다크 머쉬룸',
        description: '음습한 늪지에서 자라난 독버섯. 치명적인 독 포자를 뿜어 적을 서서히 죽음에 이르게 합니다.',
        role: '딜러',
        hp: 130,
        attack: 55,
        defense: 20,
        emoji: '🍄',
        iconUrl: '/assets/monsters/mushroom_dark.png',
        rarity: 'R',
        element: 'dark'
    },
    'monster_golem_gem': {
        name: '보석 골렘',
        description: '희귀한 보석들로 이루어진 화려한 골렘. 눈부신 광채로 적의 시야를 가리고 단단한 보석 몸체로 공격을 튕겨냅니다.',
        role: '탱커',
        hp: 280,
        attack: 40,
        defense: 80,
        emoji: '💎',
        iconUrl: '/assets/monsters/golem_gem.png',
        rarity: 'SR',
        element: 'earth'
    },
    // 눈꽃 몬스터 (Snow/Ice Monsters)
    'monster_snowflake_sprite': {
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
        factoryTrait: { targetFacility: 'herb_farm', effect: '희귀 약초 확률 증가', value: 3 }
    },
    'monster_ice_slime': {
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
    'monster_frost_bunny': {
        name: '서리 토끼',
        description: '하얀 털에 서리를 두른 재빠른 토끼. 차가운 발차기로 적을 연속 공격합니다.',
        role: '딜러',
        hp: 90,
        attack: 40,
        defense: 12,
        emoji: '🐇',
        iconUrl: '/assets/monsters/frost_bunny.png',
        rarity: 'N',
        element: 'water'
    },
    'monster_snow_fairy': {
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
        element: 'earth'
    },
    'mana_spirit': {
        name: '마력의 정령',
        description: '순수한 마력이 뭉쳐 태어난 정령. 동굴 내부를 부유하며 침입자에게 마력탄을 발사합니다.',
        role: '딜러',
        hp: 120,
        attack: 25,
        defense: 15,
        emoji: '✨',
        iconUrl: '/assets/monsters/gem_spirit.png',
        rarity: 'R',
        element: 'light'
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
        element: 'earth'
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
        element: 'water'
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
        element: 'water'
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
        element: 'water'
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
        element: 'earth'
    },
    'santa_golem': {
        name: '산타 골렘',
        description: '겨울 왕국을 지키는 거대한 눈 골렘. 산타 복장을 하고 있지만 선물 대신 강력한 주먹을 선사합니다. 🎅',
        role: '탱커',
        hp: 500,
        attack: 50,
        defense: 35,
        emoji: '🎅',
        iconUrl: '/assets/monsters/santa_golem.png',
        rarity: 'SR',
        element: 'water'
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
        element: 'fire'
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
        element: 'fire'
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
        element: 'wind'
    },
    'sky_dragon_hatchling': {
        name: '스카이 드래곤 유치',
        description: '천공의 탑 둥지에서 갓 깨어난 드래곤. 아직 어리지만 하늘의 제왕다운 위엄과 힘을 가지고 있습니다.',
        role: '딜러',
        hp: 1500,
        attack: 100,
        defense: 80,
        emoji: '🐉',
        iconUrl: '/assets/monsters/sky_dragon.png',
        rarity: 'SSR',
        element: 'wind'
    },
    // Beast Forest Monsters (짐승의 숲)
    'monster_scar_bear': {
        name: '상처 입은 곰',
        description: '수많은 전투로 온몸에 흉터가 남은 거대한 곰. 숲의 깊은 곳에서 영역을 지키며, 침입자를 무자비하게 공격합니다.',
        role: '탱커',
        hp: 800,
        attack: 90,
        defense: 60,
        emoji: '🐻',
        iconUrl: '/assets/monsters/scar_bear.png',
        rarity: 'SR',
        element: 'earth'
    },
    'monster_penguin': {
        name: '아기 펭귄',
        description: '뒤뚱거리며 걷는 귀여운 펭귄. 차가운 물속을 자유롭게 헤엄치며, 보는 이의 마음을 녹입니다.',
        role: '서포터',
        hp: 100,
        attack: 20,
        defense: 20,
        emoji: '🐧',
        iconUrl: '/assets/monsters/baby_penguin.png',
        rarity: 'N',
        element: 'water'
    },
    'monster_gazelle': {
        name: '바람 가젤',
        description: '바람처럼 빠르게 달리는 가젤. 날렵한 뿔과 다리로 적의 공격을 피하며 초원을 누빕니다.',
        role: '딜러',
        hp: 120,
        attack: 45,
        defense: 15,
        emoji: '🦌',
        iconUrl: '/assets/monsters/gazzel.png',
        rarity: 'N',
        element: 'wind'
    },
    // Conditional Monsters
    'monster_owl_night': {
        name: '밤눈 부엉이',
        description: '밤이 깊어질수록 눈빛이 밝게 빛나는 부엉이. 어둠 속에서 진실을 꿰뚫어 봅니다.',
        role: '서포터',
        hp: 130,
        attack: 45,
        defense: 35,
        emoji: '🦉',
        iconUrl: '/assets/monsters/owl_night.png',
        rarity: 'R',
        element: 'wind'
    },
    'monster_rooster_morning': {
        name: '새벽의 닭',
        description: '아침 해가 뜨면 가장 먼저 울어 세상을 깨우는 닭. 그 울음소리는 아군의 사기를 높입니다.',
        role: '딜러',
        hp: 140,
        attack: 80,
        defense: 30,
        emoji: '🐓',
        iconUrl: '/assets/monsters/rooster_morning.png',
        rarity: 'N',
        element: 'fire'
    },
    'monster_turtle_weekend': {
        name: '주말 거북이',
        description: '평일에는 깊은 잠에 빠져 있다가 주말에만 활동하는 거북이. 여유롭지만 단단한 등껍질을 가지고 있습니다.',
        role: '탱커',
        hp: 200,
        attack: 30,
        defense: 80,
        emoji: '🐢',
        iconUrl: '/assets/monsters/turtle_weekend.png',
        rarity: 'R',
        element: 'water'
    },
    'monster_golem_desktop': {
        name: 'PC 골렘',
        description: '복잡한 연산 장치와 회로로 구성된 골렘. 데스크탑 환경의 강력한 리소스를 동력원으로 사용합니다.',
        role: '탱커',
        hp: 250,
        attack: 50,
        defense: 70,
        emoji: '🖥️',
        iconUrl: '/assets/monsters/golem_desktop.png',
        rarity: 'SSR',
        element: 'earth'
    },
    'monster_slime_mobile': {
        name: '모바일 슬라임',
        description: '작고 가벼워 어디든 데리고 다닐 수 있는 슬라임. 모바일 환경에 최적화되어 있습니다.',
        role: '서포터',
        hp: 100,
        attack: 70,
        defense: 40,
        emoji: '📱',
        iconUrl: '/assets/monsters/slime_mobile.png',
        rarity: 'R',
        element: 'water'
    },

    // ==========================================
    // New High-Grade Monsters (SR/SSR Expansion)
    // ==========================================

    // SSR Monsters
    'monster_dragon_inferno': {
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
        factoryTrait: { targetFacility: 'blacksmith', effect: '제작 속도 대폭 증가', value: 25 }
    },
    'monster_angel_arch': {
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
        factoryTrait: { targetFacility: 'cathedral', effect: '성스러운 기운 증가', value: 20 }
    },
    'monster_demon_lord': {
        name: '마왕',
        description: '심연의 끝에서 돌아온 어둠의 군주. 압도적인 카리스마와 파괴적인 마력으로 적들을 공포에 떨게 합니다.',
        role: '딜러',
        hp: 500,
        attack: 110,
        defense: 70,
        emoji: '😈',
        iconUrl: '/assets/monsters/demon_lord.png',
        rarity: 'SSR',
        element: 'dark'
    },
    'monster_kraken_abyss': {
        name: '심연의 크라켄',
        description: '깊은 바다 속에서 잠자던 거대 괴수. 수많은 다리로 적을 휘감으며 절대 뚫리지 않는 방벽이 되어줍니다.',
        role: '탱커',
        hp: 600,
        attack: 60,
        defense: 90,
        emoji: '🐙',
        iconUrl: '/assets/monsters/kraken_abyss.png',
        rarity: 'SSR',
        element: 'water'
    },

    // SR Monsters
    'monster_knight_spectral': {
        name: '유령 기사',
        description: '육체는 사라졌으나 맹세는 남은 기사. 물리적인 공격을 무시하며, 전우를 지키기 위해 영원히 싸웁니다.',
        role: '탱커',
        hp: 280,
        attack: 50,
        defense: 70,
        emoji: '👻',
        iconUrl: '/assets/monsters/knight_spectral.png',
        rarity: 'SR',
        element: 'dark'
    },
    'monster_shaman_goblin': {
        name: '고블린 대주술사',
        description: '부족의 지혜를 이어받은 늙은 고블린. 기이한 주문으로 아군의 잠재력을 끌어올리는 강력한 서포터입니다.',
        role: '서포터',
        hp: 160,
        attack: 30,
        defense: 30,
        emoji: '👺',
        iconUrl: '/assets/monsters/shaman_goblin.png',
        rarity: 'SR',
        element: 'earth'
    },
    'monster_assassin_shadow': {
        name: '그림자 암살자',
        description: '소리 없이 다가와 적의 숨통을 끊는 암살자. 눈에 보이지 않는 속도로 전장을 누비며 치명타를 날립니다.',
        role: '딜러',
        hp: 140,
        attack: 85,
        defense: 25,
        emoji: '🥷',
        iconUrl: '/assets/monsters/assassin_shadow.png',
        rarity: 'SR',
        element: 'dark'
    },
    'monster_phoenix_baby': {
        name: '아기 불사조',
        description: '영원한 생명을 품은 불사조의 유체. 작지만 따스한 불꽃으로 아군의 체력을 지속적으로 회복시켜 줍니다.',
        role: '서포터',
        hp: 180,
        attack: 40,
        defense: 35,
        emoji: '🐦',
        iconUrl: '/assets/monsters/phoenix_baby.png',
        rarity: 'SR',
        element: 'fire'
    },
    'monster_yeti_ancient': {
        name: '고대 예티',
        description: '설산의 전설로 내려오는 거대한 유인원. 두꺼운 가죽과 얼음 같은 근육으로 어떤 공격도 버텨냅니다.',
        role: '탱커',
        hp: 350,
        attack: 55,
        defense: 60,
        emoji: '🦍',
        iconUrl: '/assets/monsters/yeti_ancient.png',
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
