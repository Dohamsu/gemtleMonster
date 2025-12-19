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

  const queueLastCollectedUpdate = useCallback((facilityId: string, time: number) => {
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
        const filteredUpdates = Object.entries(updatesSnapshot).reduce((acc, [k, v]) => {
          if (k !== 'empty' && v !== 0) {
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
        const facilityRecords = Object.entries(facilitySnapshot).map(([facilityId, update]) => {
          const record: {
            user_id: string
            facility_id: string
            updated_at: string
            current_level?: number
            production_mode?: number
            assigned_monster_id?: string | null
            assigned_monster_ids?: (string | null)[]
            last_collected_at?: string
          } = {
            user_id: userId,
            facility_id: facilityId,
            updated_at: new Date().toISOString()
          }
          if (update.level !== undefined) record.current_level = update.level
          if (update.productionMode !== undefined) record.production_mode = update.productionMode
          if (update.assignedMonsterIds !== undefined) {
            record.assigned_monster_ids = update.assignedMonsterIds
            // 하위 호환성을 위해 첫 번째 슬롯의 몬스터를 assigned_monster_id에도 저장
            record.assigned_monster_id = update.assignedMonsterIds[0] || null
          }
          if (update.lastCollectedAt !== undefined) {
            record.last_collected_at = new Date(update.lastCollectedAt).toISOString()
          }
          return record
        })

        const { error: facilityError } = await supabase
          .from('player_facility')
          .upsert(facilityRecords, { onConflict: 'user_id,facility_id' })

        if (facilityError) {
          console.error('❌ [BatchSync] 시설 업데이트 실패:', facilityError)
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
