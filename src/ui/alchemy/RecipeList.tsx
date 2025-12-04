import { useState, useEffect } from 'react'
import type { Recipe, Material } from '../../lib/alchemyApi'
import { isMobileView } from '../../utils/responsiveUtils'

interface RecipeListProps {
    recipes: Recipe[]
    materials: Material[]
    playerMaterials: Record<string, number>
    selectedRecipeId: string | null
    isBrewing: boolean
    onSelectRecipe: (recipeId: string | null) => void
}

export default function RecipeList({
    recipes,
    materials,
    playerMaterials,
    selectedRecipeId,
    isBrewing,
    onSelectRecipe
}: RecipeListProps) {
    const [isMobile, setIsMobile] = useState(isMobileView())

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(isMobileView())
        }
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const visibleRecipes = recipes.filter(r => !r.is_hidden)

    const handleRecipeClick = (recipeId: string) => {
        if (isBrewing) return

        // Toggle selection
        if (selectedRecipeId === recipeId) {
            onSelectRecipe(null)
        } else {
            onSelectRecipe(recipeId)
        }
    }

    return (
        <div style={{
            width: isMobile ? '100%' : '260px',
            height: '100%',
            background: '#3a2520',
            border: '2px solid #7a5040',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
        }}>
            {/* Header */}
            <div style={{
                padding: isMobile ? '10px' : '12px',
                borderBottom: '1px solid #7a5040',
                background: '#2a1810'
            }}>
                <h3 style={{
                    margin: 0,
                    fontSize: isMobile ? '16px' : '18px',
                    color: '#f0d090',
                    fontWeight: 'bold'
                }}>
                    📜 레시피
                </h3>
            </div>

            {/* Recipe List */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: isMobile ? '6px' : '8px',
                opacity: isBrewing ? 0.4 : 1,
                pointerEvents: isBrewing ? 'none' : 'auto'
            }}>
                {visibleRecipes.map(recipe => {
                    const isSelected = selectedRecipeId === recipe.id
                    const hasAllMaterials = recipe.ingredients?.every(
                        ing => (playerMaterials[ing.material_id] || 0) >= ing.quantity
                    ) ?? true

                    return (
                        <div
                            key={recipe.id}
                            onClick={() => handleRecipeClick(recipe.id)}
                            style={{
                                marginBottom: isMobile ? '6px' : '8px',
                                padding: isMobile ? '8px' : '10px',
                                background: hasAllMaterials
                                    ? (isSelected ? '#5a4030' : '#4a3020')
                                    : '#2a201a',
                                border: isSelected ? '2px solid #facc15' : '1px solid transparent',
                                borderRadius: '6px',
                                cursor: hasAllMaterials ? 'pointer' : 'not-allowed',
                                opacity: hasAllMaterials ? 1 : 0.5,
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                if (hasAllMaterials && !isBrewing) {
                                    e.currentTarget.style.transform = 'translateX(4px)'
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateX(0)'
                            }}
                        >
                            {/* Recipe Name */}
                            <div style={{
                                fontSize: isMobile ? '13px' : '14px',
                                fontWeight: 'bold',
                                color: '#f0d090',
                                marginBottom: '6px'
                            }}>
                                {recipe.name} ({recipe.craft_time_sec}s)
                            </div>

                            {/* Required Materials */}
                            {recipe.ingredients && recipe.ingredients.length > 0 && (
                                <div style={{ marginTop: '6px' }}>
                                    {recipe.ingredients.map((ing, idx) => {
                                        const mat = materials.find(m => m.id === ing.material_id)
                                        const owned = playerMaterials[ing.material_id] || 0
                                        const hasEnough = owned >= ing.quantity

                                        return (
                                            <div
                                                key={idx}
                                                style={{
                                                    fontSize: isMobile ? '10px' : '11px',
                                                    color: hasEnough ? '#aaa' : '#ff6666',
                                                    marginBottom: '2px'
                                                }}
                                            >
                                                {mat?.name || ing.material_id} {owned}/{ing.quantity}
                                            </div>
                                        )
                                    })}
                                </div>
                            )}

                            {/* Level Requirement */}
                            {recipe.required_alchemy_level > 1 && (
                                <div style={{
                                    fontSize: isMobile ? '9px' : '10px',
                                    color: '#facc15',
                                    marginTop: '4px'
                                }}>
                                    필요 레벨: {recipe.required_alchemy_level}
                                </div>
                            )}
                        </div>
                    )
                })}

                {visibleRecipes.length === 0 && (
                    <div style={{
                        padding: '20px',
                        textAlign: 'center',
                        color: '#aaa',
                        fontSize: isMobile ? '12px' : '13px'
                    }}>
                        레시피가 없습니다.
                    </div>
                )}
            </div>
        </div>
    )
}
