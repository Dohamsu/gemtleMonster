/**
 * 소모품 (Consumable) 관련 타입 정의
 */

// 소모품 효과 타입
export type ConsumableEffectType = 'HEAL_HP' | 'BUFF_ATK' | 'BUFF_DEF' | 'CURE_STATUS' | 'GRANT_XP'

// 소모품 효과 정의
export interface ConsumableEffect {
    type: ConsumableEffectType
    value: number  // HP 회복량 또는 버프 %
    duration?: number  // 버프 지속 턴 수
}

// 자동 사용 조건 타입
export type AutoUseConditionType = 'HP_BELOW' | 'HAS_STATUS'

// 자동 사용 설정
export interface ConsumableAutoConfig {
    id: string
    consumableId: string  // 소모품 ID (예: 'potion_hp_small')
    conditionType: AutoUseConditionType
    threshold: number  // HP %
    statusType?: string  // 상태이상 타입 (BURN, POISON, STUN 등)
    priority: number  // 우선순위 (낮을수록 먼저 체크)
    enabled: boolean
}

// 소모품 슬롯 (간소화된 설정)
export interface ConsumableSlot {
    id: 'hp' | 'status'
    consumableId: string | null
    threshold: number  // HP의 경우 0-100 %
    statusTypes: string[]  // 상태이상의 경우 대상 타입들
    enabled: boolean
}
