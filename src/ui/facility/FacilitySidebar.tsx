import type { FacilityData } from '../../types/idle'
import FacilityIcon from '../FacilityIcon'

interface FacilitySidebarProps {
    facilities: FacilityData[]
    playerFacilities: Record<string, number>
    selectedId: string | null
    onSelect: (id: string) => void
}

export default function FacilitySidebar({ facilities, playerFacilities, selectedId, onSelect }: FacilitySidebarProps) {
    return (
        <div style={{
            width: '280px',
            background: '#231610',
            borderRight: '2px solid #5a4030',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto'
        }}>
            <div style={{ padding: '15px', borderBottom: '1px solid #3d2b20', fontSize: '0.8em', color: '#b0a090', fontWeight: 'bold' }}>
                시설 목록
            </div>

            {facilities.map(facility => {
                const level = playerFacilities[facility.id] || 0
                const isSelected = selectedId === facility.id

                return (
                    <div
                        key={facility.id}
                        onClick={() => onSelect(facility.id)}
                        style={{
                            padding: '15px 20px',
                            cursor: 'pointer',
                            background: isSelected ? 'rgba(250, 204, 21, 0.1)' : 'transparent',
                            borderLeft: isSelected ? '4px solid #facc15' : '4px solid transparent',
                            borderBottom: '1px solid #3d2b20',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}
                    >
                        <div style={{
                            width: '40px',
                            height: '40px',
                            background: '#1a0f0a',
                            borderRadius: '6px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            border: isSelected ? '1px solid #facc15' : '1px solid #5a4030',
                            overflow: 'hidden'
                        }}>
                            <FacilityIcon id={facility.id} level={level} size={32} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                            <span style={{ fontSize: '1em', fontWeight: 'bold', color: isSelected ? '#facc15' : '#f0d090' }}>
                                {facility.name}
                            </span>
                            <span style={{ fontSize: '0.8em', color: '#b0a090' }}>
                                Level {level}
                            </span>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

