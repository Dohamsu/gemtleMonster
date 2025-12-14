/* eslint-disable no-console */
import { useEffect, useState } from 'react'
import GameCanvas from './game/GameCanvas'
import UIOverlay from './ui/UIOverlay'
import LoginScreen from './ui/LoginScreen'
import { useAuth } from './hooks/useAuth'
import { useAutoCollection } from './hooks/useAutoCollection'
import { initializePlayer } from './lib/initializePlayer'
import { useGameStore } from './store/useGameStore'
import { useResources } from './hooks/useResources'
import { useFacilities } from './hooks/useFacilities'
import InstallPrompt from './ui/common/InstallPrompt'
import LottieLoader from './ui/common/LottieLoader'
import loadingAnimation from './assets/lottie/loading.json'

function App() {
    const { user, loading: authLoading, signIn, signUp, signInAsGuest } = useAuth()
    const { setResources, setFacilities } = useGameStore()

    /**
     * 레거시 시스템: player_resource 테이블에서 데이터 로드
     * 주의: 실제 데이터는 useAlchemyStore.loadPlayerData()에서 player_material 테이블로 로드됨
     * TODO: 레거시 시스템 제거 시 이 부분도 제거 필요
     */
    const { resources: dbResources } = useResources(user?.id)
    const { playerFacilities: dbFacilities } = useFacilities(user?.id)

    // Sync DB data to local store when loaded (레거시 호환성)
    useEffect(() => {
        if (Object.keys(dbResources).length > 0) {
            setResources(dbResources)
        }
    }, [dbResources, setResources])

    useEffect(() => {
        if (Object.keys(dbFacilities).length > 0) {
            setFacilities(dbFacilities)
        }
    }, [dbFacilities, setFacilities])

    // Auto-collect resources from facilities (updates local store)
    useAutoCollection(user?.id)

    useEffect(() => {
        if (user) {
            initializePlayer(user.id).catch(err => {
                console.error('Player initialization failed:', err)
            })
        }

        // Add syncMaterials to window for manual material synchronization
        const syncMaterials = async () => {
            if (!user) {
                console.error('User not logged in')
                return
            }

            const { supabase } = await import('./lib/supabase')
            const { getMaterialsForDB } = await import('./data/alchemyData')
            const materials = getMaterialsForDB()

            console.log(`🔄 Syncing ${materials.length} materials...`)

            for (const material of materials) {
                const { error } = await supabase
                    .from('material')
                    .upsert({
                        id: material.id,
                        name: material.name,
                        family: material.family,
                        description: material.description,
                        rarity: material.rarity,
                        icon_url: material.icon_url,
                        is_special: material.is_special,
                        sell_price: 0
                    }, { onConflict: 'id' })

                if (error) {
                    console.error(`❌ Failed to sync ${material.id}:`, error)
                } else {
                    console.log(`✅ Synced ${material.id}`)
                }
            }

            console.log('✅ Material sync complete!')
        }

            ; (window as unknown as { syncMaterials: typeof syncMaterials; useGameStore: typeof useGameStore }).syncMaterials = syncMaterials
            ; (window as unknown as { syncMaterials: typeof syncMaterials; useGameStore: typeof useGameStore }).useGameStore = useGameStore
    }, [user])

    // 반응형 레이아웃을 위한 뷰포트 크기 감지
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
    const [isOverlayOpen, setIsOverlayOpen] = useState(false) // 모바일 UI Overlay 토글 상태

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 768
            setIsMobile(mobile)
            // 데스크톱으로 전환 시 오버레이 닫기
            if (!mobile) {
                setIsOverlayOpen(false)
            }
        }

        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    // 로딩 중 또는 비로그인 상태: 로그인 화면 표시 (전체 화면)
    if (authLoading) {
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
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                zIndex: 9999
            }}>
                <LottieLoader animationData={loadingAnimation} width={150} height={150} />
            </div>
        )
    }

    if (!user) {
        return (
            <LoginScreen
                onSignIn={signIn}
                onSignUp={signUp}
                onGuestLogin={signInAsGuest}
            />
        )
    }

    if (isMobile) {
        // 모바일 레이아웃: 전체 화면 Canvas + 하단 슬라이드업 UI Overlay
        return (
            <>
                <div style={{
                    position: 'relative',
                    width: '100vw',
                    height: '100vh',
                    overflow: 'hidden',
                    backgroundColor: '#000'
                }}>
                    {/* Game Area (Full Screen) */}
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#2c3e50',
                        overflow: 'hidden'
                    }}>
                        <GameCanvas />
                    </div>

                    {/* Hamburger Button */}
                    <button
                        onClick={() => setIsOverlayOpen(!isOverlayOpen)}
                        style={{
                            position: 'absolute',
                            top: '20px',
                            right: '20px',
                            width: '50px',
                            height: '50px',
                            backgroundColor: 'rgba(26, 26, 26, 0.9)',
                            border: '2px solid #444',
                            borderRadius: '8px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '5px',
                            cursor: 'pointer',
                            zIndex: 20,
                            padding: 0,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseDown={(e) => e.currentTarget.style.backgroundColor = 'rgba(60, 60, 60, 0.9)'}
                        onMouseUp={(e) => e.currentTarget.style.backgroundColor = 'rgba(26, 26, 26, 0.9)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(26, 26, 26, 0.9)'}
                    >
                        <div style={{ width: '24px', height: '3px', backgroundColor: '#fff', borderRadius: '2px' }} />
                        <div style={{ width: '24px', height: '3px', backgroundColor: '#fff', borderRadius: '2px' }} />
                        <div style={{ width: '24px', height: '3px', backgroundColor: '#fff', borderRadius: '2px' }} />
                    </button>

                    {/* UI Overlay (Bottom Slide-up Panel) */}
                    <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        width: '100%',
                        maxHeight: '80%',
                        backgroundColor: '#1a1a1a',
                        borderTop: '2px solid #333',
                        display: 'flex',
                        flexDirection: 'column',
                        zIndex: 15,
                        boxShadow: '0 -4px 12px rgba(0,0,0,0.5)',
                        overflowY: 'auto',
                        transform: isOverlayOpen ? 'translateY(0)' : 'translateY(100%)',
                        transition: 'transform 0.3s ease-in-out'
                    }}>
                        {/* Close button inside overlay */}
                        <div style={{
                            padding: '10px',
                            borderBottom: '1px solid #333',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <span style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold' }}>메뉴</span>
                            <button
                                onClick={() => setIsOverlayOpen(false)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#fff',
                                    fontSize: '24px',
                                    cursor: 'pointer',
                                    padding: '5px 10px'
                                }}
                            >
                                ✕
                            </button>
                        </div>
                        <UIOverlay />
                    </div>
                </div>

                <InstallPrompt />
            </>
        )
    }

    // 데스크톱 레이아웃 (기존 방식)
    return (
        <div style={{
            display: 'flex',
            width: '100vw',
            height: '100vh',
            overflow: 'hidden',
            backgroundColor: '#000'
        }}>
            {/* Game Area (Left) */}
            <div style={{
                flex: 1,
                position: 'relative',
                backgroundColor: '#2c3e50',
                overflow: 'hidden'
            }}>
                <GameCanvas />
            </div>

            {/* UI Sidebar (Right) */}
            <div style={{
                width: '350px',
                height: '100%',
                backgroundColor: '#1a1a1a',
                borderLeft: '2px solid #333',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 10
            }}>
                <UIOverlay />
            </div>

            <InstallPrompt />
        </div>
    )
}

export default App
