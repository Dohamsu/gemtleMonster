import { useState, useEffect } from 'react'
import type { Material } from '../../lib/alchemyApi'
import { isMobileView } from '../../utils/responsiveUtils'
import { getFamilyColor, getRarityColor } from '../../utils/materialUtils'
import ResourceIcon from '../ResourceIcon'
import { ALCHEMY } from '../../constants/game'

interface MaterialGridProps {
    materials: Material[]
    playerMaterials: Record<string, number>
    selectedIngredients: Record<string, number>
    isBrewing: boolean
    onAddIngredient: (materialId: string, quantity: number) => void
}

export default function MaterialGrid({
    materials,
    playerMaterials,
    selectedIngredients,
    isBrewing,
    onAddIngredient
}: MaterialGridProps) {
    const [isMobile, setIsMobile] = useState(isMobileView())
    const [showOnlyOwned, setShowOnlyOwned] = useState(false)

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(isMobileView())
        }
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const handleMaterialClick = (materialId: string) => {
        if (isBrewing) return

        const available = playerMaterials[materialId] || 0
        const currentlySelected = selectedIngredients[materialId] || 0

        // 재고 없으면 추가 불가
        if (available <= 0) {
            console.log('Cannot add material with zero stock')
            return
        }

        // 이미 보유한 만큼 다 선택했으면 추가 불가
        if (currentlySelected >= available) {
            console.log('Already selected all available')
            return
        }

        // 슬롯당 최대 수량 체크
        if (currentlySelected >= ALCHEMY.MAX_QUANTITY_PER_SLOT) {
            console.log('Cannot add more: maximum per slot reached')
            return
        }

        // 슬롯 개수 제한 체크 (서로 다른 재료 종류)
        const uniqueIngredients = Object.keys(selectedIngredients).length
        const isNewIngredient = currentlySelected === 0

        if (isNewIngredient && uniqueIngredients >= ALCHEMY.MAX_INGREDIENT_SLOTS) {
            console.log('Cannot add new ingredient: maximum ingredient types reached')
            return
        }

        // 클릭할 때마다 +1 추가
        onAddIngredient(materialId, 1)
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
                background: '#2a1810',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <h3 style={{
                    margin: 0,
                    fontSize: isMobile ? '16px' : '18px',
                    color: '#f0d090',
                    fontWeight: 'bold'
                }}>
                    🎒 보유 재료
                </h3>
                <button
                    onClick={() => setShowOnlyOwned(!showOnlyOwned)}
                    style={{
                        width: isMobile ? '28px' : '24px',
                        height: isMobile ? '28px' : '24px',
                        background: showOnlyOwned ? '#5a4030' : 'transparent',
                        border: '1px solid #7a5040',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        color: showOnlyOwned ? '#facc15' : '#886',
                        fontSize: isMobile ? '14px' : '12px',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                        padding: 0
                    }}
                    title="보유 재료만 보기"
                >
                    ★
                </button>
            </div>

            {/* Material Grid */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: isMobile ? '8px' : '10px',
                opacity: isBrewing ? 0.4 : 1,
                pointerEvents: isBrewing ? 'none' : 'auto'
            }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? 'repeat(auto-fill, minmax(70px, 1fr))' : 'repeat(auto-fill, minmax(60px, 1fr))',
                    gap: isMobile ? '10px' : '8px'
                }}>
                    {materials
                        .filter(m => !showOnlyOwned || (playerMaterials[m.id] || 0) > 0)
                        .map(material => {
                            const available = playerMaterials[material.id] || 0
                            const currentlySelected = selectedIngredients[material.id] || 0
                            const hasStock = available > 0

                            return (
                                <div
                                    key={material.id}
                                    onClick={() => handleMaterialClick(material.id)}
                                    style={{
                                        padding: isMobile ? '10px' : '8px',
                                        background: currentlySelected > 0 ? '#5a4030' : '#4a3020',
                                        border: currentlySelected > 0 ? '2px solid #facc15' : '2px solid #7a5040',
                                        borderRadius: '8px',
                                        cursor: hasStock ? 'pointer' : 'not-allowed',
                                        opacity: hasStock ? 1 : 0.4,
                                        filter: hasStock ? 'none' : 'grayscale(1)',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: isMobile ? '6px' : '4px',
                                        position: 'relative'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (hasStock && !isBrewing) {
                                            e.currentTarget.style.transform = 'scale(1.05)'
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'scale(1)'
                                    }}
                                >
                                    {/* Material Icon */}
                                    <div style={{
                                        width: isMobile ? '40px' : '36px',
                                        height: isMobile ? '40px' : '36px',
                                        borderRadius: '50%',
                                        background: getFamilyColor(material.family),
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        overflow: 'hidden'
                                    }}>
                                        <ResourceIcon
                                            resourceId={material.id}
                                            size={isMobile ? 32 : 28}
                                            iconUrl={material.icon_url}
                                        />
                                    </div>

                                    {/* Material Name */}
                                    <div style={{
                                        fontSize: isMobile ? '10px' : '9px',
                                        color: getRarityColor(material.rarity),
                                        textAlign: 'center',
                                        lineHeight: '1.2',
                                        fontWeight: 'bold'
                                    }}>
                                        {material.name}
                                    </div>

                                    {/* Quantity */}
                                    <div style={{
                                        fontSize: isMobile ? '11px' : '10px',
                                        color: hasStock ? '#aaa' : '#ff6666',
                                        fontWeight: 'bold'
                                    }}>
                                        {available}개
                                    </div>

                                    {/* Selected indicator */}
                                    {currentlySelected > 0 && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '4px',
                                            right: '4px',
                                            background: '#facc15',
                                            color: '#000',
                                            borderRadius: '50%',
                                            width: isMobile ? '20px' : '18px',
                                            height: isMobile ? '20px' : '18px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: isMobile ? '11px' : '10px',
                                            fontWeight: 'bold'
                                        }}>
                                            {currentlySelected}
                                        </div>
                                    )}

                                    {/* Special indicator */}
                                    {material.is_special && (
                                        <div style={{
                                            position: 'absolute',
                                            bottom: '4px',
                                            right: '4px',
                                            fontSize: isMobile ? '9px' : '8px',
                                            padding: '2px 4px',
                                            background: '#7c3aed',
                                            color: 'white',
                                            borderRadius: '3px',
                                            fontWeight: 'bold'
                                        }}>
                                            특수
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                </div>

                {materials.length === 0 && (
                    <div style={{
                        padding: '20px',
                        textAlign: 'center',
                        color: '#aaa',
                        fontSize: isMobile ? '12px' : '13px'
                    }}>
                        재료가 없습니다.
                    </div>
                )}
            </div>

            {/* Help Text */}
            <div style={{
                padding: isMobile ? '8px' : '10px',
                borderTop: '1px solid #7a5040',
                background: '#2a1810',
                fontSize: isMobile ? '9px' : '10px',
                color: '#aaa',
                textAlign: 'center'
            }}>
                재료를 클릭하여 연금솥에 추가하세요
            </div>
        </div>
    )
}
