export interface ShopItem {
    id: string
    name: string
    type: 'material' | 'legacy'
    count: number
    price: number
    rarity?: string
    buyPrice?: number // 구매 탭용
}

export interface ModalConfig {
    isOpen: boolean
    type: 'success' | 'error'
    title: string
    message: string
}
