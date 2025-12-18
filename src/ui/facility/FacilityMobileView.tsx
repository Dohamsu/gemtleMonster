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
            {/* Header */}
            <header style={{
                position: 'sticky',
                top: 0,
                zIndex: 40,
                background: '#231f10f2',
                backdropFilter: 'blur(8px)',
                borderBottom: '1px solid #494122',
                margin: '0 -16px 20px -16px',
                padding: '0 16px',
                height: '64px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '32px', height: '32px', borderRadius: '4px', background: 'rgba(247, 202, 24, 0.2)',
                        border: '1px solid rgba(247, 202, 24, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#f7ca18'
                    }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>castle</span>
                    </div>
                    <h1 style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold', margin: 0 }}>Kingdom Manager</h1>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={onBack} style={{
                        width: '36px', height: '36px', borderRadius: '50%', background: '#2a1810', border: '1px solid #494122',
                        color: '#f0d090', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
                    </button>
                </div>
            </header>

            {/* Resource Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <ResourceCard
                    label="Gold"
                    value={formatRes(getRes('gold'))}
                    icon="payments"
                    color="#f7ca18"
                    gradient="linear-gradient(to bottom, #3a2e18, #231f10)"
                />
                <ResourceCard
                    label="Wood"
                    value={formatRes(getRes('wood_branch'))}
                    icon="forest"
                    color="#cd853f"
                    gradient="linear-gradient(to bottom, #2a1e15, #231f10)"
                />
                <ResourceCard
                    label="Stone"
                    value={formatRes(getRes('stone'))}
                    icon="landscape"
                    color="#a9a9a9"
                    gradient="linear-gradient(to bottom, #252525, #1a1a1a)"
                />
                <ResourceCard
                    label="Gems"
                    value={formatRes(getRes('gem_fragment'))}
                    icon="diamond"
                    color="#ec4899"
                    gradient="linear-gradient(to bottom, #2a1020, #1a0a10)"
                />
            </div>

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
                    <p style={{ color: 'rgba(240, 208, 144, 0.7)', fontSize: '12px', fontWeight: 'bold', margin: 0, textTransform: 'uppercase' }}>Workforce</p>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                        <span style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold' }}>{assignedCount}</span>
                        <span style={{ color: '#7a7a7a', fontSize: '12px' }}>/ {playerMonsters.length} Total</span>
                    </div>
                    <div style={{ color: '#0bda1d', fontSize: '10px', marginTop: '2px' }}>{availableCount} Available</div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid #494122', marginBottom: '16px', padding: '0 8px', overflowX: 'auto' }}>
                <button style={{
                    position: 'relative', paddingBottom: '12px', color: '#f7ca18', fontWeight: 'bold', fontSize: '14px',
                    background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'
                }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>home_work</span>
                    Facilities
                    <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '2px', background: '#f7ca18', boxShadow: '0 0 10px rgba(247, 202, 24, 0.5)' }} />
                </button>
                <button style={{
                    paddingBottom: '12px', color: '#7a7a7a', fontWeight: 'medium', fontSize: '14px',
                    background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '8px'
                }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>inventory_2</span>
                    Inventory
                </button>
                <button style={{
                    paddingBottom: '12px', color: '#7a7a7a', fontWeight: 'medium', fontSize: '14px',
                    background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '8px'
                }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>science</span>
                    Research
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

function ResourceCard({ label, value, icon, color, gradient }: { label: string, value: string, icon: string, color: string, gradient: string }) {
    return (
        <div style={{
            background: gradient,
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid #494122',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <div style={{ width: '36px', height: '36px', background: 'rgba(73, 65, 34, 0.5)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: color }}>
                <span className="material-symbols-outlined">{icon}</span>
            </div>
            <div>
                <p style={{ color: 'rgba(240, 208, 144, 0.7)', fontSize: '10px', fontWeight: 'bold', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
                <div style={{ display: 'baseline', gap: '4px' }}>
                    <span style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>{value}</span>
                </div>
            </div>
        </div>
    )
}
