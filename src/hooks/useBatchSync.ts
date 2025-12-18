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
  assignedMonsterId?: string | null
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

  const queueAssignmentUpdate = useCallback((facilityId: string, monsterId: string | null) => {
    pendingFacilityUpdates.current[facilityId] = {
      ...pendingFacilityUpdates.current[facilityId],
      assignedMonsterId: monsterId
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
        const facilityRecords = Object.entries(facilitySnapshot).map(([facilityId, update]) => {
          const record: any = {
            user_id: userId,
            facility_id: facilityId,
            updated_at: new Date().toISOString()
          }
          if (update.level !== undefined) record.current_level = update.level
          if (update.assignedMonsterId !== undefined) record.assigned_monster_id = update.assignedMonsterId
          return record
        })

        const { error: facilityError } = await supabase
          .from('player_facility')
          .upsert(facilityRecords, { onConflict: 'user_id,facility_id' })

        if (facilityError) throw facilityError
      }

      onSyncCompleteRef.current?.(true, updatesSnapshot)

    } catch (error: unknown) {
      console.error('❌ [BatchSync] DB 동기화 실패:', error)
      const err = error as { code?: string }

      if (err.code === '23514' || err.code === '23505') {
        console.warn('⚠️ [BatchSync] 해결 불가능한 데이터 불일치 감지. 배치를 폐기합니다.')
      } else {
        Object.entries(updatesSnapshot).forEach(([k, v]) => {
          pendingUpdates.current[k] = (pendingUpdates.current[k] || 0) + v
        })
        Object.entries(facilitySnapshot).forEach(([k, v]) => {
          pendingFacilityUpdates.current[k] = {
            ...v,
            ...pendingFacilityUpdates.current[k]
          }
        })
      }

      onSyncErrorRef.current?.(error as Error)
      onSyncCompleteRef.current?.(false, updatesSnapshot)
    } finally {
      isSyncing.current = false
    }
  }, [userId])

  const forceSyncNow = useCallback(async () => {
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
    queueAssignmentUpdate,
    forceSyncNow,
    getPendingUpdates: () => ({ ...pendingUpdates.current }),
    getPendingFacilityUpdates: () => ({ ...pendingFacilityUpdates.current })
  }
}
