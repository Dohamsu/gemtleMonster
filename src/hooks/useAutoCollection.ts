import { useEffect, useRef } from 'react'
import { useGameStore } from '../store/useGameStore'
import { supabase } from '../lib/supabase'
import { useAlchemyStore } from '../store/useAlchemyStore'

interface FacilityLevelStats {
    intervalSeconds: number
    bundlesPerTick: number
    dropRates: Record<string, number>
}

// Facility ID -> Level -> Stats
type FacilityStatsMap = Record<string, Record<number, FacilityLevelStats>>

export function useAutoCollection(userId: string | undefined) {
    const { facilities, lastCollectedAt, addResources, setLastCollectedAt, canvasView } = useGameStore()
    const statsRef = useRef<FacilityStatsMap>({})

    // 1. Load Facility Stats Once
    useEffect(() => {
        if (!userId) return

        const loadStats = async () => {
            const { data: levelsData } = await supabase
                .from('facility_level')
                .select('facility_id, level, stats')

            if (!levelsData) return

            const map: FacilityStatsMap = {}
            levelsData.forEach(row => {
                if (!map[row.facility_id]) map[row.facility_id] = {}
                map[row.facility_id][row.level] = row.stats as FacilityLevelStats
            })
            statsRef.current = map
        }

        loadStats()
    }, [userId])

    // 2. Single Global Timer for Collection
    useEffect(() => {
        if (!userId) return
        if (canvasView === 'shop') return

        // Helper to process drops
        const collectFromFacility = (
            _facilityId: string,
            _level: number,
            stats: FacilityLevelStats,
            facilityKey: string,
            now: number
        ) => {
            const drops: Record<string, number> = {}
            let hasDrops = false

            if (stats.dropRates) {
                const random = Math.random()
                let cumulativeProbability = 0

                for (const [resource, rate] of Object.entries(stats.dropRates)) {
                    cumulativeProbability += rate
                    if (random < cumulativeProbability) {
                        drops[resource] = stats.bundlesPerTick
                        hasDrops = true
                        break
                    }
                }
            }

            if (hasDrops) {
                // 1. Update GameStore (UI)
                addResources(drops, facilityKey)

                // 2. Update AlchemyStore (Data)
                Object.entries(drops).forEach(([materialId, amount]) => {
                    useAlchemyStore.getState().addMaterial(materialId, amount)
                })
            } else {
                // Missed drop
                addResources({ 'empty': 1 }, facilityKey)
            }

            // Update timestamp
            setLastCollectedAt(facilityKey, now)
        }

        // Check every 1 second
        const tickRate = 1000

        const timer = setInterval(() => {
            const now = Date.now()
            const currentStatsMap = statsRef.current

            // Iterate over all owned facilities
            Object.entries(facilities).forEach(([facilityId, currentLevel]) => {
                if (currentLevel <= 0) return

                // Check all active levels up to current level
                for (let level = 1; level <= currentLevel; level++) {
                    const stats = currentStatsMap[facilityId]?.[level]
                    if (!stats || !stats.intervalSeconds) continue

                    const facilityKey = `${facilityId}-${level}`
                    const lastTime = lastCollectedAt[facilityKey] || 0
                    const elapsed = now - lastTime
                    const intervalMs = stats.intervalSeconds * 1000

                    if (elapsed >= intervalMs) {
                        collectFromFacility(facilityId, level, stats, facilityKey, now)
                    }
                }
            })
        }, tickRate)

        return () => clearInterval(timer)
    }, [userId, facilities, canvasView, lastCollectedAt, addResources, setLastCollectedAt])
}
