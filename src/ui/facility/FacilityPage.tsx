import { useState, useEffect } from 'react'
import { useFacilityStore } from '../../store/useFacilityStore'
import { useGameStore } from '../../store/useGameStore'
import { useFacilities } from '../../hooks/useFacilities'
import { useAuth } from '../../hooks/useAuth'
import { isMobileView } from '../../utils/responsiveUtils'
import PageLayout from '../common/PageLayout'
import FacilityHeader from './FacilityHeader'
import FacilitySidebar from './FacilitySidebar'
import FacilityControlPanel from './FacilityControlPanel'
import FacilityMobileView from './FacilityMobileView'
import DispatchManager from '../dispatch/DispatchManager'

export default function FacilityPage() {
    const { user } = useAuth()
    const { canvasView, setCanvasView } = useGameStore()
    const { facilities, upgradeFacility: storeUpgrade } = useFacilityStore()
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
                selectedFacility.id === 'dungeon_dispatch' ? (
                    <div style={{ maxWidth: '900px', margin: '0 auto', height: '100%' }}>
                        <div style={{
                            background: '#2a1810', border: '2px solid #5a4030', borderRadius: '12px', padding: '25px',
                            boxShadow: '0 8px 16px rgba(0,0,0,0.4)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '15px'
                        }}>
                            <span style={{ fontSize: '32px' }}>🗺️</span>
                            <h2 style={{ margin: 0, fontSize: '2em', color: '#facc15' }}>자동 던전 파견소</h2>
                        </div>
                        <div style={{ background: '#1a1612', border: '1px solid #494122', borderRadius: '12px', height: 'calc(100% - 120px)', minHeight: '500px' }}>
                            <DispatchManager />
                        </div>
                    </div>
                ) : (
                    <FacilityControlPanel
                        facility={selectedFacility}
                        currentLevel={currentLevel}
                        onUpgrade={storeUpgrade}
                    />
                )
            ) : (
                <div style={{ textAlign: 'center', marginTop: '100px', opacity: 0.5 }}>
                    시설을 선택해주세요
                </div>
            )}
        </PageLayout>
    )
}
