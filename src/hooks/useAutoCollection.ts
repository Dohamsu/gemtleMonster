import { useEffect } from 'react'
import { useGameStore } from '../store/useGameStore'
import { supabase } from '../lib/supabase'


import { useAlchemyStore } from '../store/useAlchemyStore'

interface FacilityLevelStats {
    intervalSeconds: number
    bundlesPerTick: number
    dropRates: Record<string, number>
}

export function useAutoCollection(userId: string | undefined) {
    const { facilities, addResources, setLastCollectedAt, canvasView } = useGameStore()

    useEffect(() => {
        if (!userId) return

        // 상점이 열려있을 때는 자동 생산 중단 (판매 시 수량 오류 방지)
        if (canvasView === 'shop') return

        let isCancelled = false
        const intervals: number[] = []

        const setupAutoCollection = async () => {
            // Get facility master data to know stats
            // Ideally this should be in store or context, but fetching here for now
            const { data: facilitiesData } = await supabase
                .from('facility')
                .select('id, name, category')

            if (isCancelled) return

            const { data: levelsData } = await supabase
                .from('facility_level')
                .select('facility_id, level, stats')

            if (isCancelled || !facilitiesData || !levelsData) return

            // For each facility player owns
            for (const [facilityId, currentLevel] of Object.entries(facilities)) {
                if (currentLevel <= 0) continue

                // Loop through ALL levels from 1 to currentLevel
                for (let level = 1; level <= currentLevel; level++) {
                    const levelData = levelsData.find(l => l.facility_id === facilityId && l.level === level)
                    if (!levelData) continue

                    const stats = levelData.stats as FacilityLevelStats

                    // Use actual interval from stats
                    const collectionInterval = stats.intervalSeconds

                    // Skip if no interval defined (e.g. passive facilities like monster farm)
                    if (!collectionInterval) continue

                    // Set up interval for this specific level
                    const interval = window.setInterval(() => {
                        if (isCancelled) return // Double check inside interval

                        // Calculate drops based on dropRates
                        const drops: Record<string, number> = {}
                        let hasDrops = false

                        if (stats.dropRates) {
                            // Select ONE material based on weighted probability
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

                        const now = Date.now()
                        const facilityKey = `${facilityId}-${level}`

                        if (hasDrops) {
                            // 1. Update Legacy GameStore (for UI animations)
                            addResources(drops, facilityKey)

                            // 2. Update AlchemyStore (for DB & Inventory)
                            Object.entries(drops).forEach(([materialId, amount]) => {
                                useAlchemyStore.getState().addMaterial(materialId, amount)
                            })

                            // console.log(`⛏️ Collected from ${facilityId} Lv.${level}:`, drops)
                        } else {
                            // Missed drop - trigger empty animation
                            addResources({ 'empty': 1 }, facilityKey)
                            // console.log(`💨 Missed drop from ${facilityId} Lv.${level}`)
                        }

                        // Always update last collected time to keep progress bar synced
                        setLastCollectedAt(facilityKey, now)
                    }, collectionInterval * 1000)

                    intervals.push(interval)
                }
            }
        }

        setupAutoCollection()

        return () => {
            isCancelled = true
            intervals.forEach(clearInterval)
        }
    }, [userId, facilities, canvasView]) // Re-run when facilities change or tab changes
}
