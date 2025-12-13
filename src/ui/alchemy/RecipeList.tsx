import { useState, useEffect } from 'react'
import type { Recipe, Material, PlayerRecipe } from '../../types'
import type { AlchemyContext } from '../../types/alchemy'
import { isRecipeValid } from '../../lib/alchemyLogic'
import { MONSTER_DATA } from '../../data/monsterData'
import { isMobileView } from '../../utils/responsiveUtils'

interface RecipeListProps {
    recipes: Recipe[]
    materials: Material[]
    playerMaterials: Record<string, number>
    playerRecipes: Record<string, PlayerRecipe>
    selectedRecipeId: string | null
    isBrewing: boolean
    onSelectRecipe: (recipeId: string | null) => void
    alchemyContext: AlchemyContext | null
}

export default function RecipeList({
    recipes,
    materials,
    playerMaterials,
    playerRecipes,
    selectedRecipeId,
    isBrewing,
    onSelectRecipe,
    alchemyContext
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

    const handleRecipeClick = (recipe: Recipe) => {
        if (isBrewing) return

        // 1. Check if recipe is discoverable/selectable
        const isDiscovered = (!recipe.is_hidden) || (playerRecipes[recipe.id]?.is_discovered)
        const areAllIngredientsRevealed = recipe.ingredients?.every(ing => {
            const discovered = playerRecipes[recipe.id]?.discovered_ingredients || []
            return discovered.includes(ing.material_id)
        }) ?? false

        if (!isDiscovered && !areAllIngredientsRevealed) {
            return // Can't select unknown hidden recipes
        }

        // 2. Check if valid in current context (Time, Device, etc.)
        const isValid = isRecipeValid(recipe, alchemyContext)
        if (!isValid) {
            // Maybe show a toast or shake animation? For now just block.
            return
        }

        // 3. Check materials
        const hasAllMaterials = recipe.ingredients?.every(
            ing => (playerMaterials[ing.material_id] || 0) >= ing.quantity
        ) ?? true

        if (!hasAllMaterials) {
            return
        }

        // 4. Toggle selection
        if (selectedRecipeId === recipe.id) {
            onSelectRecipe(null)
        } else {
            // Check materials for auto-fill preview (optional visual feedback, but click logic handles selection)
            onSelectRecipe(recipe.id)
        }
    }

    // Number formatter for large quantities (e.g. 2300 -> 2.3k)
    const formatNumber = (num: number) => {
        if (num >= 1000) {
            return `${(num / 1000).toFixed(1)}k`
        }
        return num.toString()
    }

    return (
        <div style={{
            width: isMobile ? '100%' : '320px',
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
                pointerEvents: isBrewing ? 'none' : 'auto',
                display: isMobile ? 'grid' : 'block',
                gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'none',
                gap: isMobile ? '6px' : '0',
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

                    // 이름 표시: 발견했거나, 힌트로 재료가 하나라도 밝혀졌으면 이름 공개
                    const displayName = (isDiscovered || discoveredIngredients.length > 0)
                        ? `${recipe.name} (${recipe.craft_time_sec}s)`
                        : '???'

                    // 히든 레시피 선택 조건: 이미 발견했거나, 모든 재료가 공개되었을 때
                    const areAllIngredientsRevealed = recipe.ingredients?.every(
                        ing => discoveredIngredients.includes(ing.material_id)
                    ) ?? true

                    const isSelectable = isDiscovered || areAllIngredientsRevealed

                    // 재료 충족 여부 (미발견이어도 계산은 함 - 스타일은 다르게)
                    const hasAllMaterials = recipe.ingredients?.every(
                        ing => (playerMaterials[ing.material_id] || 0) >= ing.quantity
                    ) ?? true

                    // Condition validation
                    const isValid = isRecipeValid(recipe, alchemyContext)

                    const canInteract = !isBrewing && isSelectable && isValid && hasAllMaterials

                    // Visual states
                    const opacity = canInteract ? 1 : 0.5
                    const cursor = canInteract ? 'pointer' : 'not-allowed'

                    // Border & Background logic
                    let borderColor = '#4a3520' // default brown
                    let backgroundColor = isSelected ? 'rgba(251, 191, 36, 0.1)' : 'rgba(0, 0, 0, 0.2)'

                    if (isSelected) {
                        borderColor = '#fbbf24' // active yellow
                    } else if (!isValid) {
                        borderColor = '#ef4444' // invalid red
                        backgroundColor = 'rgba(239, 68, 68, 0.05)' // subtle red tint
                    }

                    return (
                        <div
                            key={recipe.id}
                            onClick={() => handleRecipeClick(recipe)}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                padding: '8px', // Slightly reduced padding
                                background: backgroundColor,
                                borderRadius: '8px',
                                border: `1px solid ${borderColor}`,
                                cursor: cursor,
                                opacity: opacity,
                                transition: 'all 0.2s',
                                marginBottom: isMobile ? '0' : '8px', // Grid gap handles spacing on mobile
                                height: isMobile ? '100%' : 'auto', // Ensure equal height in grid
                            }}
                        >
                            {/* Top Row: Image, Name, Lock Icon */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginBottom: '6px',
                                width: '100%'
                            }}>
                                {/* Monster Image */}
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '4px',
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
                                                filter: isDiscovered ? 'none' : 'brightness(0) contrast(100%)',
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
                                    flex: 1 // Take remaining space
                                }}>
                                    {displayName}
                                </div>

                                {/* Lock/Unlock Status (Aligned to right via flex) */}
                                {!isDiscovered && (
                                    <div style={{
                                        fontSize: '16px',
                                        marginLeft: 'auto',
                                        color: areAllIngredientsRevealed ? '#fbbf24' : '#64748b'
                                    }}>
                                        {areAllIngredientsRevealed ? '🔓' : '🔒'}
                                    </div>
                                )}
                            </div>

                            {/* Required Materials */}
                            {recipe.ingredients && recipe.ingredients.length > 0 && (
                                <div style={{ paddingLeft: isMobile ? '0' : '40px', marginTop: isMobile ? '4px' : '0' }}> {/* Remove indent on mobile, move below */}
                                    {recipe.ingredients.map((ing, idx) => {
                                        const mat = materials.find(m => m.id === ing.material_id)
                                        const owned = playerMaterials[ing.material_id] || 0
                                        const hasEnough = owned >= ing.quantity
                                        const isIngredientDiscovered = isDiscovered || discoveredIngredients.includes(ing.material_id)
                                        const matName = isIngredientDiscovered ? (mat?.name || ing.material_id) : '???'

                                        return (
                                            <div
                                                key={idx}
                                                style={{
                                                    fontSize: isMobile ? '10px' : '11px',
                                                    color: isIngredientDiscovered ? (hasEnough ? '#aaa' : '#ff6666') : '#666',
                                                    marginBottom: '2px',
                                                    // display: 'flex', // Removed flex space-between
                                                    // justifyContent: 'space-between'
                                                }}
                                            >
                                                <span>{matName} </span>
                                                {isIngredientDiscovered && (
                                                    <span style={{ color: hasEnough ? '#4ade80' : '#ff6666', marginLeft: '4px' }}>
                                                        {ing.quantity} / {formatNumber(owned)}
                                                    </span>
                                                )}
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
                                    paddingLeft: isMobile ? '0' : '40px',
                                    fontStyle: 'italic'
                                }}>
                                    💡 {recipe.conditions[0].description || '특별한 조건 필요'}
                                </div>
                            )}

                            {/* Level Requirement */}
                            {recipe.required_alchemy_level > 1 && (
                                <div style={{
                                    fontSize: isMobile ? '9px' : '10px',
                                    color: '#facc15',
                                    marginTop: '4px',
                                    paddingLeft: isMobile ? '0' : '40px'
                                }}>
                                    ⚠️ Lv.{recipe.required_alchemy_level} 필요
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
