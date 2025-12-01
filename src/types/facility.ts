/**
 * Facility (시설) 관련 타입 정의
 */

export interface UnlockCondition {
  type: 'level' | 'resource' | 'facility' | 'quest'
  value: number | string
  operator?: 'gte' | 'lte' | 'eq'
}

export interface FacilityStats {
  intervalSeconds: number
  bundlesPerTick: number
  dropRates: Record<string, number>
}

export interface FacilityLevel {
  level: number
  stats: FacilityStats
  upgradeCost: Record<string, number>
}

export interface FacilityData {
  id: string
  name: string
  category: string
  unlockConditions: UnlockCondition[]
  levels: FacilityLevel[]
}
