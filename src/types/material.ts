/**
 * Material (재료) 관련 타입 정의
 */

export type MaterialFamily = 'PLANT' | 'MINERAL' | 'BEAST' | 'SLIME' | 'SPIRIT'
export type MaterialRarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'

export interface Material {
  id: string
  name: string
  description?: string
  family: MaterialFamily
  rarity: MaterialRarity
  icon_url?: string
  source_info?: unknown
  is_special: boolean
  sell_price: number
}

export interface PlayerMaterial {
  material_id: string
  quantity: number
}
