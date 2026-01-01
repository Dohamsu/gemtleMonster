import { useState, useEffect, useRef } from 'react'
import { getLocalizedError } from '../utils/errorUtils'

interface AccountLinkModalProps {
    onLink: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
    onClose: () => void
}

export default function AccountLinkModal({ onLink, onClose }: AccountLinkModalProps) {
    const [email, setEmail] = useState('')
    const modalRef = useRef<HTMLDivElement>(null)

    // 모달이 열렸을 때 배경 스크롤 방지 (모바일 터치 스크롤 포함)
    useEffect(() => {
        const originalOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'

        // 모바일 터치 스크롤 방지
        const preventTouchScroll = (e: TouchEvent) => {
            // 모달 내부에서 발생한 터치는 허용
            if (modalRef.current && modalRef.current.contains(e.target as Node)) {
                return
            }
            e.preventDefault()
        }

        document.addEventListener('touchmove', preventTouchScroll, { passive: false })

        return () => {
            document.body.style.overflow = originalOverflow
            document.removeEventListener('touchmove', preventTouchScroll)
        }
    }, [])
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (!email.trim() || !password.trim()) {
            setError('이메일과 비밀번호를 입력해주세요.')
            return
        }

        if (password !== confirmPassword) {
            setError('비밀번호가 일치하지 않습니다.')
            return
        }

        if (password.length < 6) {
            setError('비밀번호는 6자 이상이어야 합니다.')
            return
        }

        // 이메일 형식 간단 검사
        if (!email.includes('@') || email.endsWith('@gemtlemonster.com')) {
            setError('유효한 이메일 주소를 입력해주세요.')
            return
        }

        setLoading(true)
        const result = await onLink(email, password)
        setLoading(false)

        if (result.success) {
            setSuccess(true)
            setTimeout(() => {
                onClose()
            }, 2000)
        } else {
            setError(getLocalizedError(result.error || '계정 연결 중 오류가 발생했습니다.'))
        }
    }

    return (
        <div className="animate-fade-in" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            fontFamily: "'Noto Sans KR', sans-serif"
        }}>
            <div
                ref={modalRef}
                className="animate-slide-up"
                style={{
                    width: '100%',
                    maxWidth: '400px',
                    padding: '32px',
                    margin: '20px',
                    backgroundColor: '#1a1a2e',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
                }}>
                {/* 헤더 */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '24px'
                }}>
                    <h2 style={{
                        margin: 0,
                        fontSize: '20px',
                        fontWeight: 700,
                        color: '#fff'
                    }}>
                        🔗 계정 연결
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'rgba(255, 255, 255, 0.5)',
                            fontSize: '24px',
                            cursor: 'pointer',
                            padding: '4px'
                        }}
                    >
                        ×
                    </button>
                </div>

                {success ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '32px',
                        color: '#4ade80'
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
                        <p style={{ fontSize: '16px', margin: 0 }}>
                            계정이 성공적으로 연결되었습니다!
                        </p>
                    </div>
                ) : (
                    <>
                        <p style={{
                            margin: '0 0 24px',
                            fontSize: '14px',
                            color: 'rgba(255, 255, 255, 0.6)',
                            lineHeight: 1.6
                        }}>
                            이메일과 비밀번호를 설정하면 다른 기기에서도 접속할 수 있습니다.
                        </p>

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '6px',
                                    fontSize: '13px',
                                    color: 'rgba(255, 255, 255, 0.7)'
                                }}>
                                    새 이메일
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="email@example.com"
                                    style={{
                                        width: '100%',
                                        padding: '12px 14px',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        borderRadius: '8px',
                                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                                        color: '#fff',
                                        fontSize: '14px',
                                        boxSizing: 'border-box',
                                        outline: 'none'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '6px',
                                    fontSize: '13px',
                                    color: 'rgba(255, 255, 255, 0.7)'
                                }}>
                                    새 비밀번호
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="6자 이상"
                                    style={{
                                        width: '100%',
                                        padding: '12px 14px',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        borderRadius: '8px',
                                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                                        color: '#fff',
                                        fontSize: '14px',
                                        boxSizing: 'border-box',
                                        outline: 'none'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '6px',
                                    fontSize: '13px',
                                    color: 'rgba(255, 255, 255, 0.7)'
                                }}>
                                    비밀번호 확인
                                </label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="비밀번호 재입력"
                                    style={{
                                        width: '100%',
                                        padding: '12px 14px',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        borderRadius: '8px',
                                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                                        color: '#fff',
                                        fontSize: '14px',
                                        boxSizing: 'border-box',
                                        outline: 'none'
                                    }}
                                />
                            </div>

                            {error && (
                                <div style={{
                                    padding: '12px',
                                    marginBottom: '16px',
                                    backgroundColor: 'rgba(239, 68, 68, 0.2)',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    borderRadius: '8px',
                                    color: '#f87171',
                                    fontSize: '13px'
                                }}>
                                    {error}
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        borderRadius: '8px',
                                        backgroundColor: 'transparent',
                                        color: 'rgba(255, 255, 255, 0.7)',
                                        fontSize: '14px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    취소
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        border: 'none',
                                        borderRadius: '8px',
                                        backgroundColor: loading ? '#4f46e5aa' : '#4f46e5',
                                        color: '#fff',
                                        fontSize: '14px',
                                        fontWeight: 600,
                                        cursor: loading ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {loading ? '연결 중...' : '연결하기'}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    )
}
