import { useState, useMemo, useEffect } from 'react'
import type { Material, Recipe, PlayerRecipe } from '../../types'
import { isMobileView } from '../../utils/responsiveUtils'
import { MONSTER_DATA } from '../../data/monsterData'
import { getMaterialSources } from '../../utils/materialSourceUtils'

interface CodexPanelProps {
    materials: Material[]
    recipes: Recipe[]
    playerMaterials: Record<string, number>
    playerRecipes: Record<string, PlayerRecipe>
}

type Tab = 'materials' | 'recipes'

export default function CodexPanel({
    materials,
    recipes,
    playerMaterials,
    playerRecipes
}: CodexPanelProps) {
    const [activeTab, setActiveTab] = useState<Tab>('materials')
    const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null)
    const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null)
    const [isMobile, setIsMobile] = useState(isMobileView())

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(isMobileView())
        }
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    // Filter and Sort Materials
    const sortedMaterials = useMemo(() => {
        // Sort by Rarity (Common -> Legendary) then by ID
        const rarityOrder: Record<string, number> = {
            'N': 1, 'R': 2, 'SR': 3, 'SSR': 4, 'UR': 5,
            'COMMON': 1, 'UNCOMMON': 2, 'RARE': 3, 'EPIC': 4, 'LEGENDARY': 5
        }
        return [...materials].sort((a, b) => {
            const rarityDiff = (rarityOrder[a.rarity] || 0) - (rarityOrder[b.rarity] || 0)
            if (rarityDiff !== 0) return rarityDiff
            return a.id.localeCompare(b.id)
        })
    }, [materials])

    const selectedMaterial = materials.find(m => m.id === selectedMaterialId)
    const selectedRecipe = recipes.find(r => r.id === selectedRecipeId)

    const getRarityColor = (rarity: string) => {
        switch (rarity) {
            case 'COMMON': return '#a0aec0'
            case 'UNCOMMON': return '#48bb78'
            case 'RARE': return '#4299e1'
            case 'EPIC': return '#805ad5'
            case 'LEGENDARY': return '#d69e2e'
            default: return '#a0aec0'
        }
    }

    return (
        <div style={{
            width: '100%',
            height: '100%',
            background: 'rgba(26, 32, 44, 0.98)', // Increased opacity
            borderRadius: '16px',
            border: '2px solid #4a5568',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            color: '#e2e8f0',
            position: 'relative'
        }}>
            {/* Header / Tabs - Simplified for Mobile */}
            <div style={{
                display: 'flex',
                borderBottom: '2px solid #4a5568',
                background: '#1a202c',
                minHeight: '50px'
            }}>
                <button
                    onClick={() => {
                        setActiveTab('materials')
                        setSelectedRecipeId(null)
                    }}
                    style={{
                        flex: 1,
                        padding: '16px',
                        background: activeTab === 'materials' ? '#2d3748' : 'transparent',
                        color: activeTab === 'materials' ? '#fbbf24' : '#cbd5e0',
                        border: 'none',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                    }}
                >
                    📦 재료 도감
                </button>
                <div style={{ width: '1px', background: '#4a5568' }} />
                <button
                    onClick={() => {
                        setActiveTab('recipes')
                        setSelectedMaterialId(null)
                    }}
                    style={{
                        flex: 1,
                        padding: '16px',
                        background: activeTab === 'recipes' ? '#2d3748' : 'transparent',
                        color: activeTab === 'recipes' ? '#fbbf24' : '#cbd5e0',
                        border: 'none',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                    }}
                >
                    <img src="/assets/ui/recipe.png" alt="레시피" style={{ width: '18px', height: '18px', marginRight: '6px', verticalAlign: 'middle' }} />
                    레시피 도감
                </button>
            </div>

            {/* Content Area */}
            <div style={{
                flex: 1,
                overflow: 'hidden',
                display: 'flex',
                position: 'relative'
            }}>
                {/* Grid (Left side on desktop, full on mobile if list) */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '16px',
                    paddingBottom: '80px', // Ensure bottom items are visible
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', // Safe width for mobile
                    gridAutoRows: '100px', // Explicit row height
                    gap: '12px',
                    alignContent: 'start',
                    borderRight: isMobile ? 'none' : '1px solid #4a5568'
                }}>
                    {activeTab === 'materials' && sortedMaterials.map(mat => {
                        const count = playerMaterials[mat.id] || 0
                        const isUnlocked = count > 0

                        return (
                            <button
                                key={mat.id}
                                onClick={() => {
                                    if (isUnlocked) {
                                        setSelectedMaterialId(mat.id)
                                    }
                                }}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    background: selectedMaterialId === mat.id ? 'rgba(251, 191, 36, 0.2)' : '#2d3748',
                                    border: `2px solid ${selectedMaterialId === mat.id ? '#fbbf24' : getRarityColor(mat.rarity)}`,
                                    borderRadius: '8px',
                                    padding: '4px',
                                    cursor: isUnlocked ? 'pointer' : 'not-allowed',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    opacity: isUnlocked ? 1 : 0.5,
                                    position: 'relative'
                                }}
                            >
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    marginBottom: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {mat.iconUrl ? (
                                        <img src={mat.iconUrl} alt={mat.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                    ) : (
                                        <span>📦</span>
                                    )}
                                </div>
                                <span style={{ fontSize: '10px', color: '#cbd5e0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
                                    {isUnlocked ? mat.name : '???'}
                                </span>
                            </button>
                        )
                    })}

                    {activeTab === 'recipes' && recipes.map(recipe => {
                        const playerRecipe = playerRecipes[recipe.id]
                        const isDiscovered = playerRecipe?.is_discovered || false
                        const monster = recipe.resultMonsterId ? MONSTER_DATA[recipe.resultMonsterId] : undefined

                        return (
                            <button
                                key={recipe.id}
                                onClick={() => {
                                    if (isDiscovered) {
                                        setSelectedRecipeId(recipe.id)
                                    }
                                }}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    background: selectedRecipeId === recipe.id ? 'rgba(251, 191, 36, 0.2)' : '#2d3748',
                                    border: `2px solid ${selectedRecipeId === recipe.id ? '#fbbf24' : '#4a5568'}`,
                                    borderRadius: '8px',
                                    padding: '4px',
                                    cursor: isDiscovered ? 'pointer' : 'not-allowed',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    opacity: isDiscovered ? 1 : 0.5,
                                    position: 'relative'
                                }}
                            >
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    marginBottom: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {isDiscovered && monster?.iconUrl ? (
                                        <img src={monster.iconUrl} alt={monster.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                    ) : (
                                        <img src="/assets/ui/recipe.png" alt="레시피" style={{ width: '24px', height: '24px' }} />
                                    )}
                                </div>
                                <span style={{ fontSize: '10px', color: '#cbd5e0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
                                    {isDiscovered ? (monster?.name || recipe.name) : '???'}
                                </span>
                            </button>
                        )
                    })}
                </div>

                {/* Material Detail View */}
                {selectedMaterial && activeTab === 'materials' && (
                    <div style={{
                        width: isMobile ? '100%' : '300px',
                        background: '#1a202c',
                        borderLeft: isMobile ? 'none' : '1px solid #4a5568',
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px',
                        position: isMobile ? 'absolute' : 'static',
                        top: 0,
                        left: 0,
                        height: '100%',
                        zIndex: 50,
                        overflowY: 'auto'
                    }}>
                        {isMobile && (
                            <button
                                onClick={() => setSelectedMaterialId(null)}
                                style={{
                                    alignSelf: 'flex-end',
                                    background: 'rgba(0,0,0,0.3)',
                                    borderRadius: '50%',
                                    width: '36px',
                                    height: '36px',
                                    border: 'none',
                                    color: 'white',
                                    fontSize: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    marginBottom: '10px'
                                }}
                            >
                                ×
                            </button>
                        )}

                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <div style={{
                                width: '64px',
                                height: '64px',
                                background: '#2d3748',
                                borderRadius: '12px',
                                border: `2px solid ${getRarityColor(selectedMaterial.rarity)}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden'
                            }}>
                                {selectedMaterial.iconUrl ? (
                                    <img src={selectedMaterial.iconUrl} alt={selectedMaterial.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                ) : (
                                    <span style={{ fontSize: '32px' }}>📦</span>
                                )}
                            </div>
                            <div>
                                <div style={{ fontSize: '18px', fontWeight: 'bold', color: getRarityColor(selectedMaterial.rarity) }}>
                                    {selectedMaterial.name}
                                </div>
                                <div style={{ fontSize: '14px', color: '#a0aec0' }}>
                                    {selectedMaterial.type}
                                </div>
                            </div>
                        </div>

                        <div style={{
                            background: '#2d3748',
                            borderRadius: '8px',
                            padding: '12px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: '14px'
                        }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ color: '#a0aec0', marginBottom: '4px' }}>보유량</div>
                                <div style={{ color: 'white', fontWeight: 'bold' }}>
                                    {playerMaterials[selectedMaterial.id] || 0}
                                </div>
                            </div>
                            <div style={{ width: '1px', background: '#4a5568' }} />
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ color: '#a0aec0', marginBottom: '4px' }}>판매가</div>
                                <div style={{ color: '#fbbf24', fontWeight: 'bold' }}>
                                    {selectedMaterial.sellPrice} G
                                </div>
                            </div>
                        </div>

                        <div>
                            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#e2e8f0', marginBottom: '8px' }}>설명</div>
                            <div style={{ fontSize: '14px', color: '#a0aec0', lineHeight: '1.5' }}>
                                {selectedMaterial.description || '설명이 없습니다.'}
                            </div>
                        </div>

                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#e2e8f0', marginBottom: '8px' }}>획득처</div>
                            <div style={{
                                background: '#2d3748',
                                borderRadius: '8px',
                                padding: '12px',
                                fontSize: '14px',
                                color: '#cbd5e0',
                                minHeight: '80px'
                            }}>
                                {(() => {
                                    const sources = getMaterialSources(selectedMaterial.id)
                                    if (sources.length > 0) {
                                        return (
                                            <ul style={{ paddingLeft: '0', margin: 0, listStyle: 'none' }}>
                                                {sources.map((source, idx) => (
                                                    <li key={idx} style={{ marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <span style={{ fontSize: '16px', display: 'flex', alignItems: 'center' }}>
                                                            {source.type === 'facility' ? '🏭' : <img src="/assets/ui/dealer_icon.png" alt="Battle" style={{ width: '16px', height: '16px' }} />}
                                                        </span>
                                                        <span>
                                                            <strong style={{ color: '#e2e8f0' }}>{source.name}</strong>
                                                            {source.detail && (
                                                                <span style={{ color: '#a0aec0' }}> - {source.detail}</span>
                                                            )}
                                                            {source.dropRate !== undefined && (
                                                                <span style={{ color: '#48bb78', marginLeft: '4px' }}>({source.dropRate}%)</span>
                                                            )}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )
                                    }
                                    return (
                                        <div style={{ color: '#718096', fontStyle: 'italic' }}>
                                            아직 알려진 정보가 없습니다.
                                        </div>
                                    )
                                })()}
                            </div>
                        </div>
                    </div>
                )}

                {/* Recipe Detail View */}
                {selectedRecipe && activeTab === 'recipes' && (
                    <div style={{
                        width: isMobile ? '100%' : '300px',
                        background: '#1a202c',
                        borderLeft: isMobile ? 'none' : '1px solid #4a5568',
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px',
                        position: isMobile ? 'absolute' : 'static',
                        top: 0,
                        left: 0,
                        height: '100%',
                        zIndex: 50,
                        overflowY: 'auto'
                    }}>
                        {isMobile && (
                            <button
                                onClick={() => setSelectedRecipeId(null)}
                                style={{
                                    alignSelf: 'flex-end',
                                    background: 'rgba(0,0,0,0.3)',
                                    borderRadius: '50%',
                                    width: '36px',
                                    height: '36px',
                                    border: 'none',
                                    color: 'white',
                                    fontSize: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    marginBottom: '10px'
                                }}
                            >
                                ×
                            </button>
                        )}

                        {(() => {
                            const monster = selectedRecipe.resultMonsterId ? MONSTER_DATA[selectedRecipe.resultMonsterId] : undefined
                            return (
                                <>
                                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                        <div style={{
                                            width: '64px',
                                            height: '64px',
                                            background: '#2d3748',
                                            borderRadius: '12px',
                                            border: '2px solid #ed8936',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            overflow: 'hidden'
                                        }}>
                                            {monster?.iconUrl ? (
                                                <img
                                                    src={monster.iconUrl}
                                                    alt={monster.name}
                                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                                />
                                            ) : (
                                                <img src="/assets/ui/recipe.png" alt="레시피" style={{ width: '48px', height: '48px' }} />
                                            )}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ed8936' }}>
                                                {monster?.name || selectedRecipe.name}
                                            </div>
                                            <div style={{ fontSize: '14px', color: '#a0aec0' }}>
                                                {monster?.role || 'Unknown'}
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#e2e8f0', marginBottom: '8px' }}>필요 재료</div>
                                        <div style={{
                                            background: '#2d3748',
                                            borderRadius: '8px',
                                            padding: '12px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '8px'
                                        }}>
                                            {selectedRecipe.ingredients?.map((ing, idx) => {
                                                const material = materials.find(m => m.id === ing.materialId)
                                                return (
                                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <div style={{ width: '24px', height: '24px', background: '#4a5568', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            {material?.iconUrl ? <img src={material.iconUrl} style={{ width: '100%' }} /> : '📦'}
                                                        </div>
                                                        <span style={{ fontSize: '14px', color: '#cbd5e0', flex: 1 }}>
                                                            {material?.name || ing.materialId}
                                                        </span>
                                                        <span style={{ fontSize: '14px', color: '#fbbf24', fontWeight: 'bold' }}>
                                                            x {ing.quantity}
                                                        </span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    <div style={{
                                        background: '#2d3748',
                                        borderRadius: '8px',
                                        padding: '12px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        fontSize: '14px'
                                    }}>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ color: '#a0aec0', marginBottom: '4px' }}>제작 시간</div>
                                            <div style={{ color: 'white', fontWeight: 'bold' }}>
                                                {selectedRecipe.craftTimeSec}초
                                            </div>
                                        </div>
                                        <div style={{ width: '1px', background: '#4a5568' }} />
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ color: '#a0aec0', marginBottom: '4px' }}>획득 경험치</div>
                                            <div style={{ color: '#9f7aea', fontWeight: 'bold' }}>
                                                {selectedRecipe.expGain} XP
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#e2e8f0', marginBottom: '8px' }}>설명</div>
                                        <div style={{ fontSize: '14px', color: '#a0aec0', lineHeight: '1.5' }}>
                                            {monster?.description || '설명이 없습니다.'}
                                        </div>
                                    </div>
                                </>
                            )
                        })()}
                    </div>
                )}
            </div>
        </div>
    )
}
