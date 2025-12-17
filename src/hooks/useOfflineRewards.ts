/* eslint-disable no-console */
import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import * as alchemyApi from '../lib/alchemyApi'
import { useAlchemyStore } from '../store/useAlchemyStore'
import { useGameStore } from '../store/useGameStore'

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
 * @param areFacilitiesLoading - 시설 데이터 로딩 여부 (from useFacilities)
 * @returns claimed: 보상 지급 여부, rewards: 지급된 보상
 */
export function useOfflineRewards(userId: string | undefined, areFacilitiesLoading: boolean = true) {
  const [claimed, setClaimed] = useState(false)
  const [rewards, setRewards] = useState<Record<string, number>>({})
  const [elapsedTime, setElapsedTime] = useState(0)
  const { facilities } = useGameStore()

  const isCalculatingRef = useRef(false)

  // 시설 데이터가 DB에서 로드되었는지 확인
  const facilitiesLoadedRef = useRef(false)

  useEffect(() => {
    // userID가 변경되면(로그아웃/로그인) 상태 초기화
    if (userId) {
      // 새 유저 로그인 시: 초기화는 필요 없으나(컴포넌트 키가 바뀌면 자동이지만, App 최상위라 안바뀜),
      // 로그아웃 -> 로그인 시나리오에서 refs가 오염될 수 있음.
      // 그러나 아래 useEffect에서 reset을 처리함.
    } else {
      // 로그아웃 시 상태 초기화
      setClaimed(false)
      setRewards({})
      setElapsedTime(0)
      facilitiesLoadedRef.current = false
      isCalculatingRef.current = false
      // Note: claimed가 false가 되면 로딩 화면이 다시 나올 수 있음 (App.tsx 로직)
      // 하지만 로그아웃 상태이므로 LoginScreen이 나옴.
    }
  }, [userId])

  useEffect(() => {
    // 시설 로딩이 완료되었으면 로드된 것으로 표시
    // (기존에는 시설 개수로 추측했으나, 신규 유저는 기본 시설만 가지므로 추측 불가)
    if (!areFacilitiesLoading && !facilitiesLoadedRef.current) {
      facilitiesLoadedRef.current = true
      console.log('✅ [OfflineRewards] 시설 데이터 로드 확인 (로딩 완료)')
    } else if (areFacilitiesLoading) {
      // 로딩 중으로 바뀌면(재로그인 등) 다시 false로 리셋
      facilitiesLoadedRef.current = false
    }
  }, [areFacilitiesLoading])

  useEffect(() => {
    if (!userId || claimed || isCalculatingRef.current) return

    // 시설 데이터가 로드될 때까지 대기
    if (!facilitiesLoadedRef.current) {
      console.log('⏳ [OfflineRewards] 시설 데이터 로드 대기 중...')
      return
    }

    const calculateAndClaimRewards = async () => {
      try {
        isCalculatingRef.current = true
        useGameStore.getState().setIsOfflineProcessing(true) // Start critical section
        console.log('🎁 [OfflineRewards] 오프라인 보상 계산 시작...')

        // 1. 마지막 수집 시간 가져오기
        const lastCollectedAt = await alchemyApi.getLastCollectedAt(userId)
        if (!lastCollectedAt) {
          console.log('ℹ️ [OfflineRewards] 마지막 수집 시간 없음 (첫 접속)')
          await alchemyApi.updateLastCollectedAt(userId)
          setClaimed(true)
          return
        }

        // 2. 경과 시간 계산
        const now = new Date()
        const elapsedMs = now.getTime() - lastCollectedAt.getTime()
        const elapsedSeconds = Math.floor(elapsedMs / 1000)

        // 최소 시간 체크 (5분 미만이면 보상 없음)
        if (elapsedSeconds < 60 * 5) {
          console.log('ℹ️ [OfflineRewards] 경과 시간 너무 짧음:', elapsedSeconds, '초')

          // 마지막 수집 시간 업데이트 (자동 수집이 10분 초과로 멈추는 것 방지)
          const now = new Date()
          await alchemyApi.updateLastCollectedAt(userId, now)

          // 로컬 스토어 수집 시간도 업데이트
          const gameStore = useGameStore.getState()
          const nowTime = now.getTime()
          Object.keys(facilities).forEach(facilityId => {
            const level = facilities[facilityId]
            if (level > 0) {
              for (let l = 1; l <= level; l++) {
                gameStore.setLastCollectedAt(`${facilityId}-${l}`, nowTime)
              }
            }
          })

          setClaimed(true)
          return
        }

        // 최대 시간 제한 (8시간)
        const maxSeconds = MAX_OFFLINE_HOURS * 60 * 60
        const cappedSeconds = Math.min(elapsedSeconds, maxSeconds)

        console.log(`⏱️ [OfflineRewards] 경과 시간: ${elapsedSeconds}초 (${Math.floor(elapsedSeconds / 60)}분)`)
        console.log(`⏱️ [OfflineRewards] 보상 계산 시간: ${cappedSeconds}초 (${Math.floor(cappedSeconds / 60)}분)`)

        setElapsedTime(cappedSeconds)

        // 3. 시설 정보 가져오기
        const { data: facilitiesData } = await supabase
          .from('facility')
          .select('id, name, category')

        const { data: levelsData } = await supabase
          .from('facility_level')
          .select('facility_id, level, stats')

        if (!facilitiesData || !levelsData) {
          console.error('❌ [OfflineRewards] 시설 데이터 로드 실패')
          setClaimed(true)
          return
        }

        // Fetch current materials for cost calculation
        const playerMaterials = await alchemyApi.getPlayerMaterials(userId)
        // Convert array to record for faster lookup: { material_id: quantity }
        const currentMaterials: Record<string, number> = {}
        playerMaterials.forEach(m => {
          currentMaterials[m.material_id] = m.quantity
        })

        // 4. 각 시설/레벨별 생산량 계산
        const totalRewards: Record<string, number> = {}

        for (const [facilityId, currentLevel] of Object.entries(facilities)) {
          if (currentLevel <= 0) continue

          for (let level = 1; level <= currentLevel; level++) {
            const levelData = levelsData.find(l => l.facility_id === facilityId && l.level === level)
            if (!levelData) continue

            const stats = levelData.stats as FacilityLevelStats
            const intervalSeconds = stats.intervalSeconds

            // 1. 이론상 최대 생산 횟수 (시간 기준)
            const maxProductionByTime = Math.floor(cappedSeconds / intervalSeconds)
            if (maxProductionByTime <= 0) continue

            let actualProductionCount = maxProductionByTime

            // 2. 비용이 있는 경우, 자원 기준 최대 생산 횟수 계산
            if (stats.cost && Object.keys(stats.cost).length > 0) {
              let maxAffordable = maxProductionByTime

              for (const [costId, costAmount] of Object.entries(stats.cost)) {
                const available = currentMaterials[costId] || 0
                const affordable = Math.floor(available / costAmount)
                maxAffordable = Math.min(maxAffordable, affordable)
              }

              actualProductionCount = maxAffordable
            }

            if (actualProductionCount <= 0) continue

            // 3. 자원 소모 기록 (비용이 있는 경우)
            if (stats.cost) {
              for (const [costId, costAmount] of Object.entries(stats.cost)) {
                // 소모량은 음수로 기록
                const totalCost = costAmount * actualProductionCount
                totalRewards[costId] = (totalRewards[costId] || 0) - totalCost

                // 로컬 계산용 잔여 자원 차감 (같은 루프 내 다른 시설 영향을 위해)
                currentMaterials[costId] = (currentMaterials[costId] || 0) - totalCost
              }
            }

            // 4. 생산품 추가
            // 각 생산마다 확률 기반으로 재료 선택
            for (let i = 0; i < actualProductionCount; i++) {
              const random = Math.random()
              let cumulativeProbability = 0

              for (const [materialId, dropRate] of Object.entries(stats.dropRates)) {
                cumulativeProbability += dropRate
                if (random < cumulativeProbability) {
                  totalRewards[materialId] = (totalRewards[materialId] || 0) + stats.bundlesPerTick
                  break
                }
              }
            }
          }
        }

        // 전체 보상에 0.2 효율 적용 (확률적 반올림)
        // 단, 소모 비용(음수)은 효율 감소 없이 그대로 적용 (100% 소모)
        for (const key of Object.keys(totalRewards)) {
          const value = totalRewards[key]

          // 소모 비용(음수)은 건너뜀 (이미 정확한 양으로 계산됨)
          if (value < 0) continue

          const rawAmount = value * 0.2
          const integerPart = Math.floor(rawAmount)
          const decimalPart = rawAmount - integerPart

          // 소모된 비용은 유지하고, 생산된 보상만 효율 적용 후 덮어쓰기
          // 소수점 확률에 따라 +1
          const finalAmount = integerPart + (Math.random() < decimalPart ? 1 : 0)

          if (finalAmount > 0) {
            totalRewards[key] = finalAmount
          } else {
            delete totalRewards[key]
          }
        }

        console.log('🎁 [OfflineRewards] 계산된 보상:', totalRewards)

        // 5. 보상이 있으면 DB에 저장하고 로컬 상태 업데이트
        if (Object.keys(totalRewards).length > 0) {
          await alchemyApi.batchAddMaterials(userId, totalRewards)

          // 로컬 상태 업데이트
          const alchemyStore = useAlchemyStore.getState()
          const gameStore = useGameStore.getState()
          const newGameResources = { ...gameStore.resources }

          for (const [materialId, quantity] of Object.entries(totalRewards)) {
            newGameResources[materialId] = (newGameResources[materialId] || 0) + quantity
          }

          gameStore.setResources(newGameResources)
          await alchemyStore.loadPlayerData(userId) // 재로드하여 동기화

          console.log('✅ [OfflineRewards] 보상 지급 완료')
        } else {
          console.log('ℹ️ [OfflineRewards] 지급할 보상 없음')
        }

        // 6. 마지막 수집 시간 업데이트 (DB)
        await alchemyApi.updateLastCollectedAt(userId, now)

        // 7. 로컬 스토어 수집 시간도 업데이트 (중요: useAutoCollection 중복 실행 방지)
        const gameStore = useGameStore.getState()
        const nowTime = now.getTime()
        Object.keys(facilities).forEach(facilityId => {
          const level = facilities[facilityId]
          if (level > 0) {
            // 모든 레벨의 키에 대해 업데이트 (useAutoCollection은 facilityId-level 키를 사용함)
            // 하지만 useAutoCollection은 현재 활성화된 레벨만 체크하므로, 현재 레벨들만 업데이트해도 됨?
            // useAutoCollection logic: iterates 1..currentLevel.
            for (let l = 1; l <= level; l++) {
              gameStore.setLastCollectedAt(`${facilityId}-${l}`, nowTime)
            }
          }
        })

        setRewards(totalRewards)
        console.log('🎉 [OfflineRewards] 오프라인 보상 처리 완료')

      } catch (error) {
        console.error('❌ [OfflineRewards] 오프라인 보상 처리 실패:', error)
      } finally {
        setClaimed(true)
        isCalculatingRef.current = false
        useGameStore.getState().setIsOfflineProcessing(false) // End critical section
      }
    }

    calculateAndClaimRewards()
  }, [userId, claimed, facilities, areFacilitiesLoading])

  return {
    claimed,
    rewards,
    elapsedTime
  }
}
