/**
 * Alchemy API
 * 연금술 관련 데이터베이스 작업 및 통합 API
 *
 * 이 파일은 기존 코드와의 하위 호환성을 위해 유지되며,
 * 분리된 API 파일들을 re-export합니다.
 */

import { supabase } from './supabase'
import type {
  Material,
  PlayerMaterial,
  Recipe,
  RecipeIngredient,
  RecipeCondition,
  PlayerRecipe,
  PlayerAlchemy,
  PlayerMonster
} from '../types'

// Re-export types for backward compatibility
export type {
  Material,
  PlayerMaterial,
  Recipe,
  RecipeIngredient,
  RecipeCondition,
  PlayerRecipe,
  PlayerAlchemy,
  PlayerMonster
}

// Re-export functions from separated API files
export * from './materialApi'
export * from './recipeApi'
export * from './monsterApi'

// ============================================
// 연금술 정보 관련 API (Alchemy-specific)
// ============================================

/**
 * 플레이어 연금술 정보 가져오기
 *
 * @param userId - 사용자 ID
 * @returns 플레이어 연금술 정보 또는 null
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
 *
 * @param userId - 사용자 ID
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

/**
 * 조합 기록 저장
 *
 * @param userId - 사용자 ID
 * @param recipeId - 레시피 ID
 * @param success - 성공 여부
 * @param successRateUsed - 사용된 성공률
 * @param materialsUsed - 사용된 재료 목록
 * @param resultMonsterId - 결과 몬스터 ID (성공 시)
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
 * 경험치 추가
 *
 * @param userId - 사용자 ID
 * @param exp - 추가할 경험치
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

// ============================================
// 오프라인 보상 관련 API
// ============================================

/**
 * 마지막 오프라인 보상 수집 시간 가져오기
 *
 * @param userId - 사용자 ID
 * @returns 마지막 수집 시간 또는 null
 */
export async function getLastCollectedAt(userId: string): Promise<Date | null> {
  const { data, error } = await supabase
    .from('player_resource')
    .select('amount')
    .eq('user_id', userId)
    .eq('resource_id', 'offline_reward_timestamp')
    .single()

  if (error) {
    return null
  }

  // amount에 초 단위 타임스탬프가 저장됨
  return data?.amount ? new Date(data.amount * 1000) : null
}

/**
 * 마지막 오프라인 보상 수집 시간 업데이트
 *
 * @param userId - 사용자 ID
 * @param timestamp - 수집 시간 (기본값: 현재 시간)
 */
export async function updateLastCollectedAt(userId: string, timestamp?: Date): Promise<void> {
  const time = timestamp || new Date()
  const seconds = Math.floor(time.getTime() / 1000)

  const { error } = await supabase
    .from('player_resource')
    .upsert({
      user_id: userId,
      resource_id: 'offline_reward_timestamp',
      amount: seconds
    }, { onConflict: 'user_id,resource_id' })

  if (error) {
    console.error('마지막 수집 시간 업데이트 실패:', error)
    throw error
  }
}

// ============================================
// 실패 힌트 시스템 관련 API
// ============================================

/**
 * 연속 실패 횟수 가져오기
 */
export async function getConsecutiveFailures(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from('player_resource')
    .select('amount')
    .eq('user_id', userId)
    .eq('resource_id', 'alchemy_consecutive_failures')
    .single()

  if (error) {
    return 0
  }

  return data?.amount || 0
}

/**
 * 연속 실패 횟수 업데이트
 */
export async function updateConsecutiveFailures(userId: string, count: number): Promise<void> {
  const { error } = await supabase
    .from('player_resource')
    .upsert({
      user_id: userId,
      resource_id: 'alchemy_consecutive_failures',
      amount: count
    }, { onConflict: 'user_id,resource_id' })

  if (error) {
    console.error('연속 실패 횟수 업데이트 실패:', error)
    // 에러가 나도 게임 진행을 막지 않음
  }
}

/**
 * 연속 실패 횟수 초기화
 */
export async function resetConsecutiveFailures(userId: string): Promise<void> {
  await updateConsecutiveFailures(userId, 0)
}
