/**
 * Recipe API
 * 레시피 관련 데이터베이스 작업
 */

/* eslint-disable no-console, @typescript-eslint/no-explicit-any */
import { supabase } from './supabase'
import type { Recipe, PlayerRecipe } from '../types'

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

  // Transform snake_case to camelCase
  return (data || []).map((r: any) => ({
    ...r,
    resultMonsterId: r.result_monster_id,
    resultItemId: r.result_item_id,
    resultCount: r.result_count,
    baseSuccessRate: r.base_success_rate,
    craftTimeSec: r.craft_time_sec,
    costGold: r.cost_gold,
    requiredAlchemyLevel: r.required_alchemy_level,
    expGain: r.exp_gain,
    isHidden: r.is_hidden,

    ingredients: r.ingredients?.map((i: any) => ({
      materialId: i.material_id,
      quantity: i.quantity,
      isCatalyst: i.is_catalyst
    })),
    conditions: r.conditions?.map((c: any) => ({
      ...c,
      recipeId: c.recipe_id,
      conditionType: c.condition_type,
      valueInt: c.value_int,
      valueFloat: c.value_float,
      valueText: c.value_text,
      valueJson: c.value_json,
      valueBool: c.value_bool,
      createdAt: c.created_at
    }))
  }))
}

/**
 * 특정 레시피 상세 정보 가져오기
 *
 * @param recipeId - 레시피 ID
 * @returns 레시피 정보 또는 null
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

  if (!data) return null

  // Transform snake_case to camelCase
  const r = data as any
  return {
    ...r,
    resultMonsterId: r.result_monster_id,
    resultItemId: r.result_item_id,
    resultCount: r.result_count,
    baseSuccessRate: r.base_success_rate,
    craftTimeSec: r.craft_time_sec,
    costGold: r.cost_gold,
    requiredAlchemyLevel: r.required_alchemy_level,
    expGain: r.exp_gain,
    isHidden: r.is_hidden,

    ingredients: r.ingredients?.map((i: any) => ({
      materialId: i.material_id,
      quantity: i.quantity,
      isCatalyst: i.is_catalyst
    })),
    conditions: r.conditions?.map((c: any) => ({
      ...c,
      recipeId: c.recipe_id,
      conditionType: c.condition_type,
      valueInt: c.value_int,
      valueFloat: c.value_float,
      valueText: c.value_text,
      valueJson: c.value_json,
      valueBool: c.value_bool,
      createdAt: c.created_at
    }))
  }
}

/**
 * 플레이어의 레시피 발견 정보 가져오기
 *
 * @param userId - 사용자 ID
 * @returns 플레이어 레시피 목록
 */
export async function getPlayerRecipes(userId: string): Promise<PlayerRecipe[]> {
  const { data, error } = await supabase
    .from('player_recipe')
    .select('recipe_id, is_discovered, first_discovered_at, craft_count, success_count, discovered_ingredients')
    .eq('user_id', userId)

  if (error) {
    console.error('플레이어 레시피 로드 실패:', error)
    throw error
  }

  return data || []
}

/**
 * 레시피 발견 처리
 *
 * @param userId - 사용자 ID
 * @param recipeId - 레시피 ID
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

/**
 * 레시피 조합 횟수 업데이트
 *
 * @param userId - 사용자 ID
 * @param recipeId - 레시피 ID
 * @param success - 성공 여부
 */
export async function updateRecipeCraftCount(
  userId: string,
  recipeId: string,
  success: boolean
): Promise<void> {
  const { error } = await supabase.rpc('update_recipe_craft_count', {
    p_user_id: userId,
    p_recipe_id: recipeId,
    p_success: success
  })

  if (error) {
    console.error('레시피 조합 횟수 업데이트 실패:', error)
    throw error
  }
}
/**
 * 레시피 재료 발견 처리
 *
 * @param userId - 사용자 ID
 * @param recipeId - 레시피 ID
 * @param materialId - 발견한 재료 ID
 */
export async function discoverRecipeIngredient(
  userId: string,
  recipeId: string,
  materialId: string
): Promise<string[]> {
  const { data, error } = await supabase.rpc('discover_recipe_ingredient', {
    p_user_id: userId,
    p_recipe_id: recipeId,
    p_material_id: materialId
  })

  if (error) {
    console.error('레시피 재료 발견 처리 실패:', error)
    // 에러 발생 시 빈 배열 반환하여 게임 진행 방해 최소화
    return []
  }

  return data || []
}
