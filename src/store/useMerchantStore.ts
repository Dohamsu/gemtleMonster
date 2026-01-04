import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { MERCHANT_ITEMS_POOL, type MerchantItem } from '../data/merchantData'
import { useAlchemyStore } from './useAlchemyStore'
import * as alchemyApi from '../lib/alchemyApi'

interface MerchantState {
    isVisible: boolean
    isModalOpen: boolean
    expiryTime: number | null
    inventory: MerchantItem[]

    // Actions
    trySpawn: () => void
    despawn: () => void
    openModal: () => void
    closeModal: () => void
    checkExpiry: () => void
    buyItem: (item: MerchantItem) => Promise<boolean>
}

// Configuration
const SPAWN_CHANCE = 0.05 // 5% chance
const DURATION_MS = 10 * 60 * 1000 // 10 minutes

export const useMerchantStore = create<MerchantState>()(
    persist(
        (set, get) => ({
            isVisible: false,
            isModalOpen: false,
            expiryTime: null,
            inventory: [],

            trySpawn: () => {
                const { isVisible } = get()
                if (isVisible) return // Already spawned

                // Roll for spawn
                if (Math.random() < SPAWN_CHANCE) {
                    // Generate Inventory (3 items)
                    const pool = [...MERCHANT_ITEMS_POOL]
                    const selectedItems: MerchantItem[] = []

                    for (let i = 0; i < 3; i++) {
                        // Weighted random selection could be better, but simple random for now
                        // or implemented if needed.
                        const totalWeight = pool.reduce((acc, item) => acc + item.rarityWeight, 0)
                        let random = Math.random() * totalWeight

                        for (const item of pool) {
                            random -= item.rarityWeight
                            if (random <= 0) {
                                selectedItems.push(item)
                                break
                            }
                        }
                    }

                    set({
                        isVisible: true,
                        expiryTime: Date.now() + DURATION_MS,
                        inventory: selectedItems
                    })
                }
            },

            despawn: () => {
                set({ isVisible: false, isModalOpen: false, expiryTime: null, inventory: [] })
            },

            openModal: () => set({ isModalOpen: true }),
            closeModal: () => set({ isModalOpen: false }),

            checkExpiry: () => {
                const { isVisible, expiryTime } = get()
                if (isVisible && expiryTime && Date.now() > expiryTime) {
                    get().despawn()
                }
            },

            buyItem: async (item: MerchantItem) => {
                const alchemyStore = useAlchemyStore.getState()
                const currentGold = alchemyStore.playerMaterials['gold'] || 0

                if (currentGold < item.basePrice) return false
                if (!alchemyStore.userId) return false

                try {
                    // Optimistic update or wait for server? Stick to Shop pattern: Server first
                    await Promise.all([
                        alchemyApi.addGold(alchemyStore.userId, -item.basePrice),
                        alchemyApi.addMaterialToPlayer(alchemyStore.userId, item.itemId, 1)
                    ])

                    // Update local state
                    useAlchemyStore.setState({
                        playerMaterials: {
                            ...alchemyStore.playerMaterials,
                            gold: currentGold - item.basePrice,
                            [item.itemId]: (alchemyStore.playerMaterials[item.itemId] || 0) + 1
                        }
                    })

                    // Remove bought item or keep it? 
                    // Usually merchant items are limited quantity (1). Remove it from inventory.
                    const { inventory } = get()
                    set({ inventory: inventory.filter(i => i !== item) }) // Remove specifically this instance

                    return true
                } catch (e) {
                    console.error('Merchant purchase failed:', e)
                    return false
                }
            }
        }),
        {
            name: 'merchant-storage',
            partialize: (state) => ({
                isVisible: state.isVisible,
                expiryTime: state.expiryTime,
                inventory: state.inventory
            })
        }
    )
)
