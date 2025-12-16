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
    const { alchemyMode, setAlchemyMode } = useAlchemyStore()
    // 대용량 제작 수량 상태 (레시피 ID별)
    const [craftQuantities, setCraftQuantities] = useState<Record<string, number>>({})

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
            // 선택 해제 시 수량 1로 초기화
            useAlchemyStore.getState().setCraftQuantity(1)
        } else {
            onSelectRecipe(recipe.id)
            // 선택한 레시피의 현재 수량을 스토어에 동기화
            const recipeQuantity = craftQuantities[recipe.id] || 1
            useAlchemyStore.getState().setCraftQuantity(recipeQuantity)
        }
    }

    // Number formatter for large quantities (e.g. 2300 -> 2.3k)
    const formatNumber = (num: number) => {
        if (num >= 1000) {
            return `${(num / 1000).toFixed(1)}k`
        }
        return num.toString()
    }

    // 최대 제작 가능 수량 계산 (소모품용)
    const getMaxCraftable = (recipe: Recipe): number => {
        if (!recipe.ingredients || recipe.ingredients.length === 0) return 10
        let maxPossible = 10 // 최대 10개 제한
        for (const ing of recipe.ingredients) {
            const owned = playerMaterials[ing.material_id] || 0
            const canMake = Math.floor(owned / ing.quantity)
            maxPossible = Math.min(maxPossible, canMake)
        }
        return Math.max(1, maxPossible)
    }

    // 수량 변경 핸들러
    const handleQuantityChange = (recipeId: string, delta: number, maxCraftable: number) => {
        // 레시피가 선택되어 있지 않으면 자동 선택
        if (selectedRecipeId !== recipeId) {
            onSelectRecipe(recipeId)
        }

        setCraftQuantities(prev => {
            const current = prev[recipeId] || 1
            const newQty = Math.max(1, Math.min(maxCraftable, current + delta))
            // 알케미 스토어에도 수량 동기화
            useAlchemyStore.getState().setCraftQuantity(newQty)
            return { ...prev, [recipeId]: newQty }
        })
    }

    // 레시피 수량 가져오기
    const getCraftQuantity = (recipeId: string): number => {
        return craftQuantities[recipeId] || 1
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
                <h3 style={{
                    margin: 0,
                    fontSize: isMobile ? '14px' : '16px',
                    color: '#f0d090',
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap'
                }}>
                    <img src="/assets/ui/recipe.png" alt="레시피" style={{ width: '20px', height: '20px', marginRight: '6px', verticalAlign: 'middle' }} />
                    레시피
                </h3>

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
                    // 소모품 탭은 1열, 몬스터 탭은 2열
                    gridTemplateColumns: isMobile ? (alchemyMode === 'ITEM' ? '1fr' : 'repeat(2, 1fr)') : 'none',
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
                                    {recipe.type === 'ITEM' && recipe.result_item_id ? (
                                        // Item Icon
                                        (() => {
                                            const item = materials.find(m => m.id === recipe.result_item_id)
                                            return item?.icon_url ? (
                                                <img
                                                    src={item.icon_url}
                                                    alt={recipe.result_item_id}
                                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                                />
                                            ) : (
                                                <span style={{ fontSize: '18px' }}>🧪</span>
                                            )
                                        })()
                                    ) : (
                                        // Monster Icon
                                        (recipe.result_monster_id && MONSTER_DATA[recipe.result_monster_id]?.iconUrl) ? (
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
                                                {recipe.result_monster_id ? (MONSTER_DATA[recipe.result_monster_id]?.emoji || '❓') : '❓'}
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
                            {recipe.ingredients && recipe.ingredients.length > 0 && (() => {
                                const quantity = getCraftQuantity(recipe.id)
                                const maxCraftable = getMaxCraftable(recipe)
                                const isItemRecipe = recipe.type === 'ITEM'

                                return (
                                    <div style={{
                                        paddingLeft: isMobile ? '0' : '40px',
                                        marginTop: isMobile ? '4px' : '0',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}>
                                        {/* 재료 목록 */}
                                        <div style={{ flex: 1 }}>
                                            {recipe.ingredients.map((ing, idx) => {
                                                const mat = materials.find(m => m.id === ing.material_id)
                                                const owned = playerMaterials[ing.material_id] || 0
                                                const requiredQty = ing.quantity * quantity
                                                const hasEnough = owned >= requiredQty
                                                const isIngredientDiscovered = isDiscovered || discoveredIngredients.includes(ing.material_id)
                                                const matName = isIngredientDiscovered ? (mat?.name || ing.material_id) : '???'

                                                return (
                                                    <div
                                                        key={idx}
                                                        style={{
                                                            fontSize: isMobile ? '10px' : '11px',
                                                            color: isIngredientDiscovered ? (hasEnough ? '#aaa' : '#ff6666') : '#666',
                                                            marginBottom: '2px',
                                                        }}
                                                    >
                                                        <span>{matName} </span>
                                                        {isIngredientDiscovered && (
                                                            <span style={{ color: hasEnough ? '#4ade80' : '#ff6666', marginLeft: '4px' }}>
                                                                {isItemRecipe && quantity > 1 ? `${ing.quantity}×${quantity}=` : ''}{requiredQty} / {formatNumber(owned)}
                                                            </span>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                        </div>

                                        {/* 소모품 대용량 제작 수량 선택 UI - 오른쪽 배치 */}
                                        {isItemRecipe && isDiscovered && hasAllMaterials && (
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                padding: '4px 6px',
                                                background: 'rgba(122, 80, 64, 0.2)',
                                                borderRadius: '6px',
                                                border: '1px solid rgba(154, 106, 64, 0.4)',
                                                flexShrink: 0
                                            }}>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleQuantityChange(recipe.id, -1, maxCraftable)
                                                    }}
                                                    disabled={quantity <= 1}
                                                    style={{
                                                        width: '18px',
                                                        height: '18px',
                                                        border: quantity <= 1 ? '1px solid #5a4a40' : '1px solid #9a6a40',
                                                        borderRadius: '3px',
                                                        background: quantity <= 1 ? '#3a2a20' : 'linear-gradient(180deg, #6a4a30 0%, #5a3a20 100%)',
                                                        color: quantity <= 1 ? '#6a5a50' : '#f0d090',
                                                        cursor: quantity <= 1 ? 'not-allowed' : 'pointer',
                                                        fontSize: '11px',
                                                        fontWeight: 'bold',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        padding: 0
                                                    }}
                                                >
                                                    -
                                                </button>
                                                <span style={{
                                                    fontSize: '11px',
                                                    fontWeight: 'bold',
                                                    color: '#f0d090',
                                                    minWidth: '20px',
                                                    textAlign: 'center'
                                                }}>
                                                    x{quantity}
                                                </span>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleQuantityChange(recipe.id, 1, maxCraftable)
                                                    }}
                                                    disabled={quantity >= maxCraftable}
                                                    style={{
                                                        width: '18px',
                                                        height: '18px',
                                                        border: quantity >= maxCraftable ? '1px solid #5a4a40' : '1px solid #9a6a40',
                                                        borderRadius: '3px',
                                                        background: quantity >= maxCraftable ? '#3a2a20' : 'linear-gradient(180deg, #6a4a30 0%, #5a3a20 100%)',
                                                        color: quantity >= maxCraftable ? '#6a5a50' : '#f0d090',
                                                        cursor: quantity >= maxCraftable ? 'not-allowed' : 'pointer',
                                                        fontSize: '11px',
                                                        fontWeight: 'bold',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        padding: 0
                                                    }}
                                                >
                                                    +
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )
                            })()}

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
