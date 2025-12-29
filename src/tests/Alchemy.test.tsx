/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import AlchemyWorkshopOverlay from '../ui/alchemy/AlchemyWorkshopOverlay'

// Mock DB Recipes data
vi.mock('../data/alchemyData', () => ({
    MATERIALS: {
        'herb_common': { name: '일반 약초' },
        'potion_red': { name: '빨간 포션' }
    },
    DB_RECIPES_SEED: [
        {
            id: 'recipe_potion_red',
            resultItemId: 'potion_red',
            ingredients: [{ materialId: 'herb_common', quantity: 1 }],
            craftTimeSec: 0, // Instant for test
            baseSuccessRate: 100
        }
    ]
}))

// Mock Shop items to avoid import errors if Alchemy uses shared data
vi.mock('../data/shopData', () => ({
    SHOP_ITEMS: []
}))

// Mock Store
const mockSetAlchemyState = vi.fn()
const mockRemoveMaterials = vi.fn()

vi.mock('../store/useAlchemyStore', () => ({
    useAlchemyStore: (selector: any) => {
        const state = {
            alchemyState: 'idle',
            setAlchemyState: mockSetAlchemyState,
            selectedRecipe: {
                id: 'recipe_potion_red',
                resultItemId: 'potion_red',
                ingredients: [{ materialId: 'herb_common', quantity: 1 }],
                baseSuccessRate: 100
            },
            setSelectedRecipe: vi.fn(),
            isBrewing: false,
            setIsBrewing: vi.fn(),
            hasIngredients: () => true // Always enough ingredients
        }
        return selector ? selector(state) : state
    }
}))

vi.mock('../store/useGameStore', () => ({
    useGameStore: (selector: any) => {
        const state = {
            inventory: { 'herb_common': 10 },
            removeMaterials: mockRemoveMaterials,
            addMaterials: vi.fn(),
            gold: 1000,
            removeGold: vi.fn()
        }
        return selector ? selector(state) : state
    }
}))


describe('Alchemy Feature', () => {
    it('selects a recipe and attempts to craft', () => {
        const dummyProps: any = {
            recipes: [{ id: 'recipe_potion_red', resultItemId: 'potion_red', ingredients: [], type: 'ITEM', requiredAlchemyLevel: 1 }],
            materials: [],
            playerMaterials: {},
            playerRecipes: {},
            selectedRecipeId: 'recipe_potion_red',
            selectedIngredients: {},
            isBrewing: false,
            playerAlchemy: { level: 1 }, // Ensure level matches
            onSelectRecipe: vi.fn(),
            onAddIngredient: vi.fn(),
            onStartBrewing: vi.fn(),
            onStartFreeFormBrewing: vi.fn(),
            alchemyContext: null
        }
        render(<AlchemyWorkshopOverlay {...dummyProps} />)

        // Find the "Brew" or "Start" button
        // Text is "🧪 연금술 시작" or similar
        const brewButton = screen.getByRole('button', { name: /연금술|제작|Start|Brew/i })

        fireEvent.click(brewButton)

        // Check if onStartBrewing prop was called (since overlay delegates to parent)
        expect(dummyProps.onStartBrewing).toHaveBeenCalled()
        // Or if it was instant
        // expect(mockRemoveMaterials).toHaveBeenCalled()
    })
})
