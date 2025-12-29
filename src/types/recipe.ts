/**
 * Recipe (레시피) 관련 타입 정의
 */

export type RecipeConditionType =
  | 'TIME_RANGE' | 'REAL_TIME_RANGE' | 'REAL_DATE' | 'WEEKDAY'
  | 'REAL_WEATHER' | 'LANGUAGE' | 'REAL_TEMPERATURE' | 'GEO_COUNTRY'
  | 'DEVICE_TYPE' | 'PLATFORM' | 'UI_PREFERENCE'
  | 'TAB_IDLE' | 'LOGIN_STREAK' | 'DAILY_PLAYTIME' | 'RECENT_FAIL_COUNT'
  | 'EVENT_FLAG' | 'CATALYST' | 'ALCHEMY_LEVEL'

export interface RecipeIngredient {
  materialId: string
  quantity: number
  isCatalyst: boolean
}

export interface RecipeCondition {
  id?: number
  recipeId?: string
  conditionType: string
  valueInt?: number
  valueFloat?: number
  valueText?: string
  valueJson?: unknown
  valueBool?: boolean
  description?: string
  createdAt?: string
}

export interface Recipe {
  id: string
  name: string
  description?: string
  type?: 'MONSTER' | 'ITEM' // Default 'MONSTER'
  resultMonsterId?: string // Optional
  resultItemId?: string // New
  resultCount: number
  baseSuccessRate: number
  craftTimeSec: number
  costGold: number
  requiredAlchemyLevel: number
  expGain: number
  isHidden: boolean
  priority: number
  ingredients?: RecipeIngredient[]
  conditions?: RecipeCondition[]
}

export interface PlayerRecipe {
  recipe_id: string
  is_discovered: boolean
  first_discovered_at?: string
  craft_count: number
  success_count: number
  discovered_ingredients?: string[] // jsonb array of material IDs
}
