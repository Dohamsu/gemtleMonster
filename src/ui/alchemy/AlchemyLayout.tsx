import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useAlchemyStore } from '../../store/useAlchemyStore'
import { InventoryPanel } from '../InventoryPanel'
import FreeFormCauldron from './FreeFormCauldron'
import { AlchemyResultModal } from './AlchemyResultModal'

export default function AlchemyLayout() {
    const { user } = useAuth()
    const { loadAllData, brewResult } = useAlchemyStore()
    const [showResultModal, setShowResultModal] = useState(false)
    const [lastBrewResult, setLastBrewResult] = useState<{ success: boolean; monsterId?: string }>({
        success: false
    })

    useEffect(() => {
        if (user) {
            loadAllData(user.id)
        }
    }, [user])

    // Show modal when brewing completes
    useEffect(() => {
        if (brewResult.type !== 'idle') {
            setLastBrewResult({
                success: brewResult.type === 'success',
                monsterId: brewResult.monsterId
            })
            setShowResultModal(true)
        }
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
                onClose={() => setShowResultModal(false)}
            />
        </>
    )
}
