import { useEffect, useState } from 'react'
import { useGameStore } from '../../store/useGameStore'
import { useAlchemyStore } from '../../store/useAlchemyStore'
import { getAllMaterials, type Material } from '../../lib/alchemyApi'

const LEGACY_RESOURCE_NAMES: Record<string, string> = {
    gold: '골드',
    stone: '돌',
    ore_magic: '마력석',
    gem_fragment: '보석 파편',
    training_token: '훈련 토큰'
}

export default function Shop() {
    const { resources, sellResource, addResources } = useGameStore()
    const { playerMaterials, sellMaterial } = useAlchemyStore()
    const [materials, setMaterials] = useState<Material[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadMaterials() {
            try {
                const allMaterials = await getAllMaterials()
                setMaterials(allMaterials)
            } catch (error) {
                console.error('재료 목록 로드 실패:', error)
            } finally {
                setLoading(false)
            }
        }
        loadMaterials()
    }, [])

    const [sellingItems, setSellingItems] = useState<Record<string, boolean>>({})

    const handleSellMaterial = async (materialId: string, sellPrice: number) => {
        const amount = playerMaterials[materialId] || 0
        if (amount > 0) {
            setSellingItems(prev => ({ ...prev, [materialId]: true }))
            try {
                // 연금술 재료는 useAlchemyStore에서 차감 (DB 반영)
                const success = await sellMaterial(materialId, amount)

                if (success) {
                    // 골드는 useGameStore에서 지급
                    const totalValue = amount * sellPrice
                    // addResources는 내부적으로 기존 자원에 더해주는 로직이므로 gold만 넘기면 됨
                    addResources({ gold: totalValue })
                    console.log(`${materialId} ${amount}개 판매: +${totalValue}G`)
                } else {
                    console.error('판매 실패')
                }
            } finally {
                setSellingItems(prev => ({ ...prev, [materialId]: false }))
            }
        }
    }

    const handleSellLegacyResource = (resourceId: string, price: number) => {
        const amount = resources[resourceId] || 0
        if (amount > 0) {
            sellResource(resourceId, amount, price)
        }
    }

    // 판매 가능한 연금술 재료 (보유량 > 0 && sell_price > 0)
    const sellableMaterials = materials.filter(
        m => (playerMaterials[m.id] || 0) > 0 && m.sell_price > 0
    )

    // 판매 가능한 레거시 자원 (연금술 재료가 아닌 것들)
    const sellableLegacyResources = Object.entries(resources)
        .filter(([id, amount]) => {
            // gold는 제외, 보유량 > 0, 레거시 자원만
            return id !== 'gold' && amount > 0 && LEGACY_RESOURCE_NAMES[id]
        })

    const totalSellableItems = sellableMaterials.length + sellableLegacyResources.length

    if (loading) {
        return (
            <div style={{
                flex: 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: '#2a2a2a',
                borderRadius: '8px'
            }}>
                <p style={{ color: '#aaa' }}>재료 목록 로딩 중...</p>
            </div>
        )
    }

    return (
        <div style={{
            flex: 1,
            overflowY: 'auto',
            background: '#2a2a2a',
            padding: '15px',
            borderRadius: '8px',
            boxShadow: 'inset 0 0 10px rgba(0,0,0,0.3)'
        }}>
            <h2 style={{ color: 'white', marginTop: 0, fontSize: '1.1em', borderBottom: '1px solid #444', paddingBottom: '10px' }}>
                상점 (자원 판매)
            </h2>

            {totalSellableItems === 0 ? (
                <p style={{ color: '#aaa', textAlign: 'center', marginTop: '20px' }}>판매할 자원이 없습니다.</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {/* 연금술 재료 */}
                    {sellableMaterials.map(material => {
                        const count = playerMaterials[material.id] || 0
                        const price = material.sell_price
                        const totalValue = count * price
                        const isSelling = sellingItems[material.id]

                        return (
                            <div key={material.id} style={{
                                background: '#333',
                                padding: '10px',
                                borderRadius: '6px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                border: '1px solid #444'
                            }}>
                                <div>
                                    <div style={{ color: '#ddd', fontWeight: 'bold' }}>
                                        {material.name}
                                        <span style={{
                                            marginLeft: '8px',
                                            fontSize: '0.75em',
                                            padding: '2px 6px',
                                            borderRadius: '4px',
                                            background: getRarityColor(material.rarity),
                                            color: 'white'
                                        }}>
                                            {material.rarity}
                                        </span>
                                    </div>
                                    <div style={{ color: '#aaa', fontSize: '0.85em' }}>
                                        보유: {count}개 (개당 {price}G)
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleSellMaterial(material.id, price)}
                                    disabled={isSelling}
                                    style={{
                                        background: isSelling ? '#666' : '#eab308',
                                        color: isSelling ? '#aaa' : 'black',
                                        border: 'none',
                                        padding: '5px 10px',
                                        borderRadius: '4px',
                                        cursor: isSelling ? 'not-allowed' : 'pointer',
                                        fontWeight: 'bold',
                                        fontSize: '0.9em',
                                        minWidth: '100px'
                                    }}
                                >
                                    {isSelling ? '판매 중...' : `모두 판매 (+${totalValue}G)`}
                                </button>
                            </div>
                        )
                    })}

                    {/* 레거시 자원 (기존 시스템) */}
                    {sellableLegacyResources.map(([resourceId, count]) => {
                        // 레거시 자원의 가격은 임시로 설정 (추후 DB로 이동)
                        const legacyPrices: Record<string, number> = {
                            'stone': 5,
                            'ore_magic': 100,
                            'gem_fragment': 500,
                            'training_token': 50
                        }
                        const price = legacyPrices[resourceId] || 10
                        const totalValue = count * price

                        return (
                            <div key={resourceId} style={{
                                background: '#333',
                                padding: '10px',
                                borderRadius: '6px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div>
                                    <div style={{ color: '#ddd', fontWeight: 'bold' }}>{LEGACY_RESOURCE_NAMES[resourceId]}</div>
                                    <div style={{ color: '#aaa', fontSize: '0.85em' }}>
                                        보유: {count}개 (개당 {price}G)
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleSellLegacyResource(resourceId, price)}
                                    style={{
                                        background: '#eab308',
                                        color: 'black',
                                        border: 'none',
                                        padding: '5px 10px',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontWeight: 'bold',
                                        fontSize: '0.9em'
                                    }}
                                >
                                    모두 판매 (+{totalValue}G)
                                </button>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

function getRarityColor(rarity: string): string {
    switch (rarity) {
        case 'COMMON': return '#9ca3af'
        case 'UNCOMMON': return '#10b981'
        case 'RARE': return '#3b82f6'
        case 'EPIC': return '#a855f7'
        case 'LEGENDARY': return '#f59e0b'
        default: return '#6b7280'
    }
}
