export interface MerchantItem {
    id: string
    itemId: string // Material ID or Consumable ID
    type: 'material' | 'consumable' | 'recipe'
    basePrice: number
    rarityWeight: number // Higher = more common
    name?: string
}

export const MERCHANT_ITEMS_POOL: MerchantItem[] = [
    // Rare Materials
    { id: 'item_star_fragment', itemId: 'star_fragment', type: 'material', basePrice: 500, rarityWeight: 20 },
    { id: 'item_moon_stone', itemId: 'moon_stone', type: 'material', basePrice: 450, rarityWeight: 25 },
    { id: 'item_obsidian', itemId: 'obsidian', type: 'material', basePrice: 300, rarityWeight: 30 },
    { id: 'item_fairy_wing', itemId: 'fairy_wing', type: 'material', basePrice: 400, rarityWeight: 30 },
    { id: 'item_ancient_relic', itemId: 'ancient_relic_fragment', type: 'material', basePrice: 1000, rarityWeight: 10 },

    // Potions (Discounted or Bulk)
    { id: 'item_potion_xp_m', itemId: 'potion_xp_medium', type: 'consumable', basePrice: 200, rarityWeight: 50 },
    { id: 'item_potion_stamina', itemId: 'potion_stamina_full', type: 'consumable', basePrice: 150, rarityWeight: 40 },

    // Special
    { id: 'item_gem_fragment', itemId: 'gem_fragment', type: 'material', basePrice: 250, rarityWeight: 35 },
    { id: 'item_ore_gold', itemId: 'ore_gold', type: 'material', basePrice: 300, rarityWeight: 35 },
    { id: 'item_ore_mythril', itemId: 'ore_mythril', type: 'material', basePrice: 600, rarityWeight: 15 }
]
