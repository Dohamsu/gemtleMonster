import { useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useGameStore } from '../store/useGameStore'
import { useSaveGame } from '../hooks/useSaveGame'
import { useBatchMaterialSync } from '../hooks/useBatchMaterialSync'
import { useEventBasedSync } from '../hooks/useEventBasedSync'
import { useAlchemyStore } from '../store/useAlchemyStore'
import IdleFacilityList from './idle/IdleFacilityList'
import AlchemyLayout from './alchemy/AlchemyLayout'

export default function UIOverlay() {
    const { user, loading: authLoading } = useAuth()
    const { activeTab, setActiveTab } = useGameStore()
    const { saveGame, saving, lastSaved } = useSaveGame()

    // Phase 1: 배치 동기화 시스템
    const { queueUpdate, forceSyncNow } = useBatchMaterialSync(user?.id, {
        batchInterval: 30000, // 30초마다 자동 저장
        onSyncComplete: (success, updates) => {
            if (success) {
                console.log('✅ 배치 동기화 완료:', Object.keys(updates).length, '종류')
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
    useEffect(() => {
        if (user?.id) {
            useAlchemyStore.getState().setBatchSyncCallback(queueUpdate)
            useAlchemyStore.getState().setForceSyncCallback(forceSyncNow)
            console.log('🔗 배치 동기화 콜백 연결 완료')
        }

        return () => {
            useAlchemyStore.getState().setBatchSyncCallback(null)
            useAlchemyStore.getState().setForceSyncCallback(null)
            console.log('🔌 배치 동기화 콜백 해제')
        }
    }, [user?.id, queueUpdate, forceSyncNow])

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
            padding: '15px',
            boxSizing: 'border-box',
            position: 'relative'
        }}>

            {/* Header / Player Info */}
            <div style={{
                background: '#2a2a2a',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '15px',
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
            }}>
                <h2 style={{ margin: '0 0 10px 0', color: '#fff', fontSize: '1.2em' }}>GemtleMonster</h2>
                <div style={{ fontSize: '0.85em', color: '#aaa', marginBottom: '10px' }}>
                    ID: {user?.id.slice(0, 8)}...
                </div>

                <div>
                    <button
                        onClick={saveGame}
                        disabled={saving}
                        style={{
                            width: '100%',
                            padding: '8px',
                            background: saving ? '#555' : '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: saving ? 'not-allowed' : 'pointer',
                            fontWeight: 'bold',
                            transition: 'background 0.2s',
                        }}
                    >
                        {saving ? '저장 중...' : '저장하기'}
                    </button>
                    {lastSaved && (
                        <div style={{ fontSize: '0.75em', color: '#888', marginTop: '5px', textAlign: 'center' }}>
                            저장됨: {lastSaved.toLocaleTimeString()}
                        </div>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                <button
                    onClick={() => setActiveTab('facilities')}
                    style={{
                        flex: 1,
                        padding: '10px',
                        background: activeTab === 'facilities' ? '#444' : '#2a2a2a',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: activeTab === 'facilities' ? 'bold' : 'normal'
                    }}
                >
                    시설 관리
                </button>
                <button
                    onClick={() => setActiveTab('alchemy')}
                    style={{
                        flex: 1,
                        padding: '10px',
                        background: activeTab === 'alchemy' ? '#444' : '#2a2a2a',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
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
