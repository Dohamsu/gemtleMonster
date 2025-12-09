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

  // 지수형 경험치 곡선 적용된 레벨업 처리
  // Note: updateMonsterExp에서는 현재 초월 레벨을 알 수 없어 기본 maxLevel을 사용합니다.
  // 정확한 처리를 위해서는 awakening_level을 인자로 받아야 하지만, 
  // 기존 코드 호환성을 위해 우선 기본 maxLevel 로직을 유지하거나, 필요한 경우 DB 조회를 해야 합니다.
  // 여기서는 getMaxLevel 호출 시 awakeningLevel을 0으로 가정하거나, 호출처에서 처리해야 합니다.
  // processLevelUp 내부에서 getMaxLevel을 호출하므로, processLevelUp도 수정이 필요할 수 있습니다.
  // 하지만 monsterLevelUtils.ts의 processLevelUp은 내부적으로 getMaxLevel(rarity)를 호출합니다.
  // 이를 awakeningLevel을 받도록 수정해야 완벽하지만, 일단은 0으로 처리됩니다.
  // *Critical Fix*: processLevelUp이 내부적으로 getMaxLevel(rarity)만 호출하면 초월로 늘어난 만렙을 인식 못함.
  // 따라서 processLevelUp에 awakeningLevel 인자를 추가해야 함 (lib 수정 필요).
  // 일단 여기서는 기존 로직대로 호출하고, 추후 processLevelUp 시그니처 변경에 대응해야 합니다.

  // For now, let's assume awakeningLevel is 0 here to avoid breaking without reading current awakening.
  // DB에서 읽어오는게 가장 안전.
  const { data: currentMonster } = await supabase
    .from('player_monster')
    .select('awakening_level')
    .eq('id', monsterId)
    .single()

  const currentAwakeningLevel = currentMonster?.awakening_level || 0

  // We need to update processLevelUp to accept awakeningLevel.
  // Since I haven't updated processLevelUp signature in step 2 (I only updated getMaxLevel/calculateStats),
  // I must update processLevelUp in monsterLevelUtils.ts FIRST or pass a custom maxLevel if possible.
  // Let's look at monsterLevelUtils.ts again... I missed processLevelUp in previous step.
  // I will fix monsterLevelUtils.ts in next step or use a workaround.
  // Workaround: processLevelUp imports getMaxLevel, but I changed getMaxLevel signature to (rarity, awakening=0).
  // So existing processLevelUp using getMaxLevel(rarity) works but uses 0 awakening.
  // This means leveled up monsters won't reach expanded cap. THIS IS A BUG.
  // I will fix monsterLevelUtils.ts processLevelUp in a separate tool call.

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
  materialMonsterId: string
): Promise<{ success: boolean; newAwakeningLevel: number; error?: string }> {
  // 1. Validate ownership
  const { data: monsters, error: fetchError } = await supabase
    .from('player_monster')
    .select('id, monster_id, awakening_level, is_locked')
    .in('id', [targetMonsterId, materialMonsterId])
    .eq('user_id', userId)

  if (fetchError || !monsters || monsters.length !== 2) {
    return { success: false, newAwakeningLevel: 0, error: '몬스터 정보를 찾을 수 없습니다.' }
  }

  const target = monsters.find(m => m.id === targetMonsterId)
  const material = monsters.find(m => m.id === materialMonsterId)

  if (!target || !material) return { success: false, newAwakeningLevel: 0, error: '몬스터 정보 오류' }

  // 2. Validate conditions
  if (target.monster_id !== material.monster_id) {
    return { success: false, newAwakeningLevel: 0, error: '동일한 종류의 몬스터만 재료로 사용할 수 있습니다.' }
  }
  if (material.is_locked) {
    return { success: false, newAwakeningLevel: 0, error: '잠금 상태인 몬스터는 재료로 사용할 수 없습니다.' }
  }
  if (target.awakening_level >= 5) {
    return { success: false, newAwakeningLevel: 0, error: '이미 최대 초월 레벨입니다.' }
  }

  // 3. Execute Transaction (Simulate with sequential calls since we don't have a specific RPC yet)
  // Delete material
  const { error: deleteError } = await supabase
    .from('player_monster')
    .delete()
    .eq('id', materialMonsterId)
    .eq('user_id', userId)

  if (deleteError) {
    return { success: false, newAwakeningLevel: 0, error: '재료 몬스터 소모 중 오류가 발생했습니다.' }
  }

  // Update target
  const newAwakeningLevel = target.awakening_level + 1
  const { error: updateError } = await supabase
    .from('player_monster')
    .update({ awakening_level: newAwakeningLevel })
    .eq('id', targetMonsterId)
    .eq('user_id', userId)

  if (updateError) {
    // Critical: Material was deleted but target update failed. 
    // In a real production app, this should be an SQL Transaction or RPC.
    console.error('CRITICAL: Material deleted but Awakening failed', { targetMonsterId, materialMonsterId })
    return { success: false, newAwakeningLevel: 0, error: '초월 업데이트 중 오류가 발생했습니다.' }
  }

  return { success: true, newAwakeningLevel }
}

