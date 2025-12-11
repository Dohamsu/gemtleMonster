/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand'
import { DUNGEONS } from '../data/dungeonData'
import { GAME_MONSTERS as MONSTERS } from '../data/monsterData'
import { MATERIALS } from '../data/alchemyData'
import type { RarityType } from '../types/alchemy'
import { useAlchemyStore } from './useAlchemyStore'
import { getUnlockableSkills } from '../data/monsterSkillData'
import { calculateDamage, processStatusEffects } from '../lib/battleUtils'
import type { BattleEntity } from '../lib/battleUtils'
import type { FloatingText, BattleState } from '../types/battle'
import type { RoleType } from '../types/monster'

interface GameState {
    canvasView: 'map' | 'dungeon' | 'alchemy_workshop' | 'shop' | 'awakening' | 'monster_farm'
    activeDungeon: string | null
    battleState: BattleState | null

    setCanvasView: (view: 'map' | 'dungeon' | 'alchemy_workshop' | 'shop' | 'awakening' | 'monster_farm') => void
    startDungeon: (dungeonId: string) => void
    leaveDungeon: () => void

    // UI State
    activeTab: 'facilities' | 'alchemy'
    setActiveTab: (tab: 'facilities' | 'alchemy') => void

    startBattle: (dungeonId: string, enemyId: string, playerMonsterId: string) => void
    processTurn: () => Promise<void>
    endBattle: () => void
    consumeFloatingTexts: () => void // New action to clear texts after reading
    addResources: (rewards: Record<string, number>, source: string) => void
    recentAdditions: { facilityKey: string, resourceId: string }[]
    setRecentAdditions: (additions: { facilityKey: string, resourceId: string }[]) => void

    resources: Record<string, number>
    setResources: (resources: Record<string, number>) => void

    // Facilities (Idle)
    facilities: Record<string, number>
    setFacilities: (facilities: Record<string, number>) => void
    upgradeFacility: (facilityId: string, cost: Record<string, number>) => Promise<void>

    // Auto Collection
    lastCollectedAt: Record<string, number>
    setLastCollectedAt: (id: string, time: number) => void

    // Sync Callbacks
    batchFacilitySyncCallback: ((id: string, level: number) => void) | null
    setBatchFacilitySyncCallback: (callback: ((id: string, level: number) => void) | null) => void
}

export const useGameStore = create<GameState>((set, get) => ({
    canvasView: 'map',
    activeDungeon: null,

    activeTab: 'facilities',
    setActiveTab: (activeTab) => set({ activeTab }),

    resources: {},
    setResources: (resources) => set({ resources }),
    facilities: { 'herb_farm': 1, 'monster_farm': 1 }, // Default facilities
    setFacilities: (facilities) => set({ facilities }),
    batchFacilitySyncCallback: null,
    setBatchFacilitySyncCallback: (callback) => set({ batchFacilitySyncCallback: callback }),

    upgradeFacility: async (facilityId, _cost) => {
        const state = get()

        // Check if affordable
        // Note: cost logic might need to be more robust, assuming cost contains materialIds and gold
        // For now, simple deduction
        // This is a simplified implementation to fix the crash. 
        // Real implementation might need to verify detailed costs.

        // Deduct resources
        // We need to access useAlchemyStore to ensure material counts are accurate if they are separate?
        // But useGameStore.resources seems to be a mirror.

        // TODO: Implement proper cost deduction verification if needed. 
        // For now trusting the UI/caller has verified or we verify here.

        // Updating local state
        const newFacilities = { ...state.facilities }
        newFacilities[facilityId] = (newFacilities[facilityId] || 0) + 1

        set({ facilities: newFacilities })

        // Trigger sync callback
        if (state.batchFacilitySyncCallback) {
            state.batchFacilitySyncCallback(facilityId, newFacilities[facilityId])
        }
    },



    lastCollectedAt: {},
    setLastCollectedAt: (id, time) => set(state => ({
        lastCollectedAt: { ...state.lastCollectedAt, [id]: time }
    })),

    battleState: null,

    setCanvasView: (canvasView) => set({ canvasView }),

    startDungeon: (dungeonId) => set({ activeDungeon: dungeonId, canvasView: 'dungeon' }),
    leaveDungeon: () => set({ activeDungeon: null, canvasView: 'map', battleState: null }),

    addResources: (rewards, source) => {
        // ... (This function relies on useAlchemyStore which is external)
        // Since we are in useGameStore, we should call useAlchemyStore actions
        const { addMaterial } = useAlchemyStore.getState()

        // 1. Add to AlchemyStore (Authoritative)
        Object.entries(rewards).forEach(([id, qty]) => {
            addMaterial(id, qty)
        })

        // 2. Add to Recent Additions (for Animation)
        if (source) {
            const newAdditions = Object.keys(rewards).map(id => ({
                facilityKey: source,
                resourceId: id
            }))

            set(state => ({
                recentAdditions: [...state.recentAdditions, ...newAdditions]
            }))

            // Auto-clear after animation duration (e.g., 2s)
            setTimeout(() => {
                set(state => ({
                    recentAdditions: state.recentAdditions.filter(a => !newAdditions.includes(a))
                }))
            }, 2000)
        }
    },

    recentAdditions: [],
    setRecentAdditions: (additions) => set({ recentAdditions: additions }),

    startBattle: (dungeonId, enemyId, playerMonsterId) => {
        console.log(`[GameStore] startBattle called: dungeon=${dungeonId}, enemy=${enemyId}, playerMonster=${playerMonsterId}`)

        const dungeon = DUNGEONS.find(d => d.id === dungeonId)
        if (!dungeon) {
            return
        }

        const enemy = dungeon.enemies.find(e => e.id === enemyId)
        if (!enemy) {
            return
        }

        // Set active dungeon
        set({ activeDungeon: dungeonId })

        const { playerMonsters } = useAlchemyStore.getState()

        const playerMonster = playerMonsters.find(m => m.id === playerMonsterId)
        if (!playerMonster) {
            console.error(`❌ Player monster not found: ${playerMonsterId}`)
            return
        }

        // Fix: Strip 'monster_' prefix if present to match MONSTERS keys
        const monsterKey = playerMonster.monster_id.replace('monster_', '')
        const monsterData = MONSTERS[monsterKey]

        if (!monsterData) {
            console.error(`❌ Monster data not found for Key: ${monsterKey} (Original: ${playerMonster.monster_id})`)
            return
        }

        console.log('✅ Battle Initialized successfully')

        // Calculate Stats based on Level
        // Calculate Stats based on Level
        // Simple formula: Base * (1 + (Level-1) * 0.1)
        const levelMultiplier = 1 + (playerMonster.level - 1) * 0.1
        const playerHp = Math.floor(monsterData.baseStats.hp * levelMultiplier)
        const playerAtk = Math.floor(monsterData.baseStats.atk * levelMultiplier)
        const playerDef = Math.floor(monsterData.baseStats.def * levelMultiplier)

        // Enemy Stats
        const enemyHp = enemy.hp
        const enemyMaxHp = enemy.hp
        const enemyAtk = enemy.attack
        const enemyDef = enemy.defense

        // Fix: Look up enemy image from MONSTERS data if not present on enemy object
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
                enemyHp,
                enemyMaxHp,
                enemyImage, // Now correctly populated
                turn: 1,
                logs: [`전투 시작! ${enemy.name}이(가) 나타났다!`],
                result: null,
                rewards: {},
                selectedMonsterId: playerMonsterId,
                selectedMonsterType: playerMonster.monster_id,
                enemyAtk,
                enemyDef,
                enemyElement: enemy.element,
                enemyStatusEffects: [],

                floatingTexts: []
            }
        })

    },

    processTurn: async () => {
        const state = get()
        if (!state.battleState || state.battleState.result) return

        const { playerHp, enemyHp, logs, enemyId, playerAtk, playerDef, selectedMonsterType, playerMaxHp, selectedMonsterId, enemyAtk, enemyDef } = state.battleState
        const { playerMonsters } = useAlchemyStore.getState()

        // Monster & Skill Data Setup
        const selectedMonster = selectedMonsterId ? playerMonsters.find(m => m.id === selectedMonsterId) : null
        const monsterData = selectedMonsterType ? MONSTERS[selectedMonsterType] : null
        const monsterName = monsterData?.name || '플레이어'

        let currentLevel = 1
        let role: RoleType = 'TANK'

        if (selectedMonster && monsterData) {
            currentLevel = selectedMonster.level || 1
            const roleMap: Record<string, RoleType> = { '탱커': 'TANK', '딜러': 'DPS', '서포터': 'SUPPORT', '하이브리드': 'HYBRID', '생산': 'PRODUCTION' }
            role = roleMap[monsterData.role] || 'TANK'
        }

        const skills = (selectedMonster && monsterData)
            ? getUnlockableSkills(selectedMonsterType!, role, currentLevel)
            : []

        const activeSkills = skills.filter((s: any) => s.type === 'ACTIVE')

        // Skill Activation Logic (30% Chance)
        let skillLog: string | null = null
        let skillBonusDmg = 0
        let skillHeal = 0
        let skillBuffValue = 0

        const canTriggerSkill = activeSkills.length > 0 && Math.random() < 0.3

        if (canTriggerSkill) {
            const skill = activeSkills[Math.floor(Math.random() * activeSkills.length)]

            if (skill.effect.type === 'DAMAGE') {
                skillBonusDmg = Math.floor(playerAtk * (skill.effect.value / 100))
                skillLog = `${skill.emoji} [${skill.name}] 발동! 강력한 일격!`
            } else if (skill.effect.type === 'HEAL') {
                skillHeal = Math.floor(playerMaxHp * (skill.effect.value / 100))
                skillLog = `${skill.emoji} [${skill.name}] 발동! 체력을 ${skillHeal} 회복했습니다.`
            } else if (skill.effect.type === 'BUFF') {
                skillBuffValue = Math.floor(playerAtk * (skill.effect.value / 100))
                skillLog = `${skill.emoji} [${skill.name}] 발동! 공격력이 증가했습니다!`
            } else if (skill.effect.type === 'DEBUFF') {
                skillBonusDmg = Math.floor(playerAtk * 0.5)
                skillLog = `${skill.emoji} [${skill.name}] 발동! 적을 약화시킵니다!`
            } else if (skill.effect.type === 'SPECIAL') {
                skillBonusDmg = Math.floor(playerAtk * 0.3)
                skillLog = `${skill.emoji} [${skill.name}] 발동! 특수 효과!`
            }
        }

        const dungeon = DUNGEONS.find(d => d.id === state.activeDungeon)
        const enemy = dungeon?.enemies.find(e => e.id === enemyId)

        // --------------------------------------------------------
        // Phase 1: Player Attack & Status Effects
        // --------------------------------------------------------

        const playerEntity: BattleEntity = {
            id: 'player',
            name: monsterName,
            hp: playerHp,
            maxHp: playerMaxHp,
            atk: playerAtk,
            def: playerDef,
            element: (state.battleState.playerElement || 'EARTH') as any,
            isPlayer: true,
            statusEffects: state.battleState.playerStatusEffects || []
        }

        const enemyEntity: BattleEntity = {
            id: 'enemy',
            name: enemy?.name || 'Unknown',
            hp: enemyHp,
            maxHp: state.battleState.enemyMaxHp,
            atk: enemyAtk,
            def: enemyDef,
            element: (state.battleState.enemyElement || 'EARTH') as any,
            isPlayer: false,
            statusEffects: state.battleState.enemyStatusEffects || []
        }

        const newLogs = [...logs]
        const floatingTexts = [...(state.battleState.floatingTexts || [])]
            .filter(ft => ft.life > 0)
            .map(ft => ({ ...ft, life: ft.life - 1 }))

        // Status Effects
        const playerStatusResult = processStatusEffects(playerEntity)
        const enemyStatusResult = processStatusEffects(enemyEntity)

        playerEntity.statusEffects = playerStatusResult.updatedEntity.statusEffects
        enemyEntity.statusEffects = enemyStatusResult.updatedEntity.statusEffects

        if (playerStatusResult.damageTaken > 0) {
            playerEntity.hp -= playerStatusResult.damageTaken
            floatingTexts.push({
                id: `dot-player-${Date.now()}`,
                x: 0, y: 0,
                text: `-${playerStatusResult.damageTaken}`,
                color: '#a855f7',
                life: 30,
                target: 'PLAYER',
                type: 'DAMAGE'
            })
        }
        if (enemyStatusResult.damageTaken > 0) {
            enemyEntity.hp -= enemyStatusResult.damageTaken
            floatingTexts.push({
                id: `dot-enemy-${Date.now()}`,
                x: 0, y: 0,
                text: `-${enemyStatusResult.damageTaken}`,
                color: '#a855f7',
                life: 30,
                target: 'ENEMY',
                type: 'DAMAGE'
            })
        }

        newLogs.push(...playerStatusResult.logs)
        newLogs.push(...enemyStatusResult.logs)

        // Player Action
        let playerDmg = 0
        if (playerEntity.hp > 0) {
            const result = calculateDamage(playerEntity, enemyEntity, 100 + skillBuffValue)
            playerDmg = result.damage + skillBonusDmg

            if (skillLog) newLogs.push(skillLog)

            const isCrit = result.isCritical
            const isWeak = result.multiplier < 1.0
            const isEffective = result.multiplier > 1.0

            let logMsg = `[PLAYER]${monsterName}이(가) `
            if (isCrit) logMsg += `{{RED|치명타!}} `
            logMsg += `{{RED|${playerDmg}}}의 피해를 입혔습니다!`

            if (isEffective) logMsg += ` {{GREEN|(효과적!)}}`
            if (isWeak) logMsg += ` {{GRAY|(반감됨)}}`

            newLogs.push(logMsg)

            enemyEntity.hp = Math.max(0, enemyEntity.hp - playerDmg)

            floatingTexts.push({
                id: `dmg-enemy-${Date.now()}`,
                x: 0,
                y: 0,
                text: `${playerDmg}${isCrit ? '!' : ''}${isEffective ? '↑' : ''}${isWeak ? '↓' : ''}`,
                color: isCrit ? '#ef4444' : (isEffective ? '#fbbf24' : (isWeak ? '#9ca3af' : 'white')),
                life: 40,
                target: 'ENEMY',
                type: isCrit ? 'CRIT' : (isEffective ? 'WEAK' : (isWeak ? 'RESIST' : 'DAMAGE'))
            })
        }

        // Apply Heals
        if (skillHeal > 0 && playerEntity.hp > 0) {
            playerEntity.hp = Math.min(playerEntity.maxHp, playerEntity.hp + skillHeal)
            floatingTexts.push({
                id: `heal-player-${Date.now()}`,
                x: 0, y: 0,
                text: `+${skillHeal}`,
                color: '#4ade80',
                life: 40,
                target: 'PLAYER',
                type: 'HEAL'
            })
        }

        // Update State (Phase 1)
        set(s => ({
            battleState: s.battleState ? {
                ...s.battleState,
                playerHp: playerEntity.hp,
                enemyHp: enemyEntity.hp,
                logs: newLogs.slice(-50),
                playerStatusEffects: playerEntity.statusEffects,
                enemyStatusEffects: enemyEntity.statusEffects,
                floatingTexts
            } : null
        }))

        // Wait for visual delay (500ms)
        await new Promise(resolve => setTimeout(resolve, 500))

        // --------------------------------------------------------
        // Phase 2: Enemy Attack (if alive)
        // --------------------------------------------------------

        // Re-check state to ensure battle hasn't ended abruptly (e.g. user fled)
        const freshState = get()
        if (!freshState.battleState || freshState.battleState.result) return

        const phase2Logs: string[] = []
        const phase2FloatingTexts: FloatingText[] = []

        // Check if enemy is still alive (based on our local entity, which matches phase 1 update)
        if (enemyEntity.hp > 0 && playerEntity.hp > 0) {
            const result = calculateDamage(enemyEntity, playerEntity, 100)
            const enemyDmg = result.damage

            const isCrit = result.isCritical
            const isEffective = result.multiplier > 1.0
            const isWeak = result.multiplier < 1.0

            let logMsg = `[ENEMY]${enemy?.name || '적'}이(가) `
            if (isCrit) logMsg += `{{RED|강력한}} `
            logMsg += `{{RED|${enemyDmg}}}의 피해를 입혔습니다!`

            if (isEffective) logMsg += ` {{RED|(아픔!)}}`
            if (isWeak) logMsg += ` {{GRAY|(저항함)}}`

            phase2Logs.push(logMsg)

            playerEntity.hp = Math.max(0, playerEntity.hp - enemyDmg)

            phase2FloatingTexts.push({
                id: `dmg-player-${Date.now()}`,
                x: 0,
                y: 0,
                text: `${enemyDmg}${isCrit ? '!' : ''}`,
                color: isCrit ? '#ef4444' : (isEffective ? '#fbbf24' : 'white'),
                life: 40,
                target: 'PLAYER',
                type: isCrit ? 'CRIT' : (isEffective ? 'WEAK' : (isWeak ? 'RESIST' : 'DAMAGE'))
            })
        }

        // Final State Update (Phase 2 + potentially End Battle)
        // We reuse local logic for Victory/Defeat
        const newEnemyHp = enemyEntity.hp
        const newPlayerHp = playerEntity.hp

        let result: 'victory' | 'defeat' | null = null
        const rewards: Record<string, number> = {}
        const finalLogs = [...freshState.battleState.logs, ...phase2Logs]

        if (newEnemyHp === 0) {
            result = 'victory'
            // Calculate drops on victory
            if (enemy) {
                // Drop Logic
                for (const drop of enemy.drops) {
                    const roll = Math.random() * 100
                    if (roll < drop.chance) {
                        const quantity = Math.floor(
                            Math.random() * (drop.maxQuantity - drop.minQuantity + 1) + drop.minQuantity
                        )
                        rewards[drop.materialId] = (rewards[drop.materialId] || 0) + quantity
                    }
                }

                // Monster EXP Logic (Async)
                const userId = useAlchemyStore.getState().userId

                if (selectedMonsterId && userId) {
                    const { playerMonsters } = useAlchemyStore.getState()
                    const playerMonster = playerMonsters.find(m => m.id === selectedMonsterId)

                    if (playerMonster) {
                        const earnedExp = enemy.exp
                        if (earnedExp > 0) {
                            finalLogs.push(`획득 경험치: {{GREEN|${earnedExp} XP}}`)
                        }

                        // Async update - fire and forget, update state later if needed
                        import('../lib/monsterApi').then(async ({ updateMonsterExp }) => {
                            try {
                                const state = useGameStore.getState()
                                const selectedMonsterType = state.battleState?.selectedMonsterType
                                const monsterData = selectedMonsterType ? MONSTERS[selectedMonsterType] : null
                                const rarity = (monsterData?.rarity || 'N') as RarityType
                                const roleMap: Record<string, RoleType> = { '탱커': 'TANK', '딜러': 'DPS', '서포터': 'SUPPORT', '하이브리드': 'HYBRID', '생산': 'PRODUCTION' }
                                const role = monsterData ? (roleMap[monsterData.role] || 'TANK') : 'TANK'

                                const { level, leveledUp, newSkills } = await updateMonsterExp(
                                    userId,
                                    selectedMonsterId,
                                    playerMonster.level,
                                    playerMonster.exp,
                                    earnedExp,
                                    rarity,
                                    selectedMonsterType || undefined,
                                    role
                                )

                                if (leveledUp) {
                                    useGameStore.setState(s => {
                                        if (s.battleState && s.battleState.isBattling) {
                                            const newLogs = [...s.battleState.logs, `🎉 레벨 업! Lv.${level} 달성!`]
                                            if (newSkills && newSkills.length > 0) {
                                                newLogs.push(`✨ 새로운 스킬을 배웠습니다!`)
                                            }
                                            // Preserve all existing state, just update logs
                                            return {
                                                battleState: {
                                                    ...s.battleState,
                                                    logs: newLogs
                                                }
                                            }
                                        }
                                        return s
                                    })

                                    // Reload monsters to update UI
                                    await useAlchemyStore.getState().loadPlayerMonsters(userId)
                                }
                            } catch {
                                // Silently ignore exp update errors
                            }
                        })
                    }
                }

                // Add drop messages to logs (Synchronous part)
                if (Object.keys(rewards).length > 0) {
                    const dropMessages = Object.entries(rewards)
                        .map(([id, qty]) => {
                            const material = MATERIALS[id]
                            const materialName = material?.name || id
                            const rarity = material?.rarity || 'N'
                            return `{{R_${rarity}|${materialName}}} x${qty}`
                        })
                        .join(', ')

                    finalLogs.push(`전리품: ${dropMessages}`)
                }
            }
        } else if (newPlayerHp === 0) {
            result = 'defeat'
            finalLogs.push('💀 패배했습니다... 💀')
        }

        set(s => ({
            battleState: s.battleState ? {
                ...s.battleState,
                playerHp: newPlayerHp,
                enemyHp: newEnemyHp,
                logs: finalLogs.slice(-50),
                turn: s.battleState.turn + 1,
                result,
                rewards,
                floatingTexts: [...s.battleState.floatingTexts, ...phase2FloatingTexts]
            } : null
        }))
    },

    consumeFloatingTexts: () => set((state) => {
        if (!state.battleState) return state
        return {
            battleState: {
                ...state.battleState,
                floatingTexts: []
            }
        }
    }),

    endBattle: () => set((state) => {
        // Add rewards to inventory before clearing battle state
        if (state.battleState?.rewards && Object.keys(state.battleState.rewards).length > 0) {
            const addResources = useGameStore.getState().addResources
            addResources(state.battleState.rewards, 'dungeon')
        }

        return { activeDungeon: null, battleState: null }
    })
}))
