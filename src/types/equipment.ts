export type EquipmentSlot = 'WEAPON' | 'ARMOR' | 'ACCESSORY'
export type EquipmentRarity = 'N' | 'R' | 'SR' | 'SSR'

export interface EquipmentStats {
    hp?: number
    attack?: number
    defense?: number
    miningSpeed?: number // For production units
    gatherSpeed?: number
    moveSpeed?: number // For dispatch
    criticalRate?: number
}

export interface Equipment {
    id: string
    name: string
    description: string
    slot: EquipmentSlot
    rarity: EquipmentRarity
    iconUrl: string
    stats: EquipmentStats
    isSpecial?: boolean
}

export interface PlayerEquipment {
    id: string // UUID
    userId: string
    equipmentId: string
    isEquipped: boolean
    equippedMonsterId?: string | null // UUID of player_monster
    createdAt: string
    updatedAt: string
}
