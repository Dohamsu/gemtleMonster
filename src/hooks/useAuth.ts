import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'



export function useAuth() {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const isInitializing = useRef(false)

    useEffect(() => {
        // Prevent duplicate execution (React StrictMode)
        if (isInitializing.current) return
        isInitializing.current = true

        const getDeviceId = () => {
            let deviceId = localStorage.getItem('gemtle_device_id')
            if (!deviceId) {
                deviceId = crypto.randomUUID()
                localStorage.setItem('gemtle_device_id', deviceId)
            }
            return deviceId
        }

        const signInWithDevice = async () => {
            const deviceId = getDeviceId()
            const email = `user_${deviceId}@gemtlemonster.com`
            const password = `pwd_${deviceId}` // Simple password based on device ID

            // Try to sign in
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (signInError) {
                // If sign in fails, try to sign up
                console.log('Device account not found, creating...')
                const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: undefined, // Disable email confirmation
                    }
                })

                if (signUpError) {
                    // If user already exists (race condition), try to sign in again
                    if (signUpError.message.includes('already registered')) {
                        console.log('User already exists, retrying sign in...')
                        const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
                            email,
                            password,
                        })

                        if (retryError) {
                            console.error('Failed to sign in after retry:', retryError)
                            setLoading(false)
                            return
                        }

                        setUser(retryData.user)
                        console.log('Signed in with device ID (retry):', retryData.user?.id)
                    } else {
                        console.error('Failed to create device account:', signUpError)
                        setLoading(false)
                        return
                    }
                } else {
                    setUser(signUpData.user)
                    console.log('Device account created:', signUpData.user?.id)
                }
            } else {
                setUser(signInData.user)
                console.log('Signed in with device ID:', signInData.user?.id)
            }

            setLoading(false)
        }

        // Check current session first
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                setUser(session.user)
                setLoading(false)
            } else {
                signInWithDevice()
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

