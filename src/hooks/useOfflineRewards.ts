/* eslint-disable no-console */
import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import * as alchemyApi from '../lib/alchemyApi'
import { useAlchemyStore } from '../store/useAlchemyStore'
import { useGameStore } from '../store/useGameStore'
import { MONSTER_DATA } from '../data/monsterData'

interface FacilityLevelStats {
  intervalSeconds: number
  bundlesPerTick: number
  dropRates: Record<string, number>
  cost?: Record<string, number>
}

const MAX_OFFLINE_HOURS = 8 // 최대 8시간 보상

/**
 * 오프라인 보상을 계산하고 지급하는 Hook
 *
 * @param userId - 사용자 ID
 * @param facilities - 외부에서 주입된 시설 데이터 (Note: We also read from store for consistency with other hooks if needed, but props ensure race-prevention)
 * @param areFacilitiesLoading - 시설 데이터 로딩 여부 (from useFacilities)
 * @returns claimed: 보상 지급 여부, rewards: 지급된 보상
 */
export function useOfflineRewards(
  userId: string | undefined,
  facilities: Record<string, number>,
  areFacilitiesLoading: boolean = true
) {
  const [claimed, setClaimed] = useState(false)
  const [rewards, setRewards] = useState<Record<string, number>>({})
  const [elapsedTime, setElapsedTime] = useState(0)

  // Store access for Monster Traits & Production Modes
  const { assignedMonsters, productionModes } = useGameStore()
  const { playerMonsters, isLoading: isAlchemyLoading } = useAlchemyStore()

  const isCalculatingRef = useRef(false)
  const facilitiesLoadedRef = useRef(false)

  // Reset state on user change
  useEffect(() => {
    if (!userId) {
      setClaimed(false)
      setRewards({})
      setElapsedTime(0)
      facilitiesLoadedRef.current = false
      isCalculatingRef.current = false
    }
  }, [userId])

  // Track facility loading state
  useEffect(() => {
    if (!areFacilitiesLoading && !facilitiesLoadedRef.current) {
      facilitiesLoadedRef.current = true
      console.log('✅ [OfflineRewards] 시설 데이터 로드 확인 (로딩 완료)')
    } else if (areFacilitiesLoading) {
      facilitiesLoadedRef.current = false
    }
  }, [areFacilitiesLoading])

  // Main Calculation Logic
  useEffect(() => {
    // 1. Basic Checks
    if (!userId || claimed || isCalculatingRef.current) return
    if (!facilitiesLoadedRef.current) {
      console.log('⏳ [OfflineRewards] 시설 데이터 로드 대기 중...')
      return
    }

    // 2. Wait for Alchemy Data (Player Monsters) for Traits
    // Even if no monsters, useAlchemyStore should finish loading to confirm empty list.
    if (isAlchemyLoading) {
      console.log('⏳ [OfflineRewards] 플레이어 데이터(몬스터) 로드 대기 중...')
      return
    }

    const calculateAndClaimRewards = async () => {
      try {
        isCalculatingRef.current = true
        useGameStore.getState().setIsOfflineProcessing(true) // Start critical section
        console.log('🎁 [OfflineRewards] 오프라인 보상 계산 시작...')

        // --- Step 1: Time Calculation ---
        const lastCollectedAt = await alchemyApi.getLastCollectedAt(userId)
        if (!lastCollectedAt) {
          console.log('ℹ️ [OfflineRewards] 마지막 수집 시간 없음 (첫 접속)')
          await alchemyApi.updateLastCollectedAt(userId)
          setClaimed(true)
          return
        }

        const now = new Date()
        const elapsedMs = now.getTime() - lastCollectedAt.getTime()
        const elapsedSeconds = Math.floor(elapsedMs / 1000)

        // Minimum time check (5 minutes)
        if (elapsedSeconds < 60 * 5) {
          console.log('ℹ️ [OfflineRewards] 경과 시간 너무 짧음:', elapsedSeconds, '초')
          await alchemyApi.updateLastCollectedAt(userId, now)

          // Sync local lastCollectedAt to avoid double counting
          const gameStore = useGameStore.getState()
          const nowTime = now.getTime()
          Object.entries(facilities).forEach(([fid, level]) => {
            if (level > 0) gameStore.setLastCollectedAt(`${fid}-${level}`, nowTime)
          })

          setClaimed(true)
          return
        }

        const maxSeconds = MAX_OFFLINE_HOURS * 60 * 60
        const cappedSeconds = Math.min(elapsedSeconds, maxSeconds)

        console.log(`⏱️ [OfflineRewards] 경과 시간: ${elapsedSeconds}초 (적용: ${cappedSeconds}초)`)
        setElapsedTime(cappedSeconds)

        // --- Step 2: Fetch Master Data ---
        const { data: levelsData } = await supabase
          .from('facility_level')
          .select('facility_id, level, stats')

        if (!levelsData) {
          console.error('❌ [OfflineRewards] 시설 데이터 로드 실패')
          setClaimed(true)
          return
        }

        // --- Step 3: Player Resources (for Cost) ---
        const playerMaterials = await alchemyApi.getPlayerMaterials(userId)
        const currentMaterials: Record<string, number> = {}
        playerMaterials.forEach(m => {
          currentMaterials[m.material_id] = m.quantity
        })

        // --- Step 4: Calculate Per Facility ---
        const totalRewards: Record<string, number> = {}

        for (const [facilityId, currentLevel] of Object.entries(facilities)) {
          if (currentLevel <= 0) continue

          // MATCHING useAutoCollection: Only process current level
          // Get Interval Stats (Current Level)
          const intervalLevelData = levelsData.find(l => l.facility_id === facilityId && l.level === currentLevel)
          if (!intervalLevelData) continue

          const intervalStats = intervalLevelData.stats as FacilityLevelStats

          // Get Drop Stats (Target Mode or Current Level)
          const targetModeLevel = productionModes[facilityId]
          let dropStats = intervalStats

          if (targetModeLevel && targetModeLevel < currentLevel) {
            const targetData = levelsData.find(l => l.facility_id === facilityId && l.level === targetModeLevel)
            if (targetData) {
              dropStats = targetData.stats as FacilityLevelStats
            }
          }

          // --- Monster Traits Calculation ---
          let bonusSpeed = 0
          let bonusAmount = 0

          const assignedIds = assignedMonsters[facilityId]
          if (Array.isArray(assignedIds)) {
            assignedIds.forEach(id => {
              if (!id) return
              const playerMonster = playerMonsters.find(m => m.id === id)
              if (playerMonster) {
                const monsterData = MONSTER_DATA[playerMonster.monster_id]
                if (monsterData?.factoryTrait && monsterData.factoryTrait.targetFacility === facilityId) {
                  if (monsterData.factoryTrait.effect.includes('속도')) {
                    bonusSpeed += monsterData.factoryTrait.value
                  } else if (monsterData.factoryTrait.effect === '생산량 증가') {
                    bonusAmount += monsterData.factoryTrait.value
                  }
                }
              }
            })
          }
          if (bonusSpeed > 90) bonusSpeed = 90

          // --- Production Logic ---
          // 1. Calculate Modified Interval
          const intervalMs = (intervalStats.intervalSeconds * (1 - bonusSpeed / 100)) * 1000
          const intervalSec = intervalMs / 1000

          // 2. Calculate Total Ticks possible in elapsed time
          const maxTicks = Math.floor(cappedSeconds / intervalSec)
          if (maxTicks <= 0) continue

          // 3. Calculate Bundles per Tick (averaged with bonus)
          // Average yield = Base * (1 + Bonus/100)
          const bundlesPerTickAvg = intervalStats.bundlesPerTick * (1 + bonusAmount / 100)

          // 4. Calculate Max Possible based on Costs
          let actualTicks = maxTicks
          if (dropStats.cost && Object.keys(dropStats.cost).length > 0) {
            let maxAffordableTicks = maxTicks

            for (const [costId, costPerAction] of Object.entries(dropStats.cost)) {
              const available = currentMaterials[costId] || 0
              const affordableTicks = Math.floor(available / costPerAction)
              maxAffordableTicks = Math.min(maxAffordableTicks, affordableTicks)
            }
            actualTicks = maxAffordableTicks
          }

          if (actualTicks <= 0) continue

          // 5. Apply Cost
          if (dropStats.cost) {
            for (const [costId, costPerAction] of Object.entries(dropStats.cost)) {
              const totalCost = costPerAction * actualTicks
              totalRewards[costId] = (totalRewards[costId] || 0) - totalCost
              currentMaterials[costId] = (currentMaterials[costId] || 0) - totalCost
            }
          }

          // 6. Apply Rewards
          // Total Bundles = actualTicks * bundlesPerTickAvg
          // For each item in dropRates:
          // Expected Hits = actualTicks * dropRate
          // Quantity = Expected Hits * bundlesPerTickAvg

          if (dropStats.dropRates) {
            for (const [materialId, rate] of Object.entries(dropStats.dropRates)) {
              const expectedHits = Math.floor(actualTicks * rate)
              // Add probability for remainder? E.g. 10.5 hits
              const remainder = (actualTicks * rate) - expectedHits
              const extraHit = Math.random() < remainder ? 1 : 0
              const totalHits = expectedHits + extraHit

              if (totalHits > 0) {
                // Calculate quantity for these hits
                // Each hit gives 'bundlesPerTickAvg' items
                // We can use same averaging logic: Floor(Total) + random
                const totalQuantity = totalHits * bundlesPerTickAvg
                const flooredQty = Math.floor(totalQuantity)
                const extraQty = Math.random() < (totalQuantity - flooredQty) ? 1 : 0

                const finalQty = flooredQty + extraQty
                if (finalQty > 0) {
                  totalRewards[materialId] = (totalRewards[materialId] || 0) + finalQty
                }
              }
            }
          }
        }

        // --- Step 5: Finalize ---
        // 20% penalty REMOVED. 100% Efficiency.

        console.log('🎁 [OfflineRewards] 계산된 보상:', totalRewards)

        if (Object.keys(totalRewards).length > 0) {
          await alchemyApi.batchAddMaterials(userId, totalRewards)

          // Local Store Update
          const alchemyStore = useAlchemyStore.getState()
          const gameStore = useGameStore.getState()

          // Update Resources in GameStore (Visual)
          const newResources = { ...gameStore.resources }
          for (const [mid, qty] of Object.entries(totalRewards)) {
            newResources[mid] = (newResources[mid] || 0) + qty
          }
          gameStore.setResources(newResources)

          // Reload Player Data to ensure sync
          await alchemyStore.loadPlayerData(userId)
        }

        // Update Last Collected (DB)
        await alchemyApi.updateLastCollectedAt(userId, now)

        // Update Last Collected (Local)
        const gameStore = useGameStore.getState()
        const nowTime = now.getTime()
        Object.entries(facilities).forEach(([fid, level]) => {
          if (level > 0) gameStore.setLastCollectedAt(`${fid}-${level}`, nowTime)
        })

        setRewards(totalRewards)
        console.log('🎉 [OfflineRewards] 오프라인 보상 처리 완료')

      } catch (e) {
        console.error('❌ [OfflineRewards] 오프라인 보상 처리 실패:', e)
      } finally {
        setClaimed(true)
        isCalculatingRef.current = false
        useGameStore.getState().setIsOfflineProcessing(false)
      }
    }

    calculateAndClaimRewards()
  }, [userId, claimed, facilities, areFacilitiesLoading, isAlchemyLoading, assignedMonsters, productionModes, playerMonsters])

  return {
    claimed,
    rewards,
    elapsedTime
  }
}
