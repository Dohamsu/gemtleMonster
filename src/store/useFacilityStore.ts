/* eslint-disable no-console */
import { create } from 'zustand'
import { useAlchemyStore } from './useAlchemyStore'
import { useGameStore } from './useGameStore'

interface FacilityState {
    facilities: Record<string, number>
    assignedMonsters: Record<string, (string | null)[]>
    productionModes: Record<string, number>
    lastCollectedAt: Record<string, number>

    // Sync Callbacks
    batchFacilitySyncCallback: ((id: string, level: number) => void) | null
    batchProductionModeSyncCallback: ((id: string, mode: number) => void) | null
    batchLastCollectedSyncCallback: ((id: string, time: number) => void) | null
    batchAssignmentSyncCallback: ((facilityId: string, monsterIds: (string | null)[]) => void) | null

    // Actions
    setFacilities: (facilities: Record<string, number>) => void
    assignMonster: (facilityId: string, monsterId: string | null, slotIndex: number) => void
    setAssignedMonsters: (assignments: Record<string, (string | null)[]>) => void
    setProductionMode: (facilityId: string, level: number) => void
    setProductionModes: (modes: Record<string, number>) => void
    setLastCollectedAt: (id: string, time: number) => void
    setLastCollectedAtBulk: (times: Record<string, number>) => void

    setBatchFacilitySyncCallback: (callback: ((id: string, level: number) => void) | null) => void
    setBatchProductionModeSyncCallback: (callback: ((id: string, mode: number) => void) | null) => void
    setBatchLastCollectedSyncCallback: (callback: ((id: string, time: number) => void) | null) => void
    setBatchAssignmentSyncCallback: (callback: ((facilityId: string, monsterIds: (string | null)[]) => void) | null) => void

    upgradeFacility: (facilityId: string, cost: Record<string, number>) => Promise<void>

    reset: () => void
}

export const useFacilityStore = create<FacilityState>((set, get) => ({
    facilities: { 'herb_farm': 1, 'monster_farm': 1 },
    assignedMonsters: {},
    productionModes: {},
    lastCollectedAt: {},

    batchFacilitySyncCallback: null,
    batchProductionModeSyncCallback: null,
    batchLastCollectedSyncCallback: null,
    batchAssignmentSyncCallback: null,

    setFacilities: (facilities) => set({ facilities }),

    assignMonster: (facilityId, monsterId, slotIndex) => set(state => {
        let currentAssignments = state.assignedMonsters[facilityId]

        if (typeof currentAssignments === 'string') {
            currentAssignments = [currentAssignments]
        } else if (!Array.isArray(currentAssignments)) {
            currentAssignments = []
        }

        const newAssignments = [...currentAssignments]
        while (newAssignments.length <= slotIndex) {
            newAssignments.push(null)
        }
        newAssignments[slotIndex] = monsterId

        if (state.batchAssignmentSyncCallback) {
            state.batchAssignmentSyncCallback(facilityId, newAssignments)
            const forceSync = useGameStore.getState().forceSyncCallback
            if (forceSync) forceSync()
        }

        return {
            assignedMonsters: { ...state.assignedMonsters, [facilityId]: newAssignments }
        }
    }),

    setAssignedMonsters: (assignedMonsters) => set({ assignedMonsters }),

    setProductionMode: (facilityId, level) => set(state => {
        if (state.batchProductionModeSyncCallback) {
            state.batchProductionModeSyncCallback(facilityId, level)
            const forceSync = useGameStore.getState().forceSyncCallback
            if (forceSync) forceSync()
        }
        return {
            productionModes: { ...state.productionModes, [facilityId]: level }
        }
    }),

    setProductionModes: (modes) => set({ productionModes: modes }),

    setLastCollectedAt: (id, time) => set(state => {
        if (state.batchLastCollectedSyncCallback) {
            state.batchLastCollectedSyncCallback(id, time)
        }
        return {
            lastCollectedAt: { ...state.lastCollectedAt, [id]: time }
        }
    }),

    setLastCollectedAtBulk: (times) => set({ lastCollectedAt: times }),

    setBatchFacilitySyncCallback: (callback) => set({ batchFacilitySyncCallback: callback }),
    setBatchProductionModeSyncCallback: (callback) => set({ batchProductionModeSyncCallback: callback }),
    setBatchLastCollectedSyncCallback: (callback) => set({ batchLastCollectedSyncCallback: callback }),
    setBatchAssignmentSyncCallback: (callback) => set({ batchAssignmentSyncCallback: callback }),

    upgradeFacility: async (facilityId, cost) => {
        const state = get()
        const gameStore = useGameStore.getState()
        const { consumeMaterials, playerMaterials } = useAlchemyStore.getState()

        const goldCost = cost['gold'] || 0
        const materialCost = { ...cost }
        delete materialCost['gold']

        const currentGold = playerMaterials['gold'] || 0
        if (currentGold < goldCost) return

        for (const [matId, amount] of Object.entries(materialCost)) {
            const currentAmount = playerMaterials[matId] || 0
            if (currentAmount < amount) return
        }

        if (goldCost > 0) {
            // Server Sync
            try {
                // We need userId. Assuming it's available in AlchemyStore
                const userId = useAlchemyStore.getState().userId
                if (userId) {
                    await import('../lib/alchemyApi').then(api => api.addGold(userId, -goldCost))
                }

                // Local Update
                const currentMaterials = useAlchemyStore.getState().playerMaterials
                useAlchemyStore.setState({
                    playerMaterials: {
                        ...currentMaterials,
                        gold: (currentMaterials['gold'] || 0) - goldCost
                    }
                })
            } catch (e) {
                console.error('Failed to deduct gold for upgrade:', e)
                return // Should probably stop here if gold processing failed
            }
        }

        if (Object.keys(materialCost).length > 0) {
            await consumeMaterials(materialCost)
        }

        const newFacilities = { ...state.facilities }
        const newLevel = (newFacilities[facilityId] || 0) + 1
        newFacilities[facilityId] = newLevel

        set({ facilities: newFacilities })

        const now = Date.now()
        for (let l = 1; l <= newLevel; l++) {
            const key = `${facilityId}-${l}`
            if (!state.lastCollectedAt[key]) {
                get().setLastCollectedAt(key, now)
            }
        }

        if (state.batchFacilitySyncCallback) {
            state.batchFacilitySyncCallback(facilityId, newLevel)
            if (gameStore.forceSyncCallback) gameStore.forceSyncCallback()
        }
    },

    reset: () => set({
        facilities: { 'herb_farm': 1, 'monster_farm': 1 },
        assignedMonsters: {},
        productionModes: {},
        lastCollectedAt: {},
        batchFacilitySyncCallback: null,
        batchProductionModeSyncCallback: null,
        batchLastCollectedSyncCallback: null,
        batchAssignmentSyncCallback: null,
    })
}))
