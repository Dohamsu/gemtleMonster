/**
 * Monster API
 * 몬스터 관련 데이터베이스 작업
 */

/* eslint-disable no-console */
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
    .select('id, monster_id, level, exp, created_at, is_locked, awakening_level')
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

  // awakening_level 조회
  const { data: currentMonster } = await supabase
    .from('player_monster')
    .select('awakening_level')
    .eq('id', monsterId)
    .single()

  const currentAwakeningLevel = currentMonster?.awakening_level || 0

  // awakeningLevel을 포함하여 레벨업 처리 (최대 레벨 확장 적용)
  const result = processLevelUp(currentLevel, currentExp, addedExp, rarity, currentAwakeningLevel)
  const { newLevel, newExp, leveledUp, levelsGained } = result

  // ... (Rest of function)

  // 새로 해금된 스킬 수집 (No changes needed)
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

  // ... (Rest of function remains similar)

  // (Omitted existing code for brevity, will rely on replace_file checks to be safe, 
  // actually I should just append the new function at the end)

  // ... (Actually, let's just append awakenMonster at the end of the file)

  // DB update part
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


/**
 * 몬스터 초월 (Awakening)
 * 
 * @param userId - 사용자 ID
 * @param targetMonsterId - 초월할 몬스터 ID (UUID)
 * @param materialMonsterId - 재료로 쓸 몬스터 ID (UUID)
 */
export async function awakenMonster(
  userId: string,
  targetMonsterId: string,
  materialMonsterIds: string[]
): Promise<{ success: boolean; newAwakeningLevel: number; error?: string }> {
  // 1. Validate inputs
  if (!materialMonsterIds || materialMonsterIds.length === 0) {
    return { success: false, newAwakeningLevel: 0, error: '재료 몬스터를 선택해주세요.' }
  }

  const allMonsterIds = [targetMonsterId, ...materialMonsterIds]

  const { data: monsters, error: fetchError } = await supabase
    .from('player_monster')
    .select('id, monster_id, awakening_level, is_locked')
    .in('id', allMonsterIds)
    .eq('user_id', userId)

  if (fetchError || !monsters || monsters.length !== allMonsterIds.length) {
    return { success: false, newAwakeningLevel: 0, error: '몬스터 정보를 찾을 수 없습니다.' }
  }

  const target = monsters.find(m => m.id === targetMonsterId)
  if (!target) return { success: false, newAwakeningLevel: 0, error: '대상 몬스터 오류' }

  // 2. Validate conditions & Calculate Value
  let addedValue = 0
  for (const matId of materialMonsterIds) {
    const material = monsters.find(m => m.id === matId)
    if (!material) return { success: false, newAwakeningLevel: 0, error: '재료 몬스터 오류' }

    if (target.monster_id !== material.monster_id) {
      return { success: false, newAwakeningLevel: 0, error: '동일한 종류의 몬스터만 재료로 사용할 수 있습니다.' }
    }
    if (material.is_locked) {
      return { success: false, newAwakeningLevel: 0, error: '잠금 상태인 몬스터는 재료로 사용할 수 없습니다.' }
    }
    if (material.id === target.id) {
      return { success: false, newAwakeningLevel: 0, error: '자기 자신을 재료로 사용할 수 없습니다.' }
    }

    // Calculate value: 1 + awakening_level (Matches utils/getMaterialValue logic)
    addedValue += 1 + (material.awakening_level || 0)
  }

  const newAwakeningLevel = target.awakening_level + addedValue

  if (newAwakeningLevel > 5) {
    return { success: false, newAwakeningLevel: 0, error: `최대 초월 레벨(5)을 초과합니다. (현재: ${target.awakening_level}, 추가: ${addedValue})` }
  }

  // 3. Execute Transaction 
  // Delete materials
  const { error: deleteError } = await supabase
    .from('player_monster')
    .delete()
    .in('id', materialMonsterIds)
    .eq('user_id', userId)

  if (deleteError) {
    return { success: false, newAwakeningLevel: 0, error: '재료 몬스터 소모 중 오류가 발생했습니다.' }
  }

  // Update target
  // newAwakeningLevel is already calculated above
  const { error: updateError } = await supabase
    .from('player_monster')
    .update({ awakening_level: newAwakeningLevel })
    .eq('id', targetMonsterId)
    .eq('user_id', userId)

  if (updateError) {
    console.error('CRITICAL: Materials deleted but Awakening failed', { targetMonsterId, materialMonsterIds })
    return { success: false, newAwakeningLevel: 0, error: '초월 업데이트 중 오류가 발생했습니다.' }
  }

  return { success: true, newAwakeningLevel }
}


/**
 * 몬스터에게 경험치 포션 먹이기 (대량/다중 종류 지원)
 * 
 * @param userId - 사용자 ID
 * @param monsterId - 몬스터 ID (UUID)
 * @param materials - 소모할 재료 목록 (potionId -> quantity)
 * @param totalXp - 획득할 총 경험치
 */
export async function feedMonster(
  userId: string,
  monsterId: string,
  materials: Record<string, number>,
  totalXp: number
): Promise<{ success: boolean; newLevel: number; newExp: number; leveledUp: boolean; error?: string }> {
  // 1. 재료(포션) 소모
  const { error: consumeError } = await supabase.rpc('consume_materials', {
    p_user_id: userId,
    p_materials: materials
  })

  if (consumeError) {
    console.error('포션 소모 실패:', consumeError)
    return { success: false, newLevel: 0, newExp: 0, leveledUp: false, error: '포션 소모에 실패했습니다.' }
  }

  // 2. 몬스터 정보 조회
  const { data: monster, error: fetchError } = await supabase
    .from('player_monster')
    .select('level, exp, monster_id, awakening_level')
    .eq('id', monsterId)
    .single()

  if (fetchError || !monster) {
    return { success: false, newLevel: 0, newExp: 0, leveledUp: false, error: '몬스터 정보를 찾을 수 없습니다.' }
  }

  // 3. 경험치 추가 및 레벨업
  try {
    const result = await updateMonsterExp(
      userId,
      monsterId,
      monster.level,
      monster.exp,
      totalXp
    )

    return {
      success: true,
      newLevel: result.level,
      newExp: result.exp,
      leveledUp: result.leveledUp
    }

  } catch (e: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    return { success: false, newLevel: 0, newExp: 0, leveledUp: false, error: e.message }
  }
}
