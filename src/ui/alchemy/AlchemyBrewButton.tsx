import { useState, useEffect } from 'react'
import type { Recipe, PlayerAlchemy } from '../../lib/alchemyApi'
import { isMobileView } from '../../utils/responsiveUtils'

interface AlchemyBrewButtonProps {
    selectedRecipeId: string | null
    selectedIngredients: Record<string, number>
    isBrewing: boolean
    brewProgress: number
    allRecipes: Recipe[]
    playerAlchemy: PlayerAlchemy | null
    onStartBrewing: (recipeId: string) => Promise<void>
    onStartFreeFormBrewing: () => Promise<void>
}

export default function AlchemyBrewButton({
    selectedRecipeId,
    selectedIngredients,
    isBrewing,
    brewProgress,
    allRecipes,
    playerAlchemy,
    onStartBrewing,
    onStartFreeFormBrewing
}: AlchemyBrewButtonProps) {
    const [isMobile, setIsMobile] = useState(isMobileView())

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(isMobileView())
        }
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    // 버튼 상태 계산
    const hasIngredients = Object.values(selectedIngredients).some(count => count > 0)
    const selectedRecipe = allRecipes.find((r) => r.id === selectedRecipeId)

    let hasMaterials = false
    let hasLevel = true

    if (selectedRecipe && selectedRecipe.ingredients) {
        hasMaterials = selectedRecipe.ingredients.every((ing) =>
            (selectedIngredients[ing.material_id] || 0) >= ing.quantity
        )
        hasLevel = (playerAlchemy?.level || 1) >= selectedRecipe.required_alchemy_level
    }

    const isEnabled = (selectedRecipe && hasMaterials && hasLevel) || (!selectedRecipe && hasIngredients)

    // 버튼 텍스트 결정
    let btnText = '🧪 연금술 시작'
    if (selectedRecipe && !hasLevel) btnText = `Lv.${selectedRecipe.required_alchemy_level} 필요`
    else if (selectedRecipe && !hasMaterials) btnText = '재료 부족'
    else if (!selectedRecipe && !hasIngredients) btnText = '재료를 추가하세요'

    const handleClick = () => {
        if (isBrewing || !isEnabled) return

        if (selectedRecipeId) {
            onStartBrewing(selectedRecipeId)
        } else {
            onStartFreeFormBrewing()
        }
    }

    // 버튼 스타일
    const buttonStyle: React.CSSProperties = {
        width: isMobile ? '90%' : '200px',
        maxWidth: '300px',
        height: isMobile ? '50px' : '55px',
        background: isBrewing
            ? '#3a2a20'
            : isEnabled
                ? 'linear-gradient(180deg, #6a4a30 0%, #5a3a20 100%)'
                : '#3a2520',
        border: isBrewing
            ? '3px solid #7a5a40'
            : isEnabled
                ? '3px solid #9a6a40'
                : '3px solid #5a4030',
        borderRadius: '10px',
        color: isEnabled ? '#f0d090' : '#666',
        fontSize: isMobile ? '17px' : '18px',
        fontWeight: 'bold',
        cursor: isEnabled && !isBrewing ? 'pointer' : 'not-allowed',
        transition: 'all 0.2s',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    }

    const progressBarStyle: React.CSSProperties = {
        position: 'absolute',
        left: '5px',
        top: '5px',
        height: 'calc(100% - 10px)',
        width: `calc((100% - 10px) * ${brewProgress})`,
        background: '#facc15',
        borderRadius: '6px',
        transition: 'width 0.1s linear'
    }

    return (
        <button
            onClick={handleClick}
            disabled={isBrewing || !isEnabled}
            style={buttonStyle}
            onMouseEnter={(e) => {
                if (isEnabled && !isBrewing) {
                    e.currentTarget.style.transform = 'scale(1.02)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)'
                }
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = 'none'
            }}
        >
            {isBrewing && <div style={progressBarStyle} />}
            <span style={{ position: 'relative', zIndex: 1 }}>
                {isBrewing ? `⚗️ 제조 중... ${Math.floor(brewProgress * 100)}%` : btnText}
            </span>
        </button>
    )
}
