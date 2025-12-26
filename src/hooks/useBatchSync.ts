/* eslint-disable no-console */
import { useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'

interface BatchSyncOptions {
  batchInterval?: number // 배치 저장 간격 (ms)
  onSyncStart?: () => void
  onSyncComplete?: (success: boolean, updates: Record<string, number>) => void
  onSyncError?: (error: Error) => void
}

/**
 * 재료 및 시설 변경사항을 배치로 모아서 주기적으로 DB에 저장하는 Hook
 *
 * @param userId - 사용자 ID
 * @param options - 배치 동기화 옵션
 * @returns queueUpdate: 재료 변경사항 추가, queueFacilityUpdate: 시설 변경사항 추가, forceSyncNow: 즉시 동기화
 */
interface FacilityUpdate {
  level?: number
  productionMode?: number
  assignedMonsterIds?: (string | null)[]
  lastCollectedAt?: number
}

export function useBatchSync(
  userId: string | undefined,
  options: BatchSyncOptions = {}
) {
  const {
    batchInterval = 30000,
    onSyncStart,
    onSyncComplete,
    onSyncError
  } = options

  const pendingUpdates = useRef<Record<string, number>>({})
  const pendingFacilityUpdates = useRef<Record<string, FacilityUpdate>>({})
  const isSyncing = useRef(false)

  const queueUpdate = useCallback((materialId: string, quantity: number) => {
    pendingUpdates.current[materialId] =
      (pendingUpdates.current[materialId] || 0) + quantity
  }, [])
  const queueFacilityUpdate = useCallback((facilityId: string, newLevel: number) => {
    pendingFacilityUpdates.current[facilityId] = {
      ...pendingFacilityUpdates.current[facilityId],
      level: newLevel
    }
  }, [])

  const queueProductionModeUpdate = useCallback((facilityId: string, mode: number) => {
    pendingFacilityUpdates.current[facilityId] = {
      ...pendingFacilityUpdates.current[facilityId],
      productionMode: mode
    }
  }, [])

  const queueAssignmentUpdate = useCallback((facilityId: string, monsterIds: (string | null)[]) => {
    pendingFacilityUpdates.current[facilityId] = {
      ...pendingFacilityUpdates.current[facilityId],
      assignedMonsterIds: monsterIds
    }
  }, [])

  const queueLastCollectedUpdate = useCallback((key: string, time: number) => {
    // key 형식: "facilityId-level" (예: "herb_farm-4")
    // facilityId만 추출 (마지막 '-숫자' 부분 제거)
    const lastDashIndex = key.lastIndexOf('-')
    const facilityId = lastDashIndex > 0 ? key.substring(0, lastDashIndex) : key

    pendingFacilityUpdates.current[facilityId] = {
      ...pendingFacilityUpdates.current[facilityId],
      lastCollectedAt: time
    }
  }, [])

  const onSyncStartRef = useRef(onSyncStart)
  const onSyncCompleteRef = useRef(onSyncComplete)
  const onSyncErrorRef = useRef(onSyncError)

  useEffect(() => {
    onSyncStartRef.current = onSyncStart
    onSyncCompleteRef.current = onSyncComplete
    onSyncErrorRef.current = onSyncError
  }, [onSyncStart, onSyncComplete, onSyncError])

  const syncToDatabase = useCallback(async () => {
    if (!userId || isSyncing.current) return

    const updatesSnapshot = { ...pendingUpdates.current }
    const facilitySnapshot = { ...pendingFacilityUpdates.current }

    if (Object.keys(updatesSnapshot).length === 0 && Object.keys(facilitySnapshot).length === 0) {
      return
    }

    pendingUpdates.current = {}
    pendingFacilityUpdates.current = {}

    isSyncing.current = true
    onSyncStartRef.current?.()

    try {
      if (Object.keys(updatesSnapshot).length > 0) {
        // Gold check
        const goldUpdate = updatesSnapshot['gold']
        if (goldUpdate !== undefined && goldUpdate !== 0) {
          try {
            const { addGold } = await import('../lib/alchemyApi')
            await addGold(userId, goldUpdate)
            console.log(`✅ [BatchSync] 골드 동기화 완료: ${goldUpdate}`)
          } catch (e) {
            console.error(`❌ [BatchSync] 골드 동기화 실패:`, e)
            throw e
          }
        }

        const filteredUpdates = Object.entries(updatesSnapshot).reduce((acc, [k, v]) => {
          if (k !== 'empty' && k !== 'gold' && v !== 0) {
            acc[k] = v
          }
          return acc
        }, {} as Record<string, number>)

        if (Object.keys(filteredUpdates).length > 0) {
          const { error } = await supabase.rpc('batch_add_materials', {
            p_user_id: userId,
            p_materials: filteredUpdates
          })
          if (error) throw error
        }
      }

      if (Object.keys(facilitySnapshot).length > 0) {
        console.log('📡 [BatchSync] 시설 업데이트 전송 시작:', facilitySnapshot)

        // 최신 정보를 가져오기 위해 store 직접 참조
        const { useFacilityStore } = await import('../store/useFacilityStore')
        const facilityState = useFacilityStore.getState()
        const currentFacilities = facilityState.facilities
        const currentAssignments = facilityState.assignedMonsters
        const currentModes = facilityState.productionModes

        const facilityRecords = Object.entries(facilitySnapshot).map(([facilityId, update]) => {
          const record: {
            user_id: string
            facility_id: string
            updated_at: string
            current_level?: number
            production_mode?: number | null
            assigned_monster_id?: string | null
            assigned_monster_ids?: (string | null)[]
            last_collected_at?: string
          } = {
            user_id: userId,
            facility_id: facilityId,
            updated_at: new Date().toISOString()
          }

          // 1. Level: Update 우선 -> Store fallback -> 0
          if (update.level !== undefined) {
            record.current_level = update.level
          } else {
            record.current_level = currentFacilities[facilityId] || 0
          }

          // 2. Production Mode: Update 우선 -> Store fallback -> null
          if (update.productionMode !== undefined) {
            record.production_mode = update.productionMode
          } else {
            record.production_mode = currentModes[facilityId] || null
          }

          // 3. Assignments: Update 우선 -> Store fallback -> Empty
          let finalAssignments: (string | null)[] = []
          if (update.assignedMonsterIds !== undefined) {
            finalAssignments = update.assignedMonsterIds
          } else {
            finalAssignments = currentAssignments[facilityId] || []
          }

          record.assigned_monster_ids = finalAssignments
          record.assigned_monster_id = finalAssignments[0] || null

          // 4. Last Collected: Update Only (Store value might be stale or not needed for sync unless changed)
          // 하지만 lastCollectedAt은 변경된 경우에만 update 객체에 들어오므로, 여기서는 update가 있으면 넣고 없으면 안 넣어도 됨?
          // 아니요, 배치 upsert에서 모양을 맞추는 게 안전합니다.
          // 다만 last_collected_at은 DB 트리거 등으로 자동 갱신되지 않으므로, 변경사항이 없으면 굳이 덮어쓸 필요는 없는데...
          // "Heterogeneous Batch" 문제를 피하려면 키를 포함시키는 게 좋습니다.
          // Store에서 가져올까요?
          if (update.lastCollectedAt !== undefined) {
            record.last_collected_at = new Date(update.lastCollectedAt).toISOString()
          }
          // Note: last_collected_at은 자주 바뀌므로, 포함되지 않은 레코드에 대해 null을 보내면 안 됩니다.
          // 하지만 Supabase upsert가 'undefined' 키는 무시하는데, '다른 레코드에 키가 있으면' null로 처리하는게 문제입니다.
          // 안전을 위해, 만약 lastCollectedAt이 없으면 현재 시간을 보내는 건 위험하고(수집 안했는데 갱신됨),
          // DB의 기존 값을 유지해야 합니다.
          // Upsert의 한계입니다.
          // => 해결책: last_collected_at은 별도로 분리하거나, 혹은 모든 레코드에 값을 채워야 합니다.
          // 하지만 lastCollectedAt을 Store에서 가져오기엔 정밀도가 중요할 수 있습니다.
          // 일단 할당 정보(중요 데이터)가 날아가는 걸 막는 게 최우선이므로, 할당 정보는 무조건 채워서 보냅니다.
          // last_collected_at은 nullable이고, 보통 수집 시점에 업데이트되므로, 다른 시설이 수집될 때 내 시설의 수집 시간이 null이 되면 안됩니다.
          // 따라서 store의 lastCollectedAt도 가져와서 넣어줍니다.
          if (update.lastCollectedAt === undefined) {
            const lastTime = facilityState.lastCollectedAt[`${facilityId}-${record.current_level}`]
            if (lastTime) {
              record.last_collected_at = new Date(lastTime).toISOString()
            }
          }

          return record
        })

        const { error: facilityError } = await supabase
          .from('player_facility')
          .upsert(facilityRecords, { onConflict: 'user_id,facility_id' })


        if (facilityError) {
          console.error('❌ [BatchSync] 시설 업데이트 실패 (Error Detail):', facilityError)
          console.error('❌ [BatchSync] Failed Records:', facilityRecords)
          throw facilityError
        }
        console.log('✅ [BatchSync] 시설 업데이트 성공')

      }

      onSyncCompleteRef.current?.(true, updatesSnapshot)
    } catch (error: unknown) {
      console.error('❌ [BatchSync] DB 동기화 실패:', error)
      const err = error as { code?: string }

      // 해결 불가능한 제약 조건 위반이 아닌 경우에만 데이터 복구
      if (err.code !== '23514' && err.code !== '23505') {
        Object.entries(updatesSnapshot).forEach(([k, v]) => {
          pendingUpdates.current[k] = (pendingUpdates.current[k] || 0) + v
        })
        Object.entries(facilitySnapshot).forEach(([k, v]) => {
          pendingFacilityUpdates.current[k] = {
            ...v,
            ...pendingFacilityUpdates.current[k]
          }
        })
        console.log('[BatchSync] 동기화 실패. 데이터가 펜딩 큐로 복구되었습니다.')
      } else {
        console.warn('⚠️ [BatchSync] 해결 불가능한 데이터 불일치 감지. 해당 배치를 폐기합니다.')
      }

      onSyncErrorRef.current?.(error as Error)
      onSyncCompleteRef.current?.(false, updatesSnapshot)
    } finally {
      isSyncing.current = false
      console.log('[BatchSync] 동기화 프로세스 종료.')
    }
  }, [userId])

  const forceSyncNow = useCallback(async () => {
    console.log('[BatchSync] 즉시 동기화 요청.')
    await syncToDatabase()
  }, [syncToDatabase])

  useEffect(() => {
    if (!userId) return
    const interval = setInterval(() => {
      syncToDatabase()
    }, batchInterval)
    return () => {
      clearInterval(interval)
      syncToDatabase()
    }
  }, [userId, batchInterval, syncToDatabase])

  return {
    queueUpdate,
    queueFacilityUpdate,
    queueProductionModeUpdate,
    queueAssignmentUpdate,
    queueLastCollectedUpdate,
    forceSyncNow,
    getPendingUpdates: () => ({ ...pendingUpdates.current }),
    getPendingFacilityUpdates: () => ({ ...pendingFacilityUpdates.current })
  }
}
