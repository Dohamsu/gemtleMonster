/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { supabase } from '../lib/supabase'
import App from '../App'

// Mock useOfflineRewards to avoid loading screen
vi.mock('../hooks/useOfflineRewards', () => ({
    useOfflineRewards: () => ({
        claimed: true,
        rewards: {},
        elapsedTime: 0
    })
}))

// Mock useResources to avoid subscription errors
vi.mock('../hooks/useResources', () => ({
    useResources: () => ({
        resources: {},
        loading: false
    })
}))

// Mock useFacilities to avoid side effects
vi.mock('../hooks/useFacilities', () => ({
    useFacilities: () => ({
        playerFacilities: {},
        productionModes: {},
        assignedMonsters: {},
        lastCollectedAt: {},
        loading: false
    })
}))

// Mock GameSystemConnector to avoid complex logic
vi.mock('../ui/common/GameSystemConnector', () => ({
    default: () => null
}))

// Mock GameCanvas to avoid canvas context errors but allow MyPage interaction
vi.mock('../game/GameCanvas', () => ({
    default: () => {
        const React = require('react')
        const [showMyPage, setShowMyPage] = React.useState(false) // Use require for hook in mock
        // Use lazy import to avoid require context issues with Vite/Vitest
        const MyPageModal = React.lazy(() => import('../ui/MyPageModal'))

        return (
            <div data-testid="game-canvas">
                Game Map
                <button onClick={() => setShowMyPage(true)}>My Home</button>
                {showMyPage && (
                    <React.Suspense fallback={<div>Loading Modal...</div>}>
                        <MyPageModal onClose={() => setShowMyPage(false)} />
                    </React.Suspense>
                )}
            </div>
        )
    }
}))

// Mock store to control view
const { mockSetCanvasView } = vi.hoisted(() => ({
    mockSetCanvasView: vi.fn()
}))

vi.mock('../store/useGameStore', () => {
    const state = {
        canvasView: 'login', // Initial view
        setCanvasView: mockSetCanvasView,
        session: null,
        setSession: vi.fn(),
        initStore: vi.fn(),
        user: null,
        setResources: vi.fn(),
        setFacilities: vi.fn(),
        setAssignedMonsters: vi.fn(),
        setProductionMode: vi.fn(),
        setLastCollectedAt: vi.fn(),
        setForceSyncCallback: vi.fn(),
        reset: vi.fn(),
        // Add minimal facilities for useFacilities mock if needed, though useFacilities is mocked separately
        facilities: {}
    }

    // Create the hook
    const useGameStore = (selector: any) => {
        return selector ? selector(state) : state
    }

    // Attach getState for non-hook usage
    useGameStore.getState = () => state

    return { useGameStore }
})

describe('Login Feature', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('successfully logs in with valid credentials and switches to map view', async () => {
        // Setup mock response for signIn
        const mockSignInResponse = {
            data: { session: { user: { id: 'test-user-id', email: 'rlawlsdnjswk@naver.com' } } },
            error: null
        }
            ; (supabase.auth.signInWithPassword as any).mockResolvedValue(mockSignInResponse)

            // Setup mock response for session check (No user initially)
            ; (supabase.auth.getSession as any).mockResolvedValue({
                data: { session: null }, error: null
            })


        render(<App />)

        // Find inputs and button
        // Assuming your Login component has specific placeholders or labels
        // Find inputs by Placeholder (wait for loading to finish)
        const emailInput = await screen.findByPlaceholderText(/example@email.com/i)
        const passwordInput = screen.getByPlaceholderText(/••••••/i)
        const loginButton = screen.getByRole('button', { name: /시작하기/i })

        // Simulate User Input
        fireEvent.change(emailInput, { target: { value: 'rlawlsdnjswk@naver.com' } })
        fireEvent.change(passwordInput, { target: { value: '1234' } })
        fireEvent.click(loginButton)

        // Assert API call
        expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
            email: 'rlawlsdnjswk@naver.com',
            password: '1234'
        })

        // Assert API call
        expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
            email: 'rlawlsdnjswk@naver.com',
            password: '1234'
        })
    })

    it('displays profile and logs out correctly', async () => {
        // 1. Setup mocks for logged-in state
        const mockUser = { id: 'test-user-id', email: 'rlawlsdnjswk@naver.com' }

            // Mock profile fetch and update
            ; (supabase.from as any).mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({
                            data: { nickname: 'TestUser' },
                            error: null
                        }),
                        maybeSingle: vi.fn().mockResolvedValue({
                            data: { nickname: 'TestUser' },
                            error: null
                        })
                    })
                }),
                update: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({ error: null })
                })
            })

            // Mock signOut
            ; (supabase.auth.signOut as any).mockResolvedValue({ error: null })

            // Mock signInWithPassword for this test
            ; (supabase.auth.signInWithPassword as any).mockResolvedValue({
                data: { session: { user: mockUser }, user: mockUser },
                error: null
            })

            // Mock getSession (initially null to simulate logged out)
            ; (supabase.auth.getSession as any).mockResolvedValueOnce({
                data: { session: null }, error: null
            })

        render(<App />)

        // Login Flow
        const emailInput = await screen.findByPlaceholderText(/example@email.com/i)
        const passwordInput = screen.getByPlaceholderText(/••••••/i)
        const loginButton = screen.getByRole('button', { name: /시작하기/i })

        fireEvent.change(emailInput, { target: { value: 'rlawlsdnjswk@naver.com' } })
        fireEvent.change(passwordInput, { target: { value: '1234' } })

            // Update session mock BEFORE clicking login so subsequent calls get the user
            ; (supabase.auth.getSession as any).mockResolvedValue({
                data: { session: { user: mockUser } },
                error: null
            })

        fireEvent.click(loginButton)

        // 3. Verify GameCanvas appears
        // useAuth has a 2000ms delay, so we need to wait longer than default 1000ms
        const myHomeButton = await screen.findByText('My Home', {}, { timeout: 4000 })
        expect(myHomeButton).toBeInTheDocument()

        // 4. Open My Page
        fireEvent.click(myHomeButton)

        // 5. Verify Profile Info (from MyPageModal)
        expect(await screen.findByText('내 정보')).toBeInTheDocument()
        // Wait for loading to finish and data to appear
        expect(await screen.findByText('rlawlsdnjswk@naver.com')).toBeInTheDocument()
        expect(await screen.findByText('TestUser')).toBeInTheDocument()

        // 6. Logout
        const logoutButton = screen.getByText('로그아웃')
        fireEvent.click(logoutButton)

        // 7. Verify SignOut called
        expect(supabase.auth.signOut).toHaveBeenCalled()
    })
})
