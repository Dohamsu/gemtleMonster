/**
 * Monster API
 * 몬스터 관련 데이터베이스 작업
 */

import { supabase } from './supabase'
import type { PlayerMonster } from '../types'

/**
 * 몬스터를 플레이어 인벤토리에 추가
 *
 * @param userId - 사용자 ID
 * @param monsterId - 몬스터 ID
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
 *
 * @param userId - 사용자 ID
 * @returns 플레이어 몬스터 목록
 */
export async function getPlayerMonsters(userId: string): Promise<PlayerMonster[]> {
  const { data, error } = await supabase
    .from('player_monster')
    .select('id, monster_id, level, exp, created_at, is_locked')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('몬스터 목록 로드 실패:', error)
    throw error
  }

  return data || []
}

/**
 * 몬스터 분해 (여러 마리)
 *
 * @param userId - 사용자 ID
 * @param monsterIds - 분해할 몬스터 ID 목록
 * @returns 분해 결과
 */
export async function decomposeMonsters(
  userId: string,
  monsterIds: string[]
): Promise<{
  success: boolean
  deleted_count: number
  rewards: Record<string, number>
  error?: string
}> {
  console.log(`🗑️ Decomposing monsters:`, monsterIds)

  const { data, error } = await supabase.rpc('decompose_monsters', {
    p_user_id: userId,
    p_monster_uids: monsterIds
  })

  if (error) {
    console.error('몬스터 분해 실패:', error)
    return {
      success: false,
      deleted_count: 0,
      rewards: {},
      error: error.message
    }
  }

  if (!data) {
    console.error('몬스터 분해 결과 없음 (data is null)')
    return {
      success: false,
      deleted_count: 0,
      rewards: {},
      error: 'No data returned from RPC'
    }
  }

  console.log(`✅ 몬스터 분해 완료: ${data.deleted_count}마리`, data)
  return data
}

/**
 * 몬스터 잠금/해제 토글
 *
 * @param userId - 사용자 ID
 * @param monsterId - 몬스터 ID
 * @param isLocked - 잠금 여부
 */
export async function toggleMonsterLock(
  userId: string,
  monsterId: string,
  isLocked: boolean
): Promise<void> {
  const { error } = await supabase
    .from('player_monster')
    .update({ is_locked: isLocked })
    .eq('id', monsterId)
    .eq('user_id', userId)

  if (error) {
    console.error('몬스터 잠금 상태 변경 실패:', error)
    throw error
  }

  console.log(`✅ 몬스터 잠금 상태 변경: ${monsterId} -> ${isLocked}`)
}
