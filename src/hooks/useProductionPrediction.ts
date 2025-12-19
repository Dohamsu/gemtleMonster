import { useMemo } from 'react'
import { getSeededRandom } from '../lib/prng'

interface UseProductionPredictionProps {
    facilityId: string
    currentLevel: number
    stats: {
        intervalSeconds: number
        dropRates: Record<string, number>
    } | undefined
    lastCollectedAt: number
}

export function useProductionPrediction({
    stats,
    lastCollectedAt
}: UseProductionPredictionProps) {
    const nextDrop = useMemo(() => {
        if (!stats || !stats.dropRates || Object.keys(stats.dropRates).length === 0) return null

        // Calculate expected time of the NEXT drop
        // This MUST match the calculation in useAutoCollection.ts:
        // itemProductionTime = lastCollectedAt + (1 * intervalSeconds * 1000)
        // (Since useAutoCollection processes batch starting from i=0 which is the 1st item)

        // Safety: If lastCollectedAt is 0 (never collected), assume now or initialization time?
        // In modal, lastCollectedAt might be 0 if new. logic usually falls back to Date.now() if missing.
        // We should use the same fallback logic.

        const baseTime = lastCollectedAt || Date.now()
        const nextTime = baseTime + (stats.intervalSeconds * 1000)
        const seed = Math.floor(nextTime)

        const random = getSeededRandom(seed)

        let cumulative = 0
        for (const [res, rate] of Object.entries(stats.dropRates)) {
            cumulative += rate
            if (random < cumulative) {
                return res
            }
        }

        return null
    }, [stats, lastCollectedAt])

    return nextDrop
}
