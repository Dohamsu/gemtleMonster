/**
 * Alchemy 유틸리티 함수
 */

/* eslint-disable no-console */
import { ALCHEMY, RARITY_EXP } from '../constants/game'
import { MATERIALS } from '../data/alchemyData'

/**
 * 실패 시 재료 등급에 따라 경험치 계산
 * N: 10 XP, R: 20 XP, SR: 30 XP, SSR: 50 XP
 * 실패 시에는 계산된 경험치의 30%만 획득
 *
 * @param materialsUsed - 사용한 재료 Record<materialId, quantity>
 * @returns 획득할 경험치
 */
export function calculateFailureExp(materialsUsed: Record<string, number>): number {
  console.log('🔍 [calculateFailureExp] 재료 사용:', materialsUsed)

  let totalExp = 0
  for (const [materialId, quantity] of Object.entries(materialsUsed)) {
    const material = MATERIALS[materialId]
    if (material) {
      const expPerItem = RARITY_EXP[material.rarity] || 10
      const materialExp = expPerItem * quantity
      totalExp += materialExp
      console.log(`  - ${material.name} (${material.rarity}): ${expPerItem} × ${quantity} = ${materialExp} XP`)
    } else {
      console.warn(`  - ⚠️ 재료 정보 없음: ${materialId}`)
    }
  }

  // 실패 시에는 계산된 경험치의 일정 비율만 획득
  const finalExp = Math.floor(totalExp * ALCHEMY.FAILURE_EXP_MULTIPLIER)
  console.log(`💔 [calculateFailureExp] 총 경험치: ${totalExp} → 실패 보상 (${ALCHEMY.FAILURE_EXP_MULTIPLIER * 100}%): ${finalExp} XP`)

  return finalExp
}

/**
 * 레벨과 경험치를 기반으로 새로운 레벨 계산
 *
 * @param currentExp - 현재 경험치
 * @param addExp - 추가할 경험치
 * @returns 새로운 레벨과 총 경험치
 */
export function calculateNewLevel(currentExp: number, addExp: number): { newLevel: number; newExp: number } {
  const newExp = currentExp + addExp
  const newLevel = Math.floor(newExp / ALCHEMY.XP_PER_LEVEL) + 1
  return { newLevel, newExp }
}
