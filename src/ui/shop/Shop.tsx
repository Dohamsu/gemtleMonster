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
    return num.toLocaleString()
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

// 희귀도별 색상 반환
function getRarityColor(rarity: string): string {
    switch (rarity) {
        case 'COMMON': case 'N': return '#9ca3af'
        case 'UNCOMMON': return '#22c55e'
        case 'RARE': case 'R': return '#3b82f6'
        case 'EPIC': case 'SR': return '#a855f7'
        case 'LEGENDARY': case 'SSR': return '#e7b308'
        default: return '#6b7280'
    }
}

// 희귀도별 라벨 (한글)
function getRarityLabel(rarity: string): string {
    switch (rarity) {
        case 'COMMON': case 'N': return '일반'
        case 'UNCOMMON': return '고급'
        case 'RARE': case 'R': return '희귀'
        case 'EPIC': case 'SR': return '영웅'
        case 'LEGENDARY': case 'SSR': return '전설'
        default: return '재료'
    }
}

// Shop 전용 스타일 컴포넌트
const shopStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
    
    .shop-container {
        font-family: 'Space Grotesk', sans-serif;
        background: #1c1917;
        color: #f3f4f6;
        min-height: 100%;
        display: flex;
        flex-direction: column;
        overflow-x: hidden;
    }
    
    .shop-container * {
        box-sizing: border-box;
    }
    
    .shop-container::-webkit-scrollbar {
        width: 8px;
    }
    .shop-container::-webkit-scrollbar-track {
        background: #1c1917;
    }
    .shop-container::-webkit-scrollbar-thumb {
        background: #444;
        border-radius: 4px;
    }
    .shop-container::-webkit-scrollbar-thumb:hover {
        background: #e7b308;
    }
    
    .pixelated {
        image-rendering: pixelated;
    }
    
    .shop-header {
        position: sticky;
        top: 0;
        z-index: 50;
        background: rgba(28, 25, 23, 0.95);
        backdrop-filter: blur(12px);
        border-bottom: 1px solid #494022;
    }
    
    .shop-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        background: #2a2a2a;
        border: 1px solid #444444;
        border-radius: 8px;
        color: #d1d5db;
        cursor: pointer;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        font-size: 14px;
        transition: all 0.2s;
    }
    .shop-btn:hover {
        border-color: #e7b308;
        color: #e7b308;
    }
    
    .shop-title {
        font-size: 1.5rem;
        font-weight: 700;
        color: #f0d090;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        text-shadow: 0 1px 2px rgba(0,0,0,0.5);
    }
    
    .currency-display {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px 20px;
        background: #2a2a2a;
        border: 1px solid rgba(231, 179, 8, 0.3);
        border-radius: 9999px;
        box-shadow: 0 0 15px rgba(231, 179, 8, 0.15);
    }
    
    .tab-container {
        display: flex;
        width: 100%;
        max-width: 400px;
        background: #171717;
        border-radius: 8px;
        padding: 4px;
        border: 1px solid #444444;
    }
    
    .tab-btn {
        flex: 1;
        padding: 8px 16px;
        border-radius: 6px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        transition: all 0.2s;
        border: none;
        cursor: pointer;
    }
    .tab-btn.active {
        background: #e7b308;
        color: #171717;
        box-shadow: 0 4px 12px rgba(231, 179, 8, 0.3);
    }
    .tab-btn.inactive {
        background: transparent;
        color: #6b7280;
    }
    .tab-btn.inactive:hover {
        color: #d1d5db;
        background: rgba(255,255,255,0.05);
    }
    
    .timer-box {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: #2a2a2a;
        border: 1px solid rgba(231, 179, 8, 0.2);
        border-radius: 8px;
        width: 64px;
        height: 56px;
        box-shadow: inset 0 2px 4px rgba(0,0,0,0.3);
    }
    
    .filter-chip {
        white-space: nowrap;
        padding: 8px 16px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        transition: all 0.2s;
        border: 1px solid #444444;
        background: #2a2a2a;
        color: #9ca3af;
        cursor: pointer;
    }
    .filter-chip:hover {
        border-color: #9ca3af;
        color: #e5e7eb;
    }
    .filter-chip.active {
        background: rgba(231, 179, 8, 0.2);
        border-color: #e7b308;
        color: #e7b308;
        font-weight: 700;
    }
    
    .item-card {
        position: relative;
        background: rgba(42, 42, 42, 0.8);
        backdrop-filter: blur(4px);
        border: 1px solid #444444;
        border-radius: 12px;
        padding: 16px;
        transition: all 0.3s;
    }
    .item-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 0 20px rgba(231, 179, 8, 0.1);
    }
    
    .item-icon-box {
        position: relative;
        width: 80px;
        height: 80px;
        flex-shrink: 0;
        background: rgba(0,0,0,0.4);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
    }
    
    .qty-input-container {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: #171717;
        border-radius: 8px;
        border: 1px solid #444444;
        height: 40px;
        padding: 0 4px;
    }
    
    .qty-btn {
        width: 32px;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #9ca3af;
        background: transparent;
        border: none;
        cursor: pointer;
        transition: color 0.2s;
        font-size: 14px;
    }
    .qty-btn:hover {
        color: white;
    }
    
    .qty-input {
        width: 100%;
        background: transparent;
        text-align: center;
        color: white;
        font-weight: 700;
        border: none;
        outline: none;
        font-size: 14px;
        -moz-appearance: textfield;
    }
    .qty-input::-webkit-outer-spin-button,
    .qty-input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }
    
    .purchase-btn {
        width: 100%;
        height: 40px;
        background: #e7b308;
        color: #171717;
        font-weight: 700;
        font-size: 14px;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        border-radius: 8px;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        box-shadow: 0 4px 12px rgba(231, 179, 8, 0.3);
        transition: all 0.2s;
    }
    .purchase-btn:hover {
        background: #facc15;
    }
    .purchase-btn:active {
        transform: translateY(1px);
    }
    .purchase-btn:disabled {
        background: #2a2a2a;
        border: 1px solid #444444;
        color: #6b7280;
        cursor: not-allowed;
        box-shadow: none;
    }
    
    .sold-out-overlay {
        position: absolute;
        inset: 0;
        background: rgba(23, 23, 23, 0.6);
        z-index: 20;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.2s;
        pointer-events: none;
    }
    .item-card:hover .sold-out-overlay {
        opacity: 1;
    }
    
    .sold-out-badge {
        background: rgba(127, 29, 29, 0.8);
        color: white;
        padding: 8px 16px;
        border-radius: 4px;
        font-weight: 700;
        text-transform: uppercase;
        border: 1px solid #dc2626;
        transform: rotate(-10deg);
    }
    
    .no-gold-btn {
        width: 100%;
        height: 40px;
        background: #171717;
        border: 1px solid rgba(127, 29, 29, 0.5);
        color: rgba(248, 113, 113, 0.7);
        font-weight: 700;
        font-size: 14px;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        border-radius: 8px;
        cursor: not-allowed;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
    }
    
    /* Sell tab styles */
    .sell-action-bar {
        background: #2a2a2a;
        padding: 16px;
        border-radius: 12px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border: 1px solid #444444;
        gap: 16px;
        flex-wrap: wrap;
    }
    
    .sell-btn {
        padding: 12px 24px;
        background: #e7b308;
        color: #171717;
        font-weight: 700;
        text-transform: uppercase;
        border-radius: 8px;
        border: none;
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: 0 4px 12px rgba(231, 179, 8, 0.3);
    }
    .sell-btn:hover {
        background: #facc15;
    }
    .sell-btn:disabled {
        background: #444444;
        color: #9ca3af;
        cursor: not-allowed;
        box-shadow: none;
    }
    
    /* Modal styles */
    .modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.85);
        backdrop-filter: blur(4px);
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
    }
    
    .modal-content {
        background: #1c1917;
        border-radius: 16px;
        padding: 32px;
        width: 100%;
        max-width: 360px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;
        box-shadow: 0 25px 50px rgba(0,0,0,0.5);
        animation: modalPop 0.2s ease-out;
    }
    
    @keyframes modalPop {
        from { transform: scale(0.9); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
    }
    
    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
    }
`

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
    const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy')
    const [hours, setHours] = useState('00')
    const [minutes, setMinutes] = useState('00')
    const [seconds, setSeconds] = useState('00')
    const [isMobile, setIsMobile] = useState(isMobileView())

    // 반응형 감지
    useEffect(() => {
        const handleResize = () => setIsMobile(isMobileView())
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

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
                const h = Math.floor(diff / 3600000)
                const m = Math.floor((diff % 3600000) / 60000)
                const s = Math.floor((diff % 60000) / 1000)
                setHours(h.toString().padStart(2, '0'))
                setMinutes(m.toString().padStart(2, '0'))
                setSeconds(s.toString().padStart(2, '0'))
            } else {
                setHours('00')
                setMinutes('00')
                setSeconds('00')
            }
        }, 1000)

        return () => clearInterval(timer)
    }, [refreshInventory, nextRefreshTime, checkRefresh])

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
            <div className="shop-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
                <style>{shopStyles}</style>
                <p style={{ color: '#9ca3af' }}>상점 로딩 중...</p>
            </div>
        )
    }

    return (
        <div className="shop-container">
            <style>{shopStyles}</style>

            {/* Header */}
            <header className="shop-header">
                <div style={{ maxWidth: '1440px', margin: '0 auto', padding: isMobile ? '12px 16px' : '16px 24px' }}>
                    {/* Top Row: Exit, Title, Gold */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: isMobile ? '8px' : '16px', marginBottom: isMobile ? '12px' : '24px', position: 'relative' }}>
                        {/* Exit Button */}
                        <button
                            className="shop-btn"
                            onClick={handleBack}
                            style={isMobile ? { padding: '8px', width: '40px', height: '40px', justifyContent: 'center' } : {}}
                        >
                            <span style={{ fontSize: isMobile ? '20px' : '14px' }}>←</span>
                            {!isMobile && <span>Leave</span>}
                        </button>

                        {/* Shop Title */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: isMobile ? 'absolute' : 'relative', left: isMobile ? '50%' : 'auto', transform: isMobile ? 'translateX(-50%)' : 'none' }}>
                            <h1 className="shop-title" style={{ fontSize: isMobile ? '1.25rem' : '1.5rem' }}>{isMobile ? '상점' : 'Imperial Outpost'}</h1>
                            <div style={{ height: '2px', width: isMobile ? '64px' : '96px', background: 'linear-gradient(to right, transparent, #e7b308, transparent)', marginTop: '4px' }} />
                        </div>

                        {/* Currency Display */}
                        <div className="currency-display" style={isMobile ? { padding: '8px 12px', gap: '8px', borderRadius: '8px' } : {}}>
                            <img src="/assets/ui/gold_coin.png" alt="Gold" style={{ width: isMobile ? '20px' : '24px', height: isMobile ? '20px' : '24px' }} />
                            <span style={{ color: '#facc15', fontWeight: 700, fontSize: isMobile ? '0.875rem' : '1.1rem', letterSpacing: '0.05em' }}>{formatNumber(gold)}</span>
                        </div>
                    </div>

                    {/* Tabs: Buy / Sell */}
                    <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                        <div className="tab-container" style={{ maxWidth: isMobile ? '100%' : '400px' }}>
                            <button
                                className={`tab-btn ${activeTab === 'buy' ? 'active' : 'inactive'}`}
                                onClick={() => setActiveTab('buy')}
                                style={{ fontSize: isMobile ? '14px' : '14px' }}
                            >
                                {isMobile ? '구매' : 'Buy Items'}
                            </button>
                            <button
                                className={`tab-btn ${activeTab === 'sell' ? 'active' : 'inactive'}`}
                                onClick={() => setActiveTab('sell')}
                                style={{ fontSize: isMobile ? '14px' : '14px' }}
                            >
                                {isMobile ? '판매' : 'Sell Loot'}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '1440px', margin: '0 auto', padding: isMobile ? '16px' : '32px 24px' }}>

                {activeTab === 'buy' ? (
                    <>
                        {/* Timer Section - Mobile: compact inline, Desktop: boxes */}
                        {isMobile ? (
                            <div style={{ width: '100%', background: '#1c1917', border: '1px solid rgba(234, 179, 8, 0.2)', borderRadius: '12px', padding: '12px', marginBottom: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                <p style={{ color: '#9ca3af', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>상점 갱신까지</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '1.5rem', fontWeight: 700, color: '#facc15', fontFamily: "'Space Grotesk', sans-serif" }}>
                                    <span>{hours}</span>
                                    <span style={{ color: '#6b7280', fontSize: '0.875rem', fontWeight: 400, padding: '0 4px' }}>:</span>
                                    <span>{minutes}</span>
                                    <span style={{ color: '#6b7280', fontSize: '0.875rem', fontWeight: 400, padding: '0 4px' }}>:</span>
                                    <span style={{ color: '#e7b308', animation: 'pulse 2s infinite' }}>{seconds}</span>
                                </div>
                            </div>
                        ) : (
                            <div style={{ width: '100%', display: 'flex', flexDirection: 'row', gap: '24px', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px', borderBottom: '1px solid rgba(68, 68, 68, 0.5)', paddingBottom: '32px', flexWrap: 'wrap' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <p style={{ color: '#9ca3af', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: '4px', margin: 0 }}>Shop Refreshes In</p>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <div className="timer-box">
                                            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white' }}>{hours}</span>
                                            <span style={{ fontSize: '10px', color: '#6b7280', textTransform: 'uppercase' }}>Hrs</span>
                                        </div>
                                        <div style={{ color: '#4b5563' }}>:</div>
                                        <div className="timer-box">
                                            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white' }}>{minutes}</span>
                                            <span style={{ fontSize: '10px', color: '#6b7280', textTransform: 'uppercase' }}>Min</span>
                                        </div>
                                        <div style={{ color: '#4b5563' }}>:</div>
                                        <div className="timer-box">
                                            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#e7b308', animation: 'pulse 2s infinite' }}>{seconds}</span>
                                            <span style={{ fontSize: '10px', color: '#6b7280', textTransform: 'uppercase' }}>Sec</span>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', overflow: 'auto', paddingBottom: '0' }}>
                                    <button className="filter-chip active">All Items</button>
                                    <button className="filter-chip">Consumables</button>
                                    <button className="filter-chip">Equipment</button>
                                    <button className="filter-chip">Materials</button>
                                </div>
                            </div>
                        )}

                        {/* Filter Chips - Mobile: horizontal scroll */}
                        {isMobile && (
                            <div style={{ display: 'flex', gap: '8px', overflow: 'auto', paddingBottom: '8px', marginBottom: '16px', width: 'calc(100% + 32px)', marginLeft: '-16px', paddingLeft: '16px', paddingRight: '16px' }}>
                                <button className="filter-chip active" style={{ padding: '6px 12px', borderRadius: '9999px', fontSize: '12px' }}>전체</button>
                                <button className="filter-chip" style={{ padding: '6px 12px', borderRadius: '9999px', fontSize: '12px' }}>소비용품</button>
                                <button className="filter-chip" style={{ padding: '6px 12px', borderRadius: '9999px', fontSize: '12px' }}>장비</button>
                                <button className="filter-chip" style={{ padding: '6px 12px', borderRadius: '9999px', fontSize: '12px' }}>재료</button>
                            </div>
                        )}

                        {/* Item Grid */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))',
                            gap: isMobile ? '16px' : '20px',
                            width: '100%'
                        }}>
                            {buyItems.map(item => {
                                const material = MATERIALS[item.id]
                                const buyQty = buyQuantities[item.id] || 1
                                if (!material) return null

                                const totalPrice = item.price * buyQty
                                const canAfford = gold >= totalPrice
                                const isUnlimited = item.quantity === -1
                                const isOutOfStock = !isUnlimited && item.quantity <= 0
                                const rarityColor = getRarityColor(material.rarity)

                                return (
                                    <div
                                        key={item.id}
                                        className="item-card"
                                        style={{
                                            opacity: isOutOfStock ? 0.75 : 1,
                                            borderColor: isOutOfStock ? '#444444' : rarityColor + '50'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isOutOfStock) {
                                                e.currentTarget.style.borderColor = rarityColor
                                                e.currentTarget.style.boxShadow = `0 0 20px ${rarityColor}25`
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.borderColor = isOutOfStock ? '#444444' : rarityColor + '50'
                                            e.currentTarget.style.boxShadow = 'none'
                                        }}
                                    >
                                        {/* Sold Out Overlay */}
                                        {isOutOfStock && (
                                            <div className="sold-out-overlay">
                                                <span className="sold-out-badge">{isMobile ? '매진' : 'Sold Out'}</span>
                                            </div>
                                        )}

                                        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', opacity: isOutOfStock ? 0.5 : 1, filter: isOutOfStock ? 'grayscale(1)' : 'none' }}>
                                            {/* Icon */}
                                            <div className="item-icon-box" style={{ borderWidth: '2px', borderStyle: 'solid', borderColor: rarityColor, boxShadow: `0 0 10px ${rarityColor}33` }}>
                                                <div style={{ position: 'absolute', inset: 0, background: `${rarityColor}15` }} />
                                                <img
                                                    src={material.iconUrl}
                                                    alt={material.name}
                                                    className="pixelated"
                                                    style={{ width: '56px', height: '56px', objectFit: 'contain', zIndex: 10 }}
                                                />
                                            </div>

                                            {/* Info */}
                                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '4px 0' }}>
                                                <div>
                                                    <h3 style={{ color: 'white', fontWeight: 700, fontSize: '1.1rem', lineHeight: 1.2, margin: 0 }}>{material.name}</h3>
                                                    <span style={{ fontSize: '12px', color: rarityColor, textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>{getRarityLabel(material.rarity)}</span>
                                                </div>
                                                <div style={{ fontSize: '12px', color: isOutOfStock ? '#f87171' : '#9ca3af', background: isOutOfStock ? 'rgba(127, 29, 29, 0.2)' : 'rgba(0,0,0,0.3)', padding: '4px 8px', borderRadius: '4px', alignSelf: 'flex-start', border: isOutOfStock ? '1px solid rgba(127, 29, 29, 0.5)' : 'none' }}>
                                                    {isMobile ? '보유' : 'In Stock'}: <span style={{ color: isOutOfStock ? '#f87171' : 'white', fontFamily: 'monospace' }}>{isUnlimited ? '∞' : item.quantity}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Price Row */}
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', padding: '0 4px', opacity: isOutOfStock ? 0.5 : 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#facc15' }}>
                                                <span style={{ fontSize: '18px' }}>●</span>
                                                <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{formatNumber(item.price)}</span>
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#6b7280' }}>Per unit</div>
                                        </div>

                                        {/* Quantity & Buy Controls */}
                                        <div style={{ display: 'flex', flexDirection: isMobile ? 'row' : 'column', gap: isMobile ? '8px' : '12px', height: isMobile ? '40px' : 'auto' }}>
                                            {/* Quantity Input */}
                                            <div className="qty-input-container" style={{ opacity: isOutOfStock ? 0.5 : 1, pointerEvents: isOutOfStock ? 'none' : 'auto', width: isMobile ? '33%' : '100%', minWidth: isMobile ? '100px' : 'auto' }}>
                                                <button
                                                    className="qty-btn"
                                                    onClick={() => handleQuantityChange(item.id, buyQty - 1, isUnlimited ? 999 : item.quantity, 'buy')}
                                                >−</button>
                                                <input
                                                    type="number"
                                                    className="qty-input"
                                                    value={buyQty}
                                                    onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1, isUnlimited ? 999 : item.quantity, 'buy')}
                                                    min={1}
                                                    max={isUnlimited ? undefined : item.quantity}
                                                />
                                                <button
                                                    className="qty-btn"
                                                    onClick={() => handleQuantityChange(item.id, buyQty + 1, isUnlimited ? 999 : item.quantity, 'buy')}
                                                >+</button>
                                            </div>

                                            {/* Buy Button */}
                                            {isOutOfStock ? (
                                                <button className="purchase-btn" disabled style={isMobile ? { flex: 1 } : {}}>
                                                    <span>{isMobile ? '구매 불가' : 'Out of Stock'}</span>
                                                </button>
                                            ) : !canAfford ? (
                                                <button className="no-gold-btn" disabled style={isMobile ? { flex: 1 } : {}}>
                                                    <span>{isMobile ? '골드 부족' : 'Not Enough Gold'}</span>
                                                </button>
                                            ) : (
                                                <button
                                                    className="purchase-btn"
                                                    onClick={() => handleBuy(item)}
                                                    disabled={isBuying}
                                                    style={isMobile ? { flex: 1 } : {}}
                                                >
                                                    <span>{isBuying ? (isMobile ? '처리 중...' : 'Processing...') : (isMobile ? '구매' : 'Purchase')}</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </>
                ) : (
                    // =============== [판매 탭] ===============
                    <>
                        {isMobile ? (
                            // ======= 모바일: 카드 레이아웃 =======
                            <>
                                {/* Bulk Action Bar */}
                                <div className="sell-action-bar" style={{ width: '100%', marginBottom: '24px' }}>
                                    <div style={{ color: '#e5e7eb', fontWeight: 700 }}>
                                        선택된 아이템: <span style={{ color: 'white' }}>{selectedItems.size}</span>개
                                        <span style={{ margin: '0 12px', color: '#4b5563' }}>|</span>
                                        총 예상 금액: <span style={{ color: '#e7b308' }}>{formatNumber(totalSelectedValue)}G</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#9ca3af' }}>
                                            <input
                                                type="checkbox"
                                                checked={sellItems.length > 0 && selectedItems.size === sellItems.length}
                                                onChange={toggleSelectAll}
                                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                            />
                                            <span style={{ fontSize: '14px' }}>전체 선택</span>
                                        </label>
                                        <button
                                            className="sell-btn"
                                            onClick={handleBulkSell}
                                            disabled={selectedItems.size === 0 || isBulkSelling}
                                        >
                                            {isBulkSelling ? '판매 중...' : '선택 항목 판매'}
                                        </button>
                                    </div>
                                </div>

                                {/* Sell Items Grid */}
                                {sellItems.length === 0 ? (
                                    <p style={{ color: '#9ca3af', textAlign: 'center', marginTop: '40px' }}>판매할 자원이 없습니다.</p>
                                ) : (
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                                        gap: '20px',
                                        width: '100%'
                                    }}>
                                        {sellItems.map(item => {
                                            const sellQuantity = sellQuantities[item.id] || 1
                                            const totalValue = sellQuantity * item.price
                                            const isSelected = selectedItems.has(item.id)
                                            const material = MATERIALS[item.id]
                                            const rarityColor = item.rarity ? getRarityColor(item.rarity) : '#6b7280'

                                            return (
                                                <div
                                                    key={item.id}
                                                    className="item-card"
                                                    style={{
                                                        borderColor: isSelected ? '#e7b308' : '#444444',
                                                        background: isSelected ? 'rgba(58, 53, 32, 0.8)' : 'rgba(42, 42, 42, 0.8)',
                                                        cursor: 'pointer'
                                                    }}
                                                    onClick={() => toggleSelection(item.id)}
                                                >
                                                    <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                                                        {/* Checkbox */}
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => toggleSelection(item.id)}
                                                            onClick={(e) => e.stopPropagation()}
                                                            style={{ width: '20px', height: '20px', cursor: 'pointer', alignSelf: 'center' }}
                                                        />

                                                        {/* Icon */}
                                                        <div className="item-icon-box" style={{ borderWidth: '2px', borderStyle: 'solid', borderColor: rarityColor }}>
                                                            {material ? (
                                                                <img
                                                                    src={material.iconUrl}
                                                                    alt={item.name}
                                                                    className="pixelated"
                                                                    style={{ width: '56px', height: '56px', objectFit: 'contain', zIndex: 10 }}
                                                                />
                                                            ) : (
                                                                <span style={{ fontSize: '32px' }}>📦</span>
                                                            )}
                                                        </div>

                                                        {/* Info */}
                                                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '4px 0', flex: 1 }}>
                                                            <div>
                                                                <h3 style={{ color: 'white', fontWeight: 700, fontSize: '1.1rem', lineHeight: 1.2, margin: 0 }}>{item.name}</h3>
                                                                {item.rarity && (
                                                                    <span style={{ fontSize: '12px', color: rarityColor, textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>{getRarityLabel(item.rarity)}</span>
                                                                )}
                                                            </div>
                                                            <div style={{ fontSize: '12px', color: '#9ca3af', background: 'rgba(0,0,0,0.3)', padding: '4px 8px', borderRadius: '4px', alignSelf: 'flex-start' }}>
                                                                보유: <span style={{ color: 'white', fontFamily: 'monospace' }}>{formatNumber(item.count)}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Price Row */}
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', padding: '0 4px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#facc15' }}>
                                                            <span style={{ fontSize: '18px' }}>●</span>
                                                            <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{item.price}</span>
                                                        </div>
                                                        <div style={{ fontSize: '12px', color: '#6b7280' }}>Per unit</div>
                                                    </div>

                                                    {/* Quantity Controls */}
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} onClick={(e) => e.stopPropagation()}>
                                                        <div className="qty-input-container">
                                                            <button
                                                                className="qty-btn"
                                                                onClick={() => handleQuantityChange(item.id, sellQuantity - 1, item.count, 'sell')}
                                                            >−</button>
                                                            <input
                                                                type="number"
                                                                className="qty-input"
                                                                value={sellQuantity}
                                                                onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1, item.count, 'sell')}
                                                                min={1}
                                                                max={item.count}
                                                            />
                                                            <button
                                                                className="qty-btn"
                                                                onClick={() => handleQuantityChange(item.id, sellQuantity + 1, item.count, 'sell')}
                                                            >+</button>
                                                            <button
                                                                className="qty-btn"
                                                                style={{ padding: '0 12px', fontSize: '12px', fontWeight: 700 }}
                                                                onClick={() => handleQuantityChange(item.id, item.count, item.count, 'sell')}
                                                            >Max</button>
                                                        </div>

                                                        {/* Total Value */}
                                                        <div style={{ background: '#171717', padding: '10px', borderRadius: '8px', textAlign: 'center', fontWeight: 700, color: '#e7b308', border: '1px solid #444444' }}>
                                                            합계: {formatNumber(totalValue)}G
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </>
                        ) : (
                            // ======= 데스크톱: 테이블 레이아웃 =======
                            <>
                                {/* Action Panel */}
                                <div style={{ width: '100%', background: 'rgba(42, 42, 42, 0.5)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ background: 'rgba(234, 179, 8, 0.2)', padding: '8px', borderRadius: '8px', color: '#eab308' }}>
                                            <span style={{ fontSize: '24px' }}>🛒</span>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ color: 'white', fontWeight: 700, fontSize: '1.1rem' }}>{selectedItems.size} Items Selected</span>
                                            <span style={{ color: '#9ca3af', fontSize: '14px' }}>Total Estimate: <span style={{ color: '#facc15', fontWeight: 600 }}>{formatNumber(totalSelectedValue)} G</span></span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#9ca3af' }}>
                                            <input
                                                type="checkbox"
                                                checked={sellItems.length > 0 && selectedItems.size === sellItems.length}
                                                onChange={toggleSelectAll}
                                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                            />
                                            <span style={{ fontSize: '14px' }}>Select All</span>
                                        </label>
                                        <button
                                            onClick={handleBulkSell}
                                            disabled={selectedItems.size === 0 || isBulkSelling}
                                            style={{
                                                background: selectedItems.size === 0 ? '#444444' : '#eab308',
                                                color: selectedItems.size === 0 ? '#9ca3af' : '#1a1a1a',
                                                fontWeight: 700,
                                                padding: '10px 24px',
                                                borderRadius: '8px',
                                                border: 'none',
                                                cursor: selectedItems.size === 0 ? 'not-allowed' : 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                boxShadow: selectedItems.size > 0 ? '0 0 15px rgba(234,179,8,0.3)' : 'none',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <span>{isBulkSelling ? 'Processing...' : 'Sell Selected Items'}</span>
                                            <span>→</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Inventory Table */}
                                {sellItems.length === 0 ? (
                                    <p style={{ color: '#9ca3af', textAlign: 'center', marginTop: '40px' }}>No items to sell.</p>
                                ) : (
                                    <div style={{ width: '100%', background: '#2a2a2a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', position: 'relative' }}>
                                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(255,255,255,0.05), transparent)', pointerEvents: 'none' }} />
                                        <div style={{ overflowX: 'auto', position: 'relative', zIndex: 10 }}>
                                            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                                                <thead>
                                                    <tr style={{ background: 'rgba(0,0,0,0.4)', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                                                        <th style={{ padding: '16px', width: '48px', textAlign: 'center' }}></th>
                                                        <th style={{ padding: '16px', width: '64px' }}></th>
                                                        <th style={{ padding: '16px', minWidth: '200px' }}>Item Info</th>
                                                        <th style={{ padding: '16px', textAlign: 'center' }}>Owned</th>
                                                        <th style={{ padding: '16px', textAlign: 'center', minWidth: '140px' }}>Sell Qty</th>
                                                        <th style={{ padding: '16px', textAlign: 'right' }}>Unit Price</th>
                                                        <th style={{ padding: '16px', textAlign: 'right' }}>Total</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {sellItems.map(item => {
                                                        const sellQuantity = sellQuantities[item.id] || 1
                                                        const totalValue = sellQuantity * item.price
                                                        const isSelected = selectedItems.has(item.id)
                                                        const material = MATERIALS[item.id]
                                                        const rarityColor = item.rarity ? getRarityColor(item.rarity) : '#6b7280'

                                                        return (
                                                            <tr
                                                                key={item.id}
                                                                style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', background: isSelected ? 'rgba(58, 53, 32, 0.5)' : 'transparent', transition: 'background 0.2s', cursor: 'pointer' }}
                                                                onClick={() => toggleSelection(item.id)}
                                                                onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = '#333333' }}
                                                                onMouseLeave={(e) => { e.currentTarget.style.background = isSelected ? 'rgba(58, 53, 32, 0.5)' : 'transparent' }}
                                                            >
                                                                <td style={{ padding: '16px', textAlign: 'center' }}>
                                                                    <input type="checkbox" checked={isSelected} onChange={() => toggleSelection(item.id)} onClick={(e) => e.stopPropagation()} style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
                                                                </td>
                                                                <td style={{ padding: '16px' }}>
                                                                    <div style={{ width: '48px', height: '48px', background: 'rgba(0,0,0,0.5)', borderRadius: '8px', border: `1px solid ${rarityColor}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                                                        {material ? <img src={material.iconUrl} alt={item.name} className="pixelated" style={{ width: '32px', height: '32px', objectFit: 'contain' }} /> : <span style={{ fontSize: '20px' }}>📦</span>}
                                                                    </div>
                                                                </td>
                                                                <td style={{ padding: '16px' }}>
                                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                                        <span style={{ color: 'white', fontWeight: 700, fontSize: '1rem' }}>{item.name}</span>
                                                                        <span style={{ fontSize: '11px', color: rarityColor, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                                            {item.type === 'material' ? 'Material' : 'Resource'} • {item.rarity ? getRarityLabel(item.rarity) : '일반'}
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                                <td style={{ padding: '16px', textAlign: 'center', color: '#cbd5e1', fontWeight: 500 }}>{item.count}</td>
                                                                <td style={{ padding: '16px' }} onClick={(e) => e.stopPropagation()}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#333333', border: '1px solid #444444', borderRadius: '8px', padding: '4px', width: 'fit-content', margin: '0 auto' }}>
                                                                        <button onClick={() => handleQuantityChange(item.id, sellQuantity - 1, item.count, 'sell')} style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', borderRadius: '4px' }}>−</button>
                                                                        <input type="number" value={sellQuantity} onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1, item.count, 'sell')} min={1} max={item.count} style={{ width: '48px', background: 'transparent', border: 'none', textAlign: 'center', color: 'white', fontWeight: 700, fontSize: '14px', outline: 'none' }} />
                                                                        <button onClick={() => handleQuantityChange(item.id, sellQuantity + 1, item.count, 'sell')} style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', borderRadius: '4px' }}>+</button>
                                                                    </div>
                                                                </td>
                                                                <td style={{ padding: '16px', textAlign: 'right', color: '#facc15', fontWeight: 500 }}>{item.price} G</td>
                                                                <td style={{ padding: '16px', textAlign: 'right', color: isSelected ? '#eab308' : '#64748b', fontWeight: 700, fontSize: '1.1rem' }}>{formatNumber(totalValue)} G</td>
                                                            </tr>
                                                        )
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}
            </main>

            {/* Footer */}
            <footer style={{ width: '100%', padding: '24px', textAlign: 'center', color: '#4b5563', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', borderTop: '1px solid rgba(68, 68, 68, 0.3)' }}>
                Imperial Market System v2.0 • Establish 4E 201
            </footer>

            {/* Custom Modal for Alerts */}
            {modalConfig.isOpen && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" style={{ border: `2px solid ${modalConfig.type === 'success' ? '#10b981' : '#ef4444'}` }} onClick={e => e.stopPropagation()}>
                        <div style={{
                            width: '60px', height: '60px',
                            borderRadius: '50%',
                            background: modalConfig.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '30px',
                            color: modalConfig.type === 'success' ? '#10b981' : '#ef4444'
                        }}>
                            {modalConfig.type === 'success' ? '✓' : '!'}
                        </div>

                        <div style={{ textAlign: 'center' }}>
                            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2em', color: '#fff' }}>{modalConfig.title}</h3>
                            <p style={{ margin: 0, color: '#9ca3af', fontSize: '0.95em', lineHeight: '1.5' }}>
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
                                padding: '14px 0',
                                width: '100%',
                                fontSize: '1em',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                transition: 'opacity 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                        >
                            확인
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
