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

    // console.log(`📦 [BatchSync] 재료 큐에 추가: ${materialId} +${quantity}`)
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
  const syncToDatabase = useCallback(async () => {
    if (!userId || isSyncing.current) return

    const updates = { ...pendingUpdates.current }
    const facilityUpdates = { ...pendingFacilityUpdates.current }
    const materialUpdateCount = Object.keys(updates).length
    const facilityUpdateCount = Object.keys(facilityUpdates).length

    if (materialUpdateCount === 0 && facilityUpdateCount === 0) {
      // console.log('📭 [BatchSync] 저장할 변경사항 없음')
      return
    }

    isSyncing.current = true
    // console.log(`🔄 [BatchSync] DB 동기화 시작... (재료: ${materialUpdateCount}개, 시설: ${facilityUpdateCount}개)`)
    onSyncStartRef.current?.()

    try {
      // 1. 재료 동기화 (Batch RPC 사용)
      if (Object.keys(updates).length > 0) {
        // console.log(`🔄 [BatchSync] 재료 일괄 저장 중...`, updates)
        const { error } = await supabase.rpc('batch_add_materials', {
          p_user_id: userId,
          p_materials: updates
        })

        if (error) throw error
      }

      // 2. 시설 동기화
      for (const [facilityId, level] of Object.entries(facilityUpdates)) {
        await supabase
          .from('player_facility')
          .update({ current_level: level })
          .eq('user_id', userId)
          .eq('facility_id', facilityId)
      }

      // 성공 시 큐 초기화
      pendingUpdates.current = {}
      pendingFacilityUpdates.current = {}
      // console.log(`✅ [BatchSync] DB 동기화 완료!`, { materials: updates, facilities: facilityUpdates })
      onSyncCompleteRef.current?.(true, updates)
    } catch (error) {
      console.error('❌ [BatchSync] DB 동기화 실패:', error)
      onSyncErrorRef.current?.(error as Error)
      onSyncCompleteRef.current?.(false, updates)
      // 실패 시에도 큐를 유지해서 다음 배치에 재시도
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
