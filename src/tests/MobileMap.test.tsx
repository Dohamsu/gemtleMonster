
/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import GameCanvas from '../game/GameCanvas'
import * as responsiveUtils from '../utils/responsiveUtils'

// Mock Hooks
const mockSetCanvasView = vi.fn()

// Mock Store
vi.mock('../store/useGameStore', () => ({
    useGameStore: (selector: any) => {
        const state = {
            canvasView: 'map',
            setCanvasView: mockSetCanvasView,
            facilities: { 'herb_farm': 1, 'mine': 1 },
            activeTab: 'facilities',
            resources: {},
            activeDungeon: null,
            battleState: null,
            setIsOfflineProcessing: vi.fn(),
            setFacilities: vi.fn()
        }
        return selector ? selector(state) : state
    }
}))

// Mock Alchemy Store (used in GameCanvas)
vi.mock('../store/useAlchemyStore', () => ({
    useAlchemyStore: (selector: any) => {
        const state = {
            loadAllData: vi.fn(),
            allRecipes: [],
            allMaterials: [],
            selectedRecipeId: null,
            selectedIngredients: {},
            isBrewing: false,
            setAlchemyContext: vi.fn(),
            playerAlchemy: { level: 1 },
            brewResult: { type: 'idle' }, // Fix: Provide valid brewResult
            selectRecipe: vi.fn(),
            addIngredient: vi.fn(),
            removeIngredient: vi.fn(),
            startBrewing: vi.fn(),
            startFreeFormBrewing: vi.fn(),
            autoFillIngredients: vi.fn()
        }
        return selector ? selector(state) : state
    }
}))

// Mock Unified Inventory
vi.mock('../hooks/useUnifiedInventory', () => ({
    useUnifiedInventory: () => ({
        materialCounts: {}
    })
}))

// Mock Auth
vi.mock('../hooks/useAuth', () => ({
    useAuth: () => ({
        user: { id: 'test-user' }
    })
}))

// Mock Alchemy Context
vi.mock('../hooks/useAlchemyContext', () => ({
    useAlchemyContext: () => null
}))

// Mock DungeonModal to verify isOpen prop
vi.mock('../ui/dungeon/DungeonModal', () => ({
    default: ({ isOpen }: { isOpen: boolean }) => (
        <div data-testid="dungeon-modal">{isOpen ? 'Open' : 'Closed'}</div>
    )
}))

// Mock Images
const mockImage = new Image()
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
mockImage.src = 'test-image.png'

vi.mock('../hooks/useCanvasImages', () => ({
    useCanvasImages: () => ({
        background: mockImage,
        herb_farm: mockImage,
        mine: mockImage,
        alchemy_workshop: mockImage,
        shop_building: mockImage,
        shop_interior: mockImage,
        cauldron_pixel: mockImage,
        dungeon_forest: mockImage,
        spirit_sanctum: mockImage,
        my_home: mockImage,
        blacksmith: { 1: mockImage },
        materials: {}
    })
}))

// Mock Canvas Context
// We need to mock getContext to return a spy/mock object to verify draw calls
const mockContext = {
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    drawImage: vi.fn(),
    fillText: vi.fn(),
    measureText: vi.fn(() => ({ width: 10 })),
    restore: vi.fn(),
    save: vi.fn(),
    scale: vi.fn(),
    translate: vi.fn(),
    filter: 'none'
} as unknown as CanvasRenderingContext2D

describe('Mobile Map UI', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        // Mock isMobileView to true
        vi.spyOn(responsiveUtils, 'isMobileView').mockReturnValue(true)

        // Mock HTMLCanvasElement.getContext
        vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => mockContext)
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('renders facilities on mobile map', () => {
        render(<GameCanvas offlineRewards={{ claimed: true, rewards: {}, elapsedTime: 0 }} />)

        // Verify drawImage was called for key facilities
        // We can't easily check coordinates exactly without complex matching, 
        // but we can ensure it drew the images we expect.

        // Herb Farm check
        expect(mockContext.drawImage).toHaveBeenCalledWith(
            expect.any(HTMLImageElement), // The mocked image
            expect.any(Number), // x
            expect.any(Number), // y
            128, // width
            128  // height
        )
    })

    it('navigates to Herb Farm page upon clicking its location', () => {
        const { container } = render(<GameCanvas offlineRewards={{ claimed: true, rewards: {}, elapsedTime: 0 }} />)
        const canvas = container.querySelector('canvas')

        if (!canvas) throw new Error('Canvas not found')

        // Mock width/height with writable: true to allow GameCanvas to update it
        Object.defineProperty(canvas, 'width', { value: 375, writable: true })
        Object.defineProperty(canvas, 'height', { value: 667, writable: true })
        Object.defineProperty(canvas, 'getBoundingClientRect', {
            value: () => ({ left: 0, top: 0, width: 375, height: 667 })
        })

        // Herb Farm: x = width * 0.3, y = height * 0.4
        const clickX = 375 * 0.3
        const clickY = 667 * 0.4

        fireEvent.click(canvas, { clientX: clickX, clientY: clickY })

        expect(mockSetCanvasView).toHaveBeenCalledWith('facility')
    })

    it('opens Dungeon modal upon clicking Dungeon entrance', () => {
        const { container } = render(<GameCanvas offlineRewards={{ claimed: true, rewards: {}, elapsedTime: 0 }} />)
        const canvas = container.querySelector('canvas')
        if (!canvas) throw new Error('Canvas not found')

        Object.defineProperty(canvas, 'width', { value: 375, writable: true })
        Object.defineProperty(canvas, 'height', { value: 667, writable: true })
        Object.defineProperty(canvas, 'getBoundingClientRect', {
            value: () => ({ left: 0, top: 0, width: 375, height: 667 })
        })

        // Dungeon: x = width * 0.15, y = height * 0.7
        const clickX = 375 * 0.15
        const clickY = 667 * 0.7

        fireEvent.click(canvas, { clientX: clickX, clientY: clickY })

        // Check if Dungeon Modal prop changed
        const modal = screen.getByTestId('dungeon-modal')
        expect(modal).toHaveTextContent('Open')
    })
})
