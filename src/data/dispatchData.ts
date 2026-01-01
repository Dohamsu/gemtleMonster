export interface DispatchRegion {
    id: string
    name: string
    description: string
    recommendedLevel: number
    imageUrl: string
    requiredAttributes?: string[]
    durationOptions: number[] // Seconds
    rewards: {
        materialId: string
        min: number
        max: number
        chance: number // 0-1
    }[]
    unlockCondition?: {
        facilityLevel?: number
    }
}

export const DISPATCH_REGIONS: DispatchRegion[] = [
    {
        id: 'forest_1',
        name: '평화로운 숲',
        description: '약초와 나뭇가지를 쉽게 구할 수 있는 숲 가장자리입니다.',
        recommendedLevel: 1,
        imageUrl: '/assets/dungeons/slime_forest.png',
        durationOptions: [300, 1800, 3600], // 5min, 30min, 1h
        rewards: [
            { materialId: 'herb_common', min: 2, max: 5, chance: 1 },
            { materialId: 'wood_branch', min: 2, max: 4, chance: 0.8 },
            { materialId: 'slime_fluid', min: 1, max: 3, chance: 0.5 },
            { materialId: 'herb_roots', min: 1, max: 2, chance: 0.3 }
        ]
    },
    {
        id: 'cave_entrance',
        name: '동굴 입구',
        description: '돌과 광석이 발견되는 얕은 동굴입니다.',
        recommendedLevel: 5,
        imageUrl: '/assets/dungeons/crystal_cave.png',
        durationOptions: [600, 3600, 7200], // 10min, 1h, 2h
        rewards: [
            { materialId: 'stone', min: 3, max: 6, chance: 1 },
            { materialId: 'ore_iron', min: 1, max: 3, chance: 0.6 },
            { materialId: 'bone_fragment', min: 1, max: 2, chance: 0.4 },
            { materialId: 'ore_copper', min: 1, max: 2, chance: 0.3 }
        ]
    },
    {
        id: 'ancient_ruins',
        name: '고대 유적지',
        description: '신비한 기운이 감도는 유적지입니다. 희귀한 재료가 발견됩니다.',
        recommendedLevel: 15,
        imageUrl: '/assets/dungeons/desert_ruins.png',
        durationOptions: [3600, 14400, 28800], // 1h, 4h, 8h (Sleep)
        rewards: [
            { materialId: 'stone', min: 5, max: 10, chance: 1 },
            { materialId: 'gem_fragment', min: 1, max: 3, chance: 0.5 },
            { materialId: 'ancient_relic_fragment', min: 1, max: 1, chance: 0.1 },
            { materialId: 'ore_gold', min: 1, max: 2, chance: 0.2 },
            { materialId: 'ore_mythril', min: 1, max: 1, chance: 0.05 }
        ],
        unlockCondition: {
            facilityLevel: 3
        }
    },
    {
        id: 'deep_sea',
        name: '심해 탐사',
        description: '빛이 닿지 않는 깊은 바다입니다. 수중 생물들의 서식지입니다.',
        recommendedLevel: 25,
        imageUrl: '/assets/dungeons/lake.png',
        requiredAttributes: ['swimming'], // Future attribute check?
        durationOptions: [7200, 21600], // 2h, 6h
        rewards: [
            { materialId: 'coral_fragment', min: 3, max: 6, chance: 1 },
            { materialId: 'starfish_skin', min: 2, max: 4, chance: 0.7 },
            { materialId: 'jelly_biolum', min: 2, max: 4, chance: 0.6 },
            { materialId: 'pearl_black', min: 1, max: 1, chance: 0.02 }
        ],
        unlockCondition: {
            facilityLevel: 5
        }
    }
]
