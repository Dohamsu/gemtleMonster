import { useState, useEffect, memo, useMemo } from 'react'
import type { Recipe, Material, PlayerAlchemy, PlayerRecipe } from '../../lib/alchemyApi'
import type { AlchemyContext } from '../../types/alchemy'
import { isMobileView } from '../../utils/responsiveUtils'
import RecipeList from './RecipeList'
import MaterialGrid from './MaterialGrid'
import AlchemyBrewButton from './AlchemyBrewButton'
import { AlchemyBackButton } from './AlchemyBackButton'
import { useGameStore } from '../../store/useGameStore'
import { useAlchemyStore } from '../../store/useAlchemyStore'
import CodexPanel from './CodexPanel'

// 컴포넌트 외부로 이동하여 매 렌더링마다 재생성 방지
const getRecipeType = (r: Recipe): 'MONSTER' | 'ITEM' => {
    if (r.type) return r.type
    if (r.result_item_id) return 'ITEM'
    return 'MONSTER'
}

interface AlchemyWorkshopOverlayProps {
    recipes: Recipe[]
    materials: Material[]
    playerMaterials: Record<string, number>
    playerRecipes: Record<string, PlayerRecipe>
    selectedRecipeId: string | null
    selectedIngredients: Record<string, number>
    isBrewing: boolean
    playerAlchemy: PlayerAlchemy | null
    onSelectRecipe: (recipeId: string | null) => void
    onAddIngredient: (materialId: string, quantity: number) => void
    onStartBrewing: (recipeId: string, quantity?: number) => Promise<void>
    onStartFreeFormBrewing: () => Promise<void>
    mobileTab?: 'recipes' | 'materials' | 'codex'
    onMobileTabChange?: (tab: 'recipes' | 'materials' | 'codex') => void
    alchemyContext: AlchemyContext | null
}


function AlchemyWorkshopOverlay({
    recipes,
    materials,
    playerMaterials,
    playerRecipes,
    selectedRecipeId,
    selectedIngredients,
    isBrewing,
    playerAlchemy,
    onSelectRecipe,
    onAddIngredient,
    onStartBrewing,
    onStartFreeFormBrewing,
    mobileTab = 'recipes',
    onMobileTabChange,
    alchemyContext
}: AlchemyWorkshopOverlayProps) {
    const [isMobile, setIsMobile] = useState(isMobileView())
    const [showCodex, setShowCodex] = useState(false)
    const setCanvasView = useGameStore((state) => state.setCanvasView)
    const alchemyStore = useAlchemyStore()
    const { alchemyMode, error: alchemyError, resetError } = alchemyStore

    // Filter recipes based on mode (메모이제이션으로 불필요한 재계산 방지)
    const filteredRecipes = useMemo(
        () => recipes.filter(r => getRecipeType(r) === alchemyMode),
        [recipes, alchemyMode]
    )

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(isMobileView())
        }
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const handleBack = () => {
        setCanvasView('map')
    }

    // Toggle Codex
    const toggleCodex = () => {
        setShowCodex(!showCodex)
    }

    if (isMobile) {
        // 모바일: 탭 기반 UI + 플로팅 도감 버튼
        return (
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <AlchemyBackButton onBack={handleBack} />

                {/* Mobile Codex Floating Button - Below hamburger menu */}
                <div style={{
                    position: 'absolute',
                    top: '80px',
                    right: '20px',
                    pointerEvents: 'auto',
                    zIndex: 50
                }}>
                    <button
                        onClick={toggleCodex}
                        style={{
                            background: showCodex ? '#fbbf24' : '#2d3748',
                            color: showCodex ? '#1a202c' : '#f0d090',
                            border: '2px solid #ed8936',
                            borderRadius: '12px',
                            width: '56px',
                            padding: '6px 4px',
                            fontSize: '18px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '2px',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                            transition: 'all 0.2s'
                        }}
                    >
                        <img src="/assets/ui/reciepbook.png" alt="도감" style={{ width: '36px', height: '36px' }} />
                        <span style={{ fontSize: '10px' }}>도감</span>
                    </button>
                </div>

                {/* Error Toast */}
                {alchemyError && (
                    <div style={{
                        position: 'absolute',
                        top: '60px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'rgba(239, 68, 68, 0.95)',
                        color: 'white',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        zIndex: 100,
                        boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        minWidth: '300px',
                        justifyContent: 'space-between'
                    }}>
                        <span>⚠️ {alchemyError}</span>
                        <button
                            onClick={resetError}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'white',
                                fontSize: '20px',
                                cursor: 'pointer',
                                padding: '0 4px'
                            }}
                        >
                            ×
                        </button>
                    </div>
                )
                }

                {/* Mobile Codex Overlay */}
                {
                    showCodex && (
                        <div style={{
                            position: 'absolute',
                            top: '150px',
                            left: '0',
                            width: '100%',
                            height: 'calc(100% - 150px)',
                            zIndex: 40,
                            pointerEvents: 'auto',
                            background: 'rgba(0, 0, 0, 0.9)', // Darker background
                            padding: '10px',
                            boxSizing: 'border-box'
                        }}>
                            <CodexPanel
                                materials={materials}
                                recipes={recipes}
                                playerMaterials={playerMaterials}
                                playerRecipes={playerRecipes}
                            />
                        </div>
                    )
                }

                {/* Main Content Area (Tabs) - Hide if Codex is open? Or keep visible underneath? */}
                {/* Keeping it underneath but functional. Codex overlay covers it. */}
                <div style={{
                    position: 'absolute',
                    bottom: '140px', // Adjusted since 'codex' tab logic is removed
                    left: 0,
                    width: '100%',
                    height: 'calc(50% - 20px)',
                    zIndex: 'auto',
                    pointerEvents: 'auto',
                    background: 'transparent',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '10px',
                    gap: '10px',
                    transition: 'all 0.3s ease-in-out',
                    opacity: showCodex ? 0.3 : 1 // Dim when codex open
                }}>
                    {/* Tab Buttons */}
                    <div style={{
                        display: 'flex',
                        gap: '8px',
                        background: '#2a1810',
                        borderRadius: '8px 8px 0 0',
                        padding: '8px'
                    }}>
                        <button
                            onClick={() => onMobileTabChange?.('recipes')}
                            style={{
                                flex: 1,
                                padding: '10px',
                                minHeight: '44px',
                                background: mobileTab === 'recipes' ? '#5a4030' : '#4a3020',
                                border: mobileTab === 'recipes' ? '2px solid #facc15' : '2px solid transparent',
                                borderRadius: '6px',
                                color: '#f0d090',
                                fontWeight: 'bold',
                                fontSize: '14px',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            <img src="/assets/ui/recipe.png" alt="레시피" style={{ width: '36px', height: '36px', marginRight: '4px', verticalAlign: 'middle' }} />
                            레시피
                        </button>
                        <button
                            onClick={() => onMobileTabChange?.('materials')}
                            style={{
                                flex: 1,
                                padding: '10px',
                                minHeight: '44px',
                                background: mobileTab === 'materials' ? '#5a4030' : '#4a3020',
                                border: mobileTab === 'materials' ? '2px solid #facc15' : '2px solid transparent',
                                borderRadius: '6px',
                                color: '#f0d090',
                                fontWeight: 'bold',
                                fontSize: '14px',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            <img src="/assets/ui/suede_bag.png" alt="재료" style={{ width: '36px', height: '36px', marginRight: '2px', verticalAlign: 'middle' }} /> 재료
                        </button>
                        {/* Codex Tab Removed */}
                    </div>

                    {/* Tab Content */}
                    <div style={{
                        flex: 1,
                        minHeight: 0
                    }}>
                        {mobileTab === 'materials' ? (
                            <MaterialGrid
                                materials={materials}
                                playerMaterials={playerMaterials}
                                selectedIngredients={selectedIngredients}
                                isBrewing={isBrewing}
                                onAddIngredient={onAddIngredient}
                            />
                        ) : (
                            // Default to recipes if not materials (and not codex anymore)
                            <RecipeList
                                recipes={filteredRecipes}
                                materials={materials}
                                playerMaterials={playerMaterials}
                                playerRecipes={playerRecipes}
                                selectedRecipeId={selectedRecipeId}
                                isBrewing={isBrewing}
                                onSelectRecipe={onSelectRecipe}
                                alchemyContext={alchemyContext}
                            />
                        )}
                    </div>
                </div>

                {/* Mobile Brew Button Container */}
                {/* Always show unless hidden by some other logic? Logic was: !codex. Now if showCodex is true, we might want to hide it or let overlay cover it. Overlay zIndex 40, this is 10. */}
                <div style={{
                    position: 'absolute',
                    bottom: '80px',
                    left: 0,
                    width: '100%',
                    height: '60px',
                    pointerEvents: showCodex ? 'none' : 'auto', // Disable clicks when codex open
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 10,
                    opacity: showCodex ? 0 : 1 // Hide visually
                }}>
                    <AlchemyBrewButton
                        selectedRecipeId={selectedRecipeId}
                        selectedIngredients={selectedIngredients}
                        isBrewing={isBrewing}
                        allRecipes={recipes}
                        playerAlchemy={playerAlchemy}
                        onStartBrewing={onStartBrewing}
                        onStartFreeFormBrewing={onStartFreeFormBrewing}
                    />
                </div>
            </div >
        )
    }

    // 데스크탑: 좌우 패널 + 도감 토글
    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            display: 'flex',
            justifyContent: 'space-between',
            padding: '20px',
            gap: '20px'
        }}>
            <AlchemyBackButton onBack={handleBack} />

            {/* Desktop Codex Toggle Button */}
            <div style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                pointerEvents: 'auto',
                zIndex: 50
            }}>
                <button
                    onClick={toggleCodex}
                    style={{
                        background: showCodex ? '#fbbf24' : '#2d3748',
                        color: showCodex ? '#1a202c' : '#f0d090',
                        border: '2px solid #ed8936',
                        borderRadius: '8px',
                        padding: '10px 20px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                        transition: 'all 0.2s'
                    }}
                >
                    <img src="/assets/ui/reciepbook.png" alt="도감" style={{ width: '24px', height: '24px' }} />
                    <span>{showCodex ? '도감 닫기' : '도감 열기'}</span>
                </button>
            </div>

            {/* Error Toast (Desktop) */}
            {alchemyError && (
                <div style={{
                    position: 'absolute',
                    top: '80px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(239, 68, 68, 0.95)',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    zIndex: 100,
                    boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    minWidth: '400px',
                    justifyContent: 'space-between',
                    pointerEvents: 'auto'
                }}>
                    <span style={{ fontSize: '15px', fontWeight: 500 }}>⚠️ {alchemyError}</span>
                    <button
                        onClick={resetError}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'white',
                            fontSize: '20px',
                            cursor: 'pointer',
                            padding: '0 4px'
                        }}
                    >
                        ×
                    </button>
                </div>
            )}

            {/* Overlay Codex Panel for Desktop */}
            {showCodex && (
                <div style={{
                    position: 'absolute',
                    top: '80px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '90%',
                    maxWidth: '1200px',
                    height: 'calc(100% - 100px)',
                    zIndex: 40,
                    pointerEvents: 'auto'
                }}>
                    <CodexPanel
                        materials={materials}
                        recipes={recipes}
                        playerMaterials={playerMaterials}
                        playerRecipes={playerRecipes}
                    />
                </div>
            )}

            {/* Left Panel - Recipe List */}
            <div style={{
                pointerEvents: 'auto',
                height: 'calc(100% - 150px)',
                marginTop: '70px',
                opacity: showCodex ? 0.3 : 1, // Dim when codex is open
                transition: 'opacity 0.2s'
            }}>
                <RecipeList
                    recipes={filteredRecipes}
                    materials={materials}
                    playerMaterials={playerMaterials}
                    playerRecipes={playerRecipes}
                    selectedRecipeId={selectedRecipeId}
                    isBrewing={isBrewing}
                    onSelectRecipe={onSelectRecipe}
                    alchemyContext={alchemyContext}
                />
            </div>

            {/* Right Panel - Material Grid */}
            <div style={{
                pointerEvents: 'auto',
                height: 'calc(100% - 150px)',
                marginTop: '70px',
                opacity: showCodex ? 0.3 : 1, // Dim when codex is open
                transition: 'opacity 0.2s'
            }}>
                <MaterialGrid
                    materials={materials}
                    playerMaterials={playerMaterials}
                    selectedIngredients={selectedIngredients}
                    isBrewing={isBrewing}
                    onAddIngredient={onAddIngredient}
                />
            </div>

            {/* Desktop Brew Button Container */}
            <div style={{
                position: 'absolute',
                bottom: '80px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 10,
                opacity: showCodex ? 0 : 1, // Hide when codex is open
                pointerEvents: showCodex ? 'none' : 'auto', // Disable clicks
                transition: 'opacity 0.2s'
            }}>
                <AlchemyBrewButton
                    selectedRecipeId={selectedRecipeId}
                    selectedIngredients={selectedIngredients}
                    isBrewing={isBrewing}
                    allRecipes={recipes}
                    playerAlchemy={playerAlchemy}
                    onStartBrewing={onStartBrewing}
                    onStartFreeFormBrewing={onStartFreeFormBrewing}
                />
            </div>
        </div>
    )
}

export default memo(AlchemyWorkshopOverlay)
