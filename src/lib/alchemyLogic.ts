import type { Recipe, RecipeCondition } from '../lib/alchemyApi'
import type { AlchemyContext } from '../types/alchemy'

// ==========================================
// Key Generation
// ==========================================

/**
 * Generates a unique key for a list of materials.
 * Sorts material IDs to ensure order independence.
 * e.g., ['b', 'a'] -> "a|b"
 */
export function generateMaterialKey(materials: string[]): string {
    return materials.slice().sort().join('|')
}

// ==========================================
// Condition Checking
// ==========================================

export function checkCondition(condition: RecipeCondition, context: AlchemyContext): boolean {
    const rawType = condition.condition_type ?? (condition as any).type ?? (condition as any).conditionType
    const typeKey = typeof rawType === 'string' ? rawType.toUpperCase() : undefined

    if (!typeKey) return false

    switch (typeKey) {
        // 1. Game World Conditions
        case 'TIME_RANGE': {
            // value_json: [startHour, endHour] e.g., [22, 4] for 22:00 ~ 04:00
            const range = condition.value_json as [number, number]
            if (!range) return false
            const [start, end] = range
            const current = context.time.gameTime
            if (start <= end) {
                return current >= start && current < end
            } else {
                // Cross midnight: 22 ~ 4 -> 22~24 or 0~4
                return current >= start || current < end
            }
        }

        // 2. Real World Time Conditions
        case 'REAL_TIME_RANGE': {
            const range = condition.value_json as [number, number]
            if (!range) return false
            const [start, end] = range
            const current = context.time.realTime
            if (start <= end) {
                return current >= start && current < end
            } else {
                return current >= start || current < end
            }
        }
        case 'REAL_DATE': {
            // value_text: "12-25"
            return context.time.realDateStr === condition.value_text
        }
        case 'WEEKDAY': {
            // value_json: [0, 6] (Sunday, Saturday)
            const days = condition.value_json as number[]
            if (!days) return false
            return days.includes(context.time.realDayOfWeek)
        }

        // 3. Environment Conditions
        case 'REAL_WEATHER': {
            // value_json: ['RAIN', 'STORM']
            const weathers = condition.value_json as string[]
            if (!weathers) return false
            return weathers.includes(context.env.weather)
        }
        case 'LANGUAGE': {
            // value_json: ['ko', 'en'], value_text: 'ko'
            const languageList = (condition.value_json as string[]) || (condition.value_text ? [condition.value_text] : [])
            if (!languageList.length) return false
            const userLanguage = (context.env.language || '').toLowerCase()
            return languageList.some(lang => userLanguage.startsWith(lang.toLowerCase()))
        }
        case 'REAL_TEMPERATURE': {
            // value_json: { min: 30 } or { max: 0 }
            const tempCondition = condition.value_json as { min?: number, max?: number }
            if (!tempCondition) return false
            const { min, max } = tempCondition
            if (min !== undefined && context.env.temperature < min) return false
            if (max !== undefined && context.env.temperature > max) return false
            return true
        }
        case 'GEO_COUNTRY': {
            // value_json: ['KR', 'JP']
            const countries = condition.value_json as string[]
            if (!countries) return false
            return countries.includes(context.env.country)
        }

        // 4. Device/Platform Conditions
        case 'DEVICE_TYPE': {
            return context.device.type === condition.value_text
        }
        case 'PLATFORM': {
            // value_text: 'MacIntel' or check substring
            return condition.value_text ? context.device.os.includes(condition.value_text) : false
        }
        case 'UI_PREFERENCE': {
            // value_text: 'DARK_MODE'
            if (condition.value_text === 'DARK_MODE') return context.device.isDarkMode
            return false
        }

        // 5. Session Conditions
        case 'TAB_IDLE': {
            // value_int: 300 (seconds)
            return condition.value_int ? context.session.idleTimeSec >= condition.value_int : false
        }
        case 'LOGIN_STREAK': {
            return condition.value_int ? context.session.loginStreak >= condition.value_int : false
        }
        case 'DAILY_PLAYTIME': {
            return condition.value_int ? context.session.dailyPlayTimeMin >= condition.value_int : false
        }
        case 'RECENT_FAIL_COUNT': {
            return condition.value_int ? context.session.recentFailCount >= condition.value_int : false
        }
        case 'EVENT_FLAG': {
            const flags = (condition.value_json as string[]) || (condition.value_text ? [condition.value_text] : [])
            if (!flags.length) return false
            const activeFlags = context.player?.eventFlags || []
            return flags.some(flag => activeFlags.includes(flag))
        }
        case 'CATALYST': {
            const requiredCatalysts = (condition.value_json as string[]) || (condition.value_text ? [condition.value_text] : [])
            if (!requiredCatalysts.length) return false
            const ownedCatalysts = context.player?.catalysts || []
            return requiredCatalysts.some(id => ownedCatalysts.includes(id))
        }
        case 'ALCHEMY_LEVEL': {
            const requiredLevel = condition.value_int ?? (typeof condition.value_json === 'number' ? condition.value_json : undefined)
            const currentLevel = context.player?.alchemyLevel
            if (requiredLevel === undefined || currentLevel === undefined) return false
            return currentLevel >= requiredLevel
        }

        default:
            return false
    }
}

/**
 * Checks if a recipe is valid given the current context.
 */
export function isRecipeValid(recipe: Recipe, context: AlchemyContext | null): boolean {
    if (!recipe.conditions || recipe.conditions.length === 0) return true
    if (!context) return false // Conditions exist but no context to check against
    return recipe.conditions.every(condition => checkCondition(condition, context))
}

// ==========================================
// Recipe Lookup
// ==========================================

/**
 * Finds all matching recipes for a given set of materials and context.
 */
/**
 * Finds all matching recipes for a given set of materials and context.
 * Supports minimum quantity matching (superset check).
 */
export function findMatchingRecipes(
    ingredientCounts: Record<string, number>,
    context: AlchemyContext | null,
    allRecipes: Recipe[]
): Recipe[] {
    // 1. Filter by material match (superset check)
    const candidates = allRecipes.filter(recipe => {
        if (!recipe.ingredients || recipe.ingredients.length === 0) return false

        // Check if every ingredient in the recipe is present in sufficient quantity
        const hasAllIngredients = recipe.ingredients.every(ing => {
            const currentQty = ingredientCounts[ing.material_id] || 0
            return currentQty >= ing.quantity
        })

        return hasAllIngredients
    })

    // 2. Filter by conditions
    return candidates.filter(recipe => isRecipeValid(recipe, context))
}

/**
 * Finds a single matching recipe for given ingredient counts.
 * Used for free-form crafting where players add materials without selecting a recipe.
 * Prioritizes recipes that consume more materials.
 */
export function findMatchingRecipe(
    ingredientCounts: Record<string, number>,
    context: AlchemyContext | null,
    allRecipes: Recipe[]
): Recipe | null {
    const matches = findMatchingRecipes(ingredientCounts, context, allRecipes)

    if (matches.length === 0) return null

    // Sort matches by total ingredient quantity (descending) to prioritize more complex recipes
    matches.sort((a, b) => {
        const totalA = a.ingredients?.reduce((sum, ing) => sum + ing.quantity, 0) || 0
        const totalB = b.ingredients?.reduce((sum, ing) => sum + ing.quantity, 0) || 0
        return totalB - totalA
    })

    return matches[0]
}
