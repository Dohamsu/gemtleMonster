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
export function useBatchSync(
  userId: string | undefined,
  options: BatchSyncOptions = {}
) {
  const {
    batchInterval = 30000, // 기본 30초
    onSyncStart,
    onSyncComplete,
    onSyncError
  } = options

  // 누적된 변경사항 { materialId: totalQuantityChange }
  const pendingUpdates = useRef<Record<string, number>>({})
  // 누적된 시설 변경사항 { facilityId: newLevel }
  const pendingFacilityUpdates = useRef<Record<string, number>>({})
  const isSyncing = useRef(false)

  /**
   * 재료 변경사항을 큐에 추가
   */
  const queueUpdate = useCallback((materialId: string, quantity: number) => {
    pendingUpdates.current[materialId] =
      (pendingUpdates.current[materialId] || 0) + quantity

    console.log(`📦 [BatchSync] 재료 큐에 추가: ${materialId} ${quantity > 0 ? '+' : ''}${quantity} (누적: ${pendingUpdates.current[materialId]})`)
  }, [])

  /**
   * 시설 변경사항을 큐에 추가
   */
  const queueFacilityUpdate = useCallback((facilityId: string, newLevel: number) => {
    pendingFacilityUpdates.current[facilityId] = newLevel

    // console.log(`🏭 [BatchSync] 시설 큐에 추가: ${facilityId} -> Lv.${newLevel}`)
  }, [])

  // 콜백을 ref로 저장하여 안정적인 참조 유지
  const onSyncStartRef = useRef(onSyncStart)
  const onSyncCompleteRef = useRef(onSyncComplete)
  const onSyncErrorRef = useRef(onSyncError)

  useEffect(() => {
    onSyncStartRef.current = onSyncStart
    onSyncCompleteRef.current = onSyncComplete
    onSyncErrorRef.current = onSyncError
  }, [onSyncStart, onSyncComplete, onSyncError])

  /**
   * 누적된 변경사항을 DB에 저장
   */
  /**
   * 누적된 변경사항을 DB에 저장
   */
  const syncToDatabase = useCallback(async () => {
    if (!userId || isSyncing.current) return

    // 1. Snapshot pending updates
    const updatesSnapshot = { ...pendingUpdates.current }
    const facilitySnapshot = { ...pendingFacilityUpdates.current }

    // Check if anything to sync
    if (Object.keys(updatesSnapshot).length === 0 && Object.keys(facilitySnapshot).length === 0) {
      return
    }

    // 2. Clear queues immediately (optimistic clear to capture new updates during sync)
    pendingUpdates.current = {}
    pendingFacilityUpdates.current = {}

    isSyncing.current = true
    onSyncStartRef.current?.()

    try {
      // 3. 재료 동기화 (Batch RPC 사용)
      if (Object.keys(updatesSnapshot).length > 0) {
        const { error } = await supabase.rpc('batch_add_materials', {
          p_user_id: userId,
          p_materials: updatesSnapshot
        })

        if (error) throw error
      }

      // 4. 시설 동기화
      if (Object.keys(facilitySnapshot).length > 0) {
        const facilityRecords = Object.entries(facilitySnapshot).map(([facilityId, level]) => ({
          user_id: userId,
          facility_id: facilityId,
          current_level: level,
          updated_at: new Date().toISOString()
        }))

        const { error: facilityError } = await supabase
          .from('player_facility')
          .upsert(facilityRecords, { onConflict: 'user_id,facility_id' })

        if (facilityError) throw facilityError
      }

      // Success: Snapshots are successfully committed. 
      // Do nothing to pendingUpdates.current (it holds new changes)
      onSyncCompleteRef.current?.(true, updatesSnapshot)

    } catch (error: any) {
      console.error('❌ [BatchSync] DB 동기화 실패:', error)
      console.error('❌ [BatchSync] 실패한 재료 Payload:', JSON.stringify(updatesSnapshot, null, 2))
      console.error('❌ [BatchSync] 실패한 시설 Payload:', JSON.stringify(facilitySnapshot, null, 2))

      // 5. Error Handling & Restore
      // 제약 조건 위반 (예: 수량 부족) - 해결 불가능하므로 스냅샷 폐기
      if (error?.code === '23514' || error?.code === '23505') {
        console.warn('⚠️ [BatchSync] 해결 불가능한 데이터 불일치 감지. 배치를 폐기합니다.')
        // pendingUpdates.current는 건드리지 않음 (새로운 유효한 변경사항일 수 있으므로)

        // 데이터 불일치 시 전체 리로드 트리거 필요 (onSyncError에서 처리)
      } else {
        // 일시적인 오류 (네트워크 등) - 스냅샷을 다시 큐에 복구
        console.log('↩️ [BatchSync] 변경사항 복구 중...')

        // Merge updatesSnapshot back into pendingUpdates
        Object.entries(updatesSnapshot).forEach(([k, v]) => {
          pendingUpdates.current[k] = (pendingUpdates.current[k] || 0) + v
        })

        // Restore facilitySnapshot (prevent overwriting newer updates)
        Object.entries(facilitySnapshot).forEach(([k, v]) => {
          if (pendingFacilityUpdates.current[k] === undefined) {
            pendingFacilityUpdates.current[k] = v
          }
        })
      }

      onSyncErrorRef.current?.(error as Error)
      onSyncCompleteRef.current?.(false, updatesSnapshot)
    } finally {
      isSyncing.current = false
    }
  }, [userId]) // 콜백 의존성 제거

  /**
   * 즉시 동기화 (이벤트 기반 저장용)
   */
  const forceSyncNow = useCallback(async () => {
    // console.log('⚡ [BatchSync] 즉시 동기화 요청')
    await syncToDatabase()
  }, [syncToDatabase])

  /**
   * 주기적 배치 동기화
   */
  useEffect(() => {
    if (!userId) return

    // console.log(`⏰ [BatchSync] 배치 동기화 시작 (${batchInterval / 1000}초 간격)`)

    const interval = setInterval(() => {
      syncToDatabase()
    }, batchInterval)

    return () => {
      // console.log('🛑 [BatchSync] 배치 동기화 중단')
      clearInterval(interval)
      // 컴포넌트 언마운트 시 마지막 동기화
      syncToDatabase()
    }
  }, [userId, batchInterval, syncToDatabase])

  return {
    queueUpdate,
    queueFacilityUpdate,
    forceSyncNow,
    getPendingUpdates: () => ({ ...pendingUpdates.current }),
    getPendingFacilityUpdates: () => ({ ...pendingFacilityUpdates.current })
  }
}
