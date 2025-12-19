import { useState } from 'react'
import { useGameStore } from '../../store/useGameStore'
import { useAlchemyStore } from '../../store/useAlchemyStore'
import type { FacilityData } from '../../types/facility'
import FacilityMobileCard from './FacilityMobileCard'
import FacilityDetailModal from './FacilityDetailModal'

interface FacilityMobileViewProps {
    facilities: FacilityData[]
    playerFacilities: Record<string, number>
    loading: boolean
    upgradeFacility: (id: string, cost: Record<string, number>) => Promise<void>
    onBack: () => void
}

export default function FacilityMobileView({
    facilities,
    playerFacilities,
    loading,
    upgradeFacility,
    onBack
}: FacilityMobileViewProps) {
    const { resources, assignedMonsters } = useGameStore()
    const { playerMaterials, playerMonsters } = useAlchemyStore()
    const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(null)

    const getRes = (id: string) => (resources[id] || playerMaterials[id] || 0)
    const formatRes = (val: number) => val.toLocaleString()

    const assignedCount = Object.values(assignedMonsters).length
    const availableCount = playerMonsters.length - assignedCount

    const selectedFacility = facilities.find(f => f.id === selectedFacilityId)
    const currentLevel = selectedFacilityId ? (playerFacilities[selectedFacilityId] || 0) : 0

    return (
        <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            background: '#1a1612',
            padding: '0 16px 80px 16px',
            position: 'relative',
            touchAction: 'pan-y' // 부모에서 none으로 막았으므로 여기서는 세로 스크롤 허용
        }}>
            {/* Header - Shop Style Unification */}
            <header style={{
                position: 'sticky',
                top: 0,
                zIndex: 50,
                background: 'rgba(28, 25, 23, 0.95)',
                backdropFilter: 'blur(10px)',
                borderBottom: '1px solid rgba(68, 68, 68, 0.5)',
                margin: '0 -16px 20px -16px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {/* Back Button (Left) */}
                    <button onClick={onBack} style={{
                        width: '36px', height: '36px', borderRadius: '8px',
                        background: 'transparent',
                        border: 'none',
                        color: '#9ca3af',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer'
                    }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: 'currentColor' }}>
                            <path d="M20 11H7.83L13.42 5.41L12 4L4 12L12 20L13.41 18.59L7.83 13H20V11Z" fill="currentColor" />
                        </svg>
                    </button>

                    {/* Title */}
                    <h1 style={{
                        fontSize: '20px',
                        fontWeight: 900,
                        color: '#facc15',
                        textTransform: 'uppercase',
                        letterSpacing: '-0.02em',
                        margin: 0,
                        textShadow: '0 0 30px rgba(250, 204, 21, 0.2)',
                        fontFamily: "'Space Grotesk', sans-serif"
                    }}>
                        시설 관리
                    </h1>
                </div>

                {/* Gold Display (Right) */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    background: 'rgba(58, 53, 32, 0.6)',
                    padding: '6px 12px',
                    borderRadius: '9999px',
                    border: '1px solid rgba(234, 179, 8, 0.3)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                }}>
                    <img src="/assets/ui/gold_coin.png" alt="Gold" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
                    <span style={{
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '16px',
                        fontFamily: "'Space Grotesk', sans-serif",
                        letterSpacing: '0.02em'
                    }}>
                        {formatRes(getRes('gold'))}
                    </span>
                </div>
            </header>

            {/* Workforce Card */}
            <div style={{
                background: 'linear-gradient(to bottom, #2d3748, #1a202c)',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid #494122',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '24px'
            }}>
                <div style={{ width: '40px', height: '40px', background: 'rgba(73, 65, 34, 0.5)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a3bffa' }}>
                    <span className="material-symbols-outlined">groups</span>
                </div>
                <div>
                    <p style={{ color: 'rgba(240, 208, 144, 0.7)', fontSize: '12px', fontWeight: 'bold', margin: 0, textTransform: 'uppercase' }}>노동력 현황</p>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                        <span style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold' }}>{assignedCount}</span>
                        <span style={{ color: '#7a7a7a', fontSize: '12px' }}>/ {playerMonsters.length} 전체 몬스터</span>
                    </div>
                    <div style={{ color: '#0bda1d', fontSize: '10px', marginTop: '2px' }}>{availableCount}마리 배치 가능</div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid #494122', marginBottom: '16px', padding: '0 8px', overflowX: 'auto' }}>
                <button style={{
                    position: 'relative', paddingBottom: '12px', color: '#f7ca18', fontWeight: 'bold', fontSize: '14px',
                    background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'
                }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>home_work</span>
                    시설
                    <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '2px', background: '#f7ca18', boxShadow: '0 0 10px rgba(247, 202, 24, 0.5)' }} />
                </button>
                <button style={{
                    paddingBottom: '12px', color: '#7a7a7a', fontWeight: 'medium', fontSize: '14px',
                    background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '8px'
                }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>inventory_2</span>
                    인벤토리
                </button>
                <button style={{
                    paddingBottom: '12px', color: '#7a7a7a', fontWeight: 'medium', fontSize: '14px',
                    background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '8px'
                }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>science</span>
                    연구
                </button>
            </div>

            {/* Facility List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#7a7a7a' }}>로딩 중...</div>
                ) : (
                    facilities.map(facility => (
                        <FacilityMobileCard
                            key={facility.id}
                            facility={facility}
                            level={playerFacilities[facility.id] || 0}
                            lastCollectedAt={useGameStore.getState().lastCollectedAt}
                            assignedMonsters={assignedMonsters}
                            playerMonsters={playerMonsters}
                            onClick={() => setSelectedFacilityId(facility.id)}
                        />
                    ))
                )}
            </div>

            {/* Detail Modal */}
            {selectedFacility && (
                <FacilityDetailModal
                    facility={selectedFacility}
                    currentLevel={currentLevel}
                    onClose={() => setSelectedFacilityId(null)}
                    onUpgrade={upgradeFacility}
                />
            )}
        </div>
    )
}


