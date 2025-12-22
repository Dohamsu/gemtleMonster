/* eslint-disable @typescript-eslint/no-explicit-any, no-console */
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

import { describe, it, expect, vi } from 'vitest'
import ShopPage from '../ui/shop/ShopPage'

// Hoist mocks to ensure they are available in vi.mock factory
const { mockBuyItem, mockGameStoreState, mockAlchemyStoreState, mockShopStoreState, mockUnifiedInventoryState } = vi.hoisted(() => {
    const mockBuyItem = vi.fn()
    const mockAddMaterials = vi.fn()
    const mockRemoveGold = vi.fn()
    const mockAddGold = vi.fn()
    const mockRemoveMaterials = vi.fn()

    const mockGameStoreState = {
        resources: { gold: 1000 },
        inventory: { 'herb_common': 5 },
        addMaterials: mockAddMaterials,
        removeGold: mockRemoveGold,
        addGold: mockAddGold,
        removeMaterials: mockRemoveMaterials,
        user: { id: 'test-user' },
        setResources: vi.fn(),
        setCanvasView: vi.fn()
    }

    const mockAlchemyStoreState = {
        addMaterial: vi.fn(),
        consumeMaterials: vi.fn(),
        materialCounts: { 'herb_common': 5 },
        playerMaterials: { 'herb_common': 5 }
    }

    const mockShopStoreState = {
        shopItems: [
            { id: 'potion_red', quantity: 10, price: 100 },
        ],
        nextRefreshTime: Date.now() + 10000,
        buyItem: mockBuyItem,
        checkRefresh: vi.fn()
    }

    const mockUnifiedInventoryState = {
        materialCounts: { 'herb_common': 5, 'potion_red': 0 }
    }

    return {
        mockBuyItem,
        mockAddMaterials,
        mockRemoveGold,
        mockAddGold,
        mockRemoveMaterials,
        mockGameStoreState,
        mockAlchemyStoreState,
        mockShopStoreState,
        mockUnifiedInventoryState
    }
})

vi.mock('../store/useGameStore', () => ({
    useGameStore: (selector: any) => {
        return selector ? selector(mockGameStoreState) : mockGameStoreState
    }
}))

// Mock Shop items
vi.mock('../data/shopData', () => ({
    SHOP_ITEMS: [
        { id: 'potion_red', materialId: 'potion_red', price: 100, isSoldOut: false },
        { id: 'herb_common', materialId: 'herb_common', price: 10, isSoldOut: false }
    ]
}))

// Mock Alchemy Store
vi.mock('../store/useAlchemyStore', () => ({
    useAlchemyStore: () => mockAlchemyStoreState
}))

// Mock Shop Store
vi.mock('../store/useShopStore', () => ({
    BASE_SELL_PRICES: { 'N': 10 },
    useShopStore: () => mockShopStoreState
}))

// Mock Unified Inventory Hook if needed
vi.mock('../hooks/useUnifiedInventory', () => ({
    useUnifiedInventory: () => mockUnifiedInventoryState
}))

// Mock Alchemy Data for item names/prices
vi.mock('../data/alchemyData', () => ({
    MATERIALS: {
        'potion_red': { name: '빨간 포션', sellPrice: 50, rarity: 'N', iconUrl: 'path/to/icon' },
        'herb_common': { name: '일반 약초', sellPrice: 5, rarity: 'N', iconUrl: 'path/to/icon' }
    }
}))

describe('Shop Feature', () => {


    it('buys an item successfully', async () => {
        render(<ShopPage />)

        // Verify "Buy" tab is active (default)
        // Check if an item exists (wait for useEffect)
        expect(await screen.findByText('빨간 포션')).toBeInTheDocument()

        // Find purchase button. Assuming there is a "Purchase" or "구매" button enabled
        const purchaseButtons = screen.getAllByRole('button', { name: /Purchase|구매/i })
        // First button should be for the first item '빨간 포션'
        const purchaseButton = purchaseButtons[0]

        // const user = userEvent.setup()
        // await user.click(purchaseButton)
        fireEvent.click(purchaseButton)

        // Assert store update
        // TODO: Fix mock assertion. mockBuyItem is not being tracked correctly in test environment.
        await waitFor(() => {
            expect(mockBuyItem).toHaveBeenCalled()
        })
    })

    it('sells an item successfully', async () => {
        render(<ShopPage />)
        // Switch to Sell tab
        // There should be a tab/button for 'Sell' or '판매'
        const sellTab = screen.getByText(/Sell|판매/i)
        fireEvent.click(sellTab)

        // Check for '일반 약초' in sell list (we have 5 in inventory)
        expect(await screen.findByText('일반 약초')).toBeInTheDocument()
    })
})

// Add logging to verify call
mockBuyItem.mockImplementation((...args) => {
    console.log('mockBuyItem called with:', args)
})
