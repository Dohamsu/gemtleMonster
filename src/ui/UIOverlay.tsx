/* eslint-disable no-console */
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useGameStore } from '../store/useGameStore'
import { useBatchSync } from '../hooks/useBatchSync'
import { useEventBasedSync } from '../hooks/useEventBasedSync'
import { useAlchemyStore } from '../store/useAlchemyStore'
import { isMobileView } from '../utils/responsiveUtils'
import { supabase } from '../lib/supabase'
import IdleFacilityList from './idle/IdleFacilityList'
import AlchemyLayout from './alchemy/AlchemyLayout'
import LoginScreen from './LoginScreen'
import AccountLinkModal from './AccountLinkModal'

export default function UIOverlay() {
    const { user, loading: authLoading, error: authError, isGuest, signIn, signUp, signOut, signInAsGuest, linkEmailToAccount } = useAuth()
    const { activeTab, setActiveTab, resources } = useGameStore()
    const [isMobile, setIsMobile] = useState(isMobileView())
    const [nickname, setNickname] = useState<string | null>(null)
    const [showAccountLinkModal, setShowAccountLinkModal] = useState(false)

    // Phase 1: 배치 동기화 시스템
    const { loadAllData } = useAlchemyStore()
    const { queueUpdate, queueFacilityUpdate, forceSyncNow } = useBatchSync(user?.id, {
        batchInterval: 30000, // 30초마다 자동 저장
        onSyncComplete: (success) => {
            if (success) {
                console.log('✅ [UIOverlay] 배치 동기화 완료')
            }
        },
        onSyncError: async (error: any) => {
            // 치명적인 동기화 에러(예: 데이터 불일치) 발생 시 전체 데이터 리로드
            if (error?.code === '23514' || error?.code === '23505') {
                console.warn('⚠️ [UIOverlay] 데이터 불일치 감지. 서버 데이터로 동기화합니다.')
                if (user?.id) {
                    await loadAllData(user.id)
                }
            }
        }
    })

    // Phase 2: 이벤트 기반 동기화
    useEventBasedSync({
        onBeforeUnload: () => {
            // 브라우저 닫기/새로고침 시 즉시 동기화 (동기 함수만 가능)
            forceSyncNow()
        },
        onVisibilityChange: async () => {
            // 탭 전환 시 즉시 동기화 (비동기 가능)
            await forceSyncNow()
        }
    })

    // AlchemyStore에 배치 콜백 연결
    // ref를 사용하여 콜백 참조를 안정적으로 유지
    const queueUpdateRef = useRef(queueUpdate)
    const queueFacilityUpdateRef = useRef(queueFacilityUpdate)
    const forceSyncNowRef = useRef(forceSyncNow)

    // ref 업데이트
    useEffect(() => {
        queueUpdateRef.current = queueUpdate
        queueFacilityUpdateRef.current = queueFacilityUpdate
        forceSyncNowRef.current = forceSyncNow
    }, [queueUpdate, queueFacilityUpdate, forceSyncNow])

    // 반응형 감지
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(isMobileView())
        }
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    // 닉네임 가져오기 및 프로필 생성 (백필)
    useEffect(() => {
        const fetchOrStepUpProfile = async () => {
            if (!user?.id) return

            try {
                // 1. 프로필 조회
                const { data } = await supabase
                    .from('profiles')
                    .select('nickname')
                    .eq('id', user.id)
                    .single()

                if (data?.nickname) {
                    setNickname(data.nickname)
                } else {
                    // 2. 프로필이 없으면 클라이언트에서 생성 (Trigger 실패 대비)
                    const adjectives = ['용감한', '날쌘', '똑똑한', '배고픈', '졸린', '행복한', '슬픈', '신난', '황금', '무지개']
                    const animals = ['호랑이', '사자', '토끼', '고양이', '강아지', '곰', '여우', '판다', '펭귄', '드래곤']

                    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)]
                    const randomAnimal = animals[Math.floor(Math.random() * animals.length)]
                    const newNickname = `${randomAdjective} ${randomAnimal} ${Math.floor(Math.random() * 1000)} `

                    console.log('Profile not found, creating from client:', newNickname)

                    const { error: insertError } = await supabase
                        .from('profiles')
                        .insert({
                            id: user.id,
                            nickname: newNickname
                        })

                    if (!insertError) {
                        setNickname(newNickname)
                    } else {
                        console.error('Failed to create profile client-side:', insertError)
                    }
                }
            } catch (error) {
                console.error('Failed to fetch/create profile:', error)
            }
        }

        fetchOrStepUpProfile()
    }, [user?.id])


    // 콜백 등록 (user?.id 변경 시에만)
    useEffect(() => {
        if (user?.id) {
            // 재료 동기화 콜백
            useAlchemyStore.getState().setBatchSyncCallback((materialId: string, quantity: number) => {
                queueUpdateRef.current(materialId, quantity)
            })
            useAlchemyStore.getState().setForceSyncCallback(async () => {
                await forceSyncNowRef.current()
            })

            // 시설 동기화 콜백
            useGameStore.getState().setBatchFacilitySyncCallback((facilityId: string, newLevel: number) => {
                queueFacilityUpdateRef.current(facilityId, newLevel)
            })
        }

        return () => {
            useAlchemyStore.getState().setBatchSyncCallback(null)
            useAlchemyStore.getState().setForceSyncCallback(null)
            useGameStore.getState().setBatchFacilitySyncCallback(null)
        }
    }, [user?.id]) // queueUpdate, forceSyncNow 의존성 제거

    // 로딩 중
    if (authLoading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'white' }}>
                로딩 중...
            </div>
        )
    }

    // 비로그인 상태: 로그인 화면 표시
    if (!user) {
        return (
            <LoginScreen
                onSignIn={signIn}
                onSignUp={signUp}
                onGuestLogin={signInAsGuest}
            />
        )
    }

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            padding: isMobile ? '10px' : '15px',
            boxSizing: 'border-box',
            position: 'relative'
        }}>

            {/* Header / Player Info */}
            <div style={{
                background: '#2a2a2a',
                padding: isMobile ? '12px' : '15px',
                borderRadius: '8px',
                marginBottom: isMobile ? '10px' : '15px',
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h2 style={{
                        margin: 0,
                        color: '#fff',
                        fontSize: isMobile ? '1.1em' : '1.2em'
                    }}>GemtleMonster</h2>

                    {/* 계정 관련 버튼들 */}
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {isGuest && (
                            <button
                                onClick={() => setShowAccountLinkModal(true)}
                                style={{
                                    padding: '6px 12px',
                                    backgroundColor: '#4f46e5',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    fontWeight: 500
                                }}
                            >
                                🔗 계정 연결
                            </button>
                        )}
                        <button
                            onClick={async () => {
                                // 로그아웃 전에 저장되지 않은 변경사항 동기화
                                await forceSyncNow()
                                await signOut()
                                // 깨끗한 상태 전환을 위해 페이지 새로고침
                                window.location.reload()
                            }}
                            style={{
                                padding: '6px 10px',
                                backgroundColor: 'transparent',
                                color: 'rgba(255,255,255,0.6)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '6px',
                                fontSize: '12px',
                                cursor: 'pointer'
                            }}
                        >
                            로그아웃
                        </button>
                    </div>
                </div>

                <div style={{
                    fontSize: isMobile ? '0.9em' : '1em',
                    color: '#e2e8f0',
                    marginBottom: isMobile ? '8px' : '10px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    {nickname ? `👋 ${nickname} ` : (user?.id ? `ID: ${user.id.slice(0, 8)}...` : (authError ? `⚠️ ${authError} ` : '로그인 중...'))}
                    {isGuest && (
                        <span style={{
                            fontSize: '10px',
                            padding: '2px 6px',
                            backgroundColor: 'rgba(251, 191, 36, 0.2)',
                            color: '#fbbf24',
                            borderRadius: '4px'
                        }}>
                            게스트
                        </span>
                    )}
                </div>

                <div style={{
                    fontSize: isMobile ? '0.9em' : '0.95em',
                    color: '#ffd700',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                }}>
                    <img src="/assets/ui/gold_coin.png" alt="골드" style={{ width: '18px', height: '18px', marginRight: '4px', verticalAlign: 'middle' }} />
                    {(resources.gold || 0).toLocaleString()} G
                </div>
            </div>

            {/* Tabs */}
            <div style={{
                display: 'flex',
                gap: isMobile ? '8px' : '10px',
                marginBottom: isMobile ? '10px' : '15px'
            }}>
                <button
                    onClick={() => setActiveTab('facilities')}
                    style={{
                        flex: 1,
                        padding: isMobile ? '12px 8px' : '10px',
                        minHeight: isMobile ? '44px' : 'auto',
                        background: activeTab === 'facilities' ? '#444' : '#2a2a2a',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: isMobile ? '0.95em' : '1em',
                        fontWeight: activeTab === 'facilities' ? 'bold' : 'normal'
                    }}
                >
                    시설 관리
                </button>
                <button
                    onClick={() => setActiveTab('alchemy')}
                    style={{
                        flex: 1,
                        padding: isMobile ? '12px 8px' : '10px',
                        minHeight: isMobile ? '44px' : 'auto',
                        background: activeTab === 'alchemy' ? '#444' : '#2a2a2a',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: isMobile ? '0.95em' : '1em',
                        fontWeight: activeTab === 'alchemy' ? 'bold' : 'normal'
                    }}
                >
                    인벤토리
                </button>
            </div>

            {/* Content Area */}
            <div style={{ flex: 1, overflow: showAccountLinkModal ? 'hidden' : 'auto', display: 'flex', flexDirection: 'column', pointerEvents: showAccountLinkModal ? 'none' : 'auto' }}>
                {activeTab === 'facilities' && <IdleFacilityList />}
                {activeTab === 'alchemy' && <AlchemyLayout />}
            </div>

            {/* 계정 연결 모달 */}
            {showAccountLinkModal && (
                <AccountLinkModal
                    onLink={linkEmailToAccount}
                    onClose={() => setShowAccountLinkModal(false)}
                />
            )}
        </div >
    )
}
