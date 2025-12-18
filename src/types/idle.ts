export interface UnlockCondition {
    type: 'level' | 'resource' | 'facility' | 'quest'
    value: number | string
    operator?: 'gte' | 'lte' | 'eq'
}

export interface FacilityLevel {
    level: number
    name?: string // Level-specific name (e.g., "Copper Mine")
    stats: {
        intervalSeconds: number
        bundlesPerTick: number
        dropRates: Record<string, number>
        cost?: Record<string, number>
        capacity?: number
        questSeedDropRate?: number
        crackStoneFragmentDropRate?: number
        ancientRelicFragmentDropRate?: number
        // Add other potential stats here as optional
        [key: string]: unknown
    }
    upgradeCost: Record<string, number>
}

export interface FacilityData {
    id: string
    name: string
    category: string
    unlockConditions: UnlockCondition[]
    levels: FacilityLevel[]
}
