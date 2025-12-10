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
}

const MAX_OFFLINE_HOURS = 8 // 최대 8시간 보상

/**
 * 오프라인 보상을 계산하고 지급하는 Hook
 *
 * @param userId - 사용자 ID
 * @returns claimed: 보상 지급 여부, rewards: 지급된 보상
 */
export function useOfflineRewards(userId: string | undefined) {
  const [claimed, setClaimed] = useState(false)
  const [rewards, setRewards] = useState<Record<string, number>>({})
  const [elapsedTime, setElapsedTime] = useState(0)
  const { facilities } = useGameStore()

  const isCalculatingRef = useRef(false)

  // 시설 데이터가 DB에서 로드되었는지 확인 (기본값 이상이어야 함)
  // 기본값: { herb_farm: 1, monster_farm: 1 }
  // DB 로드 후에는 광산 등 다른 시설도 포함됨
  const facilitiesLoadedRef = useRef(false)

  useEffect(() => {
    // 기본값 2개보다 많은 시설이 있거나, 기본 시설 레벨이 1보다 높으면 로드된 것으로 판단
    const facilityIds = Object.keys(facilities)
    const isLoaded = facilityIds.length > 2 ||
      facilityIds.some(id => facilities[id] > 1 && id !== 'herb_farm' && id !== 'monster_farm')

    if (isLoaded && !facilitiesLoadedRef.current) {
      facilitiesLoadedRef.current = true
      console.log('✅ [OfflineRewards] 시설 데이터 로드 완료:', facilities)
    }
  }, [facilities])

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

        // 4. 각 시설/레벨별 생산량 계산
        const totalRewards: Record<string, number> = {}

        for (const [facilityId, currentLevel] of Object.entries(facilities)) {
          if (currentLevel <= 0) continue

          for (let level = 1; level <= currentLevel; level++) {
            const levelData = levelsData.find(l => l.facility_id === facilityId && l.level === level)
            if (!levelData) continue

            const stats = levelData.stats as FacilityLevelStats
            const intervalSeconds = stats.intervalSeconds

            // 이 레벨이 경과 시간 동안 몇 번 생산했는지 계산
            const productionCount = Math.floor(cappedSeconds / intervalSeconds)

            // 각 생산마다 확률 기반으로 재료 선택
            for (let i = 0; i < productionCount; i++) {
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
        for (const key of Object.keys(totalRewards)) {
          const rawAmount = totalRewards[key] * 0.2
          const integerPart = Math.floor(rawAmount)
          const decimalPart = rawAmount - integerPart

          // 소수점 확률에 따라 +1
          totalRewards[key] = integerPart + (Math.random() < decimalPart ? 1 : 0)

          if (totalRewards[key] <= 0) {
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

        // 6. 마지막 수집 시간 업데이트
        await alchemyApi.updateLastCollectedAt(userId, now)

        setRewards(totalRewards)
        console.log('🎉 [OfflineRewards] 오프라인 보상 처리 완료')

      } catch (error) {
        console.error('❌ [OfflineRewards] 오프라인 보상 처리 실패:', error)
      } finally {
        setClaimed(true)
        isCalculatingRef.current = false
      }
    }

    calculateAndClaimRewards()
  }, [userId, claimed, facilities])

  return {
    claimed,
    rewards,
    elapsedTime
  }
}
