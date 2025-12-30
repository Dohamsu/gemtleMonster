import React from 'react'
import type { Recipe, Material } from '../../lib/alchemyApi'
import { ALCHEMY } from '../../constants/game'
import { isMobileView } from '../../utils/responsiveUtils'

interface CauldronAreaProps {
    allRecipes: Recipe[]
    allMaterials: Material[]
    selectedRecipeId: string | null
    selectedIngredients: Record<string, number>
    isBrewing: boolean
    onRemoveIngredient: (materialId: string) => void
}

const ICON_MAP: Record<string, string> = {
    PLANT: '🌿',
    MINERAL: '💎',
    BEAST: '🦴',
    SLIME: '🟢',
    SPIRIT: '✨',
    SPECIAL: '🌟',
    CONSUMABLE: '🧪'
}

export default function CauldronArea({
    allRecipes,
    allMaterials,
    selectedRecipeId,
    selectedIngredients,
    isBrewing,
    onRemoveIngredient
}: CauldronAreaProps) {
    const [isMobile, setIsMobile] = React.useState(false)

    React.useEffect(() => {
        const handleResize = () => setIsMobile(isMobileView())
        handleResize()
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    // Calculate Layout Constants based on Mobile/Desktop
    const cauldronSize = isMobile ? 120 : 200
    const slotSize = isMobile ? 50 : 60
    const slotGap = isMobile ? 8 : 10
    const iconSize = slotSize * 0.6

    // Requirements logic
    const selectedRecipe = allRecipes.find(r => r.id === selectedRecipeId)
    const requiredMap: Record<string, number> = {}

    // Recipe type from supabase has ingredients property
    if (selectedRecipe && selectedRecipe.ingredients) {
        selectedRecipe.ingredients.forEach(ing => {
            requiredMap[ing.materialId] = ing.quantity
        })
    }

    const ingredientEntries = Object.entries(selectedIngredients)

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            // flex: 1, // fill available space
            position: 'relative',
            // padding: '20px',
            // minHeight: isMobile ? '300px' : '400px'
        }}>

            {/* Cauldron Circle */}
            <div style={{
                width: `${cauldronSize}px`,
                height: `${cauldronSize}px`,
                borderRadius: '50%',
                backgroundColor: '#1a1410',
                border: '4px solid #6a4020',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: isMobile ? '15px' : '20px',
                position: 'relative',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                transition: 'all 0.3s ease',
                animation: isBrewing ? 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both infinite' : 'none'
            }}>
                <style>{`
                    @keyframes shake {
                        10%, 90% { transform: translate3d(-1px, 0, 0) scale(1.02); }
                        20%, 80% { transform: translate3d(2px, 0, 0) scale(1.05); }
                        30%, 50%, 70% { transform: translate3d(-4px, 0, 0) scale(1.02); }
                        40%, 60% { transform: translate3d(4px, 0, 0) scale(1.05); }
                    }
                    @keyframes popIn {
                        0% { opacity: 0; transform: scale(0.5); }
                        70% { opacity: 1; transform: scale(1.2); }
                        100% { opacity: 1; transform: scale(1); }
                    }
                `}</style>
                <img
                    src="/assets/cauldron_pixel.png"
                    alt="Cauldron"
                    style={{
                        width: '80%',
                        height: '80%',
                        objectFit: 'contain',
                        filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))'
                    }}
                />

                {/* Brewing Glow Effect */}
                {isBrewing && (
                    <div style={{
                        position: 'absolute',
                        top: '-10%', left: '-10%', right: '-10%', bottom: '-10%',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(250, 204, 21, 0.2) 0%, transparent 70%)',
                        zIndex: -1,
                        animation: 'pulse 1.5s infinite'
                    }} />
                )}
            </div>

            {/* Ingredient Slots */}
            <div style={{
                display: 'flex',
                gap: `${slotGap}px`,
                marginBottom: '10px'
            }}>
                {Array.from({ length: ALCHEMY.MAX_INGREDIENT_SLOTS }).map((_, i) => {
                    const hasIngredient = i < ingredientEntries.length
                    let content = null
                    let onClick = () => { }
                    let borderColor = '#7a5040'
                    const bgColor = '#2a2520'
                    let isWarning = false
                    let quantityText = ''
                    let requiredText = ''


                    if (hasIngredient) {
                        const [materialId, quantity] = ingredientEntries[i]
                        const material = allMaterials.find(m => m.id === materialId)
                        const requiredQty = requiredMap[materialId] || 0


                        onClick = () => {
                            if (!isBrewing) onRemoveIngredient(materialId)
                        }

                        quantityText = quantity.toString()
                        if (quantity < requiredQty) {
                            isWarning = true
                            borderColor = '#ef4444'
                            requiredText = `${quantity}/${requiredQty}`
                        }

                        content = (
                            <div key={materialId} style={{
                                width: '100%',
                                height: '100%',
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                            }}>
                                {material?.iconUrl ? (
                                    <img
                                        src={material.iconUrl}
                                        alt={material.name}
                                        style={{ width: `${iconSize}px`, height: `${iconSize}px`, objectFit: 'contain' }}
                                    />
                                ) : (
                                    <span style={{ fontSize: '24px' }}>{ICON_MAP[material?.type || 'PLANT'] || '❓'}</span>
                                )}

                                {/* Quantity Badge */}
                                <div style={{
                                    position: 'absolute',
                                    bottom: '2px',
                                    right: '2px',
                                    backgroundColor: '#1a1a1a',
                                    padding: '2px 4px',
                                    borderRadius: '4px',
                                    fontSize: '10px',
                                    color: '#facc15',
                                    fontWeight: 'bold'
                                }}>
                                    {quantityText}
                                </div>

                                {/* Warning Overlay */}
                                {isWarning && (
                                    <div style={{
                                        position: 'absolute',
                                        top: -2, left: -2, right: -2, bottom: -2,
                                        backgroundColor: 'rgba(239, 68, 68, 0.4)',
                                        borderRadius: '6px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontSize: '11px',
                                        fontWeight: 'bold',
                                        textShadow: '0 1px 2px black',
                                        zIndex: 2
                                    }}>
                                        {requiredText}
                                    </div>
                                )}
                            </div>
                        )
                    } else {
                        // Empty Slot
                        content = <span style={{ color: '#666', fontSize: '20px' }}>+</span>
                    }

                    return (
                        <div
                            key={i}
                            onClick={onClick}
                            style={{
                                width: `${slotSize}px`,
                                height: `${slotSize}px`,
                                backgroundColor: bgColor,
                                border: `2px solid ${borderColor}`,
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative',
                                cursor: hasIngredient && !isBrewing ? 'pointer' : 'default',
                                transition: 'all 0.2s',
                                overflow: 'visible' // Changed from hidden to allow pop-out effects if needed, though popIn scales up
                            }}
                            onMouseEnter={(e) => {
                                if (hasIngredient && !isBrewing) e.currentTarget.style.borderColor = '#fbbf24'
                            }}
                            onMouseLeave={(e) => {
                                if (hasIngredient && !isBrewing && !isWarning) e.currentTarget.style.borderColor = '#7a5040'
                                if (isWarning) e.currentTarget.style.borderColor = '#ef4444'
                            }}
                        >
                            {content}
                        </div>
                    )
                })}
            </div>

            <div style={{
                color: '#888',
                fontSize: '12px',
                marginTop: '8px'
            }}>
                {isMobile ? '터치하여 재료 제거' : '재료를 클릭하면 제거됩니다'}
            </div>
        </div>
    )
}

