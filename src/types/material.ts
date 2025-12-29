/**
 * Material (재료) 관련 타입 정의
 */

export type MaterialType = 'PLANT' | 'MINERAL' | 'BEAST' | 'SLIME' | 'SPIRIT' | 'SPECIAL' | 'CONSUMABLE'
export type MaterialRarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'N' | 'R' | 'SR' | 'SSR' | 'UR'

export interface Material {
  id: string
  name: string
  description: string
  type: MaterialType
  rarity: MaterialRarity
  iconUrl?: string
  sourceInfo?: unknown
  isSpecial: boolean
  sellPrice?: number
}

export interface PlayerMaterial {
  materialId: string
  quantity: number
}
