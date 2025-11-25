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
        iconUrl: '/assets/monsters/slime_basic.png'
    },
    'monster_hound_fang': {
        name: '송곳니 하운드',
        description: '민첩한 공격형 몬스터. 빠른 공격이 특징입니다.',
        role: '딜러',
        hp: 100,
        attack: 45,
        defense: 15,
        emoji: '🐺',
        iconUrl: '/assets/monsters/hound_basic.png'
    },
    'monster_golem_stone': {
        name: '돌 골렘',
        description: '단단한 방어형 골렘. 높은 방어력으로 팀을 지킵니다.',
        role: '탱커',
        hp: 250,
        attack: 25,
        defense: 60,
        emoji: '🗿',
        iconUrl: '/assets/stoneGolem.png'
    },
    'monster_fairy_spirit': {
        name: '정령 요정',
        description: '회복과 버프를 제공하는 서포트 몬스터.',
        role: '서포터',
        hp: 80,
        attack: 15,
        defense: 20,
        emoji: '🧚'
    },
    'monster_wolf_dark': {
        name: '어둠 늑대',
        description: '어둠 속성의 강력한 딜러. 치명타에 특화되어 있습니다.',
        role: '딜러',
        hp: 120,
        attack: 60,
        defense: 25,
        emoji: '🐺'
    },
    'monster_slime_king': {
        name: '왕슬라임',
        description: '슬라임의 왕. 강력한 탱커이자 리더입니다.',
        role: '탱커',
        hp: 350,
        attack: 35,
        defense: 70,
        emoji: '👑'
    },
    'monster_golem_magma': {
        name: '마그마 골렘',
        description: '불 속성의 공격형 골렘. 화염 공격으로 적을 태웁니다.',
        role: '딜러',
        hp: 200,
        attack: 70,
        defense: 40,
        emoji: '🔥',
        iconUrl: '/assets/ironGolem.png'
    },
    'monster_slime_nightmare': {
        name: '악몽 슬라임',
        description: '심야에만 만들 수 있는 디버프 특화 몬스터.',
        role: '딜러',
        hp: 180,
        attack: 55,
        defense: 35,
        emoji: '👻'
    },
    'monster_fairy_dawn': {
        name: '새벽 정령',
        description: '새벽에만 소환 가능한 경험치 버프 정령.',
        role: '서포터',
        hp: 90,
        attack: 20,
        defense: 25,
        emoji: '✨'
    },
    'monster_guardian_tiger': {
        name: '호랑이 수호령',
        description: '한국 언어에서만 생성되는 치명타 특화 수호령.',
        role: '딜러',
        hp: 300,
        attack: 85,
        defense: 50,
        emoji: '🐯'
    },
    'monster_golem_wood': {
        name: '나무 골렘',
        description: '숲의 정령이 깃든 골렘. 자연의 힘으로 아군을 보호합니다.',
        role: '서포터',
        hp: 180,
        attack: 30,
        defense: 45,
        emoji: '🌳',
        iconUrl: '/assets/woodGolem.png'
    }
}

export const getMonsterName = (monsterId: string): string => {
    return MONSTER_DATA[monsterId]?.name || monsterId
}

export const getMonsterData = (monsterId: string): MonsterData | undefined => {
    return MONSTER_DATA[monsterId]
}
