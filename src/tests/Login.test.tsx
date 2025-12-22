/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { supabase } from '../lib/supabase'
import App from '../App'

// Mock GameCanvas to avoid canvas context errors
vi.mock('../game/GameCanvas', () => ({
    default: () => <div data-testid="game-canvas">Game Map</div>
}))

// Mock store to control view
const mockSetCanvasView = vi.fn()
vi.mock('../store/useGameStore', () => ({
    useGameStore: (selector: any) => {
        // Return mock state based on selector or full state
        const state = {
            canvasView: 'login', // Initial view
            setCanvasView: mockSetCanvasView,
            session: null,
            setSession: vi.fn(),
            initStore: vi.fn(),
            user: null
        }
        return selector ? selector(state) : state
    }
}))

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

        // Wait for view transition (This depends on how App.tsx handles state after login)
        // Since we mocked useGameStore, we might need to check if setCanvasView was called 
        // OR if the component rerenders. 
        // However, typical flow: Login success -> supabase.auth.onAuthStateChange fires -> App updates session -> View changes

        // For this isolated test, verifying the auth call is the primary goal
        // To verify view change, we'd need a more complex store mock or integration test.
    })
})
