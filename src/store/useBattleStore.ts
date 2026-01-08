import { create } from 'zustand'
import { addPlayerEquipment } from '../lib/equipmentApi'
import { DUNGEONS } from '../data/dungeonData'
import { GAME_MONSTERS as MONSTERS } from '../data/monsterData'
import { CONSUMABLE_EFFECTS } from '../data/alchemyData'
import { calculateDamage, processStatusEffects } from '../lib/battleUtils'
import type { BattleEntity } from '../lib/battleUtils'
import type { FloatingText, BattleState } from '../types/battle'
import type { ConsumableSlot } from '../types/consumable'
import { useAlchemyStore } from './useAlchemyStore'
import { useGameStore } from './useGameStore'
import { useFacilityStore } from './useFacilityStore'

interface BattleStoreState {
    activeDungeon: string | null
    battleState: BattleState | null
    battleSpeed: number
    consumableSlots: ConsumableSlot[]

    isAutoBattle: boolean
    toggleAutoBattle: () => void

    setBattleSpeed: (speed: number) => void
    setConsumableSlots: (slots: ConsumableSlot[]) => void
    updateConsumableSlot: (slotId: 'hp' | 'status', updates: Partial<ConsumableSlot>) => void

    startDungeon: (dungeonId: string) => void
    leaveDungeon: () => void
    startBattle: (dungeonId: string, enemyId: string, playerMonsterId: string) => void
    processTurn: () => Promise<void>
    endBattle: () => void
    consumeFloatingTexts: () => void

    reset: () => void
}

export const useBattleStore = create<BattleStoreState>((set, get) => ({
    activeDungeon: null,
    battleState: null,
    battleSpeed: 1,
    isAutoBattle: true,
    consumableSlots: [
        { id: 'hp', consumableId: null, threshold: 30, statusTypes: [], enabled: false },
        { id: 'status', consumableId: null, threshold: 0, statusTypes: ['BURN', 'POISON'], enabled: false }
    ],

    setBattleSpeed: (speed) => set({ battleSpeed: speed }),
    toggleAutoBattle: () => set(state => ({ isAutoBattle: !state.isAutoBattle })),
    setConsumableSlots: (slots) => set({ consumableSlots: slots }),

    updateConsumableSlot: (slotId, updates) => {
        set(state => ({
            consumableSlots: state.consumableSlots.map(slot =>
                slot.id === slotId ? { ...slot, ...updates } : slot
            )
        }))
    },

    startDungeon: (dungeonId) => {
        set({ activeDungeon: dungeonId })
        useGameStore.getState().setCanvasView('dungeon')
    },

    leaveDungeon: () => {
        set({ activeDungeon: null, battleState: null })
        useGameStore.getState().setCanvasView('map')
    },

    startBattle: (dungeonId, enemyId, playerMonsterId) => {
        const dungeon = DUNGEONS.find(d => d.id === dungeonId)
        if (!dungeon) return

        const enemy = dungeon.enemies.find(e => e.id === enemyId)
        if (!enemy) return

        set({ activeDungeon: dungeonId })

        const { playerMonsters } = useAlchemyStore.getState()
        const playerMonster = playerMonsters.find(m => m.id === playerMonsterId)
        if (!playerMonster) return

        const monsterKey = playerMonster.monster_id
        const monsterData = MONSTERS[monsterKey]
        if (!monsterData) return

        const levelMultiplier = 1 + (playerMonster.level - 1) * 0.1
        let playerHp = Math.floor(monsterData.baseStats.hp * levelMultiplier)
        let playerAtk = Math.floor(monsterData.baseStats.atk * levelMultiplier)
        let playerDef = Math.floor(monsterData.baseStats.def * levelMultiplier)

        // Calculate Synergy Bonuses
        const { assignedMonsters } = useFacilityStore.getState()

        let atkBonus = 0
        let defBonus = 0
        let hpBonus = 0

        Object.values(assignedMonsters).forEach(slotList => {
            slotList.forEach(mId => {
                if (!mId) return
                const assignedMonster = playerMonsters.find(pm => pm.id === mId)
                if (!assignedMonster) return

                const mKey = assignedMonster.monster_id
                const mData = MONSTERS[mKey]
                if (!mData) return

                // 1. Element Matching (+2% ATK)
                if (mData.element === monsterData.element) {
                    atkBonus += 2
                }

                // 2. Role Bonuses
                if (mData.role === 'TANK') hpBonus += 2
                if (mData.role === 'DPS') atkBonus += 2
                if (mData.role === 'SUPPORT') defBonus += 2

                // 3. Rarity Bonuses
                if (mData.rarity === 'SSR') {
                    atkBonus += 5
                    defBonus += 5
                    hpBonus += 5
                } else if (mData.rarity === 'UR') {
                    atkBonus += 10
                    defBonus += 10
                    hpBonus += 10
                }
            })
        })

        // Apply Bonuses (Multiplicative or Additive? Let's go additive to percent then apply)
        playerHp = Math.floor(playerHp * (1 + hpBonus / 100))
        playerAtk = Math.floor(playerAtk * (1 + atkBonus / 100))
        playerDef = Math.floor(playerDef * (1 + defBonus / 100))

        const enemyMonsterData = MONSTERS[enemyId]
        const enemyImage = enemy.image || enemyMonsterData?.iconUrl

        set({
            battleState: {
                isBattling: true,
                playerHp,
                playerMaxHp: playerHp,
                playerAtk,
                playerDef,
                playerMonsterImage: monsterData.iconUrl,
                playerElement: monsterData.element,
                playerStatusEffects: [],
                enemyId,
                enemyHp: enemy.hp,
                enemyMaxHp: enemy.hp,
                enemyImage,
                turn: 1,
                logs: [`전투 시작! ${enemy.name}이(가) 나타났다!`],
                result: null,
                rewards: {},
                equipmentRewards: [],
                selectedMonsterId: playerMonsterId,
                selectedMonsterType: playerMonster.monster_id,
                enemyAtk: enemy.attack,
                enemyDef: enemy.defense,
                enemyElement: enemy.element,
                enemyStatusEffects: [],
                floatingTexts: [],
                synergyBonuses: {
                    atkPercent: atkBonus,
                    defPercent: defBonus,
                    hpPercent: hpBonus
                }
            }
        })
    },

    processTurn: async () => {
        const state = get()
        if (!state.battleState || state.battleState.result) return

        const { battleState, consumableSlots } = state
        const { consumeMaterials, addMaterial, userId } = useAlchemyStore.getState()
        const forceSyncCallback = useGameStore.getState().forceSyncCallback

        let {
            playerHp,
            enemyHp,
            playerStatusEffects = [],
            enemyStatusEffects = [],
        } = battleState

        const {
            logs,
            turn,
            floatingTexts
        } = battleState

        const newLogs = [...logs]
        const newFloatingTexts: FloatingText[] = []

        // 1. Auto Consumable Usage
        for (const slot of consumableSlots) {
            if (!slot.enabled || !slot.consumableId) continue

            const effect = CONSUMABLE_EFFECTS[slot.consumableId]
            if (!effect) continue

            let shouldConsume = false
            if (slot.id === 'hp') {
                const hpPercent = (playerHp / battleState.playerMaxHp) * 100
                if (hpPercent <= slot.threshold) {
                    shouldConsume = true
                }
            } else if (slot.id === 'status' && playerStatusEffects.length > 0) {
                const hasMatchingStatus = playerStatusEffects.some(s => slot.statusTypes.includes(s.type))
                if (hasMatchingStatus) {
                    shouldConsume = true
                }
            }

            if (shouldConsume) {
                try {
                    // Check if player has the consumable
                    const success = await consumeMaterials({ [slot.consumableId]: 1 })
                    if (success) {
                        if (effect.type === 'HEAL_HP') {
                            const healAmount = Math.floor(battleState.playerMaxHp * (effect.value / 100))
                            playerHp = Math.min(battleState.playerMaxHp, playerHp + healAmount)
                            newLogs.push(`포션 사용! HP ${healAmount} 회복 (현재: ${playerHp}/${battleState.playerMaxHp})`)
                            newFloatingTexts.push({
                                id: `heal-${Date.now()}-${Math.random()}`,
                                x: 50, y: 50, text: `+${healAmount}`, color: '#4ade80', life: 1,
                                type: 'HEAL', target: 'PLAYER'
                            })
                        } else if (effect.type === 'CURE_STATUS') {
                            playerStatusEffects = playerStatusEffects.filter(s => !slot.statusTypes.includes(s.type))
                            newLogs.push(`포션 사용! 상태 이상 해제`)
                        }
                    }
                } catch (e) {
                    // eslint-disable-next-line no-console
                    console.error('Failed to consume item:', e)
                }
            }
        }

        // Prepare Entities for Utils
        const playerEntity: BattleEntity = {
            id: 'player',
            name: 'Player',
            hp: playerHp,
            maxHp: battleState.playerMaxHp,
            atk: battleState.playerAtk,
            def: battleState.playerDef,
            element: battleState.playerElement || 'FIRE',
            statusEffects: playerStatusEffects,
            isPlayer: true
        }

        const enemyEntity: BattleEntity = {
            id: battleState.enemyId || 'enemy',
            name: 'Enemy',
            hp: enemyHp,
            maxHp: battleState.enemyMaxHp,
            atk: battleState.enemyAtk,
            def: battleState.enemyDef,
            element: battleState.enemyElement || 'FIRE',
            statusEffects: enemyStatusEffects,
            isPlayer: false
        }

        // 2. Process Status Effects
        const playerStatusResult = processStatusEffects(playerEntity)
        playerHp = playerStatusResult.updatedEntity.hp
        playerStatusEffects = playerStatusResult.updatedEntity.statusEffects
        playerStatusResult.logs.forEach(l => newLogs.push(`[플레이어] ${l}`))
        if (playerStatusResult.damageTaken > 0) {
            newFloatingTexts.push({
                id: `pdmg-${Date.now()}`,
                x: 50, y: 50, text: `-${playerStatusResult.damageTaken}`, color: '#ef4444', life: 1,
                type: 'DAMAGE', target: 'PLAYER'
            })
        }

        const enemyStatusResult = processStatusEffects(enemyEntity)
        enemyHp = enemyStatusResult.updatedEntity.hp
        enemyStatusEffects = enemyStatusResult.updatedEntity.statusEffects
        enemyStatusResult.logs.forEach(l => newLogs.push(`[적] ${l}`))
        if (enemyStatusResult.damageTaken > 0) {
            newFloatingTexts.push({
                id: `edmg-${Date.now()}`,
                x: 150, y: 50, text: `-${enemyStatusResult.damageTaken}`, color: '#ef4444', life: 1,
                type: 'DAMAGE', target: 'ENEMY'
            })
        }

        if (playerHp <= 0 || enemyHp <= 0) {
            // End battle if status effects killed someone
        } else {
            // Update entities with new HP/Status for attack phase
            playerEntity.hp = playerHp
            playerEntity.statusEffects = playerStatusEffects
            enemyEntity.hp = enemyHp
            enemyEntity.statusEffects = enemyStatusEffects

            // 3. Player Attack
            const playerDmgResult = calculateDamage(playerEntity, enemyEntity)
            enemyHp = Math.max(0, enemyHp - playerDmgResult.damage)
            newLogs.push(`플레이어의 공격! ${playerDmgResult.damage}의 피해를 입혔다! ${playerDmgResult.isCritical ? '(크리티컬!)' : ''}`)
            newFloatingTexts.push({
                id: `p-atk-${Date.now()}`,
                x: 150, y: 50, text: `-${playerDmgResult.damage}`, color: playerDmgResult.isCritical ? '#facc15' : '#ef4444', life: 1,
                type: playerDmgResult.isCritical ? 'CRIT' : 'DAMAGE', target: 'ENEMY'
            })

            if (enemyHp > 0) {
                // 4. Enemy Attack
                enemyEntity.hp = enemyHp // Update enemy HP for next calculation if needed
                const enemyDmgResult = calculateDamage(enemyEntity, playerEntity)
                playerHp = Math.max(0, playerHp - enemyDmgResult.damage)
                newLogs.push(`${enemyEntity.id}의 공격! ${enemyDmgResult.damage}의 피해를 입었다!`)
                newFloatingTexts.push({
                    id: `e-atk-${Date.now()}`,
                    x: 50, y: 50, text: `-${enemyDmgResult.damage}`, color: '#ef4444', life: 1,
                    type: 'DAMAGE', target: 'PLAYER'
                })
            }
        }

        // 5. Check Battle End
        let result: 'victory' | 'defeat' | null = null
        const rewards: Record<string, number> = {}
        const equipmentRewards: string[] = []

        if (enemyHp <= 0) {
            result = 'victory'
            newLogs.push('전투 승리!')
            // Calculate Rewards
            const dungeon = DUNGEONS.find(d => d.id === state.activeDungeon)
            const enemy = dungeon?.enemies.find(e => e.id === battleState.enemyId)
            if (enemy) {
                if (enemy.drops) {
                    for (const drop of enemy.drops) {
                        if (Math.random() <= drop.chance) {
                            if (drop.type === 'EQUIPMENT') {
                                equipmentRewards.push(drop.materialId)
                                newLogs.push(`장비 획득! ${drop.materialId}`) // TODO: Get name
                            } else {
                                const amount = Math.floor(Math.random() * (drop.maxQuantity - drop.minQuantity + 1)) + drop.minQuantity
                                if (amount > 0) {
                                    rewards[drop.materialId] = (rewards[drop.materialId] || 0) + amount
                                }
                            }
                        }
                    }
                }
                if (enemy.goldDrop) {
                    const goldAmount = Math.floor(Math.random() * (enemy.goldDrop.max - enemy.goldDrop.min + 1)) + enemy.goldDrop.min
                    if (goldAmount > 0) {
                        rewards['gold'] = (rewards['gold'] || 0) + goldAmount
                    }
                }
            }
        } else if (playerHp <= 0) {
            result = 'defeat'
            newLogs.push('전투 패배...')
        }

        // Sync Rewards
        if (result === 'victory' && userId) {
            try {
                // 1. Rewards Sync
                const rewardEntries = Object.entries(rewards)
                await Promise.all(rewardEntries.map(([id, amt]) => {
                    return addMaterial(id, amt)
                }))

                // 1.5 Equipment Sync
                if (equipmentRewards.length > 0) {
                    await Promise.all(equipmentRewards.map(eqId => addPlayerEquipment(userId, eqId)))
                    newLogs.push(`${equipmentRewards.length}개의 장비를 획득했습니다!`)
                }

                // 2. XP Sync
                const dungeon = DUNGEONS.find(d => d.id === state.activeDungeon)
                const enemyDef = dungeon?.enemies.find(e => e.id === battleState.enemyId)
                const playerMonster = useAlchemyStore.getState().playerMonsters.find(m => m.id === battleState.selectedMonsterId)

                if (enemyDef && playerMonster) {
                    const xpGain = enemyDef.exp || 0
                    if (xpGain > 0) {
                        const { updateMonsterExp } = await import('../lib/monsterApi')
                        const monsterData = MONSTERS[playerMonster.monster_id]

                        const xpResult = await updateMonsterExp(
                            userId,
                            playerMonster.id,
                            playerMonster.level,
                            playerMonster.exp,
                            xpGain,
                            monsterData.rarity,
                            monsterData.id,
                            monsterData.role
                        )

                        // Local update
                        useAlchemyStore.getState().updatePlayerMonster(playerMonster.id, {
                            level: xpResult.level,
                            exp: xpResult.exp,
                            unlocked_skills: [...(playerMonster.unlocked_skills || []), ...xpResult.newSkills]
                        })

                        // Logs & Floating Text
                        newLogs.push(`경험치 획득: +${xpGain}`)
                        newFloatingTexts.push({
                            id: `xp-${Date.now()}`,
                            x: 50, y: 150, // Slightly lower than damage
                            text: `+${xpGain} XP`,
                            color: '#3b82f6', // Blue
                            life: 1.5,
                            type: 'HEAL', // Reusing HEAL type for upward floating or positive feeling
                            target: 'PLAYER'
                        })

                        if (xpResult.leveledUp) {
                            newLogs.push(`🎉 레벨 업! Lv.${playerMonster.level} -> Lv.${xpResult.level}`)
                            newFloatingTexts.push({
                                id: `lvlup-${Date.now()}`,
                                x: 50, y: 100,
                                text: `LEVEL UP!`,
                                color: '#fbbf24', // Gold/Yellow
                                life: 2,
                                type: 'HEAL',
                                target: 'PLAYER'
                            })
                        }
                    }
                }

                if (forceSyncCallback) {
                    await forceSyncCallback()
                }
            } catch (e) {
                // eslint-disable-next-line no-console
                console.error('Failed to sync rewards/xp:', e)
            }
        }

        set({
            battleState: {
                ...battleState,
                playerHp,
                enemyHp,
                playerStatusEffects,
                enemyStatusEffects,
                logs: newLogs,
                turn: turn + 1,
                result,
                rewards,
                equipmentRewards,
                floatingTexts: [...floatingTexts, ...newFloatingTexts]
            }
        })
    },

    endBattle: () => set({ battleState: null }),
    consumeFloatingTexts: () => set(state => ({
        battleState: state.battleState ? { ...state.battleState, floatingTexts: [] } : null
    })),

    reset: () => set({
        activeDungeon: null,
        battleState: null,
        battleSpeed: 1,
        consumableSlots: [
            { id: 'hp', consumableId: null, threshold: 30, statusTypes: [], enabled: false },
            { id: 'status', consumableId: null, threshold: 0, statusTypes: ['BURN', 'POISON'], enabled: false }
        ],
    })
}))
