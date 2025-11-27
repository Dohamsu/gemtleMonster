import { useEffect, useState, useMemo } from 'react'
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

// 숫자 포맷팅 헬퍼 함수
function formatNumber(num: number): string {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
    }
    return num.toString()
}

interface ShopItem {
    id: string
    name: string
    type: 'material' | 'legacy'
    count: number
    price: number
    rarity?: string
}

export default function Shop() {
    const { resources, sellResource, setCanvasView, addResources } = useGameStore()
    const { playerMaterials, sellMaterial } = useAlchemyStore()
    const [materials, setMaterials] = useState<Material[]>([])
    const [loading, setLoading] = useState(true)

    // 개별 아이템의 판매 수량을 관리하는 상태
    const [sellQuantities, setSellQuantities] = useState<Record<string, number>>({})

    // 다중 선택을 위한 상태
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
    const [isBulkSelling, setIsBulkSelling] = useState(false)

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

    // 통합된 아이템 리스트 생성
    const shopItems: ShopItem[] = useMemo(() => {
        const items: ShopItem[] = []

        // 연금술 재료
        materials.forEach(m => {
            const count = playerMaterials[m.id] || 0
            if (count > 0 && m.sell_price > 0) {
                items.push({
                    id: m.id,
                    name: m.name,
                    type: 'material',
                    count,
                    price: m.sell_price,
                    rarity: m.rarity
                })
            }
        })

        // 레거시 자원
        Object.entries(resources).forEach(([id, count]) => {
            if (id !== 'gold' && count > 0 && LEGACY_RESOURCE_NAMES[id]) {
                const legacyPrices: Record<string, number> = {
                    'stone': 5,
                    'ore_magic': 100,
                    'gem_fragment': 500,
                    'training_token': 50
                }
                items.push({
                    id,
                    name: LEGACY_RESOURCE_NAMES[id],
                    type: 'legacy',
                    count,
                    price: legacyPrices[id] || 10
                })
            }
        })

        return items
    }, [materials, playerMaterials, resources])

    // 수량 변경 핸들러
    const handleQuantityChange = (id: string, value: number, max: number) => {
        const newQuantity = Math.max(1, Math.min(value, max))
        setSellQuantities(prev => ({ ...prev, [id]: newQuantity }))
    }

    // 선택 핸들러
    const toggleSelection = (id: string) => {
        const newSelected = new Set(selectedItems)
        if (newSelected.has(id)) {
            newSelected.delete(id)
        } else {
            newSelected.add(id)
        }
        setSelectedItems(newSelected)
    }

    // 전체 선택 핸들러
    const toggleSelectAll = () => {
        if (selectedItems.size === shopItems.length) {
            setSelectedItems(new Set())
        } else {
            setSelectedItems(new Set(shopItems.map(item => item.id)))
        }
    }

    // 일괄 판매 핸들러
    const handleBulkSell = async () => {
        if (selectedItems.size === 0) return

        setIsBulkSelling(true)
        let totalGoldEarned = 0
        let successCount = 0

        try {
            // 선택된 아이템들을 순회하며 판매 처리
            for (const itemId of selectedItems) {
                const item = shopItems.find(i => i.id === itemId)
                if (!item) continue

                const quantity = sellQuantities[itemId] || 1
                const price = item.price

                if (item.type === 'material') {
                    const success = await sellMaterial(item.id, quantity)
                    if (success) {
                        totalGoldEarned += quantity * price
                        successCount++
                    }
                } else {
                    sellResource(item.id, quantity, price)
                    totalGoldEarned += quantity * price
                    successCount++
                }
            }

            if (totalGoldEarned > 0) {
                // 골드 지급 (레거시 자원은 sellResource 내부에서 처리되지만, 연금술 재료는 여기서 처리)
                // 주의: sellResource는 내부적으로 골드를 증가시키므로, 연금술 재료 판매분만 계산해서 더해야 함.
                // 하지만 현재 구조상 sellMaterial은 골드를 주지 않고 true만 리턴하므로, 
                // 위 루프에서 계산된 totalGoldEarned 중 'material' 타입인 것만 더해야 하는 게 맞지만,
                // 기존 로직(handleSellMaterial)을 보면 sellMaterial 성공 시 addResources({ gold })를 호출했음.
                // 여기서는 편의상 레거시 자원 판매 시 골드 증가 로직이 중복되지 않도록 주의해야 함.

                // 수정: sellResource는 내부적으로 addResources를 호출함.
                // 따라서 연금술 재료 판매분만 별도로 골드를 지급해야 함.

                const materialGoldEarned = Array.from(selectedItems).reduce((sum, itemId) => {
                    const item = shopItems.find(i => i.id === itemId)
                    if (item && item.type === 'material') {
                        const quantity = sellQuantities[itemId] || 1
                        return sum + (quantity * item.price)
                    }
                    return sum
                }, 0)

                if (materialGoldEarned > 0) {
                    addResources({ gold: materialGoldEarned })
                }

                console.log(`일괄 판매 완료: ${successCount}건, +${totalGoldEarned}G`)
            }
        } catch (error) {
            console.error('일괄 판매 중 오류:', error)
        } finally {
            setIsBulkSelling(false)
            setSelectedItems(new Set())
            // 수량 초기화 (선택사항)
            const resetQuantities = { ...sellQuantities }
            selectedItems.forEach(id => delete resetQuantities[id])
            setSellQuantities(resetQuantities)
        }
    }

    // 선택된 아이템들의 총 예상 판매 금액 계산
    const totalSelectedValue = useMemo(() => {
        return Array.from(selectedItems).reduce((sum, itemId) => {
            const item = shopItems.find(i => i.id === itemId)
            if (!item) return sum
            const quantity = sellQuantities[itemId] || 1
            return sum + (quantity * item.price)
        }, 0)
    }, [selectedItems, shopItems, sellQuantities])

    const handleBack = () => {
        setCanvasView('map')
    }

    if (loading) {
        return (
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#2a2a2a', borderRadius: '8px' }}>
                <p style={{ color: '#aaa' }}>재료 목록 로딩 중...</p>
            </div>
        )
    }

    return (
        <div style={{
            padding: '20px',
            color: '#eee',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            maxWidth: '1000px',
            margin: '0 auto',
            width: '100%'
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(0,0,0,0.6)',
                padding: '15px',
                borderRadius: '12px',
                backdropFilter: 'blur(4px)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button
                        onClick={handleBack}
                        style={{
                            background: '#4a3020',
                            border: '2px solid #8a6040',
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '14px'
                        }}
                    >
                        ← 나가기
                    </button>
                    <h2 style={{ margin: 0, fontSize: '1.5em', color: '#f0d090' }}>🏪 상점</h2>
                </div>
                <div style={{ fontSize: '1.2em', fontWeight: 'bold', color: '#facc15' }}>
                    💰 {formatNumber(resources.gold)} G
                </div>
            </div>

            {/* Bulk Action Bar */}
            <div style={{
                background: '#333',
                padding: '15px',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                border: '1px solid #444'
            }}>
                <div style={{ color: '#ddd', fontWeight: 'bold' }}>
                    선택된 아이템: <span style={{ color: '#fff' }}>{selectedItems.size}</span>개
                    <span style={{ margin: '0 10px', color: '#555' }}>|</span>
                    총 예상 금액: <span style={{ color: '#eab308' }}>{formatNumber(totalSelectedValue)}G</span>
                </div>
                <button
                    onClick={handleBulkSell}
                    disabled={selectedItems.size === 0 || isBulkSelling}
                    style={{
                        background: selectedItems.size > 0 ? '#eab308' : '#555',
                        color: selectedItems.size > 0 ? 'black' : '#aaa',
                        border: 'none',
                        padding: '10px 24px',
                        borderRadius: '6px',
                        cursor: selectedItems.size > 0 ? 'pointer' : 'not-allowed',
                        fontWeight: 'bold',
                        fontSize: '1em',
                        transition: 'all 0.2s'
                    }}
                >
                    {isBulkSelling ? '판매 중...' : '선택 항목 판매'}
                </button>
            </div>

            {/* Table */}
            {shopItems.length === 0 ? (
                <p style={{ color: '#aaa', textAlign: 'center', marginTop: '40px' }}>판매할 자원이 없습니다.</p>
            ) : (
                <div style={{
                    background: '#333',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: '1px solid #444'
                }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', color: '#ddd' }}>
                        <thead>
                            <tr style={{ background: '#222', borderBottom: '1px solid #444' }}>
                                <th style={{ padding: '12px', width: '40px', textAlign: 'center' }}>
                                    <input
                                        type="checkbox"
                                        checked={shopItems.length > 0 && selectedItems.size === shopItems.length}
                                        onChange={toggleSelectAll}
                                        style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                                    />
                                </th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>아이템</th>
                                <th style={{ padding: '12px', textAlign: 'center', width: '100px' }}>보유량</th>
                                <th style={{ padding: '12px', textAlign: 'center', width: '180px' }}>판매 수량</th>
                                <th style={{ padding: '12px', textAlign: 'right', width: '100px' }}>단가</th>
                                <th style={{ padding: '12px', textAlign: 'right', width: '120px' }}>합계</th>
                            </tr>
                        </thead>
                        <tbody>
                            {shopItems.map(item => {
                                const sellQuantity = sellQuantities[item.id] || 1
                                const totalValue = sellQuantity * item.price
                                const isSelected = selectedItems.has(item.id)

                                return (
                                    <tr key={item.id} style={{
                                        borderBottom: '1px solid #444',
                                        background: isSelected ? 'rgba(234, 179, 8, 0.05)' : 'transparent',
                                        transition: 'background 0.2s'
                                    }}>
                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => toggleSelection(item.id)}
                                                style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                                            />
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ fontWeight: 'bold' }}>{item.name}</span>
                                                {item.rarity && (
                                                    <span style={{
                                                        fontSize: '0.7em',
                                                        padding: '2px 6px',
                                                        borderRadius: '4px',
                                                        background: getRarityColor(item.rarity),
                                                        color: 'white'
                                                    }}>
                                                        {item.rarity}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'center', color: '#aaa' }}>
                                            {formatNumber(item.count)}
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                                <button
                                                    onClick={() => handleQuantityChange(item.id, sellQuantity - 1, item.count)}
                                                    style={{ width: '24px', height: '24px', background: '#444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                >-</button>
                                                <input
                                                    type="number"
                                                    value={sellQuantity}
                                                    onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 0, item.count)}
                                                    style={{ width: '50px', textAlign: 'center', background: '#222', color: 'white', border: '1px solid #555', borderRadius: '4px', padding: '4px', fontSize: '0.9em' }}
                                                />
                                                <button
                                                    onClick={() => handleQuantityChange(item.id, sellQuantity + 1, item.count)}
                                                    style={{ width: '24px', height: '24px', background: '#444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                >+</button>
                                                <button
                                                    onClick={() => handleQuantityChange(item.id, item.count, item.count)}
                                                    style={{ padding: '0 6px', height: '24px', background: '#555', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75em' }}
                                                >Max</button>
                                            </div>
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'right', color: '#aaa' }}>
                                            {item.price}G
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: '#eab308' }}>
                                            {formatNumber(totalValue)}G
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
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
