/* eslint-disable no-console */
import { useEffect, useMemo, useState } from 'react'
import { useGameStore } from '../../store/useGameStore'
import { useAlchemyStore } from '../../store/useAlchemyStore'
import { useUnifiedInventory } from '../../hooks/useUnifiedInventory'
import { isMobileView } from '../../utils/responsiveUtils'
import { MATERIALS } from '../../data/alchemyData'

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
    const { sellResource, setCanvasView } = useGameStore()
    const { sellMaterial } = useAlchemyStore()
    const {
        materials,
        materialCounts,
        legacyResources,
        refreshInventory,
        loading,
    } = useUnifiedInventory()
    const [isMobile, setIsMobile] = useState(isMobileView())

    // 골드는 materialCounts에서 가져옴 (Single Source of Truth)
    const gold = materialCounts['gold'] || 0

    // 상점 진입 시 최신 인벤토리 동기화
    useEffect(() => {
        refreshInventory()
    }, [refreshInventory])

    // 반응형 감지
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(isMobileView())
        }
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    // 개별 아이템의 판매 수량을 관리하는 상태
    const [sellQuantities, setSellQuantities] = useState<Record<string, number>>({})

    // 다중 선택을 위한 상태
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
    const [isBulkSelling, setIsBulkSelling] = useState(false)

    // 통합된 아이템 리스트 생성
    const shopItems: ShopItem[] = useMemo(() => {
        const items: ShopItem[] = []
        const addedIds = new Set<string>() // 중복 방지용

        // 연금술 재료
        materials.forEach(m => {
            const count = materialCounts[m.id] || 0

            if (count > 0) {
                // sell_price가 0이면 희귀도에 따라 기본 가격 계산
                let sellPrice = m.sell_price
                if (sellPrice === 0) {
                    switch (m.rarity) {
                        case 'COMMON':
                            sellPrice = 5
                            break
                        case 'UNCOMMON':
                            sellPrice = 15
                            break
                        case 'RARE':
                            sellPrice = 50
                            break
                        case 'EPIC':
                            sellPrice = 150
                            break
                        case 'LEGENDARY':
                            sellPrice = 500
                            break
                        default:
                            sellPrice = 10
                    }
                }

                items.push({
                    id: m.id,
                    name: m.name,
                    type: 'material',
                    count,
                    price: sellPrice,
                    rarity: m.rarity
                })
                addedIds.add(m.id) // 추가된 ID 기록
            }
        })

        // 레거시 자원 (이미 추가된 항목은 제외)
        Object.entries(legacyResources).forEach(([id, count]) => {
            if (id !== 'gold' && count > 0 && LEGACY_RESOURCE_NAMES[id] && !addedIds.has(id)) {
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
    }, [materialCounts, materials, legacyResources])

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
        // 성공적으로 판매된 재료 아이템과 그 수익을 추적
        const successfulMaterialSales: { itemId: string, goldEarned: number }[] = []

        try {
            // 선택된 아이템들을 순회하며 판매 처리
            for (const itemId of selectedItems) {
                const item = shopItems.find(i => i.id === itemId)
                if (!item) continue

                const quantity = sellQuantities[itemId] || 1
                const price = item.price
                const goldForThisItem = quantity * price

                if (item.type === 'material') {
                    const success = await sellMaterial(item.id, quantity)
                    if (success) {
                        totalGoldEarned += goldForThisItem
                        successCount++
                        // 성공한 재료 판매 기록
                        successfulMaterialSales.push({ itemId, goldEarned: goldForThisItem })
                    }
                } else {
                    const success = await sellResource(item.id, quantity, price)
                    if (success) {
                        totalGoldEarned += goldForThisItem
                        successCount++
                    }
                }
            }

            // 성공적으로 판매된 재료에 대해서만 골드 지급
            const materialGoldEarned = successfulMaterialSales.reduce((sum, sale) => sum + sale.goldEarned, 0)

            if (materialGoldEarned > 0) {
                // gold는 material 테이블에 없으므로 직접 상태 업데이트
                const alchemyStore = useAlchemyStore.getState()
                const currentGold = alchemyStore.playerMaterials['gold'] || 0
                const newGold = currentGold + materialGoldEarned

                useAlchemyStore.setState({
                    playerMaterials: {
                        ...alchemyStore.playerMaterials,
                        gold: newGold
                    }
                })

                // UI 캐시도 업데이트
                const gameStore = useGameStore.getState()
                gameStore.setResources({
                    ...gameStore.resources,
                    gold: newGold
                })

                // DB 업데이트 (골드) - await로 완료 대기
                if (alchemyStore.userId) {
                    try {
                        const api = await import('../../lib/alchemyApi')
                        await api.addGold(alchemyStore.userId, materialGoldEarned)
                        console.log(`✅ 골드 DB 저장 성공: +${materialGoldEarned} G`)
                    } catch (error) {
                        console.error('골드 DB 저장 실패:', error)
                    }
                }
            }

            if (successCount > 0) {
                console.log(`일괄 판매 완료: ${successCount} 건, +${totalGoldEarned} G`)
            }

            // refreshInventory()를 호출하지 않음 - 로컬 상태가 이미 업데이트되었고,
            // DB 동기화는 위에서 완료됨. refreshInventory 호출 시 DB에서 stale 데이터를
            // 가져올 수 있는 race condition을 방지함.
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
            padding: isMobile ? '12px' : '20px',
            color: '#eee',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: isMobile ? '12px' : '20px',
            maxWidth: '1000px',
            margin: '0 auto',
            width: '100%',
            overflow: 'hidden'
        }}>
            <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'stretch' : 'center',
                background: 'rgba(0,0,0,0.6)',
                padding: isMobile ? '12px' : '15px',
                borderRadius: '12px',
                backdropFilter: 'blur(4px)',
                gap: isMobile ? '10px' : '0'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '10px' : '15px' }}>
                    <button
                        onClick={handleBack}
                        style={{
                            background: '#4a3020',
                            border: '2px solid #8a6040',
                            color: 'white',
                            padding: isMobile ? '10px 14px' : '8px 16px',
                            minHeight: isMobile ? '44px' : 'auto',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: isMobile ? '0.95em' : '14px'
                        }}
                    >
                        ← 나가기
                    </button>
                    <h2 style={{
                        margin: 0,
                        fontSize: isMobile ? '1.3em' : '1.5em',
                        color: '#f0d090'
                    }}>🏪 상점</h2>
                </div>
                <div style={{
                    fontSize: isMobile ? '1.1em' : '1.2em',
                    fontWeight: 'bold',
                    color: '#facc15',
                    textAlign: isMobile ? 'center' : 'right'
                }}>
                    💰 {formatNumber(gold)} G
                </div>
            </div>

            {/* Bulk Action Bar */}
            <div style={{
                background: '#333',
                padding: isMobile ? '12px' : '15px',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'stretch' : 'center',
                border: '1px solid #444',
                gap: isMobile ? '10px' : '0'
            }}>
                <div style={{
                    color: '#ddd',
                    fontWeight: 'bold',
                    fontSize: isMobile ? '0.9em' : '1em',
                    textAlign: isMobile ? 'center' : 'left'
                }}>
                    선택된 아이템: <span style={{ color: '#fff' }}>{selectedItems.size}</span>개
                    <span style={{ margin: '0 10px', color: '#555' }}>{isMobile ? '' : '|'}</span>
                    {isMobile && <br />}
                    총 예상 금액: <span style={{ color: '#eab308' }}>{formatNumber(totalSelectedValue)}G</span>
                </div>
                <button
                    onClick={handleBulkSell}
                    disabled={selectedItems.size === 0 || isBulkSelling}
                    style={{
                        background: selectedItems.size > 0 ? '#eab308' : '#555',
                        color: selectedItems.size > 0 ? 'black' : '#aaa',
                        border: 'none',
                        padding: isMobile ? '12px 24px' : '10px 24px',
                        minHeight: isMobile ? '44px' : 'auto',
                        borderRadius: '6px',
                        cursor: selectedItems.size > 0 ? 'pointer' : 'not-allowed',
                        fontWeight: 'bold',
                        fontSize: isMobile ? '0.95em' : '1em',
                        transition: 'all 0.2s'
                    }}
                >
                    {isBulkSelling ? '판매 중...' : '선택 항목 판매'}
                </button>
            </div>

            {/* Table or Card List */}
            {shopItems.length === 0 ? (
                <p style={{ color: '#aaa', textAlign: 'center', marginTop: '40px' }}>판매할 자원이 없습니다.</p>
            ) : isMobile ? (
                /* Mobile: Card Layout */
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    flex: 1,
                    overflow: 'auto',
                    minHeight: 0
                }}>
                    {/* Select All Card */}
                    <div style={{
                        background: '#222',
                        padding: '12px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        border: '1px solid #444'
                    }}>
                        <input
                            type="checkbox"
                            checked={shopItems.length > 0 && selectedItems.size === shopItems.length}
                            onChange={toggleSelectAll}
                            style={{ cursor: 'pointer', width: '18px', height: '18px', minWidth: '18px' }}
                        />
                        <span style={{ fontWeight: 'bold', fontSize: '0.95em' }}>전체 선택</span>
                    </div>

                    {/* Item Cards */}
                    {shopItems.map(item => {
                        const sellQuantity = sellQuantities[item.id] || 1
                        const totalValue = sellQuantity * item.price
                        const isSelected = selectedItems.has(item.id)

                        return (
                            <div key={item.id} style={{
                                background: isSelected ? '#3a3520' : '#333',
                                border: `2px solid ${isSelected ? '#eab308' : '#444'} `,
                                borderRadius: '6px',
                                padding: '8px',
                                transition: 'all 0.2s'
                            }}>
                                {/* Header: Checkbox + Image + Name */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => toggleSelection(item.id)}
                                        style={{ cursor: 'pointer', width: '16px', height: '16px', minWidth: '16px' }}
                                    />
                                    {/* Material Image */}
                                    {item.type === 'material' && (() => {
                                        const material = MATERIALS[item.id]
                                        const isImage = material?.iconUrl?.startsWith('/') || material?.iconUrl?.startsWith('http')
                                        return (
                                            <div style={{ width: '32px', height: '32px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {isImage ? (
                                                    <img
                                                        src={material.iconUrl}
                                                        alt={item.name}
                                                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                                    />
                                                ) : (
                                                    <span style={{ fontSize: '20px' }}>{material?.iconUrl || '📦'}</span>
                                                )}
                                            </div>
                                        )
                                    })()}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                                            <span style={{ fontWeight: 'bold', fontSize: '0.95em' }}>{item.name}</span>
                                            {item.rarity && (
                                                <span style={{
                                                    fontSize: '0.6em',
                                                    padding: '2px 4px',
                                                    borderRadius: '3px',
                                                    background: getRarityColor(item.rarity),
                                                    color: 'white'
                                                }}>
                                                    {item.rarity}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Info Row */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.8em', color: '#aaa' }}>
                                    <span>보유: {formatNumber(item.count)}개</span>
                                    <span>단가: {item.price}G</span>
                                </div>

                                {/* Quantity Controls */}
                                <div style={{ marginBottom: '6px' }}>
                                    <div style={{ fontSize: '0.75em', color: '#aaa', marginBottom: '4px' }}>판매 수량</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <button
                                            onClick={() => handleQuantityChange(item.id, sellQuantity - 1, item.count)}
                                            style={{
                                                width: '32px',
                                                height: '32px',
                                                minHeight: '32px',
                                                background: '#444',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '1.1em',
                                                fontWeight: 'bold',
                                                flexShrink: 0
                                            }}
                                        >-</button>
                                        <input
                                            type="number"
                                            value={sellQuantity}
                                            onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 0, item.count)}
                                            style={{
                                                flex: 1,
                                                minWidth: '0',
                                                textAlign: 'center',
                                                background: '#222',
                                                color: 'white',
                                                border: '1px solid #555',
                                                borderRadius: '4px',
                                                padding: '6px',
                                                fontSize: '0.9em',
                                                height: '32px',
                                                minHeight: '32px'
                                            }}
                                        />
                                        <button
                                            onClick={() => handleQuantityChange(item.id, sellQuantity + 1, item.count)}
                                            style={{
                                                width: '32px',
                                                height: '32px',
                                                minHeight: '32px',
                                                background: '#444',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '1.1em',
                                                fontWeight: 'bold',
                                                flexShrink: 0
                                            }}
                                        >+</button>
                                        <button
                                            onClick={() => handleQuantityChange(item.id, item.count, item.count)}
                                            style={{
                                                padding: '0 10px',
                                                height: '32px',
                                                minHeight: '32px',
                                                background: '#555',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '0.85em',
                                                fontWeight: 'bold',
                                                flexShrink: 0
                                            }}
                                        >Max</button>
                                    </div>
                                </div>

                                {/* Total Value */}
                                <div style={{
                                    background: '#222',
                                    padding: '6px',
                                    borderRadius: '4px',
                                    textAlign: 'center',
                                    fontWeight: 'bold',
                                    color: '#eab308',
                                    fontSize: '0.9em'
                                }}>
                                    합계: {formatNumber(totalValue)}G
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                /* Desktop: Table Layout */
                <div style={{
                    background: '#333',
                    borderRadius: '8px',
                    overflow: 'auto',
                    border: '1px solid #444',
                    flex: 1,
                    minHeight: 0
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
                                                {/* Material Image */}
                                                {item.type === 'material' && (() => {
                                                    const material = MATERIALS[item.id]
                                                    const isImage = material?.iconUrl?.startsWith('/') || material?.iconUrl?.startsWith('http')
                                                    return (
                                                        <div style={{ width: '32px', height: '32px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            {isImage ? (
                                                                <img
                                                                    src={material.iconUrl}
                                                                    alt={item.name}
                                                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                                                />
                                                            ) : (
                                                                <span style={{ fontSize: '20px' }}>{material?.iconUrl || '📦'}</span>
                                                            )}
                                                        </div>
                                                    )
                                                })()}
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
