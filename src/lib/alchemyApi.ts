import { supabase } from './supabase'

// ============================================
// 타입 정의
// ============================================

export interface Material {
  id: string
  name: string
  description?: string
  family: 'PLANT' | 'MINERAL' | 'BEAST' | 'SLIME' | 'SPIRIT'
  rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'
  icon_url?: string
  source_info?: any
  is_special: boolean
  sell_price: number
}

export interface RecipeIngredient {
  material_id: string
  quantity: number
  is_catalyst: boolean
}

// Extended RecipeCondition matching new DB schema
export interface RecipeCondition {
  id?: number
  recipe_id?: string
  condition_type: string // All condition types from unionRule.md
  value_int?: number
  value_float?: number
  value_text?: string
  value_json?: any
  value_bool?: boolean
  description?: string
  created_at?: string
}

export interface Recipe {
  id: string
  name: string
  description?: string
  result_monster_id: string
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

export interface PlayerMaterial {
  material_id: string
  quantity: number
}

export interface PlayerRecipe {
  recipe_id: string
  is_discovered: boolean
  first_discovered_at?: string
  craft_count: number
  success_count: number
}

export interface PlayerAlchemy {
  level: number
  experience: number
  workshop_level: number
  global_success_bonus: number
  global_time_reduction: number
}

// ============================================
// 재료 관련 API
// ============================================

/**
 * 모든 재료 목록 가져오기
 */
export async function getAllMaterials(): Promise<Material[]> {
  const { data, error } = await supabase
    .from('material')
    .select('*')
    .order('family, rarity')

  if (error) {
    console.error('재료 목록 로드 실패:', error)
    throw error
  }

  return data || []
}

/**
 * 특정 계열의 재료 가져오기
 */
export async function getMaterialsByFamily(family: string): Promise<Material[]> {
  const { data, error } = await supabase
    .from('material')
    .select('*')
    .eq('family', family)
    .order('rarity')

  if (error) {
    console.error(`${family} 재료 로드 실패:`, error)
    throw error
  }

  return data || []
}

/**
 * 플레이어의 재료 인벤토리 가져오기
 */
export async function getPlayerMaterials(userId: string): Promise<PlayerMaterial[]> {
  const { data, error } = await supabase
    .from('player_material')
    .select('material_id, quantity')
    .eq('user_id', userId)
    .gt('quantity', 0)

  if (error) {
    console.error('플레이어 재료 로드 실패:', error)
    throw error
  }

  return data || []
}

/**
 * 재료 수량 추가 (테스트용)
 */
export async function addMaterialToPlayer(
  userId: string,
  materialId: string,
  quantity: number
): Promise<void> {
  const { error } = await supabase.rpc('add_materials', {
    p_user_id: userId,
    p_material_id: materialId,
    p_quantity: quantity
  })

  if (error) {
    console.error('재료 추가 실패:', error)
    throw error
  }
}

// ============================================
// 레시피 관련 API
// ============================================

/**
 * 모든 레시피 목록 가져오기 (재료, 조건 포함)
 */
export async function getAllRecipes(): Promise<Recipe[]> {
  const { data, error } = await supabase
    .from('recipe')
    .select(`
      *,
      ingredients:recipe_ingredient(material_id, quantity, is_catalyst),
      conditions:recipe_condition(condition_type, value_int, value_float, value_text, value_json, value_bool, description)
    `)
    .order('priority', { ascending: false })

  if (error) {
    console.error('레시피 목록 로드 실패:', error)
    throw error
  }

  return data || []
}

/**
 * 특정 레시피 상세 정보 가져오기
 */
export async function getRecipeById(recipeId: string): Promise<Recipe | null> {
  const { data, error } = await supabase
    .from('recipe')
    .select(`
      *,
      ingredients:recipe_ingredient(material_id, quantity, is_catalyst),
      conditions:recipe_condition(condition_type, value_int, value_float, value_text, value_json, value_bool, description)
    `)
    .eq('id', recipeId)
    .single()

  if (error) {
    console.error('레시피 로드 실패:', error)
    return null
  }

  return data
}

/**
 * 플레이어의 레시피 발견 정보 가져오기
 */
export async function getPlayerRecipes(userId: string): Promise<PlayerRecipe[]> {
  const { data, error } = await supabase
    .from('player_recipe')
    .select('recipe_id, is_discovered, first_discovered_at, craft_count, success_count')
    .eq('user_id', userId)

  if (error) {
    console.error('플레이어 레시피 로드 실패:', error)
    throw error
  }

  return data || []
}

/**
 * 레시피 발견 처리
 */
export async function discoverRecipe(userId: string, recipeId: string): Promise<void> {
  const { error } = await supabase
    .from('player_recipe')
    .upsert({
      user_id: userId,
      recipe_id: recipeId,
      is_discovered: true,
      first_discovered_at: new Date().toISOString()
    }, { onConflict: 'user_id,recipe_id' })

  if (error) {
    console.error('레시피 발견 처리 실패:', error)
    throw error
  }
}

// ============================================
// 연금술 정보 관련 API
// ============================================

/**
 * 플레이어 연금술 정보 가져오기
 */
export async function getPlayerAlchemy(userId: string): Promise<PlayerAlchemy | null> {
  const { data, error } = await supabase
    .from('player_alchemy')
    .select('level, experience, workshop_level, global_success_bonus, global_time_reduction')
    .eq('user_id', userId)
    .single()

  if (error) {
    // 데이터가 없으면 초기화
    if (error.code === 'PGRST116') {
      await initializePlayerAlchemy(userId)
      return {
        level: 1,
        experience: 0,
        workshop_level: 1,
        global_success_bonus: 0,
        global_time_reduction: 0
      }
    }
    console.error('연금술 정보 로드 실패:', error)
    return null
  }

  return data
}

/**
 * 플레이어 연금술 정보 초기화
 */
export async function initializePlayerAlchemy(userId: string): Promise<void> {
  const { error } = await supabase
    .from('player_alchemy')
    .insert({
      user_id: userId,
      level: 1,
      experience: 0,
      workshop_level: 1,
      global_success_bonus: 0,
      global_time_reduction: 0
    })

  if (error) {
    console.error('연금술 정보 초기화 실패:', error)
    throw error
  }
}

// ============================================
// 조합 관련 API
// ============================================

/**
 * 재료 소모 (조합 시 사용)
 */
export async function consumeMaterials(
  userId: string,
  materials: Record<string, number>
): Promise<boolean> {
  const { data, error } = await supabase.rpc('consume_materials', {
    p_user_id: userId,
    p_materials: materials
  })

  if (error) {
    console.error('재료 소모 실패:', error)
    return false
  }

  return data === true
}

/**
 * 조합 기록 저장
 */
export async function recordAlchemyHistory(
  userId: string,
  recipeId: string,
  success: boolean,
  successRateUsed: number,
  materialsUsed: Record<string, number>,
  resultMonsterId?: string
): Promise<void> {
  const { error } = await supabase
    .from('alchemy_history')
    .insert({
      user_id: userId,
      recipe_id: recipeId,
      success,
      success_rate_used: successRateUsed,
      materials_used: materialsUsed,
      result_monster_id: resultMonsterId
    })

  if (error) {
    console.error('조합 기록 저장 실패:', error)
    throw error
  }
}

/**
 * 조합 성공 시 레시피 카운트 업데이트
 */
export async function updateRecipeCraftCount(
  userId: string,
  recipeId: string,
  success: boolean
): Promise<void> {
  // 기존 레코드 가져오기
  const { data: existing } = await supabase
    .from('player_recipe')
    .select('craft_count, success_count')
    .eq('user_id', userId)
    .eq('recipe_id', recipeId)
    .single()

  const craftCount = (existing?.craft_count || 0) + 1
  const successCount = (existing?.success_count || 0) + (success ? 1 : 0)

  const { error } = await supabase
    .from('player_recipe')
    .upsert({
      user_id: userId,
      recipe_id: recipeId,
      craft_count: craftCount,
      success_count: successCount,
      is_discovered: true
    }, { onConflict: 'user_id,recipe_id' })

  if (error) {
    console.error('레시피 카운트 업데이트 실패:', error)
    throw error
  }
}

/**
 * 경험치 추가
 */
export async function addAlchemyExperience(userId: string, exp: number): Promise<void> {
  const currentData = await getPlayerAlchemy(userId)
  if (!currentData) return

  const newExp = currentData.experience + exp
  const newLevel = Math.floor(newExp / 100) + 1 // 간단한 레벨 계산 (100exp = 1레벨)

  const { error } = await supabase
    .from('player_alchemy')
    .update({
      experience: newExp,
      level: newLevel
    })
    .eq('user_id', userId)

  if (error) {
    console.error('경험치 추가 실패:', error)
    throw error
  }
}

/**
 * 몬스터를 플레이어 인벤토리에 추가
 */
export async function addMonsterToPlayer(
  userId: string,
  monsterId: string
): Promise<void> {
  const { error } = await supabase
    .from('player_monster')
    .insert({
      user_id: userId,
      monster_id: monsterId,
      level: 1,
      exp: 0,
      created_at: new Date().toISOString()
    })

  if (error) {
    console.error('❌ 몬스터 추가 실패:', error)
    console.error('상세 정보:', {
      userId,
      monsterId,
      errorMessage: error.message,
      errorDetails: error.details,
      errorHint: error.hint
    })
    throw error
  }

  console.log(`✅ 몬스터 추가 완료: ${monsterId}`)
}

/**
 * 플레이어의 몬스터 목록 가져오기
 */
export async function getPlayerMonsters(userId: string): Promise<Array<{
  id: string
  monster_id: string
  level: number
  exp: number
  created_at: string
}>> {
  const { data, error } = await supabase
    .from('player_monster')
    .select('id, monster_id, level, exp, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('몬스터 목록 로드 실패:', error)
    throw error
  }

  return data || []
}
