/* eslint-disable no-console */
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useGameStore } from '../../store/useGameStore'
import { useBatchSync } from '../../hooks/useBatchSync'
import { useEventBasedSync } from '../../hooks/useEventBasedSync'
import { useAlchemyStore } from '../../store/useAlchemyStore'
import { supabase } from '../../lib/supabase'
import AccountLinkModal from '../AccountLinkModal'

/**
 * GameSystemConnector
 * UIOverlay에 있던 비시각적 핵심 로직(동기화, 프로필 관리 등)을 
 * 화면 없이 백그라운드에서 처리하기 위한 컴포넌트입니다.
 */
export default function GameSystemConnector() {
    const { user, linkEmailToAccount } = useAuth()
    const { loadAllData } = useAlchemyStore()
    const [, setNickname] = useState<string | null>(null)
    const [showAccountLinkModal, setShowAccountLinkModal] = useState(false)

    // 배치 동기화 시스템
    const { queueUpdate, queueFacilityUpdate, queueAssignmentUpdate, queueProductionModeUpdate, queueLastCollectedUpdate, forceSyncNow } = useBatchSync(user?.id, {
        batchInterval: 30000,
        onSyncComplete: (success: boolean) => {
            if (success) console.log('✅ [SystemConnector] 배치 동기화 완료')
        },
        onSyncError: async (error: unknown) => {
            const err = error as { code?: string }
            if (err.code === '23514' || err.code === '23505') {
                console.warn('⚠️ [SystemConnector] 데이터 불일치 감지. 서버 데이터로 동기화합니다.')
                if (user?.id) await loadAllData(user.id)
            }
        }
    })

    // 이벤트 기반 동기화
    useEventBasedSync({
        onBeforeUnload: () => forceSyncNow(),
        onVisibilityChange: async () => await forceSyncNow()
    })

    // 콜백 참조 유지
    const queueUpdateRef = useRef(queueUpdate)
    const queueFacilityUpdateRef = useRef(queueFacilityUpdate)
    const queueAssignmentUpdateRef = useRef(queueAssignmentUpdate)
    const queueProductionModeUpdateRef = useRef(queueProductionModeUpdate)
    const queueLastCollectedUpdateRef = useRef(queueLastCollectedUpdate)
    const forceSyncNowRef = useRef(forceSyncNow)

    useEffect(() => {
        queueUpdateRef.current = queueUpdate
        queueFacilityUpdateRef.current = queueFacilityUpdate
        queueAssignmentUpdateRef.current = queueAssignmentUpdate
        queueProductionModeUpdateRef.current = queueProductionModeUpdate
        queueLastCollectedUpdateRef.current = queueLastCollectedUpdate
        forceSyncNowRef.current = forceSyncNow
    }, [queueUpdate, queueFacilityUpdate, queueAssignmentUpdate, queueProductionModeUpdate, queueLastCollectedUpdate, forceSyncNow])

    // 유저 프로필 관리
    useEffect(() => {
        const fetchOrStepUpProfile = async () => {
            if (!user?.id) return
            try {
                const { data } = await supabase.from('profiles').select('nickname').eq('id', user.id).maybeSingle()
                if (data?.nickname) {
                    setNickname(data.nickname)
                } else {
                    const adjectives = ['용감한', '날쌘', '똑똑한', '황금', '무지개']
                    const animals = ['호랑이', '사자', '곰', '드래곤', '유니콘']
                    const newNickname = `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${animals[Math.floor(Math.random() * animals.length)]} ${Math.floor(Math.random() * 1000)}`

                    const { error: insertError } = await supabase.from('profiles').insert({ id: user.id, nickname: newNickname })
                    if (!insertError) setNickname(newNickname)
                }
            } catch (error) {
                console.error('Failed to fetch/create profile:', error)
            }
        }
        fetchOrStepUpProfile()
    }, [user?.id])

    // 스토어에 콜백 등록
    useEffect(() => {
        if (user?.id) {
            useAlchemyStore.getState().setBatchSyncCallback((id: string, qty: number) => queueUpdateRef.current(id, qty))
            useAlchemyStore.getState().setForceSyncCallback(async () => await forceSyncNowRef.current())
            useGameStore.getState().setBatchFacilitySyncCallback((id: string, lv: number) => queueFacilityUpdateRef.current(id, lv))
            useGameStore.getState().setBatchAssignmentSyncCallback((fId: string, mIds: (string | null)[]) => queueAssignmentUpdateRef.current(fId, mIds))
            useGameStore.getState().setBatchProductionModeSyncCallback((id: string, mode: number) => queueProductionModeUpdateRef.current(id, mode))
            useGameStore.getState().setBatchLastCollectedSyncCallback((id: string, time: number) => queueLastCollectedUpdateRef.current(id, time))
        }
        return () => {
            useAlchemyStore.getState().setBatchSyncCallback(null)
            useAlchemyStore.getState().setForceSyncCallback(null)
            useGameStore.getState().setBatchFacilitySyncCallback(null)
            useGameStore.getState().setBatchAssignmentSyncCallback(null)
            useGameStore.getState().setBatchProductionModeSyncCallback(null)
            useGameStore.getState().setBatchLastCollectedSyncCallback(null)
        }
    }, [user?.id])

    // 전역적으로 접근 가능한 계정 연결 모달 트리거 (커스텀 이벤트 등 활용 가능)
    useEffect(() => {
        const handleShowModal = () => setShowAccountLinkModal(true)
        window.addEventListener('show-account-link-modal', handleShowModal)
        return () => window.removeEventListener('show-account-link-modal', handleShowModal)
    }, [])

    return (
        <>
            {showAccountLinkModal && (
                <AccountLinkModal
                    onLink={linkEmailToAccount}
                    onClose={() => setShowAccountLinkModal(false)}
                />
            )}
        </>
    )
}
