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

    // 재료의 총 개수를 계산 (종류가 아닌 실제 개수)
    const ingredientCount = Object.values(selectedIngredients).reduce((sum, count) => sum + count, 0)

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '20px', alignItems: 'center' }}>
            {/* Header Info */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: '0 0 5px 0', color: '#fff' }}>📦 재료 인벤토리</h2>
                <div style={{ color: '#aaa', fontSize: '0.9em' }}>보유 재료를 확인하세요 (조합은 Canvas에서)</div>
            </div>

            {/* Canvas에서 선택한 재료 (읽기 전용) */}
            {ingredientCount > 0 && (
                <div style={{ width: '100%', marginBottom: '20px' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#ddd', textAlign: 'center' }}>
                        Canvas에서 선택한 재료 ({ingredientCount}개)
                    </h4>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
                        {Object.entries(selectedIngredients).map(([materialId, count]) => {
                            const material = allMaterials.find(m => m.id === materialId)
                            return (
                                <div key={materialId} style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center'
                                }}>
                                    <div style={{
                                        width: '60px',
                                        height: '60px',
                                        background: '#1e293b',
                                        border: '2px solid #3b82f6',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        marginBottom: '5px',
                                        position: 'relative'
                                    }}>
                                        <ResourceIcon resourceId={materialId} size={28} />

                                        {/* Count badge */}
                                        <div style={{
                                            position: 'absolute',
                                            bottom: '-5px',
                                            right: '-5px',
                                            background: '#3b82f6',
                                            borderRadius: '50%',
                                            minWidth: '24px',
                                            height: '24px',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            fontSize: '12px',
                                            color: 'white',
                                            fontWeight: 'bold',
                                            padding: '0 4px'
                                        }}>×{count}</div>
                                    </div>
                                    <span style={{ fontSize: '11px', color: '#cbd5e1', textAlign: 'center', maxWidth: '80px' }}>
                                        {material?.name || materialId}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Available Materials (읽기 전용) */}
            <div style={{ marginTop: '30px', width: '100%', maxWidth: '500px' }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#ddd', textAlign: 'center' }}>보유 재료</h4>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                    gap: '10px',
                    maxHeight: '400px',
                    overflowY: 'auto',
                    padding: '10px',
                    background: '#1e293b',
                    borderRadius: '8px',
                    border: '1px solid #334155'
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
                                    <ResourceIcon resourceId={material.id} size={32} />
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
