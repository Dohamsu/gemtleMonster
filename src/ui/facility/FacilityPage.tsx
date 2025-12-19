import { useState, useEffect } from 'react'
import { useGameStore } from '../../store/useGameStore'
import { useFacilities } from '../../hooks/useFacilities'
import { useAuth } from '../../hooks/useAuth'
import { isMobileView } from '../../utils/responsiveUtils'
import PageLayout from '../common/PageLayout'
import FacilityHeader from './FacilityHeader'
import FacilitySidebar from './FacilitySidebar'
import FacilityControlPanel from './FacilityControlPanel'
import FacilityMobileView from './FacilityMobileView'

export default function FacilityPage() {
    const { user } = useAuth()
    const { canvasView, setCanvasView, facilities, upgradeFacility: storeUpgrade } = useGameStore()
    const { facilities: masterFacilities, loading } = useFacilities(user?.id)
    const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(null)
    const [isMobile, setIsMobile] = useState(isMobileView())

    useEffect(() => {
        const handleResize = () => setIsMobile(isMobileView())
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    if (canvasView !== 'facility') return null

    const selectedFacility = masterFacilities.find(f => f.id === selectedFacilityId) || masterFacilities[0]
    const currentLevel = (selectedFacilityId ? facilities[selectedFacilityId] : facilities[masterFacilities[0]?.id]) || 0

    if (isMobile) {
        return (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                overflow: 'hidden',
                touchAction: 'none',
                background: '#1a1612',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 1000,
                color: '#e0e0e0',
                fontFamily: "'Space Grotesk', sans-serif"
            }}>
                <FacilityMobileView
                    facilities={masterFacilities}
                    playerFacilities={facilities}
                    loading={loading}
                    upgradeFacility={storeUpgrade}
                    onBack={() => setCanvasView('map')}
                />
            </div>
        )
    }

    return (
        <PageLayout
            header={<FacilityHeader onBack={() => setCanvasView('map')} />}
            sidebar={
                <FacilitySidebar
                    facilities={masterFacilities}
                    playerFacilities={facilities}
                    selectedId={selectedFacility?.id || null}
                    onSelect={setSelectedFacilityId}
                />
            }
            onBack={() => setCanvasView('map')}
        >
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    로딩 중...
                </div>
            ) : selectedFacility ? (
                <FacilityControlPanel
                    facility={selectedFacility}
                    currentLevel={currentLevel}
                    onUpgrade={storeUpgrade}
                />
            ) : (
                <div style={{ textAlign: 'center', marginTop: '100px', opacity: 0.5 }}>
                    시설을 선택해주세요
                </div>
            )}
        </PageLayout>
    )
}
