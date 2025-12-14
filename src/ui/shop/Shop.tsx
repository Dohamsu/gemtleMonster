/* eslint-disable no-console */
import { useEffect, useMemo, useState } from 'react'
import { useGameStore } from '../../store/useGameStore'
import { useAlchemyStore } from '../../store/useAlchemyStore'
import { useShopStore, type ShopSaleItem } from '../../store/useShopStore'
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
    buyPrice?: number // 구매 탭용
}

interface ModalConfig {
    isOpen: boolean
    type: 'success' | 'error'
    title: string
    message: string
}

export default function Shop() {
    const { sellResource, setCanvasView } = useGameStore()
    const { sellMaterial } = useAlchemyStore()
    // Shop Store
    const { shopItems: buyItems, nextRefreshTime, checkRefresh, buyItem } = useShopStore()

    const {
        materials,
        materialCounts,
        legacyResources,
        refreshInventory,
        loading,
    } = useUnifiedInventory()
    const [isMobile, setIsMobile] = useState(isMobileView())
    const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy')
    const [timeLeft, setTimeLeft] = useState<string>('')

    // 모달 상태
    const [modalConfig, setModalConfig] = useState<ModalConfig>({
        isOpen: false,
        type: 'success',
        title: '',
        message: ''
    })

    // 골드는 materialCounts에서 가져옴 (Single Source of Truth)
    const gold = materialCounts['gold'] || 0

    // 상점 진입 시 로직
    useEffect(() => {
        refreshInventory()
        checkRefresh() // 초기 갱신 체크

        const timer = setInterval(() => {
            checkRefresh() // 1분마다 자동 갱신 체크

            // 타이머 UI 업데이트
            const now = Date.now()
            const diff = nextRefreshTime - now
            if (diff > 0) {
                const min = Math.floor(diff / 60000)
                const sec = Math.floor((diff % 60000) / 1000)
                setTimeLeft(`${min}:${sec.toString().padStart(2, '0')}`)
            } else {
                setTimeLeft('갱신 중...')
            }
        }, 1000)

        return () => clearInterval(timer)
    }, [refreshInventory, nextRefreshTime, checkRefresh])

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

    // 구매 탭: 개별 아이템 구매 수량 관리
    const [buyQuantities, setBuyQuantities] = useState<Record<string, number>>({})

    // 다중 선택을 위한 상태 (판매용)
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
    const [isBulkSelling, setIsBulkSelling] = useState(false)
    const [isBuying, setIsBuying] = useState(false)

    // 통합된 "판매" 아이템 리스트 생성
    const sellItems: ShopItem[] = useMemo(() => {
        const items: ShopItem[] = []
        const addedIds = new Set<string>() // 중복 방지용

        // 연금술 재료
        materials.forEach(m => {
            const count = materialCounts[m.id] || 0

            if (count > 0) {
                // sell_price가 0이면 희귀도에 따라 기본 가격 계산
                let sellPrice = m.sell_price
                if (sellPrice === 0) {
                    // Type assertion to string to avoid mismatch with MaterialRarity enum
                    switch (m.rarity as string) {
                        case 'COMMON': case 'N': sellPrice = 5; break
                        case 'UNCOMMON': sellPrice = 15; break
                        case 'RARE': case 'R': sellPrice = 50; break
                        case 'EPIC': case 'SR': sellPrice = 150; break
                        case 'LEGENDARY': case 'SSR': sellPrice = 500; break
                        default: sellPrice = 10
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
                addedIds.add(m.id)
            }
        })

        // 레거시 자원
        Object.entries(legacyResources).forEach(([id, count]) => {
            if (id !== 'gold' && count > 0 && LEGACY_RESOURCE_NAMES[id] && !addedIds.has(id)) {
                items.push({
                    id,
                    name: LEGACY_RESOURCE_NAMES[id],
                    type: 'legacy',
                    count,
                    price: 10 // 기본값
                })
            }
        })

        return items
    }, [materialCounts, materials, legacyResources])

    // 수량 변경 핸들러
    const handleQuantityChange = (id: string, value: number, max: number, type: 'buy' | 'sell') => {
        const newQuantity = Math.max(1, Math.min(value, max))
        if (type === 'sell') {
            setSellQuantities(prev => ({ ...prev, [id]: newQuantity }))
        } else {
            setBuyQuantities(prev => ({ ...prev, [id]: newQuantity }))
        }
    }

    // 모달 닫기
    const closeModal = () => {
        setModalConfig(prev => ({ ...prev, isOpen: false }))
    }

    // 구매 핸들러
    const handleBuy = async (item: ShopSaleItem) => {
        if (isBuying) return // 이중 클릭 방지

        const qty = buyQuantities[item.id] || 1
        const totalPrice = item.price * qty
        const material = MATERIALS[item.id]

        if (gold < totalPrice) {
            setModalConfig({
                isOpen: true,
                type: 'error',
                title: '잔액 부족',
                message: '골드가 부족하여 구매할 수 없습니다.'
            })
            return
        }

        setIsBuying(true)
        try {
            const success = await buyItem(item.id, qty)
            if (success) {
                // Note: refreshInventory 호출 제거 - buyItem에서 이미 로컬 상태 업데이트됨
                setModalConfig({
                    isOpen: true,
                    type: 'success',
                    title: '구매 성공',
                    message: `${material?.name || '아이템'} ${qty}개를 구매했습니다.`
                })
                setBuyQuantities(prev => ({ ...prev, [item.id]: 1 }))
            } else {
                setModalConfig({
                    isOpen: true,
                    type: 'error',
                    title: '구매 실패',
                    message: '알 수 없는 오류로 구매에 실패했습니다.'
                })
            }
        } finally {
            setIsBuying(false)
        }
    }

    // 선택 핸들러 (판매)
    const toggleSelection = (id: string) => {
        const newSelected = new Set(selectedItems)
        if (newSelected.has(id)) {
            newSelected.delete(id)
        } else {
            newSelected.add(id)
        }
        setSelectedItems(newSelected)
    }

    // 전체 선택 핸들러 (판매)
    const toggleSelectAll = () => {
        if (selectedItems.size === sellItems.length) {
            setSelectedItems(new Set())
        } else {
            setSelectedItems(new Set(sellItems.map(item => item.id)))
        }
    }

    // 일괄 판매 핸들러
    const handleBulkSell = async () => {
        if (selectedItems.size === 0) return

        setIsBulkSelling(true)
        let totalGoldEarned = 0
        let successCount = 0
        const successfulMaterialSales: { itemId: string, goldEarned: number }[] = []

        try {
            for (const itemId of selectedItems) {
                const item = sellItems.find(i => i.id === itemId)
                if (!item) continue

                const quantity = sellQuantities[itemId] || 1
                const price = item.price
                const goldForThisItem = quantity * price

                if (item.type === 'material') {
                    const success = await sellMaterial(item.id, quantity)
                    if (success) {
                        totalGoldEarned += goldForThisItem
                        successCount++
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

            const materialGoldEarned = successfulMaterialSales.reduce((sum, sale) => sum + sale.goldEarned, 0)

            if (materialGoldEarned > 0) {
                const alchemyStore = useAlchemyStore.getState()
                const currentGold = alchemyStore.playerMaterials['gold'] || 0
                const newGold = currentGold + materialGoldEarned

                useAlchemyStore.setState({
                    playerMaterials: {
                        ...alchemyStore.playerMaterials,
                        gold: newGold
                    }
                })

                const gameStore = useGameStore.getState()
                gameStore.setResources({
                    ...gameStore.resources,
                    gold: newGold
                })

                if (alchemyStore.userId) {
                    const api = await import('../../lib/alchemyApi')
                    try {
                        await api.addGold(alchemyStore.userId, materialGoldEarned)
                    } catch (error) {
                        console.error('골드 DB 저장 실패:', error)
                    }
                }
            }
            refreshInventory()

            // 판매 결과 모달
            if (successCount > 0) {
                setModalConfig({
                    isOpen: true,
                    type: 'success',
                    title: '판매 완료',
                    message: `총 ${successCount}종류의 아이템을 판매하여 ${formatNumber(totalGoldEarned)}G를 획득했습니다!`
                })
            }

        } catch (error) {
            console.error('일괄 판매 중 오류:', error)
            setModalConfig({
                isOpen: true,
                type: 'error',
                title: '판매 오류',
                message: '판매 처리 중 일부 오류가 발생했습니다.'
            })
        } finally {
            setIsBulkSelling(false)
            setSelectedItems(new Set())
            const resetQuantities = { ...sellQuantities }
            selectedItems.forEach(id => delete resetQuantities[id])
            setSellQuantities(resetQuantities)
        }
    }

    // 선택된 아이템들의 총 예상 판매 금액 계산
    const totalSelectedValue = useMemo(() => {
        return Array.from(selectedItems).reduce((sum, itemId) => {
            const item = sellItems.find(i => i.id === itemId)
            if (!item) return sum
            const quantity = sellQuantities[itemId] || 1
            return sum + (quantity * item.price)
        }, 0)
    }, [selectedItems, sellItems, sellQuantities])

    const handleBack = () => {
        setCanvasView('map')
    }

    if (loading) {
        return (
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#2a2a2a', borderRadius: '8px' }}>
                <p style={{ color: '#aaa' }}>상점 로딩 중...</p>
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
            overflow: 'hidden',
            position: 'relative' // 모달 포지셔닝을 위해
        }}>
            {/* Header Area */}
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

                <div style={{ display: 'flex', gap: '15px', alignItems: 'center', justifyContent: isMobile ? 'space-between' : 'flex-end' }}>
                    {/* 탭 버튼 */}
                    <div style={{ display: 'flex', background: '#222', borderRadius: '8px', padding: '4px' }}>
                        <button
                            onClick={() => setActiveTab('buy')}
                            style={{
                                background: activeTab === 'buy' ? '#eab308' : 'transparent',
                                color: activeTab === 'buy' ? 'black' : '#888',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '8px 16px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >과금 (구매)</button>
                        <button
                            onClick={() => setActiveTab('sell')}
                            style={{
                                background: activeTab === 'sell' ? '#eab308' : 'transparent',
                                color: activeTab === 'sell' ? 'black' : '#888',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '8px 16px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >판매</button>
                    </div>

                    <div style={{
                        fontSize: isMobile ? '1.1em' : '1.2em',
                        fontWeight: 'bold',
                        color: '#facc15'
                    }}>
                        💰 {formatNumber(gold)} G
                    </div>
                </div>
            </div>

            {/* Content Area */}
            {activeTab === 'buy' ? (
                // =============== [구매 탭] ===============
                <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {/* Timer Alert */}
                    <div style={{ padding: '10px', background: '#1c1917', borderRadius: '8px', border: '1px solid #444', textAlign: 'center', color: '#f59e0b' }}>
                        ⏰ 상점 갱신까지: <span style={{ fontWeight: 'bold', fontSize: '1.2em' }}>{timeLeft}</span>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: '12px',
                        overflow: 'auto',
                        paddingBottom: '20px'
                    }}>
                        {buyItems.map(item => {
                            const material = MATERIALS[item.id]
                            const buyQty = buyQuantities[item.id] || 1
                            if (!material) return null

                            return (
                                <div key={item.id} style={{
                                    background: '#333',
                                    borderRadius: '8px',
                                    border: '1px solid #555',
                                    padding: '12px',
                                    display: 'flex',
                                    gap: '12px',
                                    alignItems: 'center'
                                }}>
                                    {/* Icon */}
                                    <div style={{
                                        width: '64px', height: '64px',
                                        background: '#222', borderRadius: '8px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        border: `2px solid ${getRarityColor(material.rarity)}`
                                    }}>
                                        <img src={material.iconUrl} alt={material.name} style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
                                    </div>

                                    {/* Info */}
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 'bold', fontSize: '1.1em', marginBottom: '4px' }}>{material.name}</div>
                                        <div style={{ fontSize: '0.8em', color: '#aaa', marginBottom: '8px' }}>
                                            보유: {materialCounts[item.id] || 0}
                                        </div>
                                        <div style={{ color: '#eab308', fontWeight: 'bold' }}>{item.price} G</div>
                                    </div>

                                    {/* Action */}
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <button
                                                onClick={() => handleQuantityChange(item.id, buyQty - 1, 999, 'buy')}
                                                style={{ width: '24px', height: '24px', background: '#555', border: 'none', color: '#fff', borderRadius: '4px', cursor: 'pointer' }}
                                            >-</button>
                                            <input
                                                type='number'
                                                value={buyQty}
                                                onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1, 999, 'buy')}
                                                style={{ width: '40px', background: '#222', border: '1px solid #444', color: '#fff', textAlign: 'center', borderRadius: '4px' }}
                                            />
                                            <button
                                                onClick={() => handleQuantityChange(item.id, buyQty + 1, 999, 'buy')}
                                                style={{ width: '24px', height: '24px', background: '#555', border: 'none', color: '#fff', borderRadius: '4px', cursor: 'pointer' }}
                                            >+</button>
                                        </div>
                                        <button
                                            onClick={() => handleBuy(item)}
                                            disabled={isBuying || gold < item.price * buyQty}
                                            style={{
                                                background: (!isBuying && gold >= item.price * buyQty) ? '#eab308' : '#555',
                                                color: (!isBuying && gold >= item.price * buyQty) ? '#000' : '#aaa',
                                                border: 'none',
                                                borderRadius: '6px',
                                                padding: '6px 12px',
                                                cursor: (!isBuying && gold >= item.price * buyQty) ? 'pointer' : 'not-allowed',
                                                fontWeight: 'bold',
                                                fontSize: '0.9em'
                                            }}
                                        >
                                            {isBuying ? '구매 중...' : `${item.price * buyQty}G 구매`}
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            ) : (
                // =============== [판매 탭] ===============
                <>
                    {/* Bulk Action Bar - 판매용 */}
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

                    {/* Sell List Container */}
                    {sellItems.length === 0 ? (
                        <p style={{ color: '#aaa', textAlign: 'center', marginTop: '40px' }}>판매할 자원이 없습니다.</p>
                    ) : isMobile ? (
                        /* Mobile: Card Layout (Sell) */
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
                                    checked={sellItems.length > 0 && selectedItems.size === sellItems.length}
                                    onChange={toggleSelectAll}
                                    style={{ cursor: 'pointer', width: '18px', height: '18px', minWidth: '18px' }}
                                />
                                <span style={{ fontWeight: 'bold', fontSize: '0.95em' }}>전체 선택</span>
                            </div>

                            {/* Item Cards */}
                            {sellItems.map(item => {
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
                                                    onClick={() => handleQuantityChange(item.id, sellQuantity - 1, item.count, 'sell')}
                                                    style={{
                                                        width: '32px', height: '32px', minHeight: '32px',
                                                        background: '#444', color: 'white', border: 'none', borderRadius: '4px',
                                                        cursor: 'pointer', fontSize: '1.1em', fontWeight: 'bold', flexShrink: 0
                                                    }}
                                                >-</button>
                                                <input
                                                    type="number"
                                                    value={sellQuantity}
                                                    onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 0, item.count, 'sell')}
                                                    style={{
                                                        flex: 1, minWidth: '0', textAlign: 'center',
                                                        background: '#222', color: 'white', border: '1px solid #555',
                                                        borderRadius: '4px', padding: '6px', fontSize: '0.9em',
                                                        height: '32px', minHeight: '32px'
                                                    }}
                                                />
                                                <button
                                                    onClick={() => handleQuantityChange(item.id, sellQuantity + 1, item.count, 'sell')}
                                                    style={{
                                                        width: '32px', height: '32px', minHeight: '32px',
                                                        background: '#444', color: 'white', border: 'none', borderRadius: '4px',
                                                        cursor: 'pointer', fontSize: '1.1em', fontWeight: 'bold', flexShrink: 0
                                                    }}
                                                >+</button>
                                                <button
                                                    onClick={() => handleQuantityChange(item.id, item.count, item.count, 'sell')}
                                                    style={{
                                                        padding: '0 10px', height: '32px', minHeight: '32px',
                                                        background: '#555', color: 'white', border: 'none', borderRadius: '4px',
                                                        cursor: 'pointer', fontSize: '0.85em', fontWeight: 'bold', flexShrink: 0
                                                    }}
                                                >Max</button>
                                            </div>
                                        </div>

                                        {/* Total Value */}
                                        <div style={{
                                            background: '#222', padding: '6px', borderRadius: '4px',
                                            textAlign: 'center', fontWeight: 'bold', color: '#eab308', fontSize: '0.9em'
                                        }}>
                                            합계: {formatNumber(totalValue)}G
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        /* Desktop: Table Layout (Sell) */
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
                                                checked={sellItems.length > 0 && selectedItems.size === sellItems.length}
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
                                    {sellItems.map(item => {
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
                                                            onClick={() => handleQuantityChange(item.id, sellQuantity - 1, item.count, 'sell')}
                                                            style={{ width: '24px', height: '24px', background: '#444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                        >-</button>
                                                        <input
                                                            type="number"
                                                            value={sellQuantity}
                                                            onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 0, item.count, 'sell')}
                                                            style={{ width: '50px', textAlign: 'center', background: '#222', color: 'white', border: '1px solid #555', borderRadius: '4px', padding: '4px', fontSize: '0.9em' }}
                                                        />
                                                        <button
                                                            onClick={() => handleQuantityChange(item.id, sellQuantity + 1, item.count, 'sell')}
                                                            style={{ width: '24px', height: '24px', background: '#444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                        >+</button>
                                                        <button
                                                            onClick={() => handleQuantityChange(item.id, item.count, item.count, 'sell')}
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
                </>
            )}

            {/* Custom Modal for Alerts */}
            {modalConfig.isOpen && (
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px',
                    backdropFilter: 'blur(3px)'
                }} onClick={closeModal}>
                    <div style={{
                        background: '#2a2a2a',
                        border: `2px solid ${modalConfig.type === 'success' ? '#10b981' : '#ef4444'}`,
                        borderRadius: '16px',
                        padding: '30px',
                        width: '100%',
                        maxWidth: '360px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '16px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                        animation: 'popIn 0.2s ease-out'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{
                            width: '60px', height: '60px',
                            borderRadius: '50%',
                            background: modalConfig.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '30px',
                            color: modalConfig.type === 'success' ? '#10b981' : '#ef4444'
                        }}>
                            {modalConfig.type === 'success' ? '✓' : '!'}
                        </div>

                        <div style={{ textAlign: 'center' }}>
                            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2em', color: '#fff' }}>{modalConfig.title}</h3>
                            <p style={{ margin: 0, color: '#aaa', fontSize: '0.95em', lineHeight: '1.5' }}>
                                {modalConfig.message}
                            </p>
                        </div>

                        <button
                            onClick={closeModal}
                            style={{
                                background: modalConfig.type === 'success' ? '#10b981' : '#ef4444',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '12px 0',
                                width: '100%',
                                fontSize: '1em',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                marginTop: '10px'
                            }}
                        >
                            확인
                        </button>
                    </div>
                </div>
            )}
            <style>{`
                @keyframes popIn {
                    from { transform: scale(0.9); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    )
}

function getRarityColor(rarity: string): string {
    switch (rarity) {
        case 'COMMON': case 'N': return '#9ca3af'
        case 'UNCOMMON': return '#10b981'
        case 'RARE': case 'R': return '#3b82f6'
        case 'EPIC': case 'SR': return '#a855f7'
        case 'LEGENDARY': case 'SSR': return '#f59e0b'
        default: return '#6b7280'
    }
}
