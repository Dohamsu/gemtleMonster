import React, { useEffect, useRef } from 'react'
import { useGameStore } from '../../store/useGameStore'
import { RECIPES } from '../../data/recipes'
import { MATERIALS, MONSTERS } from '../../data/alchemyData'
import ResourceIcon from '../ResourceIcon'

export default function CauldronPanel() {
    const { alchemyState, startBrewing, completeBrewing, cancelBrewing } = useGameStore()
    const { selectedRecipeId, selectedIngredients, isBrewing, brewStartTime } = alchemyState

    const recipe = selectedRecipeId ? RECIPES.find(r => r.id === selectedRecipeId) : null
    const resultMonster = recipe ? MONSTERS[recipe.resultMonsterId] : null

    const progressRef = useRef<HTMLDivElement>(null)
    const animationFrameRef = useRef<number>(0)

    // Check if requirements are met
    const requirementsMet = React.useMemo(() => {
        if (!recipe) return false
        return recipe.materials.every(req => {
            const added = selectedIngredients[req.materialId] || 0
            return added >= req.count
        })
    }, [recipe, selectedIngredients])

    // Calculate missing ingredients for display
    const missingIngredients = React.useMemo(() => {
        if (!recipe) return []
        return recipe.materials.map(req => {
            const added = selectedIngredients[req.materialId] || 0
            const missing = Math.max(0, req.count - added)
            return { ...req, missing, added }
        })
    }, [recipe, selectedIngredients])

    // Handle Brewing Animation & Logic
    useEffect(() => {
        if (!isBrewing || !recipe || !brewStartTime) return

        const duration = recipe.craftTimeSec * 1000

        const animate = () => {
            const now = Date.now()
            const elapsed = now - brewStartTime
            const progress = Math.min(1, elapsed / duration)

            if (progressRef.current) {
                progressRef.current.style.width = `${progress * 100}%`
            }

            if (progress >= 1) {
                // Complete!
                completeBrewing(recipe.resultMonsterId, 1, selectedIngredients)
                alert(`연금 성공! ${resultMonster?.name} 획득!`) // Simple feedback for now
            } else {
                animationFrameRef.current = requestAnimationFrame(animate)
            }
        }

        animationFrameRef.current = requestAnimationFrame(animate)

        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
        }
    }, [isBrewing, brewStartTime, recipe, completeBrewing, resultMonster, selectedIngredients])

    if (!recipe || !resultMonster) {
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
                <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
                    {missingIngredients.map((req, idx) => {
                        const material = MATERIALS[req.materialId]
                        const isFulfilled = req.added >= req.count
                        return (
                            <div key={idx} style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                opacity: isFulfilled ? 1 : 0.7
                            }}>
                                <div style={{
                                    width: '50px',
                                    height: '50px',
                                    background: '#2a2a2a',
                                    border: isFulfilled ? '1px solid #22c55e' : '1px solid #ef4444',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    marginBottom: '5px',
                                    position: 'relative'
                                }}>
                                    <ResourceIcon resourceId={req.materialId} size={24} />
                                    {isFulfilled && (
                                        <div style={{
                                            position: 'absolute',
                                            bottom: '-5px',
                                            right: '-5px',
                                            background: '#22c55e',
                                            borderRadius: '50%',
                                            width: '16px',
                                            height: '16px',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            fontSize: '10px',
                                            color: 'white'
                                        }}>✓</div>
                                    )}
                                </div>
                                <span style={{ fontSize: '0.8em', color: '#ccc' }}>{material.name}</span>
                                <span style={{ fontSize: '0.8em', color: isFulfilled ? '#22c55e' : '#ef4444' }}>
                                    {req.added} / {req.count}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Stats */}
            <div style={{
                display: 'flex',
                gap: '20px',
                marginBottom: '30px',
                background: '#2a2a2a',
                padding: '10px 20px',
                borderRadius: '20px'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.8em', color: '#888' }}>성공 확률</div>
                    <div style={{ color: '#22c55e', fontWeight: 'bold' }}>{recipe.successRate}%</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.8em', color: '#888' }}>소요 시간</div>
                    <div style={{ color: '#fff', fontWeight: 'bold' }}>{recipe.craftTimeSec}초</div>
                </div>
            </div>

            {/* Action Button */}
            {isBrewing ? (
                <div style={{ width: '100%', maxWidth: '300px' }}>
                    <div style={{
                        width: '100%',
                        height: '10px',
                        background: '#333',
                        borderRadius: '5px',
                        overflow: 'hidden',
                        marginBottom: '10px'
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
                        onClick={cancelBrewing}
                        style={{
                            width: '100%',
                            padding: '12px',
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        취소
                    </button>
                </div>
            ) : (
                <button
                    disabled={!requirementsMet}
                    onClick={startBrewing}
                    style={{
                        width: '100%',
                        maxWidth: '300px',
                        padding: '15px',
                        background: requirementsMet ? 'linear-gradient(135deg, #8b5cf6, #6366f1)' : '#444',
                        color: requirementsMet ? 'white' : '#888',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: requirementsMet ? 'pointer' : 'not-allowed',
                        fontSize: '1.1em',
                        fontWeight: 'bold',
                        boxShadow: requirementsMet ? '0 4px 15px rgba(139, 92, 246, 0.4)' : 'none',
                        transition: 'all 0.2s'
                    }}
                >
                    {requirementsMet ? '연금술 시작' : '재료 부족'}
                </button>
            )}
        </div>
    )
}
