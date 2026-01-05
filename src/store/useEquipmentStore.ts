import { create } from 'zustand'
import type { Equipment, PlayerEquipment } from '../types/equipment'
import * as equipmentApi from '../lib/equipmentApi'

interface EquipmentState {
    // Master Data
    allEquipment: Equipment[]

    // Player Data
    playerEquipment: PlayerEquipment[]
    userId: string | null

    // Status
    isLoading: boolean
    error: string | null

    // Actions
    loadAllData: (userId: string) => Promise<void>
    loadEquipment: () => Promise<void>
    loadPlayerEquipment: (userId: string) => Promise<void>

    equipItem: (playerEquipmentId: string, playerMonsterId: string) => Promise<void>

    unequipItem: (playerEquipmentId: string) => Promise<void>

    // Debug
    debugAddEquipment: () => Promise<void>

    reset: () => void
}

export const useEquipmentStore = create<EquipmentState>((set, get) => ({
    allEquipment: [],
    playerEquipment: [],
    userId: null,
    isLoading: false,
    error: null,

    loadAllData: async (userId: string) => {
        set({ userId, isLoading: true, error: null })
        try {
            await Promise.all([
                get().loadEquipment(),
                get().loadPlayerEquipment(userId)
            ])
        } catch (error: any) {
            set({ error: error.message || 'Failed to load equipment data' })
        } finally {
            set({ isLoading: false })
        }
    },

    loadEquipment: async () => {
        try {
            const equipment = await equipmentApi.getAllEquipment()
            set({ allEquipment: equipment })
        } catch (error) {
            console.error('Failed to load equipment master data', error)
        }
    },

    loadPlayerEquipment: async (userId: string) => {
        try {
            const playerEquipment = await equipmentApi.getPlayerEquipment(userId)
            set({ playerEquipment })
        } catch (error) {
            console.error('Failed to load player equipment', error)
        }
    },

    equipItem: async (playerEquipmentId: string, playerMonsterId: string) => {
        try {
            const result = await equipmentApi.equipItem(playerEquipmentId, playerMonsterId)
            console.log('Equip result:', result)

            // Reload player equipment to reflect changes (optimistic update could be better, but simple for now)
            const { userId } = get()
            if (userId) {
                await get().loadPlayerEquipment(userId)
            }
        } catch (error: any) {
            set({ error: error.message || 'Equip failed' })
        }
    },

    unequipItem: async (playerEquipmentId: string) => {
        try {
            await equipmentApi.unequipItem(playerEquipmentId)

            const { userId } = get()
            if (userId) {
                await get().loadPlayerEquipment(userId)
            }
        } catch (error: any) {
            set({ error: error.message || 'Unequip failed' })
        }
    },

    debugAddEquipment: async () => {
        try {
            const { userId } = get()
            if (!userId) return

            await equipmentApi.addTestEquipment(userId)
            await get().loadPlayerEquipment(userId)
            alert('테스트용 장비가 지급되었습니다!')
        } catch (error: any) {
            set({ error: error.message || 'Debug add equipment failed' })
        }
    },

    reset: () => set({
        userId: null,
        playerEquipment: [],
        error: null,
        isLoading: false
    })
}))
