/* eslint-disable no-console */
import { create } from 'zustand'
import { DUNGEONS } from '../data/dungeonData'
import { GAME_MONSTERS as MONSTERS } from '../data/monsterData'
import { MATERIALS, CONSUMABLE_EFFECTS } from '../data/alchemyData'
import type { RarityType } from '../types/alchemy'
import type { ConsumableSlot } from '../types/consumable'
import { useAlchemyStore } from './useAlchemyStore'
import { getUnlockableSkills } from '../data/monsterSkillData'
import type { MonsterSkill } from '../data/monsterSkillData'
import { calculateDamage, processStatusEffects } from '../lib/battleUtils'
import type { StatusEffect } from '../lib/battleUtils'
import type { BattleEntity } from '../lib/battleUtils'
import type { FloatingText, BattleState } from '../types/battle'
import type { RoleType } from '../types/monster'

export type CanvasView = 'map' | 'dungeon' | 'alchemy_workshop' | 'shop' | 'awakening' | 'monster_farm' | 'facility'

interface GameState {
    canvasView: CanvasView
    activeDungeon: string | null
    battleState: BattleState | null

    setCanvasView: (view: CanvasView) => void
    startDungeon: (dungeonId: string) => void
    leaveDungeon: () => void

    // Offline Processing State
    isOfflineProcessing: boolean
    setIsOfflineProcessing: (isProcessing: boolean) => void

    // UI State
    activeTab: 'facilities' | 'alchemy'
    setActiveTab: (tab: 'facilities' | 'alchemy') => void

    startBattle: (dungeonId: string, enemyId: string, playerMonsterId: string) => void
    processTurn: () => Promise<void>
    endBattle: () => void
    consumeFloatingTexts: () => void // New action to clear texts after reading
    addResources: (rewards: Record<string, number>, source: string) => void
    // Recent Additions (for animations)
    recentAdditions: { id: string, facilityKey: string, resourceId: string, amount: number }[]
    setRecentAdditions: (additions: { id: string, facilityKey: string, resourceId: string, amount: number }[]) => void
    removeRecentAddition: (id: string) => void

    resources: Record<string, number>
    setResources: (resources: Record<string, number>) => void
    sellResource: (resourceId: string, quantity: number, price: number) => Promise<boolean>

    // Facilities (Idle)
    facilities: Record<string, number>
    setFacilities: (facilities: Record<string, number>) => void
    upgradeFacility: (facilityId: string, cost: Record<string, number>) => Promise<void>

    // Monster Assignment
    assignedMonsters: Record<string, (string | null)[]>
    assignMonster: (facilityId: string, monsterId: string | null, slotIndex: number) => void
    setAssignedMonsters: (assignments: Record<string, (string | null)[]>) => void
    batchAssignmentSyncCallback: ((facilityId: string, monsterId: string | null, slotIndex: number) => void) | null
    setBatchAssignmentSyncCallback: (callback: ((facilityId: string, monsterId: string | null, slotIndex: number) => void) | null) => void

    // Auto Collection
    lastCollectedAt: Record<string, number>
    setLastCollectedAt: (id: string, time: number) => void

    // Sync Callbacks
    batchFacilitySyncCallback: ((id: string, level: number) => void) | null
    setBatchFacilitySyncCallback: (callback: ((id: string, level: number) => void) | null) => void

    // Consumable Auto-Use Settings
    consumableSlots: ConsumableSlot[]
    setConsumableSlots: (slots: ConsumableSlot[]) => void
    updateConsumableSlot: (slotId: 'hp' | 'status', updates: Partial<ConsumableSlot>) => void

    // Battle Speed
    battleSpeed: number
    setBattleSpeed: (speed: number) => void
}

export const useGameStore = create<GameState>((set, get) => ({
    canvasView: 'map',
    activeDungeon: null,

    // Offline Processing State
    isOfflineProcessing: false,
    setIsOfflineProcessing: (isProcessing) => set({ isOfflineProcessing: isProcessing }),

    activeTab: 'facilities',
    setActiveTab: (activeTab) => set({ activeTab }),

    resources: {},
    setResources: (resources) => set({ resources }),
    facilities: { 'herb_farm': 1, 'monster_farm': 1 }, // Default facilities
    setFacilities: (facilities) => set({ facilities }),
    assignedMonsters: {},
    assignMonster: (facilityId, monsterId, slotIndex) => set(state => {
        if (state.batchAssignmentSyncCallback) {
            state.batchAssignmentSyncCallback(facilityId, monsterId, slotIndex)
        }

        let currentAssignments = state.assignedMonsters[facilityId]

        // Handle legacy state (string) safely
        if (typeof currentAssignments === 'string') {
            currentAssignments = [currentAssignments]
        } else if (!Array.isArray(currentAssignments)) {
            // Null or undefined
            currentAssignments = []
        }

        // Ensure array is large enough
        const newAssignments = [...currentAssignments]
        while (newAssignments.length <= slotIndex) {
            newAssignments.push(null)
        }
        newAssignments[slotIndex] = monsterId

        return {
            assignedMonsters: { ...state.assignedMonsters, [facilityId]: newAssignments }
        }
    }),
    setAssignedMonsters: (assignedMonsters) => set({ assignedMonsters }),
    batchAssignmentSyncCallback: null,
    setBatchAssignmentSyncCallback: (callback) => set({ batchAssignmentSyncCallback: callback }),
    batchFacilitySyncCallback: null,
    setBatchFacilitySyncCallback: (callback) => set({ batchFacilitySyncCallback: callback }),

    // Consumable Auto-Use Settings
    consumableSlots: [
        { id: 'hp', consumableId: null, threshold: 30, statusTypes: [], enabled: false },
        { id: 'status', consumableId: null, threshold: 0, statusTypes: ['BURN', 'POISON'], enabled: false }
    ],
    setConsumableSlots: (slots) => set({ consumableSlots: slots }),
    updateConsumableSlot: (slotId, updates) => {
        console.log('🔧 [updateConsumableSlot] 호출:', slotId, updates)
        set(state => {
            const newSlots = state.consumableSlots.map(slot =>
                slot.id === slotId ? { ...slot, ...updates } : slot
            )
            console.log('🔧 [updateConsumableSlot] 새 슬롯:', newSlots)
            return { consumableSlots: newSlots }
        })
    },

    battleSpeed: 1,
    setBattleSpeed: (speed) => set({ battleSpeed: speed }),

    upgradeFacility: async (facilityId, cost) => {
        const state = get()
        const { consumeMaterials, playerMaterials } = useAlchemyStore.getState()

        // 1. Separate Gold and Materials
        const goldCost = cost['gold'] || 0
        const materialCost = { ...cost }
        delete materialCost['gold']

        // 2. Check Sufficiency
        // Check Gold
        const currentGold = state.resources['gold'] || 0
        if (currentGold < goldCost) {
            console.warn(`[GameStore] Not enough gold: ${currentGold} < ${goldCost}`)
            return
        }

        // Check Materials
        for (const [matId, amount] of Object.entries(materialCost)) {
            const currentAmount = playerMaterials[matId] || 0
            if (currentAmount < amount) {
                console.warn(`[GameStore] Not enough material ${matId}: ${currentAmount} < ${amount}`)
                return
            }
        }

        // 3. Deduct Resources
        // Deduct Gold
        if (goldCost > 0) {
            const newResources = { ...state.resources }
            newResources['gold'] = currentGold - goldCost
            set({ resources: newResources })

            // Sync Gold (Assume legacy system handles gold sync via useBatchSync/useResources or dedicated gold sync?)
            // Currently useBatchSync only handles player_material via useAlchemyStore callback
            // We might need to manually sync gold or use a callback if available.
            // Looking at useBatchSync logic: it might not cover gold if gold is in player_resource.
            // Let's rely on local state update for now, user didn't mention gold not saving, just not deducting.
        }

        // Deduct Materials
        if (Object.keys(materialCost).length > 0) {
            console.log(`🔧 [GameStore] 시설 업그레이드 재료 차감:`, materialCost)
            await consumeMaterials(materialCost)
        }

        console.log(`🔧 [GameStore] 시설 업그레이드 완료: ${facilityId} -> Level ${(state.facilities[facilityId] || 0) + 1}`)

        // 4. Update Facility Level
        const newFacilities = { ...state.facilities }
        const newLevel = (newFacilities[facilityId] || 0) + 1
        newFacilities[facilityId] = newLevel

        set({ facilities: newFacilities })

        // 5. Initialize lastCollectedAt for the new level (CRITICAL: Prevents massive backlog processing)
        // Without this, auto-collection would see elapsed time from epoch (1970) and try to process years worth of production
        const now = Date.now()
        for (let _l = 1; _l <= newLevel; _l++) {
            const key = `${facilityId}-${_l}`
            if (!state.lastCollectedAt[key]) {
                get().setLastCollectedAt(key, now)
            }
        }

        // 6. Trigger sync callback (Facility Level)
        if (state.batchFacilitySyncCallback) {
            state.batchFacilitySyncCallback(facilityId, newLevel)
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
        const { addMaterial } = useAlchemyStore.getState()
        const currentResources = get().resources
        const updatedResources = { ...currentResources }
        let goldAdded = 0

        // 1. Process Rewards
        Object.entries(rewards).forEach(([id, qty]) => {
            if (id === 'gold') {
                goldAdded += qty
            } else if (id !== 'empty') {
                // materials are authoritative in AlchemyStore, but we mirror them for UI
                addMaterial(id, qty)
                updatedResources[id] = (updatedResources[id] || 0) + qty
            }
        })

        if (goldAdded > 0) {
            updatedResources['gold'] = (updatedResources['gold'] || 0) + goldAdded
        }

        // 2. Process Animations (Batch)
        const newAdditions = source
            ? Object.entries(rewards)
                .filter(([id]) => id !== 'empty')
                .map(([id, qty]) => ({
                    id: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                    facilityKey: source,
                    resourceId: id,
                    amount: qty
                }))
            : []

        // Single State Update for everything local
        set(state => ({
            resources: updatedResources,
            recentAdditions: [...state.recentAdditions, ...newAdditions].slice(-50) // Max 50 to prevent memory bloat
        }))

        // Auto-clear animations after 2s
        if (newAdditions.length > 0) {
            setTimeout(() => {
                const state = get()
                if (!state) return // Safety check
                set(prev => ({
                    recentAdditions: prev.recentAdditions.filter(a => !newAdditions.some(na => na.id === a.id))
                }))
            }, 2000)
        }
    },

    recentAdditions: [],
    setRecentAdditions: (additions) => set({ recentAdditions: additions }),
    removeRecentAddition: (id) => set(state => ({
        recentAdditions: state.recentAdditions.filter(item => item.id !== id)
    })),

    sellResource: async (resourceId, quantity, price) => {
        const state = get()
        const currentAmount = state.resources[resourceId] || 0
        if (currentAmount < quantity) return false

        // Update local state
        const newResources = { ...state.resources }
        newResources[resourceId] = currentAmount - quantity
        // Add Gold? Using simplified logic here as we don't have a backend for legacy resources
        const earnedGold = quantity * price
        newResources['gold'] = (newResources['gold'] || 0) + earnedGold

        set({ resources: newResources })
        return true
    },

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

        // Fix: Use ID directly (Strict Mode)
        const monsterKey = playerMonster.monster_id
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
        const { playerMonsters, playerMaterials, consumeMaterials } = useAlchemyStore.getState()

        // ========================================
        // Auto-Consumable Check (턴 시작 시)
        // ========================================
        const consumableSlots = state.consumableSlots
        let currentPlayerHp = playerHp
        let currentPlayerAtk = playerAtk
        let currentPlayerDef = playerDef
        const consumableLogs: string[] = []
        const consumableFloatingTexts: FloatingText[] = []

        console.log('🧪 [Auto-Consumable] 슬롯 체크 시작:', consumableSlots)
        console.log('🧪 [Auto-Consumable] 현재 HP:', playerHp, '/', playerMaxHp, '=', Math.round((playerHp / playerMaxHp) * 100) + '%')
        console.log('🧪 [Auto-Consumable] playerMaterials:', playerMaterials)

        for (const slot of consumableSlots) {
            console.log('🧪 [Auto-Consumable] 슬롯 체크:', slot.id, 'enabled:', slot.enabled, 'consumableId:', slot.consumableId)
            if (!slot.enabled || !slot.consumableId) continue

            const consumableCount = playerMaterials[slot.consumableId] || 0
            console.log('🧪 [Auto-Consumable] 소모품 보유량:', slot.consumableId, '=', consumableCount)
            if (consumableCount <= 0) continue

            const effect = CONSUMABLE_EFFECTS[slot.consumableId]
            console.log('🧪 [Auto-Consumable] 효과 정보:', effect)
            if (!effect) continue

            const material = MATERIALS[slot.consumableId]
            const consumableName = material?.name || slot.consumableId

            let shouldUse = false

            // HP 조건 체크
            if (slot.id === 'hp') {
                const hpPercent = (currentPlayerHp / playerMaxHp) * 100
                console.log('🧪 [Auto-Consumable] HP 조건:', hpPercent, '% <= ', slot.threshold, '%?', hpPercent <= slot.threshold)
                if (hpPercent <= slot.threshold) {
                    shouldUse = true
                }
            }
            // 상태이상 조건 체크
            else if (slot.id === 'status') {
                const playerStatusEffects = state.battleState?.playerStatusEffects || []
                const hasTargetStatus = playerStatusEffects.some(eff =>
                    slot.statusTypes.includes(eff.type)
                )
                if (hasTargetStatus) {
                    shouldUse = true
                }
            }

            if (shouldUse) {
                // 소모품 사용
                await consumeMaterials({ [slot.consumableId]: 1 })

                // 효과 적용
                if (effect.type === 'HEAL_HP') {
                    const healAmount = Math.min(effect.value, playerMaxHp - currentPlayerHp)
                    currentPlayerHp = Math.min(playerMaxHp, currentPlayerHp + effect.value)
                    consumableLogs.push(`[CONSUMABLE]🧪 ${consumableName}을(를) 사용! {{GREEN|HP +${healAmount}}}`)
                    consumableFloatingTexts.push({
                        id: `consumable-heal-${Date.now()}`,
                        x: 0, y: 0,
                        text: `+${healAmount}`,
                        color: '#4ade80',
                        life: 40,
                        target: 'PLAYER',
                        type: 'HEAL'
                    })
                } else if (effect.type === 'BUFF_ATK') {
                    currentPlayerAtk = Math.floor(playerAtk * (1 + effect.value / 100))
                    consumableLogs.push(`[CONSUMABLE]🧪 ${consumableName}을(를) 사용! {{GREEN|공격력 +${effect.value}%}} (${effect.duration || 3}턴)`)
                    consumableFloatingTexts.push({
                        id: `consumable-buff-${Date.now()}`,
                        x: 0, y: 0,
                        text: `ATK ↑`,
                        color: '#fbbf24',
                        life: 40,
                        target: 'PLAYER',
                        type: 'BUFF'
                    })
                } else if (effect.type === 'BUFF_DEF') {
                    currentPlayerDef = Math.floor(playerDef * (1 + effect.value / 100))
                    consumableLogs.push(`[CONSUMABLE]🧪 ${consumableName}을(를) 사용! {{GREEN|방어력 +${effect.value}%}} (${effect.duration || 3}턴)`)
                    consumableFloatingTexts.push({
                        id: `consumable-buff-${Date.now()}`,
                        x: 0, y: 0,
                        text: `DEF ↑`,
                        color: '#60a5fa',
                        life: 40,
                        target: 'PLAYER',
                        type: 'BUFF'
                    })
                } else if (effect.type === 'CURE_STATUS') {
                    consumableLogs.push(`[CONSUMABLE]🧪 ${consumableName}을(를) 사용! {{GREEN|상태이상 해제!}}`)
                    consumableFloatingTexts.push({
                        id: `consumable-cure-${Date.now()}`,
                        x: 0, y: 0,
                        text: `상태 해제`,
                        color: '#f0abfc',
                        life: 40,
                        target: 'PLAYER',
                        type: 'HEAL'
                    })
                    // 상태이상 해제 적용
                    set(s => ({
                        battleState: s.battleState ? {
                            ...s.battleState,
                            playerStatusEffects: []
                        } : null
                    }))
                }

                // 한 턴에 한 종류의 소모품만 사용
                break
            }
        }

        // 소모품 효과 적용 후 상태 업데이트
        if (consumableLogs.length > 0) {
            set(s => ({
                battleState: s.battleState ? {
                    ...s.battleState,
                    playerHp: currentPlayerHp,
                    playerAtk: currentPlayerAtk,
                    playerDef: currentPlayerDef,
                    logs: [...s.battleState.logs, ...consumableLogs],
                    floatingTexts: [...s.battleState.floatingTexts, ...consumableFloatingTexts]
                } : null
            }))
        }
        // ========================================

        // Monster & Skill Data Setup
        const selectedMonster = selectedMonsterId ? playerMonsters.find(m => m.id === selectedMonsterId) : null
        const monsterData = selectedMonsterType ? MONSTERS[selectedMonsterType] : null
        const monsterName = monsterData?.name || '플레이어'
        const currentLevel = selectedMonster?.level || 1
        const role = (monsterData?.role as RoleType) || 'TANK'

        console.log(`🎯 [Skill] Monster: ${monsterName}, Role: ${role}, Level: ${currentLevel}`)

        // Use ID directly
        const skillMonsterId = selectedMonsterType || ''
        const skills = (selectedMonster && monsterData)
            ? getUnlockableSkills(skillMonsterId, role, currentLevel)
            : []

        // ========================================
        // 1. Passive Skills Application
        // ========================================
        let passiveCritChance = 0
        let passivePierce = 0
        const passiveDmgBonus = 0
        let passiveStatMult = 1.0
        let passiveDefMult = 1.0

        const passiveSkills = skills.filter((s: MonsterSkill) => s.type === 'PASSIVE')
        for (const skill of passiveSkills) {
            if (skill.effect.type === 'BUFF') {
                const id = skill.id.toLowerCase()
                if (id.includes('critical')) passiveCritChance += skill.effect.value
                else if (id.includes('piercing')) passivePierce += skill.effect.value
                else if (id.includes('sharp') || id.includes('claw') || id.includes('eye') || id.includes('strike')) {
                    passiveStatMult += (skill.effect.value / 100)
                }
                else if (id.includes('balance') || id.includes('adapt') || id.includes('blessing')) {
                    passiveStatMult += (skill.effect.value / 100)
                    passiveDefMult += (skill.effect.value / 100)
                }
                else if (id.includes('guard') || id.includes('fortify') || id.includes('harden') || id.includes('shield')) {
                    passiveDefMult += (skill.effect.value / 100)
                } else {
                    // Fallback: If it's a buff on self, assume attack or defense based on role
                    if (role === 'TANK') passiveDefMult += (skill.effect.value / 100)
                    else passiveStatMult += (skill.effect.value / 100)
                }
            } else if (skill.effect.type === 'DEBUFF') {
                if (skill.id.includes('piercing')) passivePierce += skill.effect.value
            }
        }

        // Apply Passive Stat Multipliers
        currentPlayerAtk = Math.floor(currentPlayerAtk * passiveStatMult)
        currentPlayerDef = Math.floor(currentPlayerDef * passiveDefMult)

        // ========================================
        // 2. Active Skill Activation Logic
        // ========================================
        const activeSkills = skills.filter((s: MonsterSkill) => s.type === 'ACTIVE')
        let skillLog: string | null = null
        let skillMultiplier = 100
        let skillHeal = 0
        let usedSkill: MonsterSkill | null = null

        // Try each active skill based on its individual triggerChance
        for (const skill of activeSkills) {
            const triggerChance = skill.triggerChance ?? 30 // Default 30% if not set
            if (Math.random() * 100 < triggerChance) {
                usedSkill = skill
                break // Use the first skill that triggers
            }
        }

        const playerStatusEffects: StatusEffect[] = [...(state.battleState.playerStatusEffects || [])]
        const enemyStatusEffects: StatusEffect[] = [...(state.battleState.enemyStatusEffects || [])]

        if (usedSkill) {
            skillLog = `${usedSkill.emoji} [${usedSkill.name}] 발동!`
            const effect = usedSkill.effect

            if (effect.type === 'DAMAGE') {
                skillMultiplier = effect.value
            } else if (effect.type === 'HEAL') {
                skillHeal = Math.floor(playerMaxHp * (effect.value / 100))
            } else if (effect.type === 'BUFF') {
                const id = usedSkill.id.toLowerCase()
                const buffType = id.includes('atk') || id.includes('berserk') || id.includes('might') || id.includes('roar') ? 'ATK_BUFF' : 'DEF_BUFF'
                playerStatusEffects.push({
                    id: `${usedSkill.id}-${Date.now()}`,
                    type: buffType,
                    value: effect.value || 20,
                    duration: effect.duration || 3,
                    sourceId: 'player',
                    name: usedSkill.name,
                    emoji: usedSkill.emoji
                })
            } else if (effect.type === 'DEBUFF') {
                const id = usedSkill.id.toLowerCase()
                const debuffType = id.includes('atk') || id.includes('weak') || id.includes('roar') ? 'ATK_DEBUFF' : 'DEF_DEBUFF'
                enemyStatusEffects.push({
                    id: `${usedSkill.id}-${Date.now()}`,
                    type: debuffType,
                    value: effect.value || 15,
                    duration: effect.duration || 3,
                    sourceId: 'player',
                    name: usedSkill.name,
                    emoji: usedSkill.emoji
                })
            } else if (effect.type === 'SPECIAL') {
                const id = usedSkill.id.toLowerCase()
                if (id.includes('taunt')) {
                    // Taunt: Increase player's DEF and decrease enemy's ATK
                    playerStatusEffects.push({
                        id: `taunt-self-${Date.now()}`,
                        type: 'DEF_BUFF', value: 20, duration: 3,
                        sourceId: 'player', name: '도발(방어)', emoji: '🛡️'
                    })
                    enemyStatusEffects.push({
                        id: `taunt-enemy-${Date.now()}`,
                        type: 'ATK_DEBUFF', value: 15, duration: 3,
                        sourceId: 'player', name: '도발(약화)', emoji: '💢'
                    })
                } else if (id.includes('shadow') || id.includes('mimic') || id.includes('dodge')) {
                    // Utility specials: For now, give a major Evasion (treated as DEF buff)
                    playerStatusEffects.push({
                        id: `special-util-${Date.now()}`,
                        type: 'DEF_BUFF', value: 30, duration: 2,
                        sourceId: 'player', name: '회피/변이', emoji: '✨'
                    })
                } else {
                    // Default special: extra damage
                    skillMultiplier = 130
                }
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
            hp: currentPlayerHp,
            maxHp: playerMaxHp,
            atk: currentPlayerAtk,
            def: currentPlayerDef,
            element: state.battleState.playerElement || 'EARTH',
            isPlayer: true,
            statusEffects: playerStatusEffects
        }

        const enemyEntity: BattleEntity = {
            id: 'enemy',
            name: enemy?.name || 'Unknown',
            hp: enemyHp,
            maxHp: state.battleState.enemyMaxHp,
            atk: enemyAtk,
            def: enemyDef,
            element: state.battleState.enemyElement || 'EARTH',
            isPlayer: false,
            statusEffects: enemyStatusEffects
        }

        const newLogs = [...logs]
        const floatingTexts = [...(state.battleState.floatingTexts || [])]
            .filter(ft => ft.life > 0)
            .map(ft => ({ ...ft, life: ft.life - 1 }))

        // Status Effects Processing
        const playerStatusResult = processStatusEffects(playerEntity)
        const enemyStatusResult = processStatusEffects(enemyEntity)

        playerEntity.statusEffects = playerStatusResult.updatedEntity.statusEffects
        enemyEntity.statusEffects = enemyStatusResult.updatedEntity.statusEffects
        playerEntity.hp = playerStatusResult.updatedEntity.hp
        enemyEntity.hp = enemyStatusResult.updatedEntity.hp

        if (playerStatusResult.damageTaken !== 0) {
            floatingTexts.push({
                id: `dot-player-${Date.now()}`,
                x: 0, y: 0,
                text: `${playerStatusResult.damageTaken > 0 ? '-' : '+'}${Math.abs(playerStatusResult.damageTaken)}`,
                color: playerStatusResult.damageTaken > 0 ? '#a855f7' : '#4ade80',
                life: 30,
                target: 'PLAYER',
                type: playerStatusResult.damageTaken > 0 ? 'DAMAGE' : 'HEAL'
            })
        }
        if (enemyStatusResult.damageTaken !== 0) {
            floatingTexts.push({
                id: `dot-enemy-${Date.now()}`,
                x: 0, y: 0,
                text: `${enemyStatusResult.damageTaken > 0 ? '-' : '+'}${Math.abs(enemyStatusResult.damageTaken)}`,
                color: enemyStatusResult.damageTaken > 0 ? '#a855f7' : '#4ade80',
                life: 30,
                target: 'ENEMY',
                type: enemyStatusResult.damageTaken > 0 ? 'DAMAGE' : 'HEAL'
            })
        }

        newLogs.push(...playerStatusResult.logs)
        newLogs.push(...enemyStatusResult.logs)

        // Player Action
        let playerDmg = 0
        if (playerEntity.hp > 0) {
            const result = calculateDamage(playerEntity, enemyEntity, skillMultiplier, {
                critChanceOffset: passiveCritChance,
                defensePierce: passivePierce,
                damageBonus: passiveDmgBonus
            })
            playerDmg = result.damage

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

        // Apply Heals (Active Skill)
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
                // 골드 드랍 (리밸런싱 추가)
                if (enemy.goldDrop) {
                    const goldAmount = Math.floor(
                        Math.random() * (enemy.goldDrop.max - enemy.goldDrop.min + 1) + enemy.goldDrop.min
                    )
                    if (goldAmount > 0) {
                        rewards['gold'] = (rewards['gold'] || 0) + goldAmount
                        finalLogs.push(`획득 골드: {{GOLD|${goldAmount}G}}`)
                    }
                }

                // 재료 드랍
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
