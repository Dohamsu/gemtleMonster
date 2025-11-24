import { create } from 'zustand'
import type { AlchemyState } from '../types/alchemy'

interface ResourceAddition {
    id: string
    resourceId: string
    amount: number
    timestamp: number
    facilityKey?: string // e.g., "herb_farm-1"
}

interface GameState {
    player: {
        x: number
        y: number
        health: number
    }
    inventory: string[]
    resources: Record<string, number>
    facilities: Record<string, number>
    lastCollectedAt: Record<string, number>
    recentAdditions: ResourceAddition[]

    setPlayerPosition: (x: number, y: number) => void
    addItem: (item: string) => void
    setResources: (resources: Record<string, number>) => void
    setFacilities: (facilities: Record<string, number>) => void
    addResources: (resources: Record<string, number>, facilityKey?: string) => void
    setLastCollectedAt: (facilityId: string, timestamp: number) => void
    removeRecentAddition: (id: string) => void
    sellResource: (resourceId: string, amount: number, pricePerUnit: number) => void
    upgradeFacility: (facilityId: string, cost: Record<string, number>) => void

    // Alchemy Actions
    alchemyState: AlchemyState
    selectRecipe: (recipeId: string | null) => void
    addIngredient: (materialId: string, count: number) => void
    startBrewing: () => void
    completeBrewing: (resultMonsterId: string, count: number, materialsUsed: Record<string, number>) => void
    cancelBrewing: () => void
}

export const useGameStore = create<GameState>((set) => ({
    player: { x: 0, y: 0, health: 100 },
    inventory: [],
    resources: { gold: 1000 }, // Initial gold for testing
    facilities: { herb_farm: 1 }, // Initial facility
    lastCollectedAt: {},
    recentAdditions: [],
    alchemyState: {
        selectedRecipeId: null,
        selectedIngredients: {},
        isBrewing: false,
        brewStartTime: null,
        brewProgress: 0
    },

    setPlayerPosition: (x, y) => set((state) => ({ player: { ...state.player, x, y } })),
    addItem: (item) => set((state) => ({ inventory: [...state.inventory, item] })),

    setResources: (resources) => set({ resources }),
    setFacilities: (facilities) => set({ facilities }),

    addResources: (newResources, facilityKey) => set((state) => {
        const updatedResources = { ...state.resources }
        let updatedAdditions = [...state.recentAdditions]
        const newAdditions: ResourceAddition[] = []

        for (const [id, amount] of Object.entries(newResources)) {
            updatedResources[id] = (updatedResources[id] || 0) + amount

            // Remove any existing addition for this resource (overwrite)
            updatedAdditions = updatedAdditions.filter(a => a.resourceId !== id)

            const additionId = `${id}-${Date.now()}-${Math.random()}`
            const addition: ResourceAddition = {
                id: additionId,
                resourceId: id,
                amount,
                timestamp: Date.now(),
                facilityKey,
            }
            newAdditions.push(addition)

            // Auto-remove after 2 seconds
            setTimeout(() => {
                set((s) => ({
                    recentAdditions: s.recentAdditions.filter(a => a.id !== additionId)
                }))
            }, 2000)
        }

        return {
            resources: updatedResources,
            recentAdditions: [...updatedAdditions, ...newAdditions]
        }
    }),

    removeRecentAddition: (id) => set((state) => ({
        recentAdditions: state.recentAdditions.filter(a => a.id !== id)
    })),

    setLastCollectedAt: (facilityId, timestamp) => set((state) => ({
        lastCollectedAt: {
            ...state.lastCollectedAt,
            [facilityId]: timestamp
        }
    })),

    sellResource: (resourceId: string, amount: number, pricePerUnit: number) => set((state) => {
        const currentAmount = state.resources[resourceId] || 0
        if (currentAmount < amount) return state // Not enough resources

        const earnings = amount * pricePerUnit
        return {
            resources: {
                ...state.resources,
                [resourceId]: currentAmount - amount,
                gold: (state.resources.gold || 0) + earnings
            }
        }
    }),

    upgradeFacility: (facilityId, cost) => set((state) => {
        // Check if affordable
        for (const [res, amount] of Object.entries(cost)) {
            if ((state.resources[res] || 0) < amount) {
                return state; // Not enough resources
            }
        }

        // Deduct resources
        const newResources = { ...state.resources };
        for (const [res, amount] of Object.entries(cost)) {
            newResources[res] -= amount;
        }

        return {
            resources: newResources,
            facilities: {
                ...state.facilities,
                [facilityId]: (state.facilities[facilityId] || 0) + 1
            }
        };
    }),

    // Alchemy Actions Implementation
    selectRecipe: (recipeId) => set((state) => ({
        alchemyState: {
            ...state.alchemyState,
            selectedRecipeId: recipeId,
            selectedIngredients: {}, // Reset ingredients when selecting new recipe
            isBrewing: false,
            brewProgress: 0
        }
    })),

    addIngredient: (materialId, count) => set((state) => {
        const currentCount = state.alchemyState.selectedIngredients[materialId] || 0
        const newCount = Math.max(0, currentCount + count)
        return {
            alchemyState: {
                ...state.alchemyState,
                selectedIngredients: {
                    ...state.alchemyState.selectedIngredients,
                    [materialId]: newCount
                }
            }
        }
    }),

    startBrewing: () => set((state) => ({
        alchemyState: {
            ...state.alchemyState,
            isBrewing: true,
            brewStartTime: Date.now(),
            brewProgress: 0
        }
    })),

    completeBrewing: (resultMonsterId, count, materialsUsed) => set((state) => {
        const newResources = { ...state.resources }

        // Deduct materials
        for (const [matId, amount] of Object.entries(materialsUsed)) {
            newResources[matId] = Math.max(0, (newResources[matId] || 0) - amount)
        }

        // Add monster (stored as resource for now)
        newResources[resultMonsterId] = (newResources[resultMonsterId] || 0) + count

        return {
            resources: newResources,
            alchemyState: {
                ...state.alchemyState,
                isBrewing: false,
                brewStartTime: null,
                brewProgress: 0,
                selectedIngredients: {} // Reset ingredients after brew
            }
        }
    }),

    cancelBrewing: () => set((state) => ({
        alchemyState: {
            ...state.alchemyState,
            isBrewing: false,
            brewStartTime: null,
            brewProgress: 0
        }
    }))
}))
