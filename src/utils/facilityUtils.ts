
import type { MonsterData } from '../data/monsterData'

export interface FacilityBonus {
    speed: number // Percentage reduction (0-90)
    amount: number // Percentage increase
    // Future: quality, exp, etc.
}

export function calculateFacilityBonus(
    assignedTraits: NonNullable<MonsterData['factoryTrait']>[]
): FacilityBonus {
    let speed = 0
    let amount = 0

    assignedTraits.forEach(trait => {
        const effect = trait.effect
        const value = trait.value

        // Keyword Matching Logic
        if (effect.includes('속도') || effect.includes('빠른') || effect.includes('열기') || effect.includes('수분')) {
            speed += value
        } else if (effect.includes('생산량') || effect.includes('증가') || effect.includes('비료') || effect.includes('영양제') || effect.includes('응축') || effect.includes('증폭') || effect.includes('관리') || effect.includes('보조')) {
            // '증가' is generic, so we check it last or assume Amount if not Speed.
            // But '채굴 속도 증가' has '속도', so it caught by first if.
            // '생산량 증가' has '생산량', caught here.
            amount += value
        } else {
            // Default fallback? Or ignore?
            // If it has '효율' (Efficiency) -> Speed?
            if (effect.includes('효율')) {
                speed += value
            } else {
                // Fallback to Amount for generic positive things if we can't decide?
                // Or log warning?
                // '토양 습도 유지' -> '습도' (Humidity) similar to Water? -> Speed?
                if (effect.includes('습도')) speed += value
                // '정밀 채굴 보조' -> '보조' -> Amount?
                else amount += value
            }
        }
    })

    // Cap speed
    if (speed > 90) speed = 90

    return { speed, amount }
}
