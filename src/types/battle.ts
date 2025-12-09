/**
 * Battle (전투) 관련 타입 정의
 */

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
  playerElement?: string // New
  playerStatusEffects?: any[] // Will be properly typed in store usage or by importing StatusEffect type if we move it to shared types
  enemyAtk: number
  enemyDef: number
  enemyElement?: string // New
  enemyStatusEffects?: any[] // New

  // Visual Queues
  floatingTexts: { id: string; x: number; y: number; text: string; color: string; life: number; target?: 'PLAYER' | 'ENEMY' }[]
}

export interface Enemy {
  id: string
  name: string
  hp: number
  attack: number
  defense: number
  element?: string // New
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
  unlockConditions?: any[]
}
