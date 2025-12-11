import { useState, useEffect } from 'react'
import type { Recipe, Material, PlayerAlchemy, PlayerRecipe } from '../../lib/alchemyApi'
import type { AlchemyContext } from '../../types/alchemy'
import { isMobileView } from '../../utils/responsiveUtils'
import RecipeList from './RecipeList'
import MaterialGrid from './MaterialGrid'
import AlchemyBrewButton from './AlchemyBrewButton'
import { AlchemyBackButton } from './AlchemyBackButton'
import { useGameStore } from '../../store/useGameStore'
import { useAlchemyStore } from '../../store/useAlchemyStore'

interface AlchemyWorkshopOverlayProps {
    recipes: Recipe[]
    materials: Material[]
    playerMaterials: Record<string, number>
    playerRecipes: Record<string, PlayerRecipe>
    selectedRecipeId: string | null
    selectedIngredients: Record<string, number>
    isBrewing: boolean
    brewProgress: number
    playerAlchemy: PlayerAlchemy | null
    onSelectRecipe: (recipeId: string | null) => void
    onAddIngredient: (materialId: string, quantity: number) => void
    onStartBrewing: (recipeId: string) => Promise<void>
    onStartFreeFormBrewing: () => Promise<void>
    mobileTab?: 'recipes' | 'materials'
    onMobileTabChange?: (tab: 'recipes' | 'materials') => void
    alchemyContext: AlchemyContext | null
}


export default function AlchemyWorkshopOverlay({
    recipes,
    materials,
    playerMaterials,
    playerRecipes,
    selectedRecipeId,
    selectedIngredients,
    isBrewing,
    brewProgress,
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
    const setCanvasView = useGameStore((state) => state.setCanvasView)

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

    if (isMobile) {
        // 모바일: 탭 기반 UI
        // Canvas 버튼(height-130)과 XP바(height-65) 공간 확보를 위해 하단 150px 비워둠
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

                {/* Error Toast */}
                {/* We use a simple inline style for the toast. In a real app, use a proper Toast component. */}
                {useAlchemyStore((state) => state.error) && (
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
                        <span>⚠️ {useAlchemyStore.getState().error}</span>
                        <button
                            onClick={useAlchemyStore.getState().resetError}
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

                {/* Tabs */}
                <div style={{
                    position: 'absolute',
                    bottom: '140px', // 버튼(130px) + XP바(65px) 공간 확보
                    left: 0,
                    width: '100%',
                    height: 'calc(50% - 20px)', // 전체 50%에서 하단 공간 제외
                    pointerEvents: 'auto',
                    background: 'transparent',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '10px',
                    gap: '10px'
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
                                border: mobileTab === 'recipes' ? '2px solid #facc15' : 'none',
                                borderRadius: '6px',
                                color: '#f0d090',
                                fontWeight: 'bold',
                                fontSize: '14px',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            📜 레시피
                        </button>
                        <button
                            onClick={() => onMobileTabChange?.('materials')}
                            style={{
                                flex: 1,
                                padding: '10px',
                                minHeight: '44px',
                                background: mobileTab === 'materials' ? '#5a4030' : '#4a3020',
                                border: mobileTab === 'materials' ? '2px solid #facc15' : 'none',
                                borderRadius: '6px',
                                color: '#f0d090',
                                fontWeight: 'bold',
                                fontSize: '14px',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            🎒 재료
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div style={{
                        flex: 1,
                        minHeight: 0
                    }}>
                        {mobileTab === 'recipes' ? (
                            <RecipeList
                                recipes={recipes}
                                materials={materials}
                                playerMaterials={playerMaterials}
                                playerRecipes={playerRecipes}
                                selectedRecipeId={selectedRecipeId}
                                isBrewing={isBrewing}
                                onSelectRecipe={onSelectRecipe}
                                alchemyContext={alchemyContext}
                            />
                        ) : (
                            <MaterialGrid
                                materials={materials}
                                playerMaterials={playerMaterials}
                                selectedIngredients={selectedIngredients}
                                isBrewing={isBrewing}
                                onAddIngredient={onAddIngredient}
                            />
                        )}
                    </div>
                </div>

                {/* Mobile Brew Button Container */}
                <div style={{
                    position: 'absolute',
                    bottom: '80px',
                    left: 0,
                    width: '100%',
                    height: '60px',
                    pointerEvents: 'auto',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 10
                }}>
                    <AlchemyBrewButton
                        selectedRecipeId={selectedRecipeId}
                        selectedIngredients={selectedIngredients}
                        isBrewing={isBrewing}
                        brewProgress={brewProgress}
                        allRecipes={recipes}
                        playerAlchemy={playerAlchemy}
                        onStartBrewing={onStartBrewing}
                        onStartFreeFormBrewing={onStartFreeFormBrewing}
                    />
                </div>
            </div>
        )
    }

    // 데스크탑: 좌우 패널
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

            {/* Error Toast (Desktop) */}
            {useAlchemyStore((state: any) => state.error) && (
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
                    <span style={{ fontSize: '15px', fontWeight: 500 }}>⚠️ {useAlchemyStore.getState().error}</span>
                    <button
                        onClick={useAlchemyStore.getState().resetError}
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

            {/* Left Panel - Recipe List */}
            <div style={{
                pointerEvents: 'auto',
                height: 'calc(100% - 150px)', // 높이 증가 (180 → 150)
                marginTop: '70px' // 상단 마진 축소 (100 → 70)
            }}>
                <RecipeList
                    recipes={recipes}
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
                height: 'calc(100% - 150px)', // 높이 증가 (180 → 150)
                marginTop: '70px' // 상단 마진 축소 (100 → 70)
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
                pointerEvents: 'auto',
                zIndex: 10
            }}>
                <AlchemyBrewButton
                    selectedRecipeId={selectedRecipeId}
                    selectedIngredients={selectedIngredients}
                    isBrewing={isBrewing}
                    brewProgress={brewProgress}
                    allRecipes={recipes}
                    playerAlchemy={playerAlchemy}
                    onStartBrewing={onStartBrewing}
                    onStartFreeFormBrewing={onStartFreeFormBrewing}
                />
            </div>
        </div>
    )
}
