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
    iconUrl: string  // 던전 이미지 URL
    enemies: DungeonEnemy[]
}

export const SLIME_DUNGEON: Dungeon = {
    id: 'dungeon_slime_forest',
    name: '슬라임 숲',
    description: '끈적한 발자국이 끝없이 이어지는 슬라임들의 안식처. 위험도는 낮지만 방심한 모험가는 순식간에 포위당하는, 초보 모험가들의 시험장입니다.',
    recommendedLevel: 1,
    iconUrl: '/assets/dungeons/slime_forest.png',
    enemies: [
        {
            id: 'slime_green',
            name: '초록 슬라임',
            level: 1,
            hp: 30,
            attack: 5,
            defense: 1,
            exp: 10000,
            drops: [
                { materialId: 'slime_fluid', chance: 80, minQuantity: 1, maxQuantity: 2 },
                { materialId: 'herb_common', chance: 40, minQuantity: 1, maxQuantity: 1 },
                { materialId: 'beast_fang', chance: 25, minQuantity: 1, maxQuantity: 1 },
                { materialId: 'shard_earth', chance: 15, minQuantity: 1, maxQuantity: 1 }
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
                { materialId: 'slime_core', chance: 20, minQuantity: 1, maxQuantity: 1 },
                { materialId: 'mushroom_blue', chance: 20, minQuantity: 1, maxQuantity: 1 },
                { materialId: 'beast_fang', chance: 30, minQuantity: 1, maxQuantity: 2 }
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
    description: '옅은 안개가 수면을 뒤덮은 고요한 호수. 잔잔한 물결 아래 고대의 물 마력이 숨어 있어, 맑은 물 속성 재료와 신비한 보물을 노리는 모험가들이 끊이지 않는 장소입니다.',
    recommendedLevel: 3,
    iconUrl: '/assets/dungeons/lake.png',
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
                { materialId: 'shard_water', chance: 40, minQuantity: 1, maxQuantity: 1 },
                { materialId: 'frozen_dew', chance: 25, minQuantity: 1, maxQuantity: 1 }
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
                { materialId: 'crystal_mana', chance: 10, minQuantity: 1, maxQuantity: 1 },
                { materialId: 'spirit_dust', chance: 35, minQuantity: 1, maxQuantity: 2 }
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
                { materialId: 'slime_fluid', chance: 80, minQuantity: 3, maxQuantity: 5 },
                { materialId: 'frost_essence', chance: 30, minQuantity: 1, maxQuantity: 1 }
            ]
        }
    ]
}

export const CRYSTAL_DUNGEON: Dungeon = {
    id: 'dungeon_crystal_cave',
    name: '수정 동굴',
    description: '형형색색의 수정이 빛나는 아름다운 동굴. 하지만 아름다움 뒤에는 마력을 탐하는 위험한 생물들이 도사리고 있습니다. 희귀한 마력 결정과 보석을 얻을 수 있는 장소입니다.',
    recommendedLevel: 5,
    iconUrl: '/assets/dungeons/crystal_cave.png',
    enemies: [
        {
            id: 'crystal_mite',
            name: '수정 진드기',
            level: 5,
            hp: 80,
            attack: 18,
            defense: 8,
            exp: 30,
            drops: [
                { materialId: 'ore_iron', chance: 60, minQuantity: 1, maxQuantity: 2 },
                { materialId: 'crystal_mana', chance: 30, minQuantity: 1, maxQuantity: 1 }
            ]
        },
        {
            id: 'mana_spirit',
            name: '마력의 정령',
            level: 8,
            hp: 120,
            attack: 25,
            defense: 15,
            exp: 50,
            drops: [
                { materialId: 'herb_rare', chance: 50, minQuantity: 1, maxQuantity: 2 },
                { materialId: 'crystal_mana', chance: 40, minQuantity: 1, maxQuantity: 2 }
            ]
        },
        {
            id: 'crystal_golem',
            name: '수정 골렘',
            level: 12,
            hp: 400,
            attack: 45,
            defense: 30,
            exp: 120,
            drops: [
                { materialId: 'crystal_mana', chance: 100, minQuantity: 2, maxQuantity: 4 },
                { materialId: 'gem_fragment', chance: 60, minQuantity: 1, maxQuantity: 2 }
            ]
        }
    ]
}

export const CHRISTMAS_DUNGEON: Dungeon = {
    id: 'dungeon_christmas',
    name: '겨울 왕국',
    description: '영원한 눈이 내리는 신비로운 겨울 왕국. 크리스마스 분위기가 가득한 이곳에서 눈꽃 요정들과 얼음 생물들이 소중한 겨울 재료를 지키고 있습니다. ⛄🎄',
    recommendedLevel: 2,
    iconUrl: '/assets/dungeons/christmas.png',
    enemies: [
        {
            id: 'snowball_slime',
            name: '눈덩이 슬라임',
            level: 2,
            hp: 45,
            attack: 8,
            defense: 5,
            exp: 15,
            drops: [
                { materialId: 'snowflake', chance: 70, minQuantity: 1, maxQuantity: 2 },
                { materialId: 'slime_fluid', chance: 50, minQuantity: 1, maxQuantity: 1 }
            ]
        },
        {
            id: 'frost_sprite',
            name: '서리 요정',
            level: 4,
            hp: 60,
            attack: 15,
            defense: 8,
            exp: 25,
            drops: [
                { materialId: 'snowflake', chance: 80, minQuantity: 1, maxQuantity: 2 },
                { materialId: 'ice_shard', chance: 60, minQuantity: 1, maxQuantity: 2 },
                { materialId: 'spirit_dust', chance: 30, minQuantity: 1, maxQuantity: 1 }
            ]
        },
        {
            id: 'ice_wolf',
            name: '얼음 늑대',
            level: 6,
            hp: 100,
            attack: 25,
            defense: 12,
            exp: 40,
            drops: [
                { materialId: 'ice_shard', chance: 70, minQuantity: 1, maxQuantity: 3 },
                { materialId: 'frozen_dew', chance: 40, minQuantity: 1, maxQuantity: 1 },
                { materialId: 'beast_fang', chance: 50, minQuantity: 1, maxQuantity: 2 }
            ]
        },
        {
            id: 'christmas_tree_ent',
            name: '크리스마스 트리 엔트',
            level: 10,
            hp: 250,
            attack: 35,
            defense: 25,
            exp: 80,
            drops: [
                { materialId: 'frozen_dew', chance: 80, minQuantity: 1, maxQuantity: 2 },
                { materialId: 'frost_essence', chance: 50, minQuantity: 1, maxQuantity: 1 },
                { materialId: 'herb_rare', chance: 40, minQuantity: 1, maxQuantity: 2 }
            ]
        },
        {
            id: 'santa_golem',
            name: '산타 골렘',
            level: 15,
            hp: 500,
            attack: 50,
            defense: 35,
            exp: 200,
            drops: [
                { materialId: 'frost_essence', chance: 100, minQuantity: 1, maxQuantity: 2 },
                { materialId: 'frozen_dew', chance: 80, minQuantity: 2, maxQuantity: 3 },
                { materialId: 'snowflake', chance: 100, minQuantity: 3, maxQuantity: 5 },
                { materialId: 'gem_fragment', chance: 30, minQuantity: 1, maxQuantity: 1 }
            ]
        }
    ]
}

export const VOLCANO_DUNGEON: Dungeon = {
    id: 'dungeon_volcano',
    name: '화산 요새',
    description: '뜨거운 용암이 흐르는 위험한 요새. 화염 속성 몬스터들이 서식합니다. 숙련된 모험가만이 살아남을 수 있습니다.',
    recommendedLevel: 20,
    iconUrl: '/assets/dungeons/magma_dungeon.png',
    enemies: [
        {
            id: 'fire_slime',
            name: '파이어 슬라임',
            level: 18,
            hp: 600,
            attack: 60,
            defense: 40,
            exp: 250,
            drops: [
                { materialId: 'slime_fluid', chance: 80, minQuantity: 3, maxQuantity: 5 },
                { materialId: 'ore_iron', chance: 40, minQuantity: 2, maxQuantity: 4 },
                { materialId: 'gem_fragment', chance: 20, minQuantity: 1, maxQuantity: 1 }
            ]
        },
        {
            id: 'magma_golem',
            name: '마그마 골렘',
            level: 22,
            hp: 1000,
            attack: 80,
            defense: 60,
            exp: 400,
            drops: [
                { materialId: 'ore_iron', chance: 100, minQuantity: 3, maxQuantity: 6 },
                { materialId: 'gem_fragment', chance: 50, minQuantity: 1, maxQuantity: 2 },
                { materialId: 'crystal_mana', chance: 30, minQuantity: 1, maxQuantity: 2 }
            ]
        }
    ]
}

export const SKY_DUNGEON: Dungeon = {
    id: 'dungeon_sky',
    name: '천공의 탑',
    description: '구름 위에 떠 있는 신비한 탑. 비행 몬스터들과 바람의 정령들이 지키고 있습니다.',
    recommendedLevel: 25,
    iconUrl: '/assets/dungeons/sky_catsle.png',
    enemies: [
        {
            id: 'cloud_slime',
            name: '구름 슬라임',
            level: 23,
            hp: 800,
            attack: 70,
            defense: 45,
            exp: 300,
            drops: [
                { materialId: 'slime_fluid', chance: 80, minQuantity: 3, maxQuantity: 5 },
                { materialId: 'spirit_dust', chance: 50, minQuantity: 2, maxQuantity: 4 }
            ]
        },
        {
            id: 'sky_dragon_hatchling',
            name: '스카이 드래곤 유치',
            level: 28,
            hp: 1500,
            attack: 100,
            defense: 80,
            exp: 600,
            drops: [
                { materialId: 'beast_fang', chance: 80, minQuantity: 2, maxQuantity: 4 },
                { materialId: 'gem_fragment', chance: 40, minQuantity: 2, maxQuantity: 3 },
                { materialId: 'crystal_mana', chance: 20, minQuantity: 1, maxQuantity: 2 }
            ]
        }
    ]
}

export const BEAST_DUNGEON: Dungeon = {
    id: 'dungeon_beast_forest',
    name: '짐승의 숲',
    description: '거대한 곰이 포효하는 깊은 숲. 사나운 짐승들이 영역을 지키고 있어 함부로 발을 들였다가 목숨을 잃을 수 있습니다.',
    recommendedLevel: 12,
    iconUrl: '/assets/dungeons/beast_forest.png',
    enemies: [
        {
            id: 'wolf_dark', // monster_wolf_dark without prefix
            name: '어둠 늑대',
            level: 10,
            hp: 120,
            attack: 35,
            defense: 15,
            exp: 60,
            drops: [
                { materialId: 'beast_fang', chance: 70, minQuantity: 1, maxQuantity: 2 },
                { materialId: 'claw_sharp', chance: 30, minQuantity: 1, maxQuantity: 1 }
            ]
        },
        {
            id: 'hound_fang', // monster_hound_fang
            name: '송곳니 하운드',
            level: 8,
            hp: 100,
            attack: 30,
            defense: 10,
            exp: 45,
            drops: [
                { materialId: 'beast_fang', chance: 80, minQuantity: 1, maxQuantity: 2 }
            ]
        },
        {
            id: 'scar_bear',
            name: '상처 입은 곰',
            level: 15,
            hp: 800,
            attack: 60,
            defense: 40,
            exp: 300,
            drops: [
                { materialId: 'leather_beast', chance: 100, minQuantity: 1, maxQuantity: 2 },
                { materialId: 'beast_fang', chance: 80, minQuantity: 2, maxQuantity: 4 },
                { materialId: 'claw_sharp', chance: 50, minQuantity: 1, maxQuantity: 2 }
            ]
        }
    ]
}

// Helper to add global drops
function addGlobalDrops(dungeons: Dungeon[]): Dungeon[] {
    return dungeons.map(dungeon => ({
        ...dungeon,
        enemies: dungeon.enemies.map(enemy => ({
            ...enemy,
            drops: [
                ...enemy.drops,
                // Global Low Chance Drop: Monster Essence
                { materialId: 'essence', chance: 5, minQuantity: 1, maxQuantity: 1 }
            ]
        }))
    }))
}

// Add specific shard drops manually where missing before exporting
const VOLCANO_WITH_DROPS = {
    ...VOLCANO_DUNGEON,
    enemies: VOLCANO_DUNGEON.enemies.map(e => ({
        ...e,
        drops: [...e.drops, { materialId: 'shard_fire', chance: 30, minQuantity: 1, maxQuantity: 1 }]
    }))
}

const SKY_WITH_DROPS = {
    ...SKY_DUNGEON,
    enemies: SKY_DUNGEON.enemies.map(e => ({
        ...e,
        drops: [...e.drops, { materialId: 'shard_wind', chance: 30, minQuantity: 1, maxQuantity: 1 }]
    }))
}

export const DUNGEONS = addGlobalDrops([SLIME_DUNGEON, LAKE_DUNGEON, CRYSTAL_DUNGEON, BEAST_DUNGEON, CHRISTMAS_DUNGEON, VOLCANO_WITH_DROPS, SKY_WITH_DROPS])

