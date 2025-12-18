import type { FacilityData } from '../../types/facility'
import FacilityIcon from '../FacilityIcon'

interface FacilityMobileCardProps {
    facility: FacilityData
    level: number
    onClick: () => void
}

export default function FacilityMobileCard({ facility, level, onClick }: FacilityMobileCardProps) {
    const levelData = facility.levels.find((l) => l.level === level)

    const prodRate = levelData?.stats?.bundlesPerTick ? `+${levelData.stats.bundlesPerTick}/tick` : 'Inactive'

    return (
        <div
            onClick={onClick}
            style={{
                background: level > 0 ? '#1e1912' : 'rgba(30, 25, 18, 0.7)',
                border: '1px solid #494122',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
                opacity: level > 0 ? 1 : 0.7
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                    width: '40px', height: '40px', background: '#1a1612', border: '1px solid #494122',
                    borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
                }}>
                    <FacilityIcon id={facility.id} level={level} size={32} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <h4 style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold', margin: 0 }}>{facility.name}</h4>
                    {level > 0 ? (
                        <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                            <span style={{
                                background: '#494122', color: '#f7ca18', fontSize: '10px',
                                padding: '2px 6px', borderRadius: '4px', border: '1px solid #695d30', fontWeight: 'bold'
                            }}>LVL {level}</span>
                        </div>
                    ) : (
                        <span style={{ color: '#7a7a7a', fontSize: '10px', marginTop: '4px' }}>Not Constructed</span>
                    )}
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {level > 0 ? (
                    <div style={{
                        background: '#2a1810', color: '#ccc08f', fontSize: '12px',
                        padding: '4px 8px', borderRadius: '12px', border: '1px solid #494122',
                        display: 'flex', alignItems: 'center', gap: '4px'
                    }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                            {facility.id === 'mine' ? 'payments' :
                                facility.id === 'herb_farm' ? 'forest' :
                                    facility.id === 'blacksmith' ? 'handyman' : 'landscape'}
                        </span>
                        {prodRate}
                    </div>
                ) : (
                    <div style={{
                        background: '#2a1810', color: '#7a7a7a', fontSize: '12px',
                        padding: '4px 8px', borderRadius: '12px', border: '1px solid #494122',
                        display: 'flex', alignItems: 'center', gap: '4px'
                    }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>lock</span>
                        Inactive
                    </div>
                )}
                <span className="material-symbols-outlined" style={{ color: '#f0d090', fontSize: '18px' }}>chevron_right</span>
            </div>
        </div>
    )
}
