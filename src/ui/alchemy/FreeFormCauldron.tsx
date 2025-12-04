import { useAlchemyStore } from '../../store/useAlchemyStore'
import ResourceIcon from '../ResourceIcon'
import { useShallow } from 'zustand/react/shallow'
import { useUnifiedInventory } from '../../hooks/useUnifiedInventory'

/**
 * 인벤토리 조회 UI
 * 보유 재료와 Canvas에서 선택한 재료를 표시합니다 (읽기 전용)
 */
export default function FreeFormCauldron() {
    const {
        allMaterials,
        selectedIngredients
    } = useAlchemyStore(
        useShallow(state => ({
            allMaterials: state.allMaterials,
            selectedIngredients: state.selectedIngredients
        }))
    )
    const { materialCounts: playerMaterials } = useUnifiedInventory()

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            alignItems: 'center',
            overflow: 'auto',
            boxSizing: 'border-box',
            minHeight: 0
        }}>
            {/* Available Materials (읽기 전용) */}
            <div style={{
                marginTop: '30px',
                width: '100%',
                maxWidth: '500px',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0
            }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#ddd', textAlign: 'center' }}>보유 재료</h4>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                    gap: '10px',
                    flex: 1,
                    overflowY: 'auto',
                    padding: '10px',
                    background: '#1e293b',
                    borderRadius: '8px',
                    border: '1px solid #334155',
                    minHeight: 0
                }}>
                    {allMaterials
                        .filter(m => (playerMaterials[m.id] || 0) > 0)
                        .map(material => {
                            const available = playerMaterials[material.id] || 0
                            const used = selectedIngredients[material.id] || 0

                            return (
                                <div
                                    key={material.id}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        padding: '8px',
                                        background: '#0f172a',
                                        borderRadius: '6px',
                                        border: used > 0 ? '2px solid #3b82f6' : '1px solid #334155',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <ResourceIcon
                                        resourceId={material.id}
                                        size={32}
                                        iconUrl={material.icon_url}
                                    />
                                    <span style={{
                                        fontSize: '10px',
                                        color: '#cbd5e1',
                                        marginTop: '4px',
                                        textAlign: 'center'
                                    }}>
                                        {material.name}
                                    </span>
                                    <span style={{
                                        fontSize: '11px',
                                        fontWeight: 'bold',
                                        color: used > 0 ? '#3b82f6' : '#94a3b8'
                                    }}>
                                        {available}개 보유
                                    </span>
                                    {used > 0 && (
                                        <span style={{
                                            fontSize: '10px',
                                            color: '#3b82f6',
                                            marginTop: '2px'
                                        }}>
                                            ({used}개 사용 중)
                                        </span>
                                    )}
                                </div>
                            )
                        })}
                </div>
            </div>
        </div>
    )
}
