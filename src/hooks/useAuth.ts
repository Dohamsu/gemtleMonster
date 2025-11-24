import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

const TEST_EMAIL = 'test@example.com'
const TEST_PASSWORD = 'testpassword123'

export function useAuth() {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const signInTestUser = async () => {
            // Try to sign in with test account
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                email: TEST_EMAIL,
                password: TEST_PASSWORD,
            })

            if (signInError) {
                // If sign in fails, try to sign up
                console.log('Test account not found, creating...')
                const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                    email: TEST_EMAIL,
                    password: TEST_PASSWORD,
                    options: {
                        emailRedirectTo: undefined, // Disable email confirmation
                    }
                })

                if (signUpError) {
                    console.error('Failed to create test account:', signUpError)
                    setLoading(false)
                    return
                }

                setUser(signUpData.user)
                console.log('Test account created:', signUpData.user?.id)
            } else {
                setUser(signInData.user)
                console.log('Signed in as test user:', signInData.user?.id)
            }

            setLoading(false)
        }

        // Check current session first
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                setUser(session.user)
                setLoading(false)
            } else {
                signInTestUser()
            }
        })

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
        })

        return () => subscription.unsubscribe()
    }, [])

    return { user, loading }
}

