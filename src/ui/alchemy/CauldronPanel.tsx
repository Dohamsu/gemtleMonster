import React, { useEffect, useRef } from 'react'
import { useAlchemyStore } from '../../store/useAlchemyStore'
import ResourceIcon from '../ResourceIcon'

export default function CauldronPanel() {
    const {
        allMaterials,
        allRecipes,
        selectedRecipeId,
        selectedIngredients,
        isBrewing,
        brewStartTime,
        canCraft,
        startBrewing,
        completeBrewing,
        clearIngredients,
        addIngredient,
        removeIngredient
    } = useAlchemyStore()

    const recipe = selectedRecipeId ? allRecipes.find(r => r.id === selectedRecipeId) : null

    const progressRef = useRef<HTMLDivElement>(null)
    const animationFrameRef = useRef<number>(0)

    // Check if requirements are met
    const craftCheck = recipe ? canCraft(recipe.id) : { can: false, missingMaterials: [] }
    const requirementsMet = craftCheck.can

    // Calculate ingredients display info
    const ingredientsDisplay = React.useMemo(() => {
        if (!recipe || !recipe.ingredients) return []
        return recipe.ingredients.map(ing => {
            const material = allMaterials.find(m => m.id === ing.material_id)
            const added = selectedIngredients[ing.material_id] || 0
            const needed = ing.quantity
            const isFulfilled = added >= needed
            return {
                material,
                materialId: ing.material_id,
                added,
                needed,
                isFulfilled,
                isCatalyst: ing.is_catalyst
            }
        })
    }, [recipe, allMaterials, selectedIngredients])

    // Handle Brewing Animation & Logic
    useEffect(() => {
        if (!isBrewing || !recipe || !brewStartTime) return

        const duration = recipe.craft_time_sec * 1000

        const animate = () => {
            const now = Date.now()
            const elapsed = now - brewStartTime
            const progress = Math.min(1, elapsed / duration)

            if (progressRef.current) {
                progressRef.current.style.width = `${progress * 100}%`
            }

            if (progress >= 1) {
                // Complete!
                const success = Math.random() * 100 < recipe.base_success_rate
                completeBrewing(success)
                if (success) {
                    alert(`✅ 연금 성공! ${recipe.name} 획득!`)
                } else {
                    alert(`❌ 연금 실패...`)
                }
            } else {
                animationFrameRef.current = requestAnimationFrame(animate)
            }
        }

        animationFrameRef.current = requestAnimationFrame(animate)

        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
        }
    }, [isBrewing, brewStartTime, recipe, completeBrewing])

    if (!recipe) {
        return (
            <div style={{
                flex: 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: '#666',
                flexDirection: 'column',
                gap: '10px'
            }}>
                <div style={{ fontSize: '3em' }}>⚗️</div>
                <div>레시피를 선택해주세요</div>
            </div>
        )
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '20px', alignItems: 'center' }}>
            {/* Header Info */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: '0 0 5px 0', color: '#fff' }}>{recipe.name}</h2>
                <div style={{ color: '#aaa', fontSize: '0.9em' }}>{recipe.description}</div>
            </div>

            {/* Cauldron Visual (Placeholder) */}
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

                {/* Result Preview (if not brewing) */}
                {!isBrewing && (
                    <div style={{
                        position: 'absolute',
                        top: '-10px',
                        right: '-10px',
                        background: '#222',
                        border: '1px solid #444',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        fontSize: '1.5em'
                    }}>
                        ?
                    </div>
                )}
            </div>

            {/* Ingredients Slots */}
            <div style={{ width: '100%', marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#ddd', textAlign: 'center' }}>필요 재료</h4>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
                    {ingredientsDisplay.map((ing, idx) => (
                        <div key={idx} style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            opacity: ing.isFulfilled ? 1 : 0.7
                        }}>
                            <div style={{
                                width: '60px',
                                height: '60px',
                                background: '#1e293b',
                                border: ing.isFulfilled ? '2px solid #22c55e' : '2px solid #ef4444',
                                borderRadius: '8px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginBottom: '5px',
                                position: 'relative',
                                cursor: 'pointer'
                            }}
                                onClick={() => {
                                    if (ing.added > 0) {
                                        removeIngredient(ing.materialId, 1)
                                    }
                                }}
                                onContextMenu={(e) => {
                                    e.preventDefault()
                                    addIngredient(ing.materialId, 1)
                                }}
                            >
                                <ResourceIcon resourceId={ing.materialId} size={28} />
                                {ing.isFulfilled && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '-5px',
                                        right: '-5px',
                                        background: '#22c55e',
                                        borderRadius: '50%',
                                        width: '20px',
                                        height: '20px',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        fontSize: '12px',
                                        color: 'white',
                                        fontWeight: 'bold'
                                    }}>✓</div>
                                )}
                                {ing.isCatalyst && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '-5px',
                                        left: '-5px',
                                        background: '#7c3aed',
                                        borderRadius: '50%',
                                        width: '20px',
                                        height: '20px',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        fontSize: '10px',
                                        color: 'white',
                                        fontWeight: 'bold'
                                    }}>⭐</div>
                                )}
                            </div>
                            <span style={{ fontSize: '11px', color: '#cbd5e1', textAlign: 'center', maxWidth: '80px' }}>
                                {ing.material?.name || ing.materialId}
                            </span>
                            <span style={{ fontSize: '12px', fontWeight: 'bold', color: ing.isFulfilled ? '#22c55e' : '#ef4444' }}>
                                {ing.added} / {ing.needed}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Stats */}
            <div style={{
                display: 'flex',
                gap: '20px',
                marginBottom: '30px',
                background: '#1e293b',
                padding: '12px 24px',
                borderRadius: '20px',
                border: '1px solid #334155'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>성공 확률</div>
                    <div style={{ color: '#22c55e', fontWeight: 'bold', fontSize: '18px' }}>{recipe.base_success_rate}%</div>
                </div>
                <div style={{
                    width: '1px',
                    background: '#334155'
                }} />
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>소요 시간</div>
                    <div style={{ color: '#f0e68c', fontWeight: 'bold', fontSize: '18px' }}>{recipe.craft_time_sec}초</div>
                </div>
                <div style={{
                    width: '1px',
                    background: '#334155'
                }} />
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>필요 레벨</div>
                    <div style={{ color: '#3b82f6', fontWeight: 'bold', fontSize: '18px' }}>Lv.{recipe.required_alchemy_level}</div>
                </div>
            </div>

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
                    {!requirementsMet && (
                        <div style={{
                            marginBottom: '12px',
                            padding: '8px 12px',
                            background: '#7f1d1d',
                            color: '#fecaca',
                            borderRadius: '6px',
                            fontSize: '12px',
                            textAlign: 'center'
                        }}>
                            {craftCheck.missingMaterials[0] || '재료를 확인하세요'}
                        </div>
                    )}
                    <button
                        disabled={!requirementsMet}
                        onClick={() => {
                            if (recipe) startBrewing(recipe.id)
                        }}
                        style={{
                            width: '100%',
                            padding: '16px',
                            background: requirementsMet ? 'linear-gradient(135deg, #8b5cf6, #6366f1)' : '#475569',
                            color: requirementsMet ? 'white' : '#94a3b8',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: requirementsMet ? 'pointer' : 'not-allowed',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            boxShadow: requirementsMet ? '0 4px 15px rgba(139, 92, 246, 0.4)' : 'none',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            if (requirementsMet) {
                                e.currentTarget.style.transform = 'translateY(-2px)'
                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(139, 92, 246, 0.6)'
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (requirementsMet) {
                                e.currentTarget.style.transform = 'translateY(0)'
                                e.currentTarget.style.boxShadow = '0 4px 15px rgba(139, 92, 246, 0.4)'
                            }
                        }}
                    >
                        {requirementsMet ? '🧪 연금술 시작!' : '재료 부족'}
                    </button>
                </div>
            )}
        </div>
    )
}
