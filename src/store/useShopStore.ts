/* eslint-disable no-console */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { MATERIALS } from '../data/alchemyData'
import { useAlchemyStore } from './useAlchemyStore'
import * as alchemyApi from '../lib/alchemyApi'

export interface ShopSaleItem {
    id: string
    price: number
    quantity: number // 구매 가능 수량 (무제한인 경우 -1, 여기선 일단 1개씩 판매가 아니라 종류만 정의. 수량은 구매 시 결정)
    // 하지만 보통 로테이션 상점은 재고가 한정적인 경우가 많음. 
    // 유저 요청에 "1분 주기로 5개 물품 판매"라 했으므로, 재고 제한 언급은 없었음.
    // 따라서 무제한 구매 가능으로 가정하되, UI상 표시는 필요 없음.
}

interface ShopState {
    shopItems: ShopSaleItem[]
    nextRefreshTime: number
    lastRefreshTime: number

    // Actions
    refreshItems: () => void
    checkRefresh: () => void
    buyItem: (itemId: string, quantity: number) => Promise<boolean>
}

// Note: WEIGHTS are defined inline in refreshItems()

// 기본 판매가 (구매가는 여기에 10배 등 적용)
export const BASE_SELL_PRICES: Record<string, number> = {
    'N': 10,
    'COMMON': 10,
    'R': 50,
    'RARE': 50,
    'SR': 150,
    'EPIC': 150,
    'SSR': 500,
    'LEGENDARY': 500
}

const REFRESH_INTERVAL_MS = 60 * 1000 // 1분

export const useShopStore = create<ShopState>()(
    persist(
        (set, get) => ({
            shopItems: [],
            nextRefreshTime: 0,
            lastRefreshTime: 0,

            refreshItems: () => {
                const allMaterials = Object.values(MATERIALS)
                const newItems: ShopSaleItem[] = []

                // 5개 아이템 랜덤 선택
                for (let i = 0; i < 5; i++) {
                    // 1. 희귀도 결정
                    const rand = Math.random() * 100
                    let currentSum = 0
                    let selectedRarity = 'COMMON'

                    // Rarity 매핑 정규화
                    // MATERIALS의 rarity는 'N', 'R', 'SR', 'SSR' 사용
                    // WEIGHTS를 이에 맞춤
                    const WEIGHTS = {
                        'N': 40,
                        'R': 30,
                        'SR': 20,
                        'SSR': 10
                    }

                    for (const [rarity, weight] of Object.entries(WEIGHTS)) {
                        currentSum += weight
                        if (rand <= currentSum) {
                            selectedRarity = rarity
                            break
                        }
                    }

                    // 2. 해당 희귀도의 아이템 풀 생성
                    const pool = allMaterials.filter(m => m.rarity === selectedRarity)

                    // 풀이 비었으면(예: SR이 없음) 전체에서 랜덤 (Fallback)
                    const targetPool = pool.length > 0 ? pool : allMaterials

                    const randomItem = targetPool[Math.floor(Math.random() * targetPool.length)]

                    // 3. 가격 결정
                    // 기본 판매가의 10배
                    const basePrice = randomItem.sellPrice || BASE_SELL_PRICES[randomItem.rarity as keyof typeof BASE_SELL_PRICES] || 10
                    const buyPrice = basePrice * 10

                    newItems.push({
                        id: randomItem.id,
                        price: buyPrice,
                        quantity: -1 // 무제한
                    })
                }

                set({
                    shopItems: newItems,
                    nextRefreshTime: Date.now() + REFRESH_INTERVAL_MS,
                    lastRefreshTime: Date.now()
                })
            },

            checkRefresh: () => {
                const { nextRefreshTime } = get()
                if (Date.now() >= nextRefreshTime) {
                    get().refreshItems()
                }
            },

            buyItem: async (itemId, quantity) => {
                const { shopItems } = get()
                const item = shopItems.find(i => i.id === itemId)
                if (!item) return false

                const totalPrice = item.price * quantity
                const alchemyStore = useAlchemyStore.getState()
                const currentGold = alchemyStore.playerMaterials['gold'] || 0
                const currentItemCount = alchemyStore.playerMaterials[itemId] || 0

                // 골드 부족 체크
                if (currentGold < totalPrice) {
                    return false
                }

                // userId 없으면 실패
                if (!alchemyStore.userId) {
                    console.error('구매 실패: 사용자 ID 없음')
                    return false
                }

                // 트랜잭션 패턴: 서버 먼저, 성공 시에만 로컬 업데이트
                try {
                    // 1. 서버 트랜잭션 실행 (병렬 처리)
                    await Promise.all([
                        alchemyApi.addGold(alchemyStore.userId, -totalPrice),
                        alchemyApi.addMaterialToPlayer(alchemyStore.userId, itemId, quantity)
                    ])

                    // 2. 서버 성공 시에만 로컬 상태 업데이트
                    const newGold = currentGold - totalPrice
                    const newItemCount = currentItemCount + quantity

                    useAlchemyStore.setState({
                        playerMaterials: {
                            ...alchemyStore.playerMaterials,
                            gold: newGold,
                            [itemId]: newItemCount
                        }
                    })

                    // 3. UI 동기화 (레거시 호환 제거 - useAlchemyStore가 source of truth)
                    // useGameStore.getState().setResources({ ... }) 
                    // No action needed as UI listens to useAlchemyStore now.

                    return true
                } catch (e) {
                    console.error('구매 실패:', e)
                    // 서버 실패 시 로컬 상태는 변경되지 않음 (자동 롤백)
                    return false
                }
            }
        }),
        {
            name: 'shop-storage', // local storage key
            partialize: (state) => ({
                shopItems: state.shopItems,
                nextRefreshTime: state.nextRefreshTime,
                lastRefreshTime: state.lastRefreshTime
            }),
        }
    )
)
