/**
 * Battle (전투) 관련 타입 정의
 */
import type { ElementType } from '../types/alchemy'
import type { StatusEffect } from '../lib/battleUtils'

export type FloatingTextType = 'DAMAGE' | 'HEAL' | 'CRIT' | 'MISS' | 'BUFF' | 'WEAK' | 'RESIST'


export interface FloatingText {
  id: string
  x: number
  y: number
  text: string
  color: string
  life: number
  target?: 'PLAYER' | 'ENEMY'
  type?: FloatingTextType
}

export interface BattleState {
  isBattling: boolean
  playerHp: number
  playerMaxHp: number
  enemyId: string | null
  enemyHp: number
  enemyMaxHp: number
  enemyImage?: string
  turn: number
  logs: string[]
  result: 'victory' | 'defeat' | null
  rewards: Record<string, number>
  selectedMonsterId: string | null
  selectedMonsterType: string | null
  playerAtk: number
  playerDef: number
  playerMonsterImage?: string
  playerElement?: ElementType
  playerStatusEffects?: StatusEffect[]
  enemyAtk: number
  enemyDef: number
  enemyElement?: ElementType
  enemyStatusEffects?: StatusEffect[]

  // Visual Queues
  floatingTexts: FloatingText[]

  // Skill System
  playerSkills?: BattleSkill[]
  skillCooldowns?: Record<string, number> // skillId -> remaining turns
}

export interface BattleSkill {
  id: string
  name: string
  emoji: string
  iconUrl?: string
  type: 'ACTIVE' | 'PASSIVE'
  effectType: string
  effectValue: number
  effectTarget: string
  duration?: number
  cooldown?: number
  triggerChance: number
}

export interface Enemy {
  id: string
  name: string
  image?: string
  hp: number
  attack: number
  defense: number
  element?: ElementType // New
  drops: EnemyDrop[]
}

export interface EnemyDrop {
  materialId: string
  chance: number
  minQuantity: number
  maxQuantity: number
}

export interface Dungeon {
  id: string
  name: string
  description: string
  enemies: Enemy[]
  requiredLevel: number
  unlockConditions?: unknown[]
}
