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
  material_id: string
  quantity: number
  is_catalyst: boolean
}

export interface RecipeCondition {
  id?: number
  recipe_id?: string
  condition_type: string
  value_int?: number
  value_float?: number
  value_text?: string
  value_json?: unknown
  value_bool?: boolean
  description?: string
  created_at?: string
}

export interface Recipe {
  id: string
  name: string
  description?: string
  type?: 'MONSTER' | 'ITEM' // Default 'MONSTER'
  result_monster_id?: string // Optional
  result_item_id?: string // New
  result_count: number
  base_success_rate: number
  craft_time_sec: number
  cost_gold: number
  required_alchemy_level: number
  exp_gain: number
  is_hidden: boolean
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
