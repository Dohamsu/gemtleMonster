/**
 * 재료 관련 공통 유틸리티 함수
 *
 * 여러 컴포넌트에서 재료를 표시할 때 일관된 스타일을 유지하기 위한 헬퍼 함수들
 */

/**
 * 계열(family)별 배경색 반환
 */
export function getFamilyColor(family: string): string {
    switch (family) {
        case 'PLANT': return '#10b981'
        case 'MINERAL': return '#6366f1'
        case 'BEAST': return '#f59e0b'
        case 'SLIME': return '#8b5cf6'
        case 'SPIRIT': return '#ec4899'
        default: return '#64748b'
    }
}

/**
 * 등급(rarity)별 텍스트 색상 반환
 */
export function getRarityColor(rarity: string): string {
    switch (rarity.toUpperCase()) {
        case 'COMMON': return '#9ca3af'
        case 'UNCOMMON': return '#22c55e'
        case 'RARE': return '#3b82f6'
        case 'EPIC': return '#a855f7'
        case 'LEGENDARY': return '#eab308'
        default: return '#fff'
    }
}

/**
 * 등급별 밝은 텍스트 색상 반환 (어두운 배경용)
 */
export function getRarityColorBright(rarity: string): string {
    switch (rarity.toUpperCase()) {
        case 'COMMON': return '#ffffff'
        case 'UNCOMMON': return '#4ade80'
        case 'RARE': return '#60a5fa'
        case 'EPIC': return '#c084fc'
        case 'LEGENDARY': return '#fbbf24'
        default: return '#f0d090'
    }
}

/**
 * 계열별 아이콘(이모지) 반환
 */
export function getFamilyIcon(family: string): string {
    switch (family) {
        case 'PLANT': return '🌿'
        case 'MINERAL': return '💎'
        case 'BEAST': return '🦴'
        case 'SLIME': return '🟢'
        case 'SPIRIT': return '✨'
        default: return '❓'
    }
}

/**
 * 계열별 표시 이름 반환
 */
export function getFamilyDisplayName(family: string): string {
    switch (family) {
        case 'PLANT': return '식물'
        case 'MINERAL': return '광물'
        case 'BEAST': return '야수'
        case 'SLIME': return '슬라임'
        case 'SPIRIT': return '정령'
        default: return family
    }
}

/**
 * 등급별 표시 이름 반환
 */
export function getRarityDisplayName(rarity: string): string {
    switch (rarity.toUpperCase()) {
        case 'COMMON': return '일반'
        case 'UNCOMMON': return '고급'
        case 'RARE': return '희귀'
        case 'EPIC': return '영웅'
        case 'LEGENDARY': return '전설'
        default: return rarity
    }
}
