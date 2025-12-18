import { useGameStore } from '../../store/useGameStore'
import { useAlchemyStore } from '../../store/useAlchemyStore'
import ResourceIcon from '../ResourceIcon'

interface ResourceHeaderProps {
    onBack: () => void
}

export default function ResourceHeader({ onBack }: ResourceHeaderProps) {
    const { resources } = useGameStore()
    const { playerMaterials } = useAlchemyStore()

    const getRes = (id: string) => (resources[id] || playerMaterials[id] || 0).toLocaleString()

    return (
        <div style={{
            height: '60px',
            background: '#2a1810',
            borderBottom: '2px solid #5a4030',
            padding: '0 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
            zIndex: 10
        }}>
            {/* Back Button */}
            <button
                onClick={onBack}
                style={{
                    background: 'none',
                    border: '1px solid #5a4030',
                    color: '#f0d090',
                    padding: '6px 15px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.9em',
                    fontWeight: 'bold',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#3d2b20'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
            >
                ← 돌아가기
            </button>

            {/* Resources List */}
            <div style={{ display: 'flex', gap: '25px', alignItems: 'center' }}>
                <ResourceItem resourceId="gold" label="Gold" value={getRes('gold')} color="#ffd700" />
                <ResourceItem resourceId="wood_branch" label="Wood" value={getRes('wood_branch')} color="#a0522d" />
                <ResourceItem resourceId="stone" label="Stone" value={getRes('stone')} color="#808080" />
                <ResourceItem resourceId="gem_fragment" label="Gems" value={getRes('gem_fragment')} color="#00ffff" />
                <ResourceItem resourceId="soul_fragment" label="Essence" value={getRes('soul_fragment')} color="#b19cd9" />
            </div>

            {/* Empty space to balance the layout */}
            <div style={{ width: '100px' }} />
        </div>
    )
}

function ResourceItem({ resourceId, label, value, color }: { resourceId: string, label: string, value: string, color: string }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ResourceIcon resourceId={resourceId} size={24} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.75em', color: '#b0a090', fontWeight: 'bold' }}>{label}</span>
                <span style={{ fontSize: '1.1em', fontWeight: 'bold', color: color, letterSpacing: '0.5px' }}>{value}</span>
            </div>
        </div>
    )
}
