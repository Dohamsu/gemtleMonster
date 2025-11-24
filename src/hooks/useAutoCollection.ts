import { useEffect } from 'react'
import { useGameStore } from '../store/useGameStore'
import { supabase } from '../lib/supabase'


interface FacilityLevelStats {
    intervalSeconds: number
    bundlesPerTick: number
    dropRates: Record<string, number>
}

export function useAutoCollection(userId: string | undefined) {
    const { facilities, addResources, setLastCollectedAt } = useGameStore()

    useEffect(() => {
        if (!userId) return

        const intervals: number[] = []

        const setupAutoCollection = async () => {
            // Get facility master data to know stats
            // Ideally this should be in store or context, but fetching here for now
            const { data: facilitiesData } = await supabase
                .from('facility')
                .select('id, name, category')

            const { data: levelsData } = await supabase
                .from('facility_level')
                .select('facility_id, level, stats')

            if (!facilitiesData || !levelsData) return

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

                    // Set up interval for this specific level
                    const interval = window.setInterval(() => {
                        // Calculate drops based on dropRates
                        const drops: Record<string, number> = {}
                        let hasDrops = false

                        for (const [resource, rate] of Object.entries(stats.dropRates)) {
                            const amount = Math.random() < rate ? stats.bundlesPerTick : 0
                            if (amount > 0) {
                                drops[resource] = amount
                                hasDrops = true
                            }
                        }

                        if (hasDrops) {
                            const now = Date.now()
                            const facilityKey = `${facilityId}-${level}`
                            addResources(drops, facilityKey)
                            // Use unique key for each level
                            setLastCollectedAt(facilityKey, now)
                            console.log(`⛏️ Collected from ${facilityId} Lv.${level}:`, drops)
                        }
                    }, collectionInterval * 1000)

                    intervals.push(interval)
                }
            }
        }

        setupAutoCollection()

        return () => {
            intervals.forEach(clearInterval)
        }
    }, [userId, facilities]) // Re-run when facilities change (upgrade)
}
