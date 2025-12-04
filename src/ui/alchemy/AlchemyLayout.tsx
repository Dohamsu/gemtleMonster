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
    }, [user])

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
            {/* Header */}
            <div style={{
                padding: isMobile ? '12px' : '16px',
                borderBottom: '2px solid #4a5568',
                background: 'linear-gradient(90deg, #1a1a2e 0%, #16213e 100%)'
            }}>
                <h1 style={{
                    margin: 0,
                    fontSize: isMobile ? '20px' : '24px',
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
