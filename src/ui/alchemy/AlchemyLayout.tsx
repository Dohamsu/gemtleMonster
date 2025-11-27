import { useEffect, useState, useRef } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useAlchemyStore } from '../../store/useAlchemyStore'
import { InventoryPanel } from '../InventoryPanel'
import FreeFormCauldron from './FreeFormCauldron'
import { AlchemyResultModal } from './AlchemyResultModal'

export default function AlchemyLayout() {
    const { user } = useAuth()
    const { loadAllData, brewResult, resetBrewResult } = useAlchemyStore()
    const [showResultModal, setShowResultModal] = useState(false)
    const [lastBrewResult, setLastBrewResult] = useState<{ success: boolean; monsterId?: string }>({
        success: false
    })
    const isInitialMount = useRef(true)
    const prevBrewResultType = useRef<'idle' | 'success' | 'fail'>('idle')

    console.log('🔍 [AlchemyLayout] Render:', {
        brewResultType: brewResult.type,
        prevBrewResultType: prevBrewResultType.current,
        showResultModal,
        isInitialMount: isInitialMount.current
    })

    useEffect(() => {
        console.log('🔄 [AlchemyLayout] Mount/User Change Effect')
        if (user) {
            loadAllData(user.id)
        }
        return () => {
            console.log('🧹 [AlchemyLayout] Cleanup - resetting brewResult and isInitialMount')
            // Reset the initial mount flag so next mount is treated as initial
            isInitialMount.current = true
            prevBrewResultType.current = 'idle'
            resetBrewResult()
        }
    }, [user])

    // Show modal when brewing completes (only on actual state changes)
    useEffect(() => {
        console.log('👁️ [AlchemyLayout] brewResult Effect triggered:', {
            brewResultType: brewResult.type,
            prevBrewResultType: prevBrewResultType.current,
            isInitialMount: isInitialMount.current,
            currentShowModal: showResultModal
        })

        // Skip the initial mount - don't show modal for existing brewResult state
        if (isInitialMount.current) {
            console.log('⏩ [AlchemyLayout] Skipping initial mount, setting prevBrewResultType')
            isInitialMount.current = false
            prevBrewResultType.current = brewResult.type
            return
        }

        // Only show modal if brewResult actually changed from idle to fail/success
        if (brewResult.type !== 'idle' && prevBrewResultType.current === 'idle') {
            console.log('🚨 [AlchemyLayout] Actual state change detected - showing modal for:', brewResult.type)
            setLastBrewResult({
                success: brewResult.type === 'success',
                monsterId: brewResult.monsterId
            })
            setShowResultModal(true)
        } else {
            console.log('⏸️ [AlchemyLayout] No relevant state change:', {
                current: brewResult.type,
                previous: prevBrewResultType.current
            })
        }

        // Update previous state
        prevBrewResultType.current = brewResult.type
    }, [brewResult])

    return (
        <>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                color: '#eee',
                overflow: 'hidden'
            }}>
                {/* Header */}
                <div style={{
                    padding: '16px',
                    borderBottom: '2px solid #4a5568',
                    background: 'linear-gradient(90deg, #1a1a2e 0%, #16213e 100%)'
                }}>
                    <h1 style={{
                        margin: 0,
                        fontSize: '24px',
                        color: '#f0e68c',
                        textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                        textAlign: 'center'
                    }}>
                        🧪 연금술 작업장
                    </h1>
                </div>

                {/* Main Content: Split view with Cauldron and Inventory */}
                <div style={{
                    flex: 1,
                    display: 'flex',
                    overflow: 'hidden'
                }}>
                    {/* Left: Free Form Cauldron */}
                    <div style={{
                        flex: 1,
                        overflow: 'auto',
                        borderRight: '2px solid #4a5568'
                    }}>
                        <FreeFormCauldron />
                    </div>

                    {/* Right: Inventory Panel */}
                    <InventoryPanel />
                </div>
            </div>

            {/* Result Modal */}
            <AlchemyResultModal
                isOpen={showResultModal}
                success={lastBrewResult.success}
                monsterId={lastBrewResult.monsterId}
                onClose={() => {
                    setShowResultModal(false)
                    resetBrewResult()
                }}
            />
        </>
    )
}
