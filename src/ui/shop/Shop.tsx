
/* eslint-disable no-console */
import { useEffect, useMemo, useState } from 'react'
import { useGameStore } from '../../../store/useGameStore'
import { useAlchemyStore } from '../../../store/useAlchemyStore'
import { useShopStore, type ShopSaleItem } from '../../../store/useShopStore'
import { useUnifiedInventory } from '../../../hooks/useUnifiedInventory'
import { MATERIALS } from '../../../data/alchemyData'
import ShopHeader from './components/ShopHeader'
import ShopInfoBar from './components/ShopInfoBar'
import ShopItemGrid from './components/ShopItemGrid'
import ShopItemCard from './components/ShopItemCard'
import SellTab from './components/SellTab'
import { colors, fontFamily } from '../../../constants/designTokens'
import { SellItem } from './components/SellList'

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

interface ModalConfig {
    isOpen: boolean
    type: 'success' | 'error'
    title: string
    message: string
}

export default function Shop() {
    const { setCanvasView, sellResource } = useGameStore()
    const { sellMaterial } = useAlchemyStore();
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
    const [timeLeft, setTimeLeft] = useState<string>('')

    const [modalConfig, setModalConfig] = useState<ModalConfig>({
        isOpen: false,
        type: 'success',
        title: '',
        message: ''
    })

    const gold = materialCounts['gold'] || 0
    const [isBuying, setIsBuying] = useState(false)

    useEffect(() => {
        refreshInventory()
        checkRefresh()

        const timer = setInterval(() => {
            checkRefresh()
            const now = Date.now()
            const diff = nextRefreshTime - now
            if (diff > 0) {
                const totalSeconds = Math.floor(diff / 1000);
                const hours = Math.floor(totalSeconds / 3600);
                const minutes = Math.floor((totalSeconds % 3600) / 60);
                const seconds = totalSeconds % 60;

                setTimeLeft(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`)
            } else {
                setTimeLeft('00:00:00')
            }
        }, 1000)

        return () => clearInterval(timer)
    }, [refreshInventory, nextRefreshTime, checkRefresh])


    const sellItems: SellItem[] = useMemo(() => {
        const items: SellItem[] = []
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


    const closeModal = () => {
        setModalConfig(prev => ({ ...prev, isOpen: false }))
    }

    const handleBuy = async (item: ShopSaleItem, qty: number) => {
        if (isBuying) return

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
                setModalConfig({
                    isOpen: true,
                    type: 'success',
                    title: '구매 성공',
                    message: `${material?.name || '아이템'} ${qty}개를 구매했습니다.`
                })
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

    const handleSellItems = async (itemsToSell: { id: string; quantity: number; type: 'material' | 'legacy' }[]) => {
        let totalGoldEarned = 0;
        let successCount = 0;

        for (const itemToSell of itemsToSell) {
            const item = sellItems.find(i => i.id === itemToSell.id);
            if (!item) continue;

            const goldForThisItem = itemToSell.quantity * item.price;

            if (itemToSell.type === 'material') {
                const success = await sellMaterial(itemToSell.id, itemToSell.quantity);
                if (success) {
                    totalGoldEarned += goldForThisItem;
                    successCount++;
                }
            } else {
                const success = await sellResource(itemToSell.id, itemToSell.quantity, item.price);
                if (success) {
                    totalGoldEarned += goldForThisItem;
                    successCount++;
                }
            }
        }

        refreshInventory();

        if (successCount > 0) {
            setModalConfig({
                isOpen: true,
                type: 'success',
                title: '판매 완료',
                message: `총 ${successCount}종류의 아이템을 판매하여 ${formatNumber(totalGoldEarned)}G를 획득했습니다!`
            });
        }
    };


    const handleBack = () => {
        setCanvasView('map')
    }

    if (loading) {
        return (
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', background: colors.backgroundDark, borderRadius: '8px' }}>
                <p style={{ color: '#aaa' }}>상점 로딩 중...</p>
            </div>
        )
    }

    return (
        <div style={{
            backgroundColor: colors.backgroundDark,
            color: colors.gray100,
            fontFamily: fontFamily.display.join(','),
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            overflowX: 'hidden',
        }}>
            <ShopHeader gold={gold} activeTab={activeTab} setActiveTab={setActiveTab} onLeave={handleBack} />

            <main style={{
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
                maxWidth: '1440px',
                margin: '0 auto',
                padding: '2rem 1.5rem',
            }}>
                {activeTab === 'buy' ? (
                    <>
                        <ShopInfoBar timeLeft={timeLeft} />
                        <ShopItemGrid>
                            {buyItems.map(item => (
                                <ShopItemCard
                                    key={item.id}
                                    item={item}
                                    playerGold={gold}
                                    onPurchase={handleBuy}
                                    isPurchasing={isBuying}
                                    inStock={item.quantity}
                                />
                            ))}
                        </ShopItemGrid>
                    </>
                ) : (
                    <SellTab sellItems={sellItems} onSellItems={handleSellItems} />
                )}
            </main>

            {modalConfig.isOpen && (
                <div style={{
                    position: 'fixed',
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
        </div>
    )
}
