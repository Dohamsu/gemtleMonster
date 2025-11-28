import { useGameStore } from '../../store/useGameStore'
import { MATERIALS } from '../../data/alchemyData'
import ResourceIcon from '../ResourceIcon'

export default function InventoryPanel() {
    const { resources, addIngredient } = useGameStore()

    // Filter resources to find materials
    const ownedMaterials = Object.entries(resources).filter(([id, count]) => {
        return MATERIALS[id] && count > 0
    })

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ padding: '10px', borderBottom: '1px solid #333', fontWeight: 'bold', color: '#eee' }}>
                보유 재료
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    {ownedMaterials.map(([id, count]) => {
                        const material = MATERIALS[id]
                        return (
                            <div
                                key={id}
                                onClick={() => addIngredient(id, 1)}
                                style={{
                                    background: '#2a2a2a',
                                    border: '1px solid #333',
                                    borderRadius: '6px',
                                    padding: '8px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    position: 'relative'
                                }}
                            >
                                <ResourceIcon resourceId={id} size={24} />
                                <span style={{ fontSize: '0.8em', marginTop: '4px', textAlign: 'center', wordBreak: 'break-word' }}>
                                    {material.name}
                                </span>
                                <span style={{
                                    position: 'absolute',
                                    top: '4px',
                                    right: '4px',
                                    fontSize: '0.75em',
                                    color: '#aaa',
                                    background: 'rgba(0,0,0,0.5)',
                                    padding: '1px 4px',
                                    borderRadius: '4px'
                                }}>
                                    {count}
                                </span>
                            </div>
                        )
                    })}
                    {ownedMaterials.length === 0 && (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#666', marginTop: '20px' }}>
                            보유한 재료가 없습니다.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
