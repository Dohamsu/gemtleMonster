/**
 * Monster (몬스터) 관련 타입 정의
 */

export type ElementType = 'FIRE' | 'WATER' | 'EARTH' | 'WIND' | 'LIGHT' | 'DARK' | 'CHAOS'
export type RoleType = 'TANK' | 'DPS' | 'SUPPORT' | 'HYBRID' | 'PRODUCTION'
export type MonsterRarity = 'N' | 'R' | 'SR' | 'SSR'

export interface MonsterStats {
  hp: number
  atk: number
  def: number
}

export interface MonsterFactoryTrait {
  targetFacility: string
  effect: string
  value: number
}

export interface Monster {
  id: string
  name: string
  role: RoleType
  element: ElementType
  rarity: MonsterRarity
  description: string
  iconUrl?: string
  baseStats: MonsterStats
  factoryTrait?: MonsterFactoryTrait
}

export interface PlayerMonster {
  id: string
  monster_id: string
  level: number
  exp: number
  created_at: string
  is_locked: boolean
  awakening_level: number
}
