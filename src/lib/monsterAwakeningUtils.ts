/**
 * Monster Awakening Utilities
 * 몬스터 초월 관련 로직
 */

export const MAX_AWAKENING_LEVEL = 5

/**
 * 초월에 필요한 재료(중복 몬스터) 개수 계산
 * 현재는 레벨 상관없이 1마리 고정
 */
export function getRequiredAwakeningMaterials(currentAwakeningLevel: number): number {
    if (currentAwakeningLevel >= MAX_AWAKENING_LEVEL) return 0
    return 1
}

/**
 * 초월 가능 여부 확인
 */
export function canAwaken(currentAwakeningLevel: number): boolean {
    return currentAwakeningLevel < MAX_AWAKENING_LEVEL
}

/**
 * 초월 성공 확률 (현재 100%)
 */
export function getAwakeningSuccessRate(): number {
    return 100
}
