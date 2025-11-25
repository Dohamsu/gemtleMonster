export type ElementType = 'FIRE' | 'WATER' | 'EARTH' | 'WIND' | 'LIGHT' | 'DARK' | 'CHAOS'
export type RoleType = 'TANK' | 'DPS' | 'SUPPORT' | 'HYBRID' | 'PRODUCTION'
export type RarityType = 'N' | 'R' | 'SR' | 'SSR'

export interface Material {
    id: string
    name: string
    type: 'PLANT' | 'MINERAL' | 'BEAST' | 'SLIME' | 'SPIRIT' | 'SPECIAL'
    description: string
    rarity: RarityType
    iconUrl?: string
    sellPrice?: number
}

export interface Monster {
    id: string
    name: string
    role: RoleType
    element: ElementType
    rarity: RarityType
    description: string
    iconUrl?: string
    baseStats: {
        hp: number
        atk: number
        def: number
    }
    factoryTrait?: {
        targetFacility: string
        effect: string
        value: number
    }
}

export interface Recipe {
    id: string
    name: string
    description: string
    resultMonsterId: string
    materials: {
        materialId: string
        count: number
    }[]
    craftTimeSec: number
    successRate: number // 0-100
    requiredAlchemyLevel: number
    isHidden: boolean
    conditions?: {
        timeRange?: [number, number] // start hour, end hour (0-24)
        requiredCatalystId?: string
        requiredLanguage?: string[]
    }
}

export interface AlchemyState {
    selectedRecipeId: string | null
    selectedIngredients: Record<string, number> // materialId -> count
    isBrewing: boolean
    brewStartTime: number | null
    brewProgress: number // 0-100
}
