import { useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'

interface MaterialUpdate {
  materialId: string
  quantity: number
}

interface BatchSyncOptions {
  batchInterval?: number // 배치 저장 간격 (ms)
  onSyncStart?: () => void
  onSyncComplete?: (success: boolean, updates: Record<string, number>) => void
  onSyncError?: (error: Error) => void
}

/**
 * 재료 변경사항을 배치로 모아서 주기적으로 DB에 저장하는 Hook
 *
 * @param userId - 사용자 ID
 * @param options - 배치 동기화 옵션
 * @returns queueUpdate: 변경사항 추가, forceSyncNow: 즉시 동기화
 */
export function useBatchMaterialSync(
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
  const isSyncing = useRef(false)

  /**
   * 변경사항을 큐에 추가
   */
  const queueUpdate = useCallback((materialId: string, quantity: number) => {
    pendingUpdates.current[materialId] =
      (pendingUpdates.current[materialId] || 0) + quantity

    console.log(`📦 [BatchSync] 큐에 추가: ${materialId} +${quantity}`)
    console.log(`📊 [BatchSync] 현재 큐:`, pendingUpdates.current)
  }, [])

  /**
   * 누적된 변경사항을 DB에 저장
   */
  const syncToDatabase = useCallback(async () => {
    if (!userId || isSyncing.current) return

    const updates = { ...pendingUpdates.current }
    const updateCount = Object.keys(updates).length

    if (updateCount === 0) {
      console.log('📭 [BatchSync] 저장할 변경사항 없음')
      return
    }

    isSyncing.current = true
    console.log(`🔄 [BatchSync] DB 동기화 시작... (${updateCount}개 재료)`)
    onSyncStart?.()

    try {
      // 각 재료별로 add_materials RPC 호출
      const promises = Object.entries(updates).map(([materialId, quantity]) => {
        if (quantity === 0) return Promise.resolve()

        return supabase.rpc('add_materials', {
          p_user_id: userId,
          p_material_id: materialId,
          p_quantity: quantity
        })
      })

      await Promise.all(promises)

      // 성공 시 큐 초기화
      pendingUpdates.current = {}
      console.log(`✅ [BatchSync] DB 동기화 완료!`, updates)
      onSyncComplete?.(true, updates)
    } catch (error) {
      console.error('❌ [BatchSync] DB 동기화 실패:', error)
      onSyncError?.(error as Error)
      onSyncComplete?.(false, updates)
      // 실패 시에도 큐를 유지해서 다음 배치에 재시도
    } finally {
      isSyncing.current = false
    }
  }, [userId, onSyncStart, onSyncComplete, onSyncError])

  /**
   * 즉시 동기화 (이벤트 기반 저장용)
   */
  const forceSyncNow = useCallback(async () => {
    console.log('⚡ [BatchSync] 즉시 동기화 요청')
    await syncToDatabase()
  }, [syncToDatabase])

  /**
   * 주기적 배치 동기화
   */
  useEffect(() => {
    if (!userId) return

    console.log(`⏰ [BatchSync] 배치 동기화 시작 (${batchInterval / 1000}초 간격)`)

    const interval = setInterval(() => {
      syncToDatabase()
    }, batchInterval)

    return () => {
      console.log('🛑 [BatchSync] 배치 동기화 중단')
      clearInterval(interval)
      // 컴포넌트 언마운트 시 마지막 동기화
      syncToDatabase()
    }
  }, [userId, batchInterval, syncToDatabase])

  return {
    queueUpdate,
    forceSyncNow,
    getPendingUpdates: () => ({ ...pendingUpdates.current })
  }
}
