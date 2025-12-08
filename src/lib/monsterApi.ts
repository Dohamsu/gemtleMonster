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

/**
 * 몬스터 경험치 업데이트 (개선된 레벨링 시스템)
 *
 * @param userId - 사용자 ID
 * @param monsterId - 몬스터 ID (UUID)
 * @param currentLevel - 현재 레벨
 * @param currentExp - 현재 경험치
 * @param addedExp - 추가할 경험치
 * @param rarity - 몬스터 레어도 (N, R, SR, SSR)
 * @param monsterTypeId - 몬스터 타입 ID (스킬 해금용)
 * @param role - 몬스터 역할 (스킬 해금용)
 * @returns 업데이트된 레벨, 경험치, 레벨업 여부, 새로 해금된 스킬
 */
export async function updateMonsterExp(
  userId: string,
  monsterId: string,
  currentLevel: number,
  currentExp: number,
  addedExp: number,
  rarity: 'N' | 'R' | 'SR' | 'SSR' = 'N',
  monsterTypeId?: string,
  role?: 'TANK' | 'DPS' | 'SUPPORT' | 'HYBRID' | 'PRODUCTION'
): Promise<{
  level: number
  exp: number
  leveledUp: boolean
  levelsGained: number
  newSkills: string[]
}> {
  // 레벨업 유틸리티 동적 임포트 (순환 참조 방지)
  const { processLevelUp } = await import('./monsterLevelUtils')
  const { getNewlyUnlockedSkills } = await import('../data/monsterSkillData')

  // 지수형 경험치 곡선 적용된 레벨업 처리
  const result = processLevelUp(currentLevel, currentExp, addedExp, rarity)
  const { newLevel, newExp, leveledUp, levelsGained } = result

  // 새로 해금된 스킬 수집
  const newSkills: string[] = []
  if (leveledUp && monsterTypeId && role) {
    for (let lv = currentLevel + 1; lv <= newLevel; lv++) {
      const skills = getNewlyUnlockedSkills(monsterTypeId, role, lv)
      newSkills.push(...skills.map(s => s.id))
    }
  }

  // DB 업데이트 (스킬 해금 포함)
  const updateData: Record<string, unknown> = {
    level: newLevel,
    exp: newExp
  }

  // 새 스킬이 있으면 unlocked_skills 배열에 추가
  if (newSkills.length > 0) {
    const { data: currentData } = await supabase
      .from('player_monster')
      .select('unlocked_skills')
      .eq('id', monsterId)
      .eq('user_id', userId)
      .single()

    const existingSkills = currentData?.unlocked_skills || []
    const allSkills = [...new Set([...existingSkills, ...newSkills])]
    updateData.unlocked_skills = allSkills
  }

  const { error } = await supabase
    .from('player_monster')
    .update(updateData)
    .eq('id', monsterId)
    .eq('user_id', userId)

  if (error) {
    console.error('몬스터 경험치 업데이트 실패:', error)
    throw error
  }

  if (leveledUp) {
    console.log(`🎉 레벨업! Lv.${currentLevel} → Lv.${newLevel} (+${levelsGained})`)
    if (newSkills.length > 0) {
      console.log(`✨ 새 스킬 해금: ${newSkills.join(', ')}`)
    }
  }

  return { level: newLevel, exp: newExp, leveledUp, levelsGained, newSkills }
}

