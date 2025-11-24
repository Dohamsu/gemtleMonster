import type { Recipe } from '../types/alchemy'

export const RECIPES: Recipe[] = [
    // --- Basic Recipes ---
    {
        id: 'recipe_slime_basic',
        name: '기본 슬라임',
        description: '가장 기초적인 슬라임 소환법.',
        resultMonsterId: 'slime_basic',
        materials: [
            { materialId: 'slime_core', count: 1 },
            { materialId: 'herb_common', count: 1 }
        ],
        craftTimeSec: 5,
        successRate: 100,
        requiredAlchemyLevel: 1,
        isHidden: false
    },
    {
        id: 'recipe_hound_basic',
        name: '송곳니 하운드',
        description: '날렵한 사냥개를 소환한다.',
        resultMonsterId: 'hound_basic',
        materials: [
            { materialId: 'beast_fang', count: 2 },
            { materialId: 'herb_common', count: 1 }
        ],
        craftTimeSec: 10,
        successRate: 90,
        requiredAlchemyLevel: 1,
        isHidden: false
    },
    {
        id: 'recipe_golem_stone',
        name: '돌 골렘',
        description: '단단한 돌 골렘을 제작한다.',
        resultMonsterId: 'golem_stone',
        materials: [
            { materialId: 'magic_ore', count: 2 },
            { materialId: 'slime_core', count: 3 }
        ],
        craftTimeSec: 30,
        successRate: 80,
        requiredAlchemyLevel: 2,
        isHidden: false
    },
    {
        id: 'recipe_fairy_spirit',
        name: '정령 요정',
        description: '치유의 힘을 가진 요정을 부른다.',
        resultMonsterId: 'fairy_spirit',
        materials: [
            { materialId: 'spirit_dust', count: 2 },
            { materialId: 'herb_common', count: 3 }
        ],
        craftTimeSec: 20,
        successRate: 85,
        requiredAlchemyLevel: 2,
        isHidden: false
    },
    {
        id: 'recipe_wolf_dark',
        name: '어둠 늑대',
        description: '어둠 속에서 활동하는 늑대.',
        resultMonsterId: 'wolf_dark',
        materials: [
            { materialId: 'beast_fang', count: 3 },
            { materialId: 'dark_crystal', count: 1 }
        ],
        craftTimeSec: 25,
        successRate: 80,
        requiredAlchemyLevel: 3,
        isHidden: false
    },

    // --- Special Recipes ---
    {
        id: 'recipe_slime_king',
        name: '왕슬라임',
        description: '거대한 왕관을 쓴 슬라임의 왕.',
        resultMonsterId: 'slime_king',
        materials: [
            { materialId: 'slime_core', count: 10 },
            { materialId: 'herb_common', count: 10 }
        ],
        craftTimeSec: 60,
        successRate: 50,
        requiredAlchemyLevel: 5,
        isHidden: true,
        conditions: {
            requiredCatalystId: 'crown_shard'
        }
    },
    {
        id: 'recipe_golem_magma',
        name: '마그마 골렘',
        description: '뜨거운 용암이 흐르는 골렘.',
        resultMonsterId: 'golem_magma',
        materials: [
            { materialId: 'magic_ore', count: 5 },
            { materialId: 'slime_core', count: 5 }
        ],
        craftTimeSec: 60,
        successRate: 40,
        requiredAlchemyLevel: 5,
        isHidden: true,
        conditions: {
            requiredCatalystId: 'fire_core'
        }
    }
]
