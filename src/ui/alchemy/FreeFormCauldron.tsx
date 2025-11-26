import { useEffect, useRef } from 'react'
import { useAlchemyStore } from '../../store/useAlchemyStore'
import { useGameStore } from '../../store/useGameStore'
import ResourceIcon from '../ResourceIcon'
import { ALCHEMY } from '../../constants/game'

/**
 * 자유 조합 가마솥 UI
 * 재료를 자유롭게 넣고 조합을 시도할 수 있습니다.
 */
export default function FreeFormCauldron() {
    const {
        allMaterials,
        playerMaterials: alchemyMaterials,
        selectedIngredients,
        isBrewing,
        brewStartTime,
        brewProgress,
        canStartBrewing,
        startFreeFormBrewing,
        clearIngredients,
        addIngredient,
        removeIngredient
    } = useAlchemyStore()

    const { resources } = useGameStore()

    // 두 스토어의 재료 병합 (gameStore의 resources가 실시간 업데이트됨)
    const playerMaterials = { ...alchemyMaterials, ...resources }

    const progressRef = useRef<HTMLDivElement>(null)

    // Update progress bar visually
    useEffect(() => {
        if (progressRef.current && isBrewing) {
            progressRef.current.style.width = `${brewProgress * 100}%`
        }
    }, [brewProgress, isBrewing])

    const canBrew = canStartBrewing()
    const ingredientCount = Object.keys(selectedIngredients).length
    const maxSlots = ALCHEMY.MAX_INGREDIENT_SLOTS

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '20px', alignItems: 'center' }}>
            {/* Header Info */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: '0 0 5px 0', color: '#fff' }}>자유 연금술</h2>
                <div style={{ color: '#aaa', fontSize: '0.9em' }}>재료를 자유롭게 조합해보세요</div>
            </div>

            {/* Cauldron Visual */}
            <div style={{
                width: '120px',
                height: '120px',
                background: isBrewing ? '#4a1d96' : '#333',
                borderRadius: '50%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: '30px',
                position: 'relative',
                boxShadow: isBrewing ? '0 0 20px #8b5cf6' : 'none',
                transition: 'all 0.5s'
            }}>
                <span style={{ fontSize: '3em' }}>
                    {isBrewing ? '🔥' : '⚗️'}
                </span>

                {/* Ingredient count badge */}
                {ingredientCount > 0 && !isBrewing && (
                    <div style={{
                        position: 'absolute',
                        top: '-10px',
                        right: '-10px',
                        background: '#22c55e',
                        border: '2px solid #166534',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        fontSize: '1.2em',
                        fontWeight: 'bold',
                        color: 'white'
                    }}>
                        {ingredientCount}
                    </div>
                )}
            </div>

            {/* Ingredient Slots */}
            <div style={{ width: '100%', marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#ddd', textAlign: 'center' }}>
                    재료 슬롯 ({ingredientCount}/{maxSlots})
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
                                    position: 'relative',
                                    cursor: 'pointer'
                                }}
                                    onClick={() => removeIngredient(materialId, 1)}
                                    onContextMenu={(e) => {
                                        e.preventDefault()
                                        addIngredient(materialId, 1)
                                    }}
                                >
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

                    {/* Empty slots */}
                    {ingredientCount < maxSlots && Array.from({ length: maxSlots - ingredientCount }).map((_, idx) => (
                        <div key={`empty-${idx}`} style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center'
                        }}>
                            <div style={{
                                width: '60px',
                                height: '60px',
                                background: '#1e293b',
                                border: '2px dashed #475569',
                                borderRadius: '8px',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginBottom: '5px',
                                color: '#475569',
                                fontSize: '24px'
                            }}>
                                +
                            </div>
                            <span style={{ fontSize: '11px', color: '#475569' }}>빈 슬롯</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Hint */}
            {!isBrewing && ingredientCount === 0 && (
                <div style={{
                    marginBottom: '20px',
                    padding: '12px 20px',
                    background: '#1e293b',
                    color: '#94a3b8',
                    borderRadius: '8px',
                    fontSize: '13px',
                    textAlign: 'center',
                    border: '1px solid #334155'
                }}>
                    💡 아래 재료 목록에서 재료를 클릭하여 추가하세요
                </div>
            )}

            {/* Action Button */}
            {isBrewing ? (
                <div style={{ width: '100%', maxWidth: '400px' }}>
                    <div style={{
                        width: '100%',
                        height: '12px',
                        background: '#1e293b',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        marginBottom: '12px',
                        border: '1px solid #334155'
                    }}>
                        <div
                            ref={progressRef}
                            style={{
                                width: '0%',
                                height: '100%',
                                background: 'linear-gradient(90deg, #8b5cf6, #ec4899)',
                                transition: 'width 0.1s linear'
                            }}
                        />
                    </div>
                    <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '14px', marginBottom: '12px' }}>
                        {brewStartTime ? `조합 중... ${Math.floor(brewProgress * 100)}%` : '조합 중...'}
                    </div>
                    <button
                        onClick={clearIngredients}
                        style={{
                            width: '100%',
                            padding: '14px',
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '15px'
                        }}
                    >
                        취소
                    </button>
                </div>
            ) : (
                <div style={{ width: '100%', maxWidth: '400px' }}>
                    {ingredientCount > 0 && (
                        <button
                            onClick={clearIngredients}
                            style={{
                                width: '100%',
                                padding: '10px',
                                background: 'transparent',
                                color: '#ef4444',
                                border: '1px solid #ef4444',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                marginBottom: '12px'
                            }}
                        >
                            재료 전체 제거
                        </button>
                    )}
                    <button
                        disabled={!canBrew}
                        onClick={startFreeFormBrewing}
                        style={{
                            width: '100%',
                            padding: '16px',
                            background: canBrew ? 'linear-gradient(135deg, #8b5cf6, #6366f1)' : '#475569',
                            color: canBrew ? 'white' : '#94a3b8',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: canBrew ? 'pointer' : 'not-allowed',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            boxShadow: canBrew ? '0 4px 15px rgba(139, 92, 246, 0.4)' : 'none',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            if (canBrew) {
                                e.currentTarget.style.transform = 'translateY(-2px)'
                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(139, 92, 246, 0.6)'
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (canBrew) {
                                e.currentTarget.style.transform = 'translateY(0)'
                                e.currentTarget.style.boxShadow = '0 4px 15px rgba(139, 92, 246, 0.4)'
                            }
                        }}
                    >
                        {canBrew ? '🧪 연금술 시작!' : '재료를 추가하세요'}
                    </button>
                </div>
            )}

            {/* Available Materials */}
            {!isBrewing && (
                <div style={{ marginTop: '30px', width: '100%', maxWidth: '500px' }}>
                    <h4 style={{ margin: '0 0 15px 0', color: '#ddd', textAlign: 'center' }}>보유 재료</h4>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                        gap: '10px',
                        maxHeight: '200px',
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
                                const canAdd = ingredientCount < maxSlots && used < available

                                return (
                                    <div
                                        key={material.id}
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            padding: '8px',
                                            background: canAdd ? '#0f172a' : '#1e293b',
                                            borderRadius: '6px',
                                            cursor: canAdd ? 'pointer' : 'not-allowed',
                                            opacity: canAdd ? 1 : 0.5,
                                            border: used > 0 ? '2px solid #3b82f6' : '1px solid #334155',
                                            transition: 'all 0.2s'
                                        }}
                                        onClick={() => canAdd && addIngredient(material.id, 1)}
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
                                            {available - used}/{available}
                                        </span>
                                    </div>
                                )
                            })}
                    </div>
                </div>
            )}
        </div>
    )
}
