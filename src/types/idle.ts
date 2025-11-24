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
    unlockConditions: any[] // We can define this more strictly later
    levels: FacilityLevel[]
}
