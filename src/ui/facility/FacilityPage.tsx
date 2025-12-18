import { useState, useEffect } from 'react'
import { useGameStore } from '../../store/useGameStore'
import { useFacilities } from '../../hooks/useFacilities'
import { useAuth } from '../../hooks/useAuth'
import { isMobileView } from '../../utils/responsiveUtils'
import ResourceHeader from '../common/ResourceHeader'
import FacilitySidebar from './FacilitySidebar'
import FacilityControlPanel from './FacilityControlPanel'
import FacilityMobileView from './FacilityMobileView'

export default function FacilityPage() {
    const { user } = useAuth()
    const { canvasView, setCanvasView } = useGameStore()
    const { facilities: masterFacilities, playerFacilities, loading, upgradeFacility } = useFacilities(user?.id)
    const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(null)
    const [isMobile, setIsMobile] = useState(isMobileView())

    useEffect(() => {
        const handleResize = () => setIsMobile(isMobileView())
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    if (canvasView !== 'facility') return null

    const selectedFacility = masterFacilities.find(f => f.id === selectedFacilityId) || masterFacilities[0]
    const currentLevel = (selectedFacilityId ? playerFacilities[selectedFacilityId] : playerFacilities[masterFacilities[0]?.id]) || 0

    if (isMobile) {
        return (
            <div style={{
                position: 'fixed',
                inset: 0,
                background: '#1a1612',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 1000,
                color: '#e0e0e0',
                fontFamily: "'Space Grotesk', sans-serif"
            }}>
                <FacilityMobileView
                    facilities={masterFacilities}
                    playerFacilities={playerFacilities}
                    loading={loading}
                    upgradeFacility={upgradeFacility}
                    onBack={() => setCanvasView('map')}
                />
            </div>
        )
    }

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: '#1a0f0a',
            color: '#f0d090',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 2000,
            fontFamily: "'Inter', sans-serif"
        }}>
            {/* Header */}
            <ResourceHeader onBack={() => setCanvasView('map')} />

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                {/* Sidebar */}
                <FacilitySidebar
                    facilities={masterFacilities}
                    playerFacilities={playerFacilities}
                    selectedId={selectedFacility?.id || null}
                    onSelect={setSelectedFacilityId}
                />

                {/* Main Content */}
                <div style={{ flex: 1, padding: '20px', overflowY: 'auto', background: 'rgba(0,0,0,0.2)' }}>
                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                            로딩 중...
                        </div>
                    ) : selectedFacility ? (
                        <FacilityControlPanel
                            facility={selectedFacility}
                            currentLevel={currentLevel}
                            onUpgrade={upgradeFacility}
                        />
                    ) : (
                        <div style={{ textAlign: 'center', marginTop: '100px', opacity: 0.5 }}>
                            시설을 선택해주세요
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
