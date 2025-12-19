/* eslint-disable no-console, @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useGameStore } from '../store/useGameStore'
import { useAlchemyStore } from '../store/useAlchemyStore'
import type { User } from '@supabase/supabase-js'

interface AuthState {
    user: User | null
    loading: boolean
    error: string | null
    isGuest: boolean
}

const MIN_LOADING_TIME = 2000

export function useAuth() {
    const [state, setState] = useState<AuthState>({
        user: null,
        loading: true,
        error: null,
        isGuest: false
    })
    const isInitializing = useRef(false)

    // 익명 사용자인지 확인 (Supabase의 is_anonymous 필드 또는 기존 가상 이메일 체크)
    const checkIsGuest = (user: User | null): boolean => {
        if (!user) return false
        // Supabase Anonymous Auth 사용 시 is_anonymous 필드 확인
        if ((user as any).is_anonymous === true) return true
        // 기존 가상 이메일 방식도 호환성을 위해 유지
        if (user.email?.endsWith('@gemtlemonster.com')) return true
        return false
    }

    // 이메일/비밀번호로 로그인
    const signIn = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        const startTime = Date.now()
        // Note: 여기서 loading 상태를 변경하지 않음 - LoginScreen에서 자체 loading 상태를 관리함
        // setState를 호출하면 App.tsx가 로딩 화면으로 전환되어 LoginScreen이 언마운트됨

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            })

            if (error) {
                // 에러 시 바로 반환 - 내부 상태 변경 없음
                return { success: false, error: error.message }
            }

            const elapsed = Date.now() - startTime
            if (elapsed < MIN_LOADING_TIME) {
                await new Promise(resolve => setTimeout(resolve, MIN_LOADING_TIME - elapsed))
            }

            // 성공 시에만 user 상태 업데이트
            setState({
                user: data.user,
                loading: false,
                error: null,
                isGuest: checkIsGuest(data.user)
            })
            return { success: true }
        } catch (err: any) {
            const errorMsg = err.message || '로그인 중 오류가 발생했습니다.'
            return { success: false, error: errorMsg }
        }
    }, [])

    // 이메일/비밀번호로 회원가입
    const signUp = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        const startTime = Date.now()
        // Note: 여기서 loading 상태를 변경하지 않음 - LoginScreen에서 자체 loading 상태를 관리함

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: undefined // 이메일 인증 비활성화
                }
            })

            if (error) {
                // 에러 시 바로 반환 - 내부 상태 변경 없음
                return { success: false, error: error.message }
            }

            // Supabase에서 이메일 인증이 필요한 경우 user가 있지만 확인되지 않음
            // 여기서는 이메일 인증을 비활성화했으므로 바로 로그인됨
            if (data.user) {
                const elapsed = Date.now() - startTime
                if (elapsed < MIN_LOADING_TIME) {
                    await new Promise(resolve => setTimeout(resolve, MIN_LOADING_TIME - elapsed))
                }

                // 성공 시에만 user 상태 업데이트
                setState({
                    user: data.user,
                    loading: false,
                    error: null,
                    isGuest: false
                })
                return { success: true }
            }

            return { success: true }
        } catch (err: any) {
            const errorMsg = err.message || '회원가입 중 오류가 발생했습니다.'
            return { success: false, error: errorMsg }
        }
    }, [])

    // 게스트로 로그인 (Anonymous Auth 사용)
    const signInAsGuest = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
        const startTime = Date.now()
        setState(prev => ({ ...prev, loading: true, error: null }))

        try {
            // Supabase Anonymous Sign-in 사용
            const { data, error } = await supabase.auth.signInAnonymously()

            if (error) {
                console.error('Anonymous sign-in error:', error)
                setState(prev => ({ ...prev, loading: false, error: error.message }))
                return { success: false, error: error.message }
            }

            const elapsed = Date.now() - startTime
            if (elapsed < MIN_LOADING_TIME) {
                await new Promise(resolve => setTimeout(resolve, MIN_LOADING_TIME - elapsed))
            }

            setState({
                user: data.user,
                loading: false,
                error: null,
                isGuest: true
            })
            console.log('익명 로그인 성공:', data.user?.id)
            return { success: true }
        } catch (err: any) {
            const errorMsg = err.message || '게스트 로그인 중 오류가 발생했습니다.'
            setState(prev => ({ ...prev, loading: false, error: errorMsg }))
            return { success: false, error: errorMsg }
        }
    }, [])

    // 게스트 계정에 이메일/비밀번호 연결
    const linkEmailToAccount = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        if (!state.user) {
            return { success: false, error: '로그인되어 있지 않습니다.' }
        }

        try {
            // Supabase updateUser로 이메일 변경
            const { error: updateError } = await supabase.auth.updateUser({
                email,
                password
            })

            if (updateError) {
                return { success: false, error: updateError.message }
            }

            setState(prev => ({
                ...prev,
                isGuest: false
            }))

            console.log('계정 연결 성공:', email)
            return { success: true }
        } catch (err: any) {
            return { success: false, error: err.message || '계정 연결 중 오류가 발생했습니다.' }
        }
    }, [state.user])

    // 로그아웃
    const signOut = useCallback(async (): Promise<void> => {
        // Clear Local State
        useGameStore.getState().reset()
        useAlchemyStore.getState().reset()

        await supabase.auth.signOut()
        setState({
            user: null,
            loading: false,
            error: null,
            isGuest: false
        })
    }, [])

    // 초기화: 세션 확인
    useEffect(() => {
        if (isInitializing.current) return
        isInitializing.current = true

        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                setState({
                    user: session.user,
                    loading: false,
                    error: null,
                    isGuest: checkIsGuest(session.user)
                })
            } else {
                // 세션이 없으면 로그인 화면으로 (loading: false로 설정)
                setState(prev => ({ ...prev, loading: false }))
            }
        })

        // 인증 상태 변경 리스너
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setState(prev => ({
                ...prev,
                user: session?.user ?? null,
                isGuest: checkIsGuest(session?.user ?? null)
            }))
        })

        return () => subscription.unsubscribe()
    }, [])

    return {
        user: state.user,
        loading: state.loading,
        error: state.error,
        isGuest: state.isGuest,
        signIn,
        signUp,
        signOut,
        signInAsGuest,
        linkEmailToAccount
    }
}
