import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
    const [showIOSPrompt, setShowIOSPrompt] = useState(false)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        // 1. 이미 설치되었는지 확인 (Standalone 모드)
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as any).standalone === true

        if (isStandalone) {
            return
        }

        // 2. 이전에 닫았는지 확인 (7일간 숨김)
        const dismissedAt = localStorage.getItem('install-prompt-dismissed')
        if (dismissedAt) {
            const daysSinceDismissed = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60 * 24)
            if (daysSinceDismissed < 7) return
        }

        // 3. Android: beforeinstallprompt 이벤트 감지
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault()
            setDeferredPrompt(e as BeforeInstallPromptEvent)
            setIsVisible(true)
        }

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

        // 4. iOS 감지 (단순 User Agent 체크)
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
        if (isIOS) {
            setIsVisible(true)
            setShowIOSPrompt(true)
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
        }
    }, [])

    const handleInstallClick = async () => {
        if (!deferredPrompt) return

        deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice

        if (outcome === 'accepted') {
            setIsVisible(false)
        }
        setDeferredPrompt(null)
    }

    const handleDismiss = () => {
        setIsVisible(false)
        localStorage.setItem('install-prompt-dismissed', Date.now().toString())
    }

    if (!isVisible) return null

    // Portal을 사용하여 최상위에 렌더링
    return createPortal(
        <div style={{
            position: 'fixed',
            bottom: '20px',
            left: '20px',
            right: '20px',
            backgroundColor: '#1a1a1a',
            border: '1px solid #333',
            borderRadius: '12px',
            padding: '16px',
            zIndex: 9999,
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            animation: 'slideUp 0.3s ease-out'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <img
                        src="/favicon.png"
                        alt="App Icon"
                        style={{ width: '40px', height: '40px', borderRadius: '8px' }}
                    />
                    <div>
                        <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '15px' }}>
                            홈 화면에 추가하기
                        </div>
                        <div style={{ color: '#bbb', fontSize: '13px', marginTop: '2px' }}>
                            앱처럼 더 빠르고 편하게 즐기세요!
                        </div>
                    </div>
                </div>
                <button
                    onClick={handleDismiss}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#888',
                        fontSize: '18px',
                        cursor: 'pointer',
                        padding: '4px'
                    }}
                >
                    ✕
                </button>
            </div>

            {showIOSPrompt ? (
                <div style={{
                    backgroundColor: '#333',
                    padding: '10px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: '#ddd',
                    lineHeight: '1.4'
                }}>
                    하단의 <span style={{ fontSize: '16px' }}>📤</span> 공유 버튼을 누르고<br />
                    <strong>'홈 화면에 추가'</strong>를 선택하세요.
                </div>
            ) : (
                <button
                    onClick={handleInstallClick}
                    style={{
                        width: '100%',
                        padding: '10px',
                        backgroundColor: '#3b82f6',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        fontSize: '14px',
                        cursor: 'pointer'
                    }}
                >
                    설치하기
                </button>
            )}

            <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
        </div>,
        document.body
    )
}
