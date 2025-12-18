import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useAlchemyStore } from '../../store/useAlchemyStore'
import { useGameStore } from '../../store/useGameStore'
import { isMobileView } from '../../utils/responsiveUtils'
import { InventoryPanel } from '../InventoryPanel'
import FreeFormCauldron from './FreeFormCauldron'
import PageLayout from '../common/PageLayout'

export default function AlchemyPage() {
    const { user } = useAuth()
    const { loadAllData, resetBrewResult } = useAlchemyStore()
    const { setCanvasView } = useGameStore()
    const [isMobile, setIsMobile] = useState(isMobileView())

    useEffect(() => {
        if (user) {
            loadAllData(user.id)
        }
        return () => {
            resetBrewResult()
        }
    }, [user, loadAllData, resetBrewResult])

    // 반응형 감지
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(isMobileView())
        }
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    return (
        <PageLayout
            title="인벤토리 및 연금술"
            onBack={() => setCanvasView('map')}
        >
            <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                gap: '20px',
                height: '100%',
                minHeight: 0
            }}>
                {/* Free Form Cauldron */}
                <div style={{
                    flex: isMobile ? 'none' : 1,
                    background: 'rgba(42, 24, 16, 0.5)',
                    borderRadius: '12px',
                    border: '1px solid #5a4030',
                    padding: '20px',
                    overflowY: 'auto'
                }}>
                    <FreeFormCauldron />
                </div>

                {/* Inventory Panel */}
                <div style={{
                    flex: isMobile ? 'none' : 1,
                    background: 'rgba(42, 24, 16, 0.5)',
                    borderRadius: '12px',
                    border: '1px solid #5a4030',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }}>
                    <InventoryPanel />
                </div>
            </div>
        </PageLayout>
    )
}
