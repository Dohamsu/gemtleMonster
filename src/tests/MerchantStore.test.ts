import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useMerchantStore } from '../store/useMerchantStore'
import { act } from '@testing-library/react'
import * as alchemyApi from '../lib/alchemyApi'

// Mock alchemyApi
vi.mock('../lib/alchemyApi', () => ({
    addGold: vi.fn(),
    addMaterialToPlayer: vi.fn()
}))

// Mock useAlchemyStore
const mockSetState = vi.fn()
const mockGetState = vi.fn()

vi.mock('../store/useAlchemyStore', () => ({
    useAlchemyStore: {
        getState: () => mockGetState(),
        setState: (args: unknown) => mockSetState(args)
    }
}))

describe('useMerchantStore', () => {
    beforeEach(() => {
        // Reset store state
        useMerchantStore.setState({
            isVisible: false,
            expiryTime: null,
            inventory: [],
            isModalOpen: false
        })
        vi.clearAllMocks()
        vi.useFakeTimers()

        // Setup default mock responses for alchemy store
        mockGetState.mockReturnValue({
            userId: 'test-user',
            playerMaterials: { gold: 1000 }
        })
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('trySpawn should spawn merchant when random check passes', () => {
        const spyRandom = vi.spyOn(Math, 'random').mockReturnValue(0.01) // 1% < 5% chance

        act(() => {
            useMerchantStore.getState().trySpawn()
        })

        const state = useMerchantStore.getState()
        expect(state.isVisible).toBe(true)
        expect(state.inventory.length).toBe(3)
        expect(state.expiryTime).toBeGreaterThan(Date.now())

        spyRandom.mockRestore()
    })

    it('trySpawn should not spawn merchant when random check fails', () => {
        const spyRandom = vi.spyOn(Math, 'random').mockReturnValue(0.99) // 99% > 5% chance

        act(() => {
            useMerchantStore.getState().trySpawn()
        })

        const state = useMerchantStore.getState()
        expect(state.isVisible).toBe(false)
        expect(state.inventory).toHaveLength(0)

        spyRandom.mockRestore()
    })

    it('checkExpiry should despawn merchant if time expired', () => {
        // First spawn
        const spyRandom = vi.spyOn(Math, 'random').mockReturnValue(0.01)
        act(() => {
            useMerchantStore.getState().trySpawn()
        })
        spyRandom.mockRestore()

        expect(useMerchantStore.getState().isVisible).toBe(true)

        // Advance time by 11 minutes (duration is 10 mins)
        vi.advanceTimersByTime(11 * 60 * 1000)

        act(() => {
            // Need to manually trigger checkExpiry as it's not auto-called in test environment
            useMerchantStore.getState().checkExpiry()
        })

        const state = useMerchantStore.getState()
        expect(state.isVisible).toBe(false)
        expect(state.inventory).toHaveLength(0)
    })

    it('buyItem should succeed when player has enough gold', async () => {
        // Setup successful API calls
        (alchemyApi.addGold as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ error: null });
        (alchemyApi.addMaterialToPlayer as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ error: null });

        // Spawn merchant
        const spyRandom = vi.spyOn(Math, 'random').mockReturnValue(0.01)
        act(() => {
            useMerchantStore.getState().trySpawn()
        })
        spyRandom.mockRestore()

        const itemToBuy = useMerchantStore.getState().inventory[0]

        // Ensure player has enough gold
        mockGetState.mockReturnValue({
            userId: 'test-user',
            playerMaterials: { gold: itemToBuy.basePrice + 100, [itemToBuy.itemId]: 0 }
        })

        const result = await useMerchantStore.getState().buyItem(itemToBuy)

        expect(result).toBe(true)
        expect(alchemyApi.addGold).toHaveBeenCalledWith('test-user', -itemToBuy.basePrice)
        expect(alchemyApi.addMaterialToPlayer).toHaveBeenCalledWith('test-user', itemToBuy.itemId, 1)

        // Inventory should decrease by 1
        expect(useMerchantStore.getState().inventory).not.toContain(itemToBuy)
    })

    it('buyItem should fail when player has insufficient gold', async () => {
        // Spawn merchant
        const spyRandom = vi.spyOn(Math, 'random').mockReturnValue(0.01)
        act(() => {
            useMerchantStore.getState().trySpawn()
        })
        spyRandom.mockRestore()

        const itemToBuy = useMerchantStore.getState().inventory[0]

        // Ensure player has NOT enough gold
        mockGetState.mockReturnValue({
            userId: 'test-user',
            playerMaterials: { gold: itemToBuy.basePrice - 1 }
        })

        const result = await useMerchantStore.getState().buyItem(itemToBuy)

        expect(result).toBe(false)
        expect(alchemyApi.addGold).not.toHaveBeenCalled()
    })
})
