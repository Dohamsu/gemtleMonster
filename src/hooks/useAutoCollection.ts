import { useEffect, useRef } from 'react'
import { useGameStore } from '../store/useGameStore'
import { supabase } from '../lib/supabase'
import { useAlchemyStore } from '../store/useAlchemyStore'
import { MONSTER_DATA } from '../data/monsterData'

interface FacilityLevelStats {
    intervalSeconds: number
    bundlesPerTick: number
    dropRates: Record<string, number>
    cost?: Record<string, number>
}

type FacilityStatsMap = Record<string, Record<number, FacilityLevelStats>>

export function useAutoCollection(userId: string | undefined) {
    const { facilities, assignedMonsters, lastCollectedAt, addResources, setLastCollectedAt, canvasView, isOfflineProcessing } = useGameStore()
    const { playerMonsters } = useAlchemyStore()
    const statsRef = useRef<FacilityStatsMap>({})
    const processingRef = useRef<Set<string>>(new Set())

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

    useEffect(() => {
        if (!userId || canvasView === 'shop' || isOfflineProcessing) return

        const collectFromBatch = async (
            facilityKey: string,
            stats: FacilityLevelStats,
            count: number,
            nextTime: number
        ) => {
            if (processingRef.current.has(facilityKey)) return
            processingRef.current.add(facilityKey)

            try {
                let actualCount = count

                // 1. Cost Handling
                if (stats.cost) {
                    const alchemyStore = useAlchemyStore.getState()
                    const playerMaterials = alchemyStore.playerMaterials
                    const gameResources = useGameStore.getState().resources

                    let maxPossible = count
                    for (const [resId, amount] of Object.entries(stats.cost)) {
                        const owned = (playerMaterials[resId] ?? gameResources[resId] ?? 0)
                        maxPossible = Math.min(maxPossible, Math.floor(owned / amount))
                    }

                    actualCount = maxPossible
                    if (actualCount <= 0) return // Not enough materials for even one production

                    const totalCost: Record<string, number> = {}
                    for (const [id, amt] of Object.entries(stats.cost)) {
                        totalCost[id] = amt * actualCount
                    }
                    await alchemyStore.consumeMaterials(totalCost)
                }

                // 2. Drop Calculation
                const totalDrops: Record<string, number> = {}
                let hasAnyDrop = false
                if (stats.dropRates) {
                    for (let i = 0; i < actualCount; i++) {
                        const random = Math.random()
                        let cumulative = 0
                        for (const [res, rate] of Object.entries(stats.dropRates)) {
                            cumulative += rate
                            if (random < cumulative) {
                                totalDrops[res] = (totalDrops[res] || 0) + stats.bundlesPerTick
                                hasAnyDrop = true
                                break
                            }
                        }
                    }
                }

                if (hasAnyDrop) {
                    addResources(totalDrops, facilityKey)
                }

                // 3. Update Timestamp only for produced amount
                const finalTime = actualCount === count ? nextTime : (lastCollectedAt[facilityKey] || Date.now()) + (actualCount * stats.intervalSeconds * 1000)
                setLastCollectedAt(facilityKey, finalTime)

            } catch (e) {
                // console.error("Batch collection failed", e)
            } finally {
                processingRef.current.delete(facilityKey)
            }
        }

        const intervalId = setInterval(async () => {
            const now = Date.now()
            const currentStatsMap = statsRef.current
            const entries = Object.entries(facilities)

            for (const [facilityId, currentLevel] of entries) {
                const facilityStats = currentStatsMap[facilityId]
                if (!facilityStats) continue

                const stats = facilityStats[currentLevel]
                if (!stats || !stats.intervalSeconds) continue

                const facilityKey = `${facilityId}-${currentLevel}`
                const lastTime = lastCollectedAt[facilityKey]

                if (!lastTime) {
                    setLastCollectedAt(facilityKey, now)
                    continue
                }

                // --- Monster Bonus Calculation ---
                let bonusSpeed = 0 // Percentage reduction
                let bonusAmount = 0 // Percentage increase
                const assignedMonsterId = assignedMonsters[facilityId]
                if (assignedMonsterId) {
                    const playerMonster = playerMonsters.find(m => m.id === assignedMonsterId)
                    if (playerMonster) {
                        const monsterData = MONSTER_DATA[playerMonster.monster_id]
                        if (monsterData?.factoryTrait && monsterData.factoryTrait.targetFacility === facilityId) {
                            if (monsterData.factoryTrait.effect === '채굴 속도 증가' || monsterData.factoryTrait.effect === '채집 속도 증가' || monsterData.factoryTrait.effect === '생산 속도 증가') {
                                bonusSpeed = monsterData.factoryTrait.value
                            } else if (monsterData.factoryTrait.effect === '생산량 증가') {
                                bonusAmount = monsterData.factoryTrait.value
                            }
                        }
                    }
                }

                const intervalMs = (stats.intervalSeconds * (1 - bonusSpeed / 100)) * 1000
                const elapsed = now - lastTime

                if (elapsed < intervalMs) continue

                const productionCount = Math.floor(elapsed / intervalMs)
                if (productionCount <= 0) continue

                // Ignore huge catch-up (delegated to offline rewards)
                if (elapsed > 10 * 60 * 1000) {
                    setLastCollectedAt(facilityKey, now)
                    continue
                }

                // Apply quantity bonus to bundlesPerTick (probabilistic for fractions)
                const baseBundles = stats.bundlesPerTick
                const adjustedBundles = baseBundles * (1 + bonusAmount / 100)
                const actualBundles = Math.floor(adjustedBundles) + (Math.random() < (adjustedBundles % 1) ? 1 : 0)

                const nextTime = lastTime + (productionCount * intervalMs)
                // Fire and forget (internal locking handles it)
                collectFromBatch(facilityKey, { ...stats, bundlesPerTick: actualBundles }, productionCount, nextTime)
            }
        }, 100) // 0.1s tick

        return () => clearInterval(intervalId)
    }, [userId, facilities, assignedMonsters, playerMonsters, canvasView, lastCollectedAt, addResources, setLastCollectedAt, isOfflineProcessing])
}
