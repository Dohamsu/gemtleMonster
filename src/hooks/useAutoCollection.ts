import { useEffect, useRef } from 'react'
import { useGameStore } from '../store/useGameStore'
import { supabase } from '../lib/supabase'
import { useAlchemyStore } from '../store/useAlchemyStore'

interface FacilityLevelStats {
    intervalSeconds: number
    bundlesPerTick: number
    dropRates: Record<string, number>
    cost?: Record<string, number>
}

// Facility ID -> Level -> Stats
type FacilityStatsMap = Record<string, Record<number, FacilityLevelStats>>

export function useAutoCollection(userId: string | undefined) {
    const { facilities, lastCollectedAt, addResources, setLastCollectedAt, canvasView, isOfflineProcessing } = useGameStore()
    const statsRef = useRef<FacilityStatsMap>({})
    const processingRef = useRef<Set<string>>(new Set())

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
        if (isOfflineProcessing) return // 오프라인 보상 처리 중에는 자동 수집 일시 중지

        // Helper to process drops
        const collectFromFacility = async (
            _facilityId: string,
            _level: number,
            stats: FacilityLevelStats,
            facilityKey: string,
            now: number
        ) => {
            // Prevent double processing
            if (processingRef.current.has(facilityKey)) return
            processingRef.current.add(facilityKey)

            try {
                // 1. Consumption (if cost exists)
                if (stats.cost) {
                    // console.log(`🔄 [AutoCollection] ${facilityKey} 자원 소비 시도:`, stats.cost)
                    const consumed = await useAlchemyStore.getState().consumeMaterials(stats.cost)
                    if (!consumed) {
                        console.log(`⚠️ [AutoCollection] ${facilityKey} 자원 부족으로 생산 건너뜀`)
                        // Not enough resources, skip production
                        // Do NOT update lastCollectedAt so it retries soon (or update to avoid spamming logic?)
                        // If we skip update, it retries every second. This checks DB/State every second.
                        // Ideally we should wait a bit? But idle game logic usually checks often.
                        // We'll return early.
                        return
                    }
                    // console.log(`✅ [AutoCollection] ${facilityKey} 자원 소비 성공`)
                }

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

                    // NOTE: useAlchemyStore sync is handled inside 'addResources' or mirrored?
                    // Original code:
                    // addResources(drops, facilityKey)
                    // Object.entries(drops).forEach(([materialId, amount]) => {
                    //     useAlchemyStore.getState().addMaterial(materialId, amount)
                    // })
                    // existing logic:

                    // 2. Update AlchemyStore (Data)
                    // addResources in GameStore calls addMaterial in AlchemyStore?
                    // Let's check GameStore logic.
                    // GameStore.addResources calls useAlchemyStore.getState().addMaterial(id, qty) (Line 116 in useGameStore.ts)
                    // So we DON'T need to call it manually again here if addResources does it.
                    // But original code DID call it manually? 
                    // Let's check original code snippet again.
                    // Original Line 76: Object.entries(drops).forEach...
                    // Original Line 73: addResources(drops, facilityKey)
                    // GameStore: 
                    // addResources: (rewards, source) => { const { addMaterial } = useAlchemyStore.getState(); ... }
                    // So it WAS calling it twice? Or GameStore logic changed safely?
                    // I will trust GameStore.addResources invokes persistence.
                } else {
                    // Missed drop
                    addResources({ 'empty': 1 }, facilityKey)
                }

                // Update timestamp
                setLastCollectedAt(facilityKey, now)

            } catch (e) {
                console.error("Auto collection failed", e)
            } finally {
                processingRef.current.delete(facilityKey)
            }
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
                        // Safety Check: If elapsed time is too long (> 10 mins), skip auto-collection.
                        // This prevents race conditions with useOfflineRewards which handles long offline durations.
                        // useOfflineRewards handles > 5 mins. We give a buffer (10 mins) to ensure no conflict.
                        if (elapsed > 10 * 60 * 1000) {
                            // console.warn(`[AutoCollection] Skipping ${facilityKey} (Elapsed: ${elapsed}ms) - Delegating to OfflineRewards`)
                            continue
                        }

                        collectFromFacility(facilityId, level, stats, facilityKey, now)
                    }
                }
            })
        }, tickRate)

        return () => clearInterval(timer)
    }, [userId, facilities, canvasView, lastCollectedAt, addResources, setLastCollectedAt, isOfflineProcessing])
}
