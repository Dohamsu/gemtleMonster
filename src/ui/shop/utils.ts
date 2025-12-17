export const LEGACY_RESOURCE_NAMES: Record<string, string> = {
    gold: '골드',
    stone: '돌',
    ore_magic: '마력석',
    gem_fragment: '보석 파편',
    training_token: '훈련 토큰'
}

// 숫자 포맷팅 헬퍼 함수
export function formatNumber(num: number): string {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
    }
    return num.toLocaleString()
}

// 희귀도별 색상 반환
export function getRarityColor(rarity: string): string {
    switch (rarity) {
        case 'COMMON': case 'N': return '#9ca3af'
        case 'UNCOMMON': return '#22c55e'
        case 'RARE': case 'R': return '#3b82f6'
        case 'EPIC': case 'SR': return '#a855f7'
        case 'LEGENDARY': case 'SSR': return '#e7b308'
        default: return '#6b7280'
    }
}

// 희귀도별 라벨 (한글)
export function getRarityLabel(rarity: string): string {
    switch (rarity) {
        case 'COMMON': case 'N': return '일반'
        case 'UNCOMMON': return '고급'
        case 'RARE': case 'R': return '희귀'
        case 'EPIC': case 'SR': return '영웅'
        case 'LEGENDARY': case 'SSR': return '전설'
        default: return '재료'
    }
}
