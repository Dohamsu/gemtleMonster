import { useState, useEffect } from 'react'
import type { Recipe, Material, PlayerRecipe } from '../../types'
import type { AlchemyContext } from '../../types/alchemy'
import { isRecipeValid } from '../../lib/alchemyLogic'
import { MONSTER_DATA } from '../../data/monsterData'
import { isMobileView } from '../../utils/responsiveUtils'
import { useAlchemyStore } from '../../store/useAlchemyStore'

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
    const { alchemyMode, setAlchemyMode, favoriteRecipes, toggleFavoriteRecipe } = useAlchemyStore()
    const [showOnlyFavorites, setShowOnlyFavorites] = useState(false)

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
        const isDiscovered = (!recipe.isHidden) || (playerRecipes[recipe.id]?.is_discovered)
        const areAllIngredientsRevealed = recipe.ingredients?.every(ing => {
            const discovered = playerRecipes[recipe.id]?.discovered_ingredients || []
            return discovered.includes(ing.materialId)
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
            ing => (playerMaterials[ing.materialId] || 0) >= ing.quantity
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
                padding: isMobile ? '8px 10px' : '10px 12px',
                borderBottom: '1px solid #7a5040',
                background: '#2a1810',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{
                        margin: 0,
                        fontSize: isMobile ? '14px' : '16px',
                        color: '#f0d090',
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap'
                    }}>
                        <img src="/assets/ui/recipe.png" alt="레시피" style={{ width: '36px', height: '36px', marginRight: '6px', verticalAlign: 'middle' }} />
                        레시피
                    </h3>

                    {/* Favorites Filter */}
                    <button
                        onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
                        style={{
                            background: showOnlyFavorites ? '#334155' : 'transparent',
                            border: '1px solid #4a3520',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s',
                            padding: '2px 4px'
                        }}
                        title="즐겨찾기만 보기"
                    >
                        <img
                            src="/assets/ui/gold_star.png"
                            alt="Favorites"
                            style={{
                                width: '18px',
                                height: '18px',
                                opacity: showOnlyFavorites ? 1 : 0.4,
                                filter: showOnlyFavorites ? 'none' : 'grayscale(1)'
                            }}
                        />
                    </button>
                </div>

                {/* Mode Toggle */}
                <div style={{
                    display: 'flex',
                    background: '#1a1210',
                    borderRadius: '16px',
                    padding: '2px',
                    border: '1px solid #4a3520',
                    position: 'relative'
                }}>
                    <button
                        onClick={() => setAlchemyMode('MONSTER')}
                        style={{
                            background: alchemyMode === 'MONSTER' ? 'linear-gradient(135deg, #6b46c1 0%, #805ad5 100%)' : 'transparent',
                            color: alchemyMode === 'MONSTER' ? 'white' : '#8a7060',
                            border: 'none',
                            borderRadius: '14px',
                            padding: isMobile ? '4px 10px' : '5px 14px',
                            fontSize: isMobile ? '11px' : '13px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            transform: alchemyMode === 'MONSTER' ? 'scale(1.05)' : 'scale(1)',
                            boxShadow: alchemyMode === 'MONSTER' ? '0 2px 8px rgba(107, 70, 193, 0.5)' : 'none'
                        }}
                    >
                        몬스터
                    </button>
                    <button
                        onClick={() => setAlchemyMode('ITEM')}
                        style={{
                            background: alchemyMode === 'ITEM' ? 'linear-gradient(135deg, #2b6cb0 0%, #4299e1 100%)' : 'transparent',
                            color: alchemyMode === 'ITEM' ? 'white' : '#8a7060',
                            border: 'none',
                            borderRadius: '14px',
                            padding: isMobile ? '4px 10px' : '5px 14px',
                            fontSize: isMobile ? '11px' : '13px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            transform: alchemyMode === 'ITEM' ? 'scale(1.05)' : 'scale(1)',
                            boxShadow: alchemyMode === 'ITEM' ? '0 2px 8px rgba(43, 108, 176, 0.5)' : 'none'
                        }}
                    >
                        소모품
                    </button>
                </div>
            </div>

            {/* Recipe List - key로 모드 변경 시 애니메이션 재실행 */}
            <div
                key={alchemyMode}
                style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: isMobile ? '6px' : '8px',
                    opacity: isBrewing ? 0.4 : 1,
                    pointerEvents: isBrewing ? 'none' : 'auto',
                    display: isMobile ? 'grid' : 'block',
                    gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'none',
                    gap: isMobile ? '6px' : '0',
                    animation: 'fadeSlideIn 0.25s ease-out'
                }}>
                <style>{`
                    @keyframes fadeSlideIn {
                        from {
                            opacity: 0;
                            transform: translateY(8px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                `}</style>
                {visibleRecipes
                    .filter(r => !showOnlyFavorites || favoriteRecipes.has(r.id))
                    .map(recipe => {
                        const isSelected = selectedRecipeId === recipe.id
                        /*
                        const hasAllMaterials = recipe.ingredients?.every(
                            ing => (playerMaterials[ing.materialId] || 0) >= ing.quantity
                        ) ?? true
                        */

                        const playerRecipe = playerRecipes[recipe.id]
                        const isDiscovered = !recipe.isHidden || (playerRecipe && playerRecipe.is_discovered)
                        const discoveredIngredients = playerRecipe?.discovered_ingredients || []

                        // 이름 표시: 발견했거나, 힌트로 재료가 하나라도 밝혀졌으면 이름 공개
                        const displayName = (isDiscovered || discoveredIngredients.length > 0)
                            ? `${recipe.name} (${recipe.craftTimeSec}s)`
                            : '???'

                        // 히든 레시피 선택 조건: 이미 발견했거나, 모든 재료가 공개되었을 때
                        const areAllIngredientsRevealed = recipe.ingredients?.every(
                            ing => discoveredIngredients.includes(ing.materialId)
                        ) ?? true

                        const isSelectable = isDiscovered || areAllIngredientsRevealed

                        // 재료 충족 여부 (미발견이어도 계산은 함 - 스타일은 다르게)
                        const hasAllMaterials = recipe.ingredients?.every(
                            ing => (playerMaterials[ing.materialId] || 0) >= ing.quantity
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
                                    position: 'relative'
                                }}
                            >
                                {/* Favorite Toggle (Absolute Positioned) */}
                                <div
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        toggleFavoriteRecipe(recipe.id)
                                    }}
                                    style={{
                                        position: 'absolute',
                                        top: '4px',
                                        right: '4px',
                                        width: '24px',
                                        height: '24px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        zIndex: 10
                                    }}
                                >
                                    <img
                                        src="/assets/ui/gold_star.png"
                                        alt="Fav"
                                        style={{
                                            width: '14px',
                                            height: '14px',
                                            opacity: favoriteRecipes.has(recipe.id) ? 1 : 0.2,
                                            filter: favoriteRecipes.has(recipe.id) ? 'none' : 'grayscale(1)',
                                            transition: 'all 0.2s'
                                        }}
                                    />
                                </div>
                                {/* Top Row: Image, Name, Lock Icon */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    marginBottom: '6px',
                                    width: '100%'
                                }}>
                                    {/* Monster/Item Image */}
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
                                        {recipe.type === 'ITEM' && recipe.resultItemId ? (
                                            // Item Icon
                                            (() => {
                                                const item = materials.find(m => m.id === recipe.resultItemId)
                                                return item?.iconUrl ? (
                                                    <img
                                                        src={item.iconUrl}
                                                        alt={recipe.resultItemId}
                                                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                                    />
                                                ) : (
                                                    <span style={{ fontSize: '18px' }}>🧪</span>
                                                )
                                            })()
                                        ) : (
                                            // Monster Icon
                                            (recipe.resultMonsterId && MONSTER_DATA[recipe.resultMonsterId]?.iconUrl) ? (
                                                <img
                                                    src={MONSTER_DATA[recipe.resultMonsterId].iconUrl}
                                                    alt={recipe.resultMonsterId}
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
                                                    {recipe.resultMonsterId ? (MONSTER_DATA[recipe.resultMonsterId]?.emoji || '❓') : '❓'}
                                                </span>
                                            )
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
                                            const mat = materials.find(m => m.id === ing.materialId)
                                            const owned = playerMaterials[ing.materialId] || 0
                                            const hasEnough = owned >= ing.quantity
                                            const isIngredientDiscovered = isDiscovered || discoveredIngredients.includes(ing.materialId)
                                            const matName = isIngredientDiscovered ? (mat?.name || ing.materialId) : '???'

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
                                {recipe.requiredAlchemyLevel > 1 && (
                                    <div style={{
                                        fontSize: isMobile ? '9px' : '10px',
                                        color: '#facc15',
                                        marginTop: '4px',
                                        paddingLeft: isMobile ? '0' : '40px'
                                    }}>
                                        ⚠️ Lv.{recipe.requiredAlchemyLevel} 필요
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
