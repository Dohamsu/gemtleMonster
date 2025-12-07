import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useGameStore } from '../store/useGameStore'
import { useBatchSync } from '../hooks/useBatchSync'
import { useEventBasedSync } from '../hooks/useEventBasedSync'
import { useAlchemyStore } from '../store/useAlchemyStore'
import { isMobileView } from '../utils/responsiveUtils'
import IdleFacilityList from './idle/IdleFacilityList'
import AlchemyLayout from './alchemy/AlchemyLayout'

export default function UIOverlay() {
    const { user, loading: authLoading } = useAuth()
    const { activeTab, setActiveTab, resources } = useGameStore()
    const [isMobile, setIsMobile] = useState(isMobileView())

    // Phase 1: 배치 동기화 시스템
    const { queueUpdate, queueFacilityUpdate, forceSyncNow } = useBatchSync(user?.id, {
        batchInterval: 30000, // 30초마다 자동 저장
        onSyncComplete: (success) => {
            if (success) {
                console.log('✅ [UIOverlay] 배치 동기화 완료')
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

    if (authLoading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'white' }}>
                로딩 중...
            </div>
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
                <h2 style={{
                    margin: '0 0 8px 0',
                    color: '#fff',
                    fontSize: isMobile ? '1.1em' : '1.2em'
                }}>GemtleMonster</h2>
                <div style={{
                    fontSize: isMobile ? '0.8em' : '0.85em',
                    color: '#aaa',
                    marginBottom: isMobile ? '8px' : '10px'
                }}>
                    ID: {user?.id.slice(0, 8)}...
                </div>
                <div style={{
                    fontSize: isMobile ? '0.9em' : '0.95em',
                    color: '#ffd700',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                }}>
                    💰 {(resources.gold || 0).toLocaleString()} G
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
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {activeTab === 'facilities' && <IdleFacilityList />}
                {activeTab === 'alchemy' && <AlchemyLayout />}
            </div>
        </div>
    )
}
