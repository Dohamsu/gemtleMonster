import { type RarityType, getRequiredExp, getMaxLevel } from './monsterLevelUtils'

interface Potion {
    id: string
    xp: number
}

/**
 * Calculate potions needed to reach a target level or max possible level.
 * 
 * @param currentExp - Current total XP of the monster
 * @param currentLevel - Current level
 * @param rarity - Monster rarity
 * @param availablePotions - Map of potionId -> quantity available
 * @param potionDefinitions - Array of potion definitions {id, xp}
 * @param mode - 'NEXT_LEVEL' | 'MAX_LEVEL'
 */
export function calculatePotionsForLevelUp(
    currentExp: number,
    currentLevel: number,
    rarity: RarityType,
    availablePotions: Record<string, number>,
    potionDefinitions: Potion[],
    mode: 'NEXT_LEVEL' | 'MAX_LEVEL'
): {
    potionsToUse: Record<string, number>
    totalXpToAdd: number
    predictedLevel: number
    predictedExp: number
} {
    const maxLevel = getMaxLevel(rarity)
    if (currentLevel >= maxLevel) {
        return { potionsToUse: {}, totalXpToAdd: 0, predictedLevel: currentLevel, predictedExp: currentExp }
    }

    const sortedPotions = [...potionDefinitions].sort((a, b) => b.xp - a.xp) // Descending
    const potionsToUse: Record<string, number> = {}

    let xpNeeded = 0

    if (mode === 'NEXT_LEVEL') {
        const levelCapExp = getRequiredExp(currentLevel, rarity)
        xpNeeded = levelCapExp - currentExp
        if (xpNeeded <= 0) xpNeeded = 0
    } else {
        // MAX LEVEL: Use as much as possible
        xpNeeded = Infinity
    }

    let currentAddedXp = 0

    // Clone available to track usage
    const stock = { ...availablePotions }

    if (mode === 'NEXT_LEVEL') {
        let remainingNeeded = xpNeeded

        // Pass 1: Use potions <= remainingNeeded (Largest first)
        for (const potion of sortedPotions) {
            if (!stock[potion.id]) continue

            if (potion.xp <= remainingNeeded) {
                const count = Math.min(stock[potion.id], Math.floor(remainingNeeded / potion.xp))
                potionsToUse[potion.id] = (potionsToUse[potion.id] || 0) + count
                stock[potion.id] -= count
                remainingNeeded -= count * potion.xp
                currentAddedXp += count * potion.xp
            }
        }

        // Pass 2: If still needed, use smallest available to top off
        if (remainingNeeded > 0) {
            // Sort ascending for waste minimization
            const ascPotions = [...sortedPotions].sort((a, b) => a.xp - b.xp)
            for (const potion of ascPotions) {
                if (stock[potion.id] > 0) {
                    potionsToUse[potion.id] = (potionsToUse[potion.id] || 0) + 1
                    stock[potion.id] -= 1
                    currentAddedXp += potion.xp
                    remainingNeeded -= potion.xp
                    break // Only need one to cross the threshold
                }
            }
        }
    } else {
        // MAX_LEVEL: Just use everything from largest to smallest
        for (const potion of sortedPotions) {
            if (!stock[potion.id]) continue

            const count = stock[potion.id]
            if (count > 0) {
                potionsToUse[potion.id] = (potionsToUse[potion.id] || 0) + count
                stock[potion.id] -= count
                currentAddedXp += count * potion.xp
            }
        }
    }

    return { potionsToUse, totalXpToAdd: currentAddedXp, predictedLevel: currentLevel, predictedExp: currentExp + currentAddedXp }
}
