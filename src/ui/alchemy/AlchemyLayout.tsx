import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useAlchemyStore } from '../../store/useAlchemyStore'
import { isMobileView } from '../../utils/responsiveUtils'
import { InventoryPanel } from '../InventoryPanel'
import FreeFormCauldron from './FreeFormCauldron'

export default function AlchemyLayout() {
    const { user } = useAuth()
    const { loadAllData, resetBrewResult } = useAlchemyStore()
    const [isMobile, setIsMobile] = useState(isMobileView())

    useEffect(() => {
        // console.log('🔄 [AlchemyLayout] Mount/User Change Effect')
        if (user) {
            loadAllData(user.id)
        }
        return () => {
            // console.log('🧹 [AlchemyLayout] Cleanup')
            resetBrewResult()
        }
    }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

    // 반응형 감지
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(isMobileView())
        }
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: '#eee',
            overflow: 'hidden'
        }}>
            {/* Main Content: Split view with Cauldron and Inventory */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                overflow: 'hidden',
                minHeight: 0
            }}>
                {/* Left/Top: Free Form Cauldron */}
                <div style={{
                    flex: 1,
                    overflow: 'auto',
                    borderRight: isMobile ? 'none' : '2px solid #4a5568',
                    borderBottom: isMobile ? '2px solid #4a5568' : 'none',
                    minHeight: isMobile ? '50%' : 0,
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <FreeFormCauldron />
                </div>

                {/* Right/Bottom: Inventory Panel */}
                <InventoryPanel />
            </div>
        </div>
    )
}
