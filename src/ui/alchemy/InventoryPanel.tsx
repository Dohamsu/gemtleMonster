import React from 'react'
import { useGameStore } from '../../store/useGameStore'
import { MATERIALS, MONSTERS } from '../../data/alchemyData'
import ResourceIcon from '../ResourceIcon'

export default function InventoryPanel() {
    const { resources, addIngredient } = useGameStore()
    const [activeTab, setActiveTab] = React.useState<'materials' | 'monsters'>('materials')

    // Filter resources to find materials
    const ownedMaterials = Object.entries(resources).filter(([id, count]) => {
        return MATERIALS[id] && count > 0
    })

    // Filter resources to find monsters (assuming monsters are stored in resources for now)
    const ownedMonsters = Object.entries(resources).filter(([id, count]) => {
        return MONSTERS[id] && count > 0
    })

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #333' }}>
                <button
                    onClick={() => setActiveTab('materials')}
                    style={{
                        flex: 1,
                        padding: '10px',
                        background: activeTab === 'materials' ? '#333' : 'transparent',
                        color: activeTab === 'materials' ? '#fff' : '#888',
                        border: 'none',
                        cursor: 'pointer'
                    }}
                >
                    재료
                </button>
                <button
                    onClick={() => setActiveTab('monsters')}
                    style={{
                        flex: 1,
                        padding: '10px',
                        background: activeTab === 'monsters' ? '#333' : 'transparent',
                        color: activeTab === 'monsters' ? '#fff' : '#888',
                        border: 'none',
                        cursor: 'pointer'
                    }}
                >
                    몬스터
                </button>
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
                {activeTab === 'materials' ? (
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
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {ownedMonsters.map(([id, count]) => {
                            const monster = MONSTERS[id]
                            return (
                                <div
                                    key={id}
                                    style={{
                                        background: '#2a2a2a',
                                        border: '1px solid #333',
                                        borderRadius: '6px',
                                        padding: '10px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                >
                                    <div>
                                        <div style={{ fontWeight: 'bold', color: '#ddd' }}>{monster.name}</div>
                                        <div style={{ fontSize: '0.8em', color: '#888' }}>{monster.role} / {monster.element}</div>
                                    </div>
                                    <div style={{ fontSize: '0.9em', color: '#aaa' }}>x{count}</div>
                                </div>
                            )
                        })}
                        {ownedMonsters.length === 0 && (
                            <div style={{ textAlign: 'center', color: '#666', marginTop: '20px' }}>
                                보유한 몬스터가 없습니다.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
