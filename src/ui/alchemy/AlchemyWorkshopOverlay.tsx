import { useState, useEffect } from 'react'
import type { Recipe, Material } from '../../lib/alchemyApi'
import { isMobileView } from '../../utils/responsiveUtils'
import RecipeList from './RecipeList'
import MaterialGrid from './MaterialGrid'

interface AlchemyWorkshopOverlayProps {
    recipes: Recipe[]
    materials: Material[]
    playerMaterials: Record<string, number>
    selectedRecipeId: string | null
    selectedIngredients: Record<string, number>
    isBrewing: boolean
    onSelectRecipe: (recipeId: string | null) => void
    onAddIngredient: (materialId: string, quantity: number) => void
    mobileTab?: 'recipes' | 'materials'
    onMobileTabChange?: (tab: 'recipes' | 'materials') => void
}

export default function AlchemyWorkshopOverlay({
    recipes,
    materials,
    playerMaterials,
    selectedRecipeId,
    selectedIngredients,
    isBrewing,
    onSelectRecipe,
    onAddIngredient,
    mobileTab = 'recipes',
    onMobileTabChange
}: AlchemyWorkshopOverlayProps) {
    const [isMobile, setIsMobile] = useState(isMobileView())

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(isMobileView())
        }
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

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
                {/* Tabs */}
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    height: '50%',
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
                                selectedRecipeId={selectedRecipeId}
                                isBrewing={isBrewing}
                                onSelectRecipe={onSelectRecipe}
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
            {/* Left Panel - Recipe List */}
            <div style={{
                pointerEvents: 'auto',
                height: 'calc(100% - 180px)',
                marginTop: '100px'
            }}>
                <RecipeList
                    recipes={recipes}
                    materials={materials}
                    playerMaterials={playerMaterials}
                    selectedRecipeId={selectedRecipeId}
                    isBrewing={isBrewing}
                    onSelectRecipe={onSelectRecipe}
                />
            </div>

            {/* Right Panel - Material Grid */}
            <div style={{
                pointerEvents: 'auto',
                height: 'calc(100% - 180px)',
                marginTop: '100px'
            }}>
                <MaterialGrid
                    materials={materials}
                    playerMaterials={playerMaterials}
                    selectedIngredients={selectedIngredients}
                    isBrewing={isBrewing}
                    onAddIngredient={onAddIngredient}
                />
            </div>
        </div>
    )
}
