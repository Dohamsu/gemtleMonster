import { create } from 'zustand'
import { useAlchemyStore } from './useAlchemyStore'

export type CanvasView = 'map' | 'dungeon' | 'alchemy_workshop' | 'shop' | 'awakening' | 'monster_farm' | 'facility'

interface GameState {
    canvasView: CanvasView
    setCanvasView: (view: CanvasView) => void

    // Offline Processing State
    isOfflineProcessing: boolean
    setIsOfflineProcessing: (isProcessing: boolean) => void

    // UI State
    activeTab: 'facilities' | 'alchemy'
    setActiveTab: (tab: 'facilities' | 'alchemy') => void

    addResources: (rewards: Record<string, number>, source: string) => void
    sellResource: (resourceId: string, quantity: number, price: number) => Promise<boolean>

    // Recent Additions (for animations)
    recentAdditions: { id: string, facilityKey: string, resourceId: string, amount: number }[]
    setRecentAdditions: (additions: { id: string, facilityKey: string, resourceId: string, amount: number }[]) => void
    removeRecentAddition: (id: string) => void

    // Force Sync Callback (즉시 동기화 - 공동 사용)
    forceSyncCallback: (() => Promise<void>) | null
    setForceSyncCallback: (callback: (() => Promise<void>) | null) => void

    reset: () => void
}

export const useGameStore = create<GameState>((set) => ({
    canvasView: 'map',
    isOfflineProcessing: false,
    setIsOfflineProcessing: (isProcessing) => set({ isOfflineProcessing: isProcessing }),

    activeTab: 'facilities',
    setActiveTab: (activeTab) => set({ activeTab }),

    setCanvasView: (canvasView) => set({ canvasView }),

    addResources: (rewards, source) => {
        const { addMaterials } = useAlchemyStore.getState()
        const resourcesToAdd: Record<string, number> = {}

        Object.entries(rewards).forEach(([id, qty]) => {
            if (id !== 'empty') {
                resourcesToAdd[id] = qty
            }
        })

        // Delegate to AlchemyStore for actual data update
        addMaterials(resourcesToAdd)

        // UI Animation Logic (recentAdditions)
        const newAdditions = source
            ? Object.entries(rewards)
                .filter(([id]) => id !== 'empty')
                .map(([id, qty]) => ({
                    id: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                    facilityKey: source,
                    resourceId: id,
                    amount: qty
                }))
            : []

        set(state => ({
            recentAdditions: [...state.recentAdditions, ...newAdditions].slice(-50)
        }))

        if (newAdditions.length > 0) {
            setTimeout(() => {
                set(prev => ({
                    recentAdditions: prev.recentAdditions.filter(a => !newAdditions.some(na => na.id === a.id))
                }))
            }, 2000)
        }
    },

    recentAdditions: [],
    setRecentAdditions: (additions) => set({ recentAdditions: additions }),
    removeRecentAddition: (id) => set(state => ({
        recentAdditions: state.recentAdditions.filter(item => item.id !== id)
    })),

    sellResource: async (resourceId, quantity, _price) => {
        const { sellMaterial } = useAlchemyStore.getState()
        // Delegate to AlchemyStore
        // Note: AlchemyStore.sellMaterial handles both material and gold update logically
        return await sellMaterial(resourceId, quantity)
    },

    forceSyncCallback: null,
    setForceSyncCallback: (callback) => set({ forceSyncCallback: callback }),

    reset: () => set({
        canvasView: 'map',
        activeTab: 'facilities',
        isOfflineProcessing: false,
        recentAdditions: [],
        forceSyncCallback: null
    })
}))
