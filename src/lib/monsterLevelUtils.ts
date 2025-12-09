/**
 * Monster Level Utilities
 * 몬스터 레벨링 관련 공식 및 유틸리티 함수들
 */

// ==========================================
// Types
// ==========================================

export type RarityType = 'N' | 'R' | 'SR' | 'SSR'
export type RoleType = 'TANK' | 'DPS' | 'SUPPORT' | 'HYBRID' | 'PRODUCTION'

export interface MonsterStats {
    hp: number
    atk: number
    def: number
}

export interface RarityConfig {
    maxLevel: number
    growthRate: number      // 스탯 성장률 배율
    expMultiplier: number   // 필요 경험치 배율
}

// ==========================================
// Constants
// ==========================================

/**
 * 레어도별 설정
 * - maxLevel: 최대 도달 가능 레벨
 * - growthRate: 레벨당 스탯 성장 배율 (높을수록 강해짐)
 * - expMultiplier: 필요 경험치 배율 (높을수록 레벨업 어려움)
 */
export const RARITY_CONFIG: Record<RarityType, RarityConfig> = {
    N: { maxLevel: 30, growthRate: 1.0, expMultiplier: 1.0 },
    R: { maxLevel: 50, growthRate: 1.15, expMultiplier: 1.2 },
    SR: { maxLevel: 70, growthRate: 1.3, expMultiplier: 1.5 },
    SSR: { maxLevel: 99, growthRate: 1.5, expMultiplier: 2.0 }
}

/**
 * 스탯 성장률 (레벨당 기본 증가율)
 */
export const BASE_STAT_GROWTH_PER_LEVEL = 0.08

// ==========================================
// Experience Functions
// ==========================================

/**
 * 특정 레벨에서 다음 레벨로 올리기 위해 필요한 경험치
 * 지수형 커브: base(선형) + growth(지수)
 * 
 * @example
 * Lv.1 → 2 (N): 53 EXP
 * Lv.10 → 11 (N): 830 EXP
 * Lv.50 → 51 (N): 10,000 EXP
 */
export function getRequiredExp(level: number, rarity: RarityType = 'N'): number {
    const config = RARITY_CONFIG[rarity]
    const base = level * 50       // 선형 증가
    const growth = level * level * 3  // 지수 증가
    return Math.floor((base + growth) * config.expMultiplier)
}

/**
 * 레벨 1부터 특정 레벨까지 필요한 총 경험치
 */
export function getTotalExpToLevel(targetLevel: number, rarity: RarityType = 'N'): number {
    let total = 0
    for (let lv = 1; lv < targetLevel; lv++) {
        total += getRequiredExp(lv, rarity)
    }
    return total
}

/**
 * 다음 레벨까지 경험치 진행률 (0-100)
 */
export function getExpProgress(currentExp: number, level: number, rarity: RarityType = 'N'): number {
    const required = getRequiredExp(level, rarity)
    return Math.min(100, Math.floor((currentExp / required) * 100))
}

const AWAKENING_BONUS_PER_LEVEL = 0.05 // 5% stats per awakening
const AWAKENING_MAX_LEVEL_BONUS = 5    // +5 max level per awakening

/**
 * 최대 레벨 가져오기 (초월 포함)
 */
export function getMaxLevel(rarity: RarityType, awakeningLevel: number = 0): number {
    return RARITY_CONFIG[rarity].maxLevel + (awakeningLevel * AWAKENING_MAX_LEVEL_BONUS)
}

// ==========================================
// Stats Functions
// ==========================================

/**
 * 레벨에 따른 스탯 계산
 * 공식: baseStat × (1 + (level - 1) × 0.08 × growthRate) × (1 + awakeningLevel × 0.05)
 * 
 * @example (N등급, 기본 HP 100, 초월 1강)
 * Lv.1: 100 * 1.05 = 105
 */
export function calculateStats(
    baseStats: MonsterStats,
    level: number,
    rarity: RarityType = 'N',
    awakeningLevel: number = 0
): MonsterStats {
    const config = RARITY_CONFIG[rarity]
    const levelMultiplier = 1 + (level - 1) * BASE_STAT_GROWTH_PER_LEVEL * config.growthRate
    const awakeningMultiplier = 1 + (awakeningLevel * AWAKENING_BONUS_PER_LEVEL)

    const finalMultiplier = levelMultiplier * awakeningMultiplier

    return {
        hp: Math.floor(baseStats.hp * finalMultiplier),
        atk: Math.floor(baseStats.atk * finalMultiplier),
        def: Math.floor(baseStats.def * finalMultiplier)
    }
}

/**
 * 레벨업 처리 (경험치 추가 후 레벨/남은 경험치 계산)
 * 한 번에 여러 레벨업 가능
 */
export function processLevelUp(
    currentLevel: number,
    currentExp: number,
    addedExp: number,
    rarity: RarityType = 'N',
    awakeningLevel: number = 0
): {
    newLevel: number
    newExp: number
    leveledUp: boolean
    levelsGained: number
} {
    let newLevel = currentLevel
    let newExp = currentExp + addedExp
    let levelsGained = 0
    const maxLevel = getMaxLevel(rarity, awakeningLevel)

    // 레벨업 루프 (최대 레벨 도달 시 중단)
    while (newLevel < maxLevel) {
        const required = getRequiredExp(newLevel, rarity)
        if (newExp >= required) {
            newExp -= required
            newLevel++
            levelsGained++
        } else {
            break
        }
    }

    // 최대 레벨이면 경험치 초과분 제거
    if (newLevel >= maxLevel) {
        newExp = 0
    }

    return {
        newLevel,
        newExp,
        leveledUp: levelsGained > 0,
        levelsGained
    }
}

// ==========================================
// Display Helpers
// ==========================================

/**
 * 레어도 색상 가져오기
 */
export function getRarityColor(rarity: RarityType): string {
    switch (rarity) {
        case 'N': return '#9ca3af'    // Gray
        case 'R': return '#22c55e'    // Green
        case 'SR': return '#3b82f6'   // Blue
        case 'SSR': return '#f59e0b'  // Amber/Gold
        default: return '#9ca3af'
    }
}

/**
 * 레어도 배경 그라데이션 가져오기
 */
export function getRarityGradient(rarity: RarityType): string {
    switch (rarity) {
        case 'N': return 'linear-gradient(135deg, #4b5563, #374151)'
        case 'R': return 'linear-gradient(135deg, #166534, #14532d)'
        case 'SR': return 'linear-gradient(135deg, #1e40af, #1e3a8a)'
        case 'SSR': return 'linear-gradient(135deg, #d97706, #b45309)'
        default: return 'linear-gradient(135deg, #4b5563, #374151)'
    }
}

/**
 * 경험치를 읽기 쉬운 형태로 포맷
 */
export function formatExp(exp: number): string {
    if (exp >= 1000000) {
        return `${(exp / 1000000).toFixed(1)}M`
    }
    if (exp >= 1000) {
        return `${(exp / 1000).toFixed(1)}K`
    }
    return exp.toString()
}
