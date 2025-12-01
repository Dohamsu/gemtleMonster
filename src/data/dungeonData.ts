export interface DungeonDrop {
    materialId: string
    chance: number // 0-100
    minQuantity: number
    maxQuantity: number
}

export interface DungeonEnemy {
    id: string
    name: string
    level: number
    hp: number
    attack: number
    defense: number
    exp: number
    drops: DungeonDrop[]
}

export interface Dungeon {
    id: string
    name: string
    description: string
    recommendedLevel: number
    enemies: DungeonEnemy[]
}

export const SLIME_DUNGEON: Dungeon = {
    id: 'dungeon_slime_forest',
    name: '슬라임 숲',
    description: '끈적끈적한 슬라임들이 서식하는 숲입니다. 초보 모험가에게 적합합니다.',
    recommendedLevel: 1,
    enemies: [
        {
            id: 'slime_green',
            name: '초록 슬라임',
            level: 1,
            hp: 30,
            attack: 5,
            defense: 1,
            exp: 10,
            drops: [
                { materialId: 'slime_fluid', chance: 80, minQuantity: 1, maxQuantity: 2 },
                { materialId: 'herb_common', chance: 40, minQuantity: 1, maxQuantity: 1 }
            ]
        },
        {
            id: 'slime_blue',
            name: '파랑 슬라임',
            level: 3,
            hp: 50,
            attack: 8,
            defense: 2,
            exp: 20,
            drops: [
                { materialId: 'slime_fluid', chance: 90, minQuantity: 1, maxQuantity: 3 },
                { materialId: 'slime_core', chance: 20, minQuantity: 1, maxQuantity: 1 }
            ]
        },
        {
            id: 'slime_king',
            name: '킹 슬라임',
            level: 10,
            hp: 200,
            attack: 20,
            defense: 5,
            exp: 100,
            drops: [
                { materialId: 'slime_core', chance: 100, minQuantity: 1, maxQuantity: 2 },
                { materialId: 'gem_fragment', chance: 50, minQuantity: 1, maxQuantity: 1 }
            ]
        }
    ]
}

export const LAKE_DUNGEON: Dungeon = {
    id: 'dungeon_lake',
    name: '신비한 호수',
    description: '맑은 물이 고여있는 신비한 호수입니다. 물 속성 재료를 얻을 수 있습니다.',
    recommendedLevel: 3,
    enemies: [
        {
            id: 'slime_water',
            name: '워터 슬라임',
            level: 4,
            hp: 60,
            attack: 12,
            defense: 3,
            exp: 15,
            drops: [
                { materialId: 'slime_fluid', chance: 70, minQuantity: 1, maxQuantity: 2 },
                { materialId: 'shard_water', chance: 40, minQuantity: 1, maxQuantity: 1 }
            ]
        },
        {
            id: 'lake_fairy',
            name: '호수의 요정',
            level: 6,
            hp: 50,
            attack: 15,
            defense: 5,
            exp: 25,
            drops: [
                { materialId: 'herb_common', chance: 60, minQuantity: 1, maxQuantity: 2 },
                { materialId: 'shard_water', chance: 30, minQuantity: 1, maxQuantity: 1 },
                { materialId: 'crystal_mana', chance: 10, minQuantity: 1, maxQuantity: 1 }
            ]
        },
        {
            id: 'slime_water_giant',
            name: '거대 워터 슬라임',
            level: 15,
            hp: 300,
            attack: 35,
            defense: 10,
            exp: 150,
            drops: [
                { materialId: 'shard_water', chance: 100, minQuantity: 1, maxQuantity: 2 },
                { materialId: 'gem_fragment', chance: 40, minQuantity: 1, maxQuantity: 1 },
                { materialId: 'slime_fluid', chance: 80, minQuantity: 3, maxQuantity: 5 }
            ]
        }
    ]
}

export const DUNGEONS = [SLIME_DUNGEON, LAKE_DUNGEON]
