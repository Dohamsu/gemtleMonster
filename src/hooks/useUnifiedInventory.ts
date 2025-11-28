import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAlchemyStore } from '../store/useAlchemyStore'

export function useUnifiedInventory() {
  const {
    allMaterials,
    playerMaterials,
    loadMaterials,
    loadPlayerData,
    userId,
    forceSyncCallback,
  } = useAlchemyStore()
  // resources는 useAlchemyStore.loadPlayerData()에서만 동기화되므로 여기서는 구독하지 않음

  const [loading, setLoading] = useState(true)

  const refreshInventory = useCallback(async () => {
    if (!userId) return

    setLoading(true)
    try {
      if (forceSyncCallback) {
        await forceSyncCallback()
      }
      await loadPlayerData(userId)
    } finally {
      setLoading(false)
    }
  }, [forceSyncCallback, loadPlayerData, userId])

  // 보유 재료 마스터 데이터가 없으면 한 번만 로드
  useEffect(() => {
    if (allMaterials.length === 0) {
      setLoading(true)
      loadMaterials()
        .catch((error) => {
          console.error('[useUnifiedInventory] 재료 목록 로딩 실패:', error)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [allMaterials.length, loadMaterials])

  // 로그인 이후 초기 동기화가 비어있다면 강제 수행
  useEffect(() => {
    if (userId && Object.keys(playerMaterials).length === 0) {
      refreshInventory()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  /**
   * Single Source of Truth: playerMaterials를 우선 소스로 사용
   * resources는 UI 애니메이션용 읽기 전용 캐시로만 사용
   */
  const materialCounts = useMemo(() => {
    // playerMaterials가 우선 (DB의 공식 소스)
    // resources는 UI 애니메이션용이므로 보조로만 사용 (최근 획득 애니메이션 등)
    return {
      ...playerMaterials,
      // resources에서만 있고 playerMaterials에 없는 항목은 UI 애니메이션용이므로 제외하지 않음
      // 하지만 playerMaterials가 있으면 우선 사용
    }
  }, [playerMaterials])

  /**
   * 주의: resources 동기화는 useAlchemyStore.loadPlayerData()에서 수행됩니다.
   * useUnifiedInventory에서는 동기화를 수행하지 않아 무한 루프를 방지합니다.
   * resources는 UI 애니메이션용이므로, addResources에서만 업데이트됩니다.
   */

  const legacyResources = useMemo(() => {
    const legacyKeys = ['stone', 'ore_magic', 'gem_fragment', 'training_token']
    const legacy: Record<string, number> = {}

    legacyKeys.forEach((key) => {
      if (materialCounts[key]) {
        legacy[key] = materialCounts[key]
      }
    })

    if (typeof materialCounts.gold !== 'undefined') {
      legacy.gold = materialCounts.gold
    }

    return legacy
  }, [materialCounts])

  return {
    materials: allMaterials,
    materialCounts,
    legacyResources,
    refreshInventory,
    loading,
  }
}
