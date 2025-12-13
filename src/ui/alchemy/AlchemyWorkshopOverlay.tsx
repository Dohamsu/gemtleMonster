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
import CodexPanel from './CodexPanel'

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
    mobileTab?: 'recipes' | 'materials' | 'codex'
    onMobileTabChange?: (tab: 'recipes' | 'materials' | 'codex') => void
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
    const [showCodexDesktop, setShowCodexDesktop] = useState(false)
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

                {/* Error Toast code... (omitting internal redundancy if possible, but replace_block needs context) */}
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

                {/* Main Content Area (Tabs) */}
                <div style={{
                    position: 'absolute',
                    bottom: mobileTab === 'codex' ? '10px' : '140px',
                    left: 0,
                    width: '100%',
                    height: mobileTab === 'codex' ? 'calc(100% - 80px)' : 'calc(50% - 20px)',
                    zIndex: mobileTab === 'codex' ? 20 : 'auto',
                    pointerEvents: 'auto',
                    background: 'transparent',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '10px',
                    gap: '10px',
                    transition: 'all 0.3s ease-in-out'
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
                        <button
                            onClick={() => onMobileTabChange?.('codex')}
                            style={{
                                flex: 1,
                                padding: '10px',
                                minHeight: '44px',
                                background: mobileTab === 'codex' ? '#5a4030' : '#4a3020',
                                border: mobileTab === 'codex' ? '2px solid #facc15' : 'none',
                                borderRadius: '6px',
                                color: '#f0d090',
                                fontWeight: 'bold',
                                fontSize: '14px',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            📚 도감
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
                        ) : mobileTab === 'materials' ? (
                            <MaterialGrid
                                materials={materials}
                                playerMaterials={playerMaterials}
                                selectedIngredients={selectedIngredients}
                                isBrewing={isBrewing}
                                onAddIngredient={onAddIngredient}
                            />
                        ) : (
                            <CodexPanel
                                materials={materials}
                                recipes={recipes}
                                playerMaterials={playerMaterials}
                                playerRecipes={playerRecipes}
                            />
                        )}
                    </div>
                </div>

                {/* Mobile Brew Button Container - Hide if Codex */}
                {mobileTab !== 'codex' && (
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
                )}
            </div>
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
                    onClick={() => setShowCodexDesktop(!showCodexDesktop)}
                    style={{
                        background: showCodexDesktop ? '#fbbf24' : '#2d3748',
                        color: showCodexDesktop ? '#1a202c' : '#f0d090',
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
                    <span>📚</span>
                    <span>{showCodexDesktop ? '도감 닫기' : '도감 열기'}</span>
                </button>
            </div>

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

            {/* Overlay Codex Panel for Desktop */}
            {showCodexDesktop && (
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
                opacity: showCodexDesktop ? 0.3 : 1, // Dim when codex is open
                transition: 'opacity 0.2s'
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
                height: 'calc(100% - 150px)',
                marginTop: '70px',
                opacity: showCodexDesktop ? 0.3 : 1, // Dim when codex is open
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
                opacity: showCodexDesktop ? 0 : 1, // Hide when codex is open
                pointerEvents: showCodexDesktop ? 'none' : 'auto',
                transition: 'opacity 0.2s'
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
