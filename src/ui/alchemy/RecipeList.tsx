import { useState, useEffect } from 'react'
import type { Recipe, Material, PlayerRecipe } from '../../lib/alchemyApi'
import { isMobileView } from '../../utils/responsiveUtils'
import { MONSTER_DATA } from '../../data/monsterData'

interface RecipeListProps {
    recipes: Recipe[]
    materials: Material[]
    playerMaterials: Record<string, number>
    playerRecipes: Record<string, PlayerRecipe>
    selectedRecipeId: string | null
    isBrewing: boolean
    onSelectRecipe: (recipeId: string | null) => void
}

export default function RecipeList({
    recipes,
    materials,
    playerMaterials,
    playerRecipes,
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

    // 모든 레시피 표시 (hidden 포함)
    // 단, hidden이면서 발견하지 못한 경우 ??? 처리
    const visibleRecipes = recipes

    const handleRecipeClick = (recipeId: string) => {
        if (isBrewing) return

        // 미발견 레시피도 클릭은 가능하게 할지? 
        // -> 재료를 확인하려면 클릭해야 함. 하지만 ??? 인 재료는 보여주면 안됨.
        // -> 클릭 가능하게 하고 상세에서 처리

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
                    /*
                    const hasAllMaterials = recipe.ingredients?.every(
                        ing => (playerMaterials[ing.material_id] || 0) >= ing.quantity
                    ) ?? true
                    */

                    const playerRecipe = playerRecipes[recipe.id]
                    const isDiscovered = !recipe.is_hidden || (playerRecipe && playerRecipe.is_discovered)
                    const discoveredIngredients = playerRecipe?.discovered_ingredients || []

                    // 이름 표시
                    const displayName = isDiscovered ? `${recipe.name} (${recipe.craft_time_sec}s)` : '???'

                    // 재료 충족 여부 (미발견이어도 계산은 함 - 스타일은 다르게)
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
                                cursor: 'pointer',
                                opacity: hasAllMaterials ? 1 : 0.7,
                                transition: 'all 0.2s',
                                position: 'relative'
                            }}
                        >
                            {/* 미발견 아이콘 */}
                            {!isDiscovered && (
                                <div style={{
                                    position: 'absolute',
                                    right: '10px',
                                    top: '10px',
                                    fontSize: '16px'
                                }}>
                                    🔒
                                </div>
                            )}

                            {/* Recipe Name Area with Image */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginBottom: '6px'
                            }}>
                                {/* Monster Image */}
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '4px',
                                    // background: '#1a1010',
                                    // border: '1px solid #5a4030',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    overflow: 'hidden',
                                    flexShrink: 0
                                }}>
                                    {MONSTER_DATA[recipe.result_monster_id]?.iconUrl ? (
                                        <img
                                            src={MONSTER_DATA[recipe.result_monster_id].iconUrl}
                                            alt={recipe.result_monster_id}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'contain',
                                                filter: isDiscovered ? 'none' : 'brightness(0) contrast(100%)', // 미발견 시 실루엣(검정)
                                                opacity: isDiscovered ? 1 : 0.7
                                            }}
                                        />
                                    ) : (
                                        <span style={{ fontSize: '18px' }}>
                                            {MONSTER_DATA[recipe.result_monster_id]?.emoji || '❓'}
                                        </span>
                                    )}
                                </div>

                                {/* Recipe Name Text */}
                                <div style={{
                                    fontSize: isMobile ? '13px' : '14px',
                                    fontWeight: 'bold',
                                    color: isDiscovered ? '#f0d090' : '#aaa',
                                }}>
                                    {displayName}
                                </div>
                            </div>

                            {/* Required Materials */}
                            {recipe.ingredients && recipe.ingredients.length > 0 && (
                                <div style={{ marginTop: '6px' }}>
                                    {recipe.ingredients.map((ing, idx) => {
                                        const mat = materials.find(m => m.id === ing.material_id)
                                        const owned = playerMaterials[ing.material_id] || 0
                                        const hasEnough = owned >= ing.quantity

                                        // 재료 발견 여부
                                        // 레시피가 발견되었거나, 이 재료가 발견된 재료 목록에 있을 때
                                        const isIngredientDiscovered = isDiscovered || discoveredIngredients.includes(ing.material_id)
                                        const matName = isIngredientDiscovered ? (mat?.name || ing.material_id) : '???'

                                        return (
                                            <div
                                                key={idx}
                                                style={{
                                                    fontSize: isMobile ? '10px' : '11px',
                                                    color: isIngredientDiscovered ? (hasEnough ? '#aaa' : '#ff6666') : '#666',
                                                    marginBottom: '2px'
                                                }}
                                            >
                                                {matName} {isIngredientDiscovered ? `${owned}/${ing.quantity}` : ''}
                                            </div>
                                        )
                                    })}
                                </div>
                            )}

                            {/* 힌트 (미발견 시) */}
                            {!isDiscovered && recipe.conditions && recipe.conditions.length > 0 && (
                                <div style={{
                                    fontSize: '10px',
                                    color: '#88aaff',
                                    marginTop: '4px',
                                    fontStyle: 'italic'
                                }}>
                                    힌트: {recipe.conditions[0].description || '특별한 조건 필요'}
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
