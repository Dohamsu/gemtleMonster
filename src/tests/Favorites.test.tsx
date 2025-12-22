
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import { useAlchemyStore } from '../store/useAlchemyStore'

describe('Favorites Feature', () => {

    beforeEach(() => {
        // Reset store state and localStorage before each test
        act(() => {
            useAlchemyStore.setState({
                favoriteRecipes: new Set(),
                favoriteMaterials: new Set()
            })
        })
        localStorage.clear()
        vi.restoreAllMocks()
    })

    it('toggles favorite recipe correctly', () => {
        const { toggleFavoriteRecipe } = useAlchemyStore.getState()
        const recipeId = 'recipe_1'

        act(() => {
            toggleFavoriteRecipe(recipeId)
        })

        expect(useAlchemyStore.getState().favoriteRecipes.has(recipeId)).toBe(true)

        act(() => {
            toggleFavoriteRecipe(recipeId)
        })

        expect(useAlchemyStore.getState().favoriteRecipes.has(recipeId)).toBe(false)
    })

    it('toggles favorite material correctly', () => {
        const { toggleFavoriteMaterial } = useAlchemyStore.getState()
        const materialId = 'material_1'

        act(() => {
            toggleFavoriteMaterial(materialId)
        })

        expect(useAlchemyStore.getState().favoriteMaterials.has(materialId)).toBe(true)

        act(() => {
            toggleFavoriteMaterial(materialId)
        })

        expect(useAlchemyStore.getState().favoriteMaterials.has(materialId)).toBe(false)
    })

    it('persists favorite recipes to localStorage', () => {
        const { toggleFavoriteRecipe } = useAlchemyStore.getState()
        const recipeId = 'recipe_persistent'

        act(() => {
            toggleFavoriteRecipe(recipeId)
        })

        const stored = localStorage.getItem('favoriteRecipes')
        expect(stored).toBeTruthy()
        expect(JSON.parse(stored!)).toContain(recipeId)
    })

    it('loads favorites from localStorage on data load', () => {
        // Mock localStorage setup
        const recipeId = 'saved_recipe'
        localStorage.setItem('favoriteRecipes', JSON.stringify([recipeId]))

        // Trigger loadFavorites manually or simulate the initial load
        // Since loadFavorites is part of the store actions:
        const { loadFavorites } = useAlchemyStore.getState()

        act(() => {
            loadFavorites()
        })

        expect(useAlchemyStore.getState().favoriteRecipes.has(recipeId)).toBe(true)
    })
})
