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
    conditions?: RecipeCondition[]
}

export interface AlchemyState {
    selectedRecipeId: string | null
    selectedIngredients: Record<string, number> // materialId -> count
    isBrewing: boolean
    brewStartTime: number | null
    brewProgress: number // 0-100
}

// ==========================================
// Advanced Alchemy Types
// ==========================================

export interface AlchemyContext {
    time: {
        gameTime: number // 0-24
        realTime: number // 0-24
        realDayOfWeek: number // 0-6 (Sun-Sat)
        realDateStr: string // "MM-DD"
    }
    env: {
        weather: 'SUNNY' | 'RAIN' | 'SNOW' | 'STORM' | 'CLOUDY'
        temperature: number
        language: string
        country: string
    }
    device: {
        type: 'MOBILE' | 'DESKTOP'
        os: string
        isDarkMode: boolean
    }
    session: {
        idleTimeSec: number
        loginStreak: number
        dailyPlayTimeMin: number
        recentFailCount: number
    }
    player?: {
        alchemyLevel?: number
        catalysts?: string[]
        eventFlags?: string[]
    }
}

export type RecipeConditionType =
    | 'TIME_RANGE' | 'REAL_TIME_RANGE' | 'REAL_DATE' | 'WEEKDAY'
    | 'REAL_WEATHER' | 'LANGUAGE' | 'REAL_TEMPERATURE' | 'GEO_COUNTRY'
    | 'DEVICE_TYPE' | 'PLATFORM' | 'UI_PREFERENCE'
    | 'TAB_IDLE' | 'LOGIN_STREAK' | 'DAILY_PLAYTIME' | 'RECENT_FAIL_COUNT'
    | 'EVENT_FLAG' | 'CATALYST' | 'ALCHEMY_LEVEL'

export interface RecipeCondition {
    condition_type?: RecipeConditionType | string
    type?: RecipeConditionType // Legacy client format
    conditionType?: RecipeConditionType // Seed data format
    value?: unknown // Legacy single-field payloads
    value_int?: number
    value_float?: number
    value_text?: string
    value_json?: unknown
    value_bool?: boolean
    description?: string // For UI hint (e.g., "비 오는 날")
}
