/* eslint-disable no-console */
import { useState } from 'react'
import { isMobileView } from '../utils/responsiveUtils'
import { getLocalizedError } from '../utils/errorUtils'

interface LoginScreenProps {
    onSignIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
    onSignUp: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
    onGuestLogin: () => Promise<{ success: boolean; error?: string }>
}

export default function LoginScreen({ onSignIn, onSignUp, onGuestLogin }: LoginScreenProps) {
    const [mode, setMode] = useState<'login' | 'signup'>('login')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const isMobile = isMobileView()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (!email.trim() || !password.trim()) {
            setError('이메일과 비밀번호를 입력해주세요.')
            return
        }

        if (mode === 'signup') {
            if (password !== confirmPassword) {
                setError('비밀번호가 일치하지 않습니다.')
                return
            }
            if (password.length < 6) {
                setError('비밀번호는 6자 이상이어야 합니다.')
                return
            }
        }

        setLoading(true)

        const result = mode === 'login'
            ? await onSignIn(email, password)
            : await onSignUp(email, password)

        setLoading(false)

        if (!result.success) {
            setError(getLocalizedError(result.error || '오류가 발생했습니다.'))
        }
    }

    const handleGuestLogin = async () => {
        setLoading(true)
        setError(null)
        const result = await onGuestLogin()
        setLoading(false)

        if (!result.success) {
            setError(getLocalizedError(result.error || '게스트 로그인 중 오류가 발생했습니다.'))
        }
    }

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
            fontFamily: "'Pretendard', 'Noto Sans KR', sans-serif",
            overflow: 'hidden'
        }}>
            {/* 배경 장식 요소 - Floating Blobs */}
            <div style={{
                position: 'absolute',
                top: '-10%',
                left: '-10%',
                width: '500px',
                height: '500px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(79, 70, 229, 0.2) 0%, rgba(0, 0, 0, 0) 70%)',
                filter: 'blur(60px)',
                zIndex: 0,
                animation: 'float 20s infinite ease-in-out'
            }} />
            <div style={{
                position: 'absolute',
                bottom: '-10%',
                right: '-10%',
                width: '600px',
                height: '600px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, rgba(0, 0, 0, 0) 70%)',
                filter: 'blur(80px)',
                zIndex: 0,
                animation: 'float 25s infinite ease-in-out reverse'
            }} />

            <div style={{
                position: 'relative',
                width: '100%',
                maxWidth: '420px',
                padding: isMobile ? '30px 20px' : '50px',
                margin: '20px',
                backgroundColor: 'rgba(30, 41, 59, 0.7)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                zIndex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: '24px'
            }}>
                {/* 로고/타이틀 영역 */}
                <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        margin: '0 auto 20px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 10px 25px -5px rgba(79, 70, 229, 0.5)',
                        position: 'relative',
                        overflow: 'hidden',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <img
                            src="/favicon.png"
                            alt="Logo"
                            style={{
                                width: '60%',
                                height: '60%',
                                objectFit: 'contain',
                                filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.5))'
                            }}
                        />
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.6) 45%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.6) 55%, transparent 70%)',
                            backgroundSize: '200% 100%',
                            transform: 'skewX(-20deg)',
                            filter: 'blur(5px)',
                            animation: 'shimmer 4s infinite linear'
                        }} />
                    </div>
                    <h1 style={{
                        margin: 0,
                        fontSize: '28px',
                        fontWeight: 800,
                        background: 'linear-gradient(to right, #fff, #cbd5e1)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        letterSpacing: '-0.5px'
                    }}>
                        Gemtle Monster
                    </h1>
                    <p style={{
                        margin: '8px 0 0',
                        fontSize: '15px',
                        color: '#94a3b8',
                        fontWeight: 500
                    }}>
                        방치형 연금술 RPG
                    </p>
                </div>

                {/* 탭 선택 */}
                <div style={{
                    display: 'flex',
                    backgroundColor: 'rgba(15, 23, 42, 0.5)',
                    borderRadius: '12px',
                    padding: '4px',
                    border: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                    {['login', 'signup'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => {
                                setMode(tab as 'login' | 'signup')
                                setError(null)
                            }}
                            style={{
                                flex: 1,
                                padding: '10px',
                                border: 'none',
                                borderRadius: '8px',
                                backgroundColor: mode === tab ? 'rgba(79, 70, 229, 0.9)' : 'transparent',
                                color: mode === tab ? '#fff' : '#94a3b8',
                                fontSize: '14px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                boxShadow: mode === tab ? '0 4px 12px rgba(79, 70, 229, 0.3)' : 'none'
                            }}
                        >
                            {tab === 'login' ? '로그인' : '회원가입'}
                        </button>
                    ))}
                </div>

                {/* 폼 */}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '13px', color: '#cbd5e1', fontWeight: 500, marginLeft: '4px' }}>
                            이메일
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="example@email.com"
                            style={{
                                width: '100%',
                                padding: '14px 16px',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '12px',
                                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                                color: '#fff',
                                fontSize: '15px',
                                boxSizing: 'border-box',
                                outline: 'none',
                                transition: 'border-color 0.2s, box-shadow 0.2s'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#6366f1'
                                e.target.style.boxShadow = '0 0 0 2px rgba(99, 102, 241, 0.2)'
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                                e.target.style.boxShadow = 'none'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '13px', color: '#cbd5e1', fontWeight: 500, marginLeft: '4px' }}>
                            비밀번호
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••"
                            style={{
                                width: '100%',
                                padding: '14px 16px',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '12px',
                                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                                color: '#fff',
                                fontSize: '15px',
                                boxSizing: 'border-box',
                                outline: 'none',
                                transition: 'border-color 0.2s, box-shadow 0.2s'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#6366f1'
                                e.target.style.boxShadow = '0 0 0 2px rgba(99, 102, 241, 0.2)'
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                                e.target.style.boxShadow = 'none'
                            }}
                        />
                    </div>

                    {mode === 'signup' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '13px', color: '#cbd5e1', fontWeight: 500, marginLeft: '4px' }}>
                                비밀번호 확인
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••"
                                style={{
                                    width: '100%',
                                    padding: '14px 16px',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '12px',
                                    backgroundColor: 'rgba(15, 23, 42, 0.6)',
                                    color: '#fff',
                                    fontSize: '15px',
                                    boxSizing: 'border-box',
                                    outline: 'none',
                                    transition: 'border-color 0.2s, box-shadow 0.2s'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#6366f1'
                                    e.target.style.boxShadow = '0 0 0 2px rgba(99, 102, 241, 0.2)'
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                                    e.target.style.boxShadow = 'none'
                                }}
                            />
                        </div>
                    )}

                    {error && (
                        <div style={{
                            padding: '14px',
                            backgroundColor: 'rgba(239, 68, 68, 0.15)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '12px',
                            color: '#fca5a5',
                            fontSize: '13px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <span style={{ fontSize: '16px' }}>⚠️</span>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '16px',
                            border: 'none',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                            color: '#fff',
                            fontSize: '16px',
                            fontWeight: 600,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.7 : 1,
                            marginTop: '8px',
                            transition: 'transform 0.1s, box-shadow 0.2s',
                            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.4)'
                        }}
                        onMouseDown={(e) => !loading && ((e.target as any).style.transform = 'scale(0.98)')}
                        onMouseUp={(e) => !loading && ((e.target as any).style.transform = 'scale(1)')}
                        onMouseEnter={(e) => !loading && ((e.target as any).style.boxShadow = '0 6px 16px rgba(79, 70, 229, 0.5)')}
                        onMouseLeave={(e) => !loading && ((e.target as any).style.boxShadow = '0 4px 12px rgba(79, 70, 229, 0.4)')}
                    >
                        {loading ? '처리 중...' : (mode === 'login' ? '시작하기' : '계정 생성')}
                    </button>
                </form>

                <div style={{ position: 'relative', margin: '10px 0' }}>
                    <div style={{ position: 'absolute', left: 0, top: '50%', width: '100%', height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                    <span style={{ position: 'relative', display: 'block', textAlign: 'center' }}>
                        <span style={{ background: '#1e293b', padding: '0 12px', color: '#64748b', fontSize: '13px', fontWeight: 500 }}>
                            또는
                        </span>
                    </span>
                </div>

                <button
                    onClick={handleGuestLogin}
                    disabled={loading}
                    style={{
                        width: '100%',
                        padding: '14px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        color: '#94a3b8',
                        fontSize: '14px',
                        fontWeight: 500,
                        cursor: loading ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => !loading && ((e.target as any).style.backgroundColor = 'rgba(255, 255, 255, 0.1)')}
                    onMouseLeave={(e) => !loading && ((e.target as any).style.backgroundColor = 'rgba(255, 255, 255, 0.05)')}
                >
                    게스트로 빠르게 시작
                </button>
            </div>
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    33% { transform: translateY(-30px) rotate(5deg); }
                    66% { transform: translateY(20px) rotate(-5deg); }
                }
                @keyframes shimmer {
                    0% { transform: translateX(-150%) skewX(-20deg); }
                    50%, 100% { transform: translateX(150%) skewX(-20deg); }
                }
            `}</style>
        </div>
    )
}
