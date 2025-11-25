export interface UnlockCondition {
    type: 'level' | 'resource' | 'facility' | 'quest'
    value: number | string
    operator?: 'gte' | 'lte' | 'eq'
}

export interface FacilityLevel {
    level: number
    stats: {
        intervalSeconds: number
        bundlesPerTick: number
        dropRates: Record<string, number>
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
