import type { ElementType } from '../types/alchemy'

// ==========================================
// Types
// ==========================================

export type StatusEffectType = 'BURN' | 'POISON' | 'STUN' | 'ATK_BUFF' | 'DEF_BUFF' | 'ATK_DEBUFF' | 'DEF_DEBUFF' | 'REGEN'

export interface StatusEffect {
    id: string
    type: StatusEffectType
    value: number
    duration: number // Turns remaining
    sourceId: string // Who applied it
    name: string
    emoji: string
}

export interface BattleEntity {
    id: string
    name: string
    hp: number
    maxHp: number
    atk: number
    def: number
    element: ElementType
    image?: string
    isPlayer: boolean
    statusEffects: StatusEffect[]
}

// ==========================================
// Constants
// ==========================================

const ELEMENTAL_ADVANTAGE = 1.3
const ELEMENTAL_DISADVANTAGE = 0.8 // Less penalty than advantage bonus to keep flow moving

export const ELEMENT_MAP: Record<ElementType, string> = {
    FIRE: '🔥',
    WATER: '💧',
    EARTH: '🌳',
    WIND: '🍃',
    LIGHT: '✨',
    DARK: '🌑',
    CHAOS: '🌀'
}

// ==========================================
// Core Logic
// ==========================================

/**
 * Calculate Elemental Multiplier
 * Fire > Earth > Wind > Water > Fire
 * Light <> Dark (Both deal extra damage to each other)
 */
export function getElementalMultiplier(attacker: ElementType, defender: ElementType): number {
    if (!attacker || !defender) return 1.0

    const normalize = (e: string) => e?.toUpperCase() as ElementType
    const atk = normalize(attacker)
    const def = normalize(defender)

    // Fire > Earth
    if (atk === 'FIRE' && def === 'EARTH') return ELEMENTAL_ADVANTAGE
    if (atk === 'EARTH' && def === 'FIRE') return ELEMENTAL_DISADVANTAGE

    // Earth > Wind
    if (atk === 'EARTH' && def === 'WIND') return ELEMENTAL_ADVANTAGE
    if (atk === 'WIND' && def === 'EARTH') return ELEMENTAL_DISADVANTAGE

    // Wind > Water
    if (atk === 'WIND' && def === 'WATER') return ELEMENTAL_ADVANTAGE
    if (atk === 'WATER' && def === 'WIND') return ELEMENTAL_DISADVANTAGE

    // Water > Fire
    if (atk === 'WATER' && def === 'FIRE') return ELEMENTAL_ADVANTAGE
    if (atk === 'FIRE' && def === 'WATER') return ELEMENTAL_DISADVANTAGE

    // Light <> Dark (Both deal bonus damage)
    if (atk === 'LIGHT' && def === 'DARK') return ELEMENTAL_ADVANTAGE
    if (atk === 'DARK' && def === 'LIGHT') return ELEMENTAL_ADVANTAGE

    return 1.0
}

/**
 * Calculate basic damage
 */
export function calculateDamage(
    attacker: BattleEntity,
    defender: BattleEntity,
    skillMultiplier: number = 100, // Percentage
    options: {
        critChanceOffset?: number    // 치명타 확률 보정 (0~100)
        defensePierce?: number        // 방어력 무시 (%)
        damageBonus?: number         // 최종 데미지 보너스 (%)
    } = {}
): { damage: number; isCritical: boolean; multiplier: number } {
    // 1. Calculate Effective Stats (Apply Status Effects)
    let effectiveAtk = attacker.atk
    for (const eff of attacker.statusEffects) {
        if (eff.type === 'ATK_BUFF') effectiveAtk *= (1 + eff.value / 100)
        if (eff.type === 'ATK_DEBUFF') effectiveAtk *= (1 - eff.value / 100)
    }

    let effectiveDef = defender.def
    for (const eff of defender.statusEffects) {
        if (eff.type === 'DEF_BUFF') effectiveDef *= (1 + eff.value / 100)
        if (eff.type === 'DEF_DEBUFF') effectiveDef *= (1 - eff.value / 100)
    }

    // Apply skill multiplier to base attack
    let damage = effectiveAtk * (skillMultiplier / 100)

    // 2. Elemental Multiplier
    const elementMultiplier = getElementalMultiplier(attacker.element, defender.element)
    damage *= elementMultiplier

    // 3. Defense Mitigation (비율 감쇄 공식)
    const DEF_COEFFICIENT = 1.0
    // Apply pierce from options
    effectiveDef *= (1 - (options.defensePierce || 0) / 100)

    damage = Math.floor(damage * (100 / (100 + effectiveDef * DEF_COEFFICIENT)))
    damage = Math.max(1, damage)

    // 4. Critical Hit
    let isCritical = false
    const baseCritChance = 0.1 // 10% base
    const finalCritChance = baseCritChance + (options.critChanceOffset || 0) / 100
    if (Math.random() < finalCritChance) {
        isCritical = true
        damage *= 1.5
    }

    // 5. Damage Bonus
    if (options.damageBonus) {
        damage *= (1 + options.damageBonus / 100)
    }

    // 6. Random Variance (+- 10%)
    const variance = (Math.random() * 0.2) + 0.9 // 0.9 ~ 1.1
    damage = Math.floor(damage * variance)

    return { damage, isCritical, multiplier: elementMultiplier }
}

/**
 * Process Status Effects (Turn Start/End)
 * Returns logs and damage taken from effects (Burn/Poison)
 */
export function processStatusEffects(entity: BattleEntity): {
    updatedEntity: BattleEntity
    logs: string[]
    damageTaken: number
} {
    const logs: string[] = []
    let damageTaken = 0
    const activeEffects: StatusEffect[] = []

    // Create a copy to modify stats if needed (though stats are usually recalculated from base + effects)
    // For now we just process DoT and Duration
    const nextEntity = { ...entity }

    for (const effect of entity.statusEffects) {
        // Process Effect
        if (effect.type === 'BURN') {
            const dmg = Math.floor(entity.maxHp * 0.05) // 5% Max HP
            damageTaken += dmg
            // logs.push(`${entity.name}은(는) 화상으로 ${dmg}의 피해를 입었습니다.`)
        } else if (effect.type === 'POISON') {
            const dmg = Math.floor(entity.maxHp * 0.03) // 3% Max HP
            damageTaken += dmg
            // logs.push(`${entity.name}은(는) 독으로 ${dmg}의 피해를 입었습니다.`)
        } else if (effect.type === 'REGEN') {
            // Handle positive effects (Heal) - wait, this function returns "damageTaken". 
            // We might need "healingReceived" too, or just negative damage?
            // Let's stick to damage for now for DoT. Healing should probably be handled separately or passed back.
            // Simple hack: negative damage = heal
            const heal = Math.floor(entity.maxHp * 0.05)
            damageTaken -= heal
        }

        // Decrement Duration
        const nextDuration = effect.duration - 1
        if (nextDuration > 0) {
            activeEffects.push({ ...effect, duration: nextDuration })
        } else {
            logs.push(`${effect.emoji} ${effect.name} 효과가 사라졌습니다.`)
        }
    }

    nextEntity.statusEffects = activeEffects

    // Apply final HP change
    nextEntity.hp = Math.max(0, Math.min(nextEntity.maxHp, nextEntity.hp - damageTaken))

    return {
        updatedEntity: nextEntity,
        logs,
        damageTaken
    }
}

/**
 * Helper to add a status effect
 */
export function addStatusEffect(entity: BattleEntity, effect: StatusEffect): BattleEntity {
    // Check if same type exists? (Currently stacking allowed or refresh duration?)
    // Let's Simple: Refresh duration if exists, else add
    const existingIdx = entity.statusEffects.findIndex(e => e.type === effect.type)
    const newEffects = [...entity.statusEffects]

    if (existingIdx >= 0) {
        newEffects[existingIdx] = effect // Overwrite/Refresh
    } else {
        newEffects.push(effect)
    }

    return {
        ...entity,
        statusEffects: newEffects
    }
}

/**
 * Calculate effective stat based on status effects
 */
export function calculateEffectiveStat(baseValue: number, effects: StatusEffect[], type: 'ATK' | 'DEF'): number {
    let multiplier = 1.0
    const buffType = type === 'ATK' ? 'ATK_BUFF' : 'DEF_BUFF'
    const debuffType = type === 'ATK' ? 'ATK_DEBUFF' : 'DEF_DEBUFF'

    for (const eff of (effects || [])) {
        if (eff.type === buffType) multiplier *= (1 + eff.value / 100)
        if (eff.type === debuffType) multiplier *= (1 - eff.value / 100)
    }

    return Math.floor(baseValue * multiplier)
}
