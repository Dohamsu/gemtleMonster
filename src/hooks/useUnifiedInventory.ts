import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAlchemyStore } from '../store/useAlchemyStore'
import { useGameStore } from '../store/useGameStore'

export function useUnifiedInventory() {
  const {
    allMaterials,
    playerMaterials,
    loadMaterials,
    loadPlayerData,
    userId,
    forceSyncCallback,
  } = useAlchemyStore()
  const resources = useGameStore(state => state.resources)
  const setResources = useGameStore(state => state.setResources)

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

  // 두 스토어의 재료 카운트를 통합 (alchemy 우선)
  const materialCounts = useMemo(
    () => ({
      ...resources,
      ...playerMaterials,
    }),
    [playerMaterials, resources]
  )

  // alchemy 재료 변경 시 gameStore.resources도 최신 값으로 덮어 동기화 유지
  useEffect(() => {
    const current = useGameStore.getState().resources
    const merged = { ...current, ...playerMaterials }

    const hasDifference =
      Object.keys(merged).some((key) => merged[key] !== current[key]) ||
      Object.keys(current).some((key) => !(key in merged))

    if (hasDifference) {
      setResources(merged)
    }
  }, [playerMaterials, setResources])

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
