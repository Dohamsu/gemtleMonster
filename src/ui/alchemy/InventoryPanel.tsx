import { useGameStore } from '../../store/useGameStore'
import { useUnifiedInventory } from '../../hooks/useUnifiedInventory'
import ResourceIcon from '../ResourceIcon'

export default function InventoryPanel() {
    const { addIngredient } = useGameStore()
    const { materials, materialCounts } = useUnifiedInventory()

    // 보유한 재료만 필터링 (수량 > 0)
    const ownedMaterials = materials.filter(m => {
        const count = materialCounts[m.id] || 0
        return count > 0
    })

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ padding: '10px', borderBottom: '1px solid #333', fontWeight: 'bold', color: '#eee' }}>
                보유 재료
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    {ownedMaterials.map((material) => {
                        const count = materialCounts[material.id] || 0
                        return (
                            <div
                                key={material.id}
                                onClick={() => addIngredient(material.id, 1)}
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
                                <ResourceIcon resourceId={material.id} size={24} />
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
