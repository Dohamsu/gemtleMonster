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

export const DUNGEONS = [SLIME_DUNGEON]
