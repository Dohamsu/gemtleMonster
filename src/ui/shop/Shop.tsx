/* eslint-disable no-console */
import { useEffect, useMemo, useState } from 'react'
import { useGameStore } from '../../store/useGameStore'
import { useAlchemyStore } from '../../store/useAlchemyStore'
import { useShopStore, type ShopSaleItem, BASE_SELL_PRICES } from '../../store/useShopStore'
import { addGold } from '../../lib/alchemyApi'
import { useUnifiedInventory } from '../../hooks/useUnifiedInventory'
import { ShopHeader } from './component/ShopHeader'
import { ShopTimer } from './component/ShopTimer'
import { ShopBuyTab } from './component/ShopBuyTab'
import { ShopSellTab } from './component/ShopSellTab'
import { ShopModal } from './component/ShopModal'
import { shopStyles } from './Shop.styles'
import type { ModalConfig, ShopItem } from './types'
import { MATERIALS } from '../../data/alchemyData'

// Shop Item Base Data (구매 가능 아이템 목록 정의) - 기존 로직 유지
const SHOP_ITEMS = [
    { id: 'potion_hp_small', name: '하급 회복 물약', price: 50, count: -1 },
    { id: 'potion_hp_medium', name: '중급 회복 물약', price: 150, count: -1 },
    { id: 'potion_mp_small', name: '하급 마나 물약', price: 50, count: -1 },
    { id: 'scroll_return', name: '귀환 주문서', price: 100, count: -1 },
    { id: 'material_iron_ore', name: '철광석', price: 200, count: 10 },
    { id: 'material_herb', name: '약초', price: 150, count: 20 },
    { id: 'material_magic_dust', name: '마법 가루', price: 300, count: 5 }
]

export default function Shop({ onClose }: { onClose?: () => void }) {
    // Stores
    const { resources, setResources, setCanvasView } = useGameStore()
    // useUnifiedInventory for reading material counts (Single Source of Truth)
    const { materialCounts } = useUnifiedInventory()
    // useAlchemyStore for actions
    const { addMaterial, consumeMaterials, userId } = useAlchemyStore()
    const { shopItems, nextRefreshTime, buyItem, checkRefresh } = useShopStore()

    const gold = resources['gold'] || 0

    // State
    const [timerComponents, setTimerComponents] = useState({ hours: '00', minutes: '00', seconds: '00' })
    const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy')
    const [buyItems, setBuyItems] = useState<ShopItem[]>([])
    const [sellItems, setSellItems] = useState<ShopItem[]>([])

    // Quantity State
    const [buyQuantities, setBuyQuantities] = useState<Record<string, number>>({})
    const [sellQuantities, setSellQuantities] = useState<Record<string, number>>({})

    // Selection State (Sell Tab)
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())

    // Loading State
    const [isBuying, setIsBuying] = useState(false)
    const [isBulkSelling, setIsBulkSelling] = useState(false)

    // Modal State
    const [modalConfig, setModalConfig] = useState<ModalConfig>({
        isOpen: false,
        type: 'success',
        title: '',
        message: ''
    })

    // Mobile Check
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

    // Handlers defined before usage
    const isMobileHandler = () => setIsMobile(window.innerWidth <= 768)

    useEffect(() => {
        window.addEventListener('resize', isMobileHandler)
        return () => window.removeEventListener('resize', isMobileHandler)
    }, [])

    const handleBack = () => {
        if (onClose) {
            onClose()
        } else {
            setCanvasView('map')
        }
    }

    // Timer Logic
    useEffect(() => {
        checkRefresh() // Check immediately on mount

        const timer = setInterval(() => {
            checkRefresh()

            const now = Date.now()
            const diff = nextRefreshTime - now
            if (diff > 0) {
                const h = Math.floor(diff / (1000 * 60 * 60))
                const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
                const s = Math.floor((diff % (1000 * 60)) / 1000)

                setTimerComponents({
                    hours: h.toString().padStart(2, '0'),
                    minutes: m.toString().padStart(2, '0'),
                    seconds: s.toString().padStart(2, '0')
                })
            } else {
                setTimerComponents({ hours: '00', minutes: '00', seconds: '00' })
            }
        }, 1000)

        return () => clearInterval(timer)
    }, [nextRefreshTime, checkRefresh])

    // Helper to get material name using global MATERIALS
    const getMaterialName = (id: string) => {
        if (MATERIALS[id]) return MATERIALS[id].name
        const item = SHOP_ITEMS.find(i => i.id === id)
        if (item) return item.name
        return id
    }

    // Load Buy Items from Store
    useEffect(() => {
        if (shopItems.length > 0) {
            const mappedItems: ShopItem[] = shopItems.map((item: ShopSaleItem) => ({
                id: item.id,
                name: getMaterialName(item.id),
                price: item.price,
                count: item.quantity,
                type: 'material',
                rarity: MATERIALS[item.id]?.rarity || 'COMMON'
            }))
            setBuyItems(mappedItems)
        } else {
            setBuyItems(SHOP_ITEMS.map(item => ({ ...item, type: 'material' })))
        }
    }, [shopItems])

    // Load Sell Items from Inventory
    useEffect(() => {
        // materialCounts is Record<string, number>
        const items: ShopItem[] = Object.entries(materialCounts)
            .filter(([id, count]) => count > 0 && id !== 'gold') // exclude gold from sell list
            .map(([id, count]) => {
                const material = MATERIALS[id]
                const rarity = material?.rarity || 'N'
                const basePrice = BASE_SELL_PRICES[rarity] || 10

                return {
                    id,
                    name: material?.name || id,
                    type: 'material', // Assuming all are materials for now
                    count,
                    price: Math.max(1, Math.floor(basePrice / 2)), // Sell price is usually lower
                    rarity: rarity
                }
            })
        setSellItems(items)
    }, [materialCounts])


    const handleQuantityChange = (id: string, qty: number, max: number, mode: 'buy' | 'sell') => {
        if (qty < 1) qty = 1
        if (max !== -1 && qty > max) qty = max // -1 is unlimited

        if (mode === 'buy') {
            setBuyQuantities(prev => ({ ...prev, [id]: qty }))
        } else {
            setSellQuantities(prev => ({ ...prev, [id]: qty }))
        }
    }

    const showModal = (type: 'success' | 'error', title: string, message: string) => {
        setModalConfig({ isOpen: true, type, title, message })
        // Auto close success modal
        if (type === 'success') {
            setTimeout(() => {
                setModalConfig(prev => ({ ...prev, isOpen: false }))
            }, 2000)
        }
    }

    const closeModal = () => setModalConfig(prev => ({ ...prev, isOpen: false }))

    const handleBuy = async (item: ShopItem) => {
        if (isBuying) return
        const qty = buyQuantities[item.id] || 1
        const totalPrice = item.price * qty

        if (gold < totalPrice) {
            showModal('error', '골드 부족', '골드가 부족하여 아이템을 구매할 수 없습니다.')
            return
        }

        if (item.count !== -1 && item.count < qty) { // Check stock
            showModal('error', '재고 부족', '상점에 남은 재고가 부족합니다.')
            return
        }

        setIsBuying(true)
        try {
            // 1. Remove Gold (Local UI update + Store update)
            const newResources = { ...resources }
            newResources['gold'] = (newResources['gold'] || 0) - totalPrice
            setResources(newResources)

            // 2. Add Item to Inventory
            await addMaterial(item.id, qty)

            // 3. Update Shop Stock
            await buyItem(item.id, qty)

            showModal('success', '구매 완료', `${item.name} ${qty}개를 구매했습니다.`)
            setBuyQuantities(prev => ({ ...prev, [item.id]: 1 })) // Reset qty
        } catch (error) {
            console.error('Purchase failed:', error)
            showModal('error', '구매 실패', '아이템 구매 중 오류가 발생했습니다.')
            // Gold rollback is tricky without proper transaction, assuming setResources works.
        } finally {
            setIsBuying(false)
        }
    }

    const toggleSelection = (id: string) => {
        setSelectedItems(prev => {
            const newSet = new Set(prev)
            if (newSet.has(id)) {
                newSet.delete(id)
            } else {
                newSet.add(id)
            }
            return newSet
        })
    }

    const toggleSelectAll = () => {
        if (selectedItems.size === sellItems.length) {
            setSelectedItems(new Set())
        } else {
            setSelectedItems(new Set(sellItems.map(item => item.id)))
        }
    }

    const totalSelectedValue = useMemo(() => {
        let total = 0
        selectedItems.forEach(id => {
            const item = sellItems.find(i => i.id === id)
            if (item) {
                const qty = sellQuantities[id] || 1
                total += item.price * qty
            }
        })
        return total
    }, [selectedItems, sellItems, sellQuantities])

    const handleBulkSell = async () => {
        if (selectedItems.size === 0 || isBulkSelling) return

        setIsBulkSelling(true)
        let totalGain = 0
        let soldCount = 0
        const materialsToConsume: Record<string, number> = {}

        try {
            // Calculate totals
            for (const id of selectedItems) {
                const item = sellItems.find(i => i.id === id)
                if (item) {
                    const qty = sellQuantities[id] || 1
                    materialsToConsume[id] = qty
                    totalGain += item.price * qty
                    soldCount += 1
                }
            }

            // 1. Remove from Inventory
            await consumeMaterials(materialsToConsume)

            // 2. Add Gold (DB Sync)
            if (userId) {
                await addGold(userId, totalGain)
            }

            // 3. Add Gold (Local UI)
            const newResources = { ...resources }
            newResources['gold'] = (newResources['gold'] || 0) + totalGain
            setResources(newResources)

            showModal('success', '판매 완료', `아이템 ${soldCount}종을 판매하여 ${totalGain.toLocaleString()}G를 획득했습니다.`)
            setSelectedItems(new Set())
            setSellQuantities({})
        } catch (error) {
            console.error('Bulk sell failed:', error)
            showModal('error', '판매 실패', '아이템 판매 중 오류가 발생했습니다.')
        } finally {
            setIsBulkSelling(false)
        }
    }

    const handleSingleSell = async (id: string, qty: number) => {
        if (isBulkSelling) return
        const item = sellItems.find(i => i.id === id)
        if (!item) return

        const totalGain = item.price * qty
        setIsBulkSelling(true) // Reuse loading state
        try {
            await consumeMaterials({ [id]: qty })
            if (userId) {
                await addGold(userId, totalGain)
            }
            const newResources = { ...resources }
            newResources['gold'] = (newResources['gold'] || 0) + totalGain
            setResources(newResources)
            showModal('success', '판매 완료', `${item.name} 판매: +${totalGain.toLocaleString()}G`)
            // Reset quantity to 1
            setSellQuantities(prev => ({ ...prev, [id]: 1 }))
        } catch (error) {
            console.error('Sell failed:', error)
            showModal('error', '판매 실패', '판매 중 오류가 발생했습니다.')
        } finally {
            setIsBulkSelling(false)
        }
    }

    return (
        <div className="shop-container">
            <ShopHeader
                gold={gold}
                activeTab={activeTab}
                isMobile={isMobile}
                onTabChange={setActiveTab}
                onClose={handleBack}
            />

            {/* Main Content */}
            <main style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '1440px', margin: '0 auto', padding: isMobile ? '16px' : '32px 24px' }}>

                {activeTab === 'buy' ? (
                    <>
                        <ShopTimer
                            hours={timerComponents.hours}
                            minutes={timerComponents.minutes}
                            seconds={timerComponents.seconds}
                            isMobile={isMobile}
                        />

                        <ShopBuyTab
                            buyItems={buyItems}
                            buyQuantities={buyQuantities}
                            inventoryCounts={materialCounts}
                            gold={gold}
                            isBuying={isBuying}
                            isMobile={isMobile}
                            onQuantityChange={handleQuantityChange}
                            onBuy={handleBuy}
                        />
                    </>
                ) : (
                    <ShopSellTab
                        sellItems={sellItems}
                        sellQuantities={sellQuantities}
                        selectedItems={selectedItems}
                        isBulkSelling={isBulkSelling}
                        isMobile={isMobile}
                        totalSelectedValue={totalSelectedValue}
                        onToggleSelection={toggleSelection}
                        onToggleSelectAll={toggleSelectAll}
                        onBulkSell={handleBulkSell}
                        onSingleSell={handleSingleSell}
                        onQuantityChange={handleQuantityChange}
                    />
                )}
            </main>

            {/* Footer */}
            {/* <footer style={{ width: '100%', padding: '24px', textAlign: 'center', color: '#4b5563', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', borderTop: '1px solid rgba(68, 68, 68, 0.3)' }}>
            </footer> */}

            <ShopModal config={modalConfig} onClose={closeModal} />

            <style>{shopStyles}</style>
        </div>
    )
}
