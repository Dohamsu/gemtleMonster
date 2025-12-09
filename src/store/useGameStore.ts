import { create } from 'zustand'
import type { BattleState } from '../types'
import type { AlchemyState } from '../types/alchemy'
import { useAlchemyStore } from './useAlchemyStore'
import { MATERIALS } from '../data/alchemyData'
import { getUnlockableSkills } from '../data/monsterSkillData'
import { DUNGEONS } from '../data/dungeonData'
import { GAME_MONSTERS as MONSTERS } from '../data/monsterData'
import { ALCHEMY } from '../constants/game'
import { calculateStats, type RarityType } from '../lib/monsterLevelUtils'
import type { RoleType } from '../types/alchemy'

// ... existing imports ...
import {
    calculateDamage,
    processStatusEffects,
    getElementalMultiplier,
    type BattleEntity
} from '../lib/battleUtils'



export interface ResourceAddition {
    id: string
    resourceId: string
    amount: number
    timestamp: number
    facilityKey?: string
}


export type Tab = 'facilities' | 'shop' | 'alchemy'
export type CanvasView = 'map' | 'alchemy_workshop' | 'shop' | 'monster_farm'

interface GameState {
    player: {
        x: number
        y: number
        health: number
    }
    inventory: string[]
    /** UI 애니메이션용 읽기 전용 캐시. 실제 데이터는 useAlchemyStore.playerMaterials에 저장됨. 컴포넌트에서는 useUnifiedInventory.materialCounts를 사용하세요. */
    resources: Record<string, number>
    facilities: Record<string, number>
    lastCollectedAt: Record<string, number>
    recentAdditions: ResourceAddition[]
    activeTab: Tab
    canvasView: CanvasView

    setPlayerPosition: (x: number, y: number) => void
    addItem: (item: string) => void
    setResources: (resources: Record<string, number>) => void
    setFacilities: (facilities: Record<string, number>) => void
    addResources: (resources: Record<string, number>, facilityKey?: string) => void
    setLastCollectedAt: (facilityId: string, timestamp: number) => void
    removeRecentAddition: (id: string) => void
    sellResource: (resourceId: string, amount: number, pricePerUnit: number) => Promise<boolean>
    upgradeFacility: (facilityId: string, cost: Record<string, number>) => Promise<void>
    batchFacilitySyncCallback: ((facilityId: string, newLevel: number) => void) | null
    setBatchFacilitySyncCallback: (callback: ((facilityId: string, newLevel: number) => void) | null) => void
    setActiveTab: (tab: Tab) => void
    setCanvasView: (view: CanvasView) => void

    // Alchemy Actions
    alchemyState: AlchemyState
    selectRecipe: (recipeId: string | null) => void
    addIngredient: (materialId: string, count: number) => void
    startBrewing: () => void
    completeBrewing: (resultMonsterId: string, count: number, materialsUsed: Record<string, number>) => void
    // Battle Actions
    activeDungeon: string | null
    battleState: BattleState | null
    startBattle: (dungeonId: string, enemyId: string, playerMonsterId?: string) => void
    processTurn: () => void
    consumeFloatingTexts: () => void
    endBattle: () => void
}

export const useGameStore = create<GameState>((set, get) => ({
    player: { x: 0, y: 0, health: 100 },
    inventory: [],
    /**
     * resources: UI 애니메이션용 읽기 전용 캐시
     * 실제 데이터는 useAlchemyStore.playerMaterials에 저장됩니다.
     * 이 값은 useAlchemyStore.loadPlayerData() 호출 시 자동으로 동기화됩니다.
     */
    resources: {
        gold: 1000,
        herb_common: 10,
        slime_core: 5,
        beast_fang: 3,
        magic_ore: 2,
        spirit_dust: 2
    }, // Initial resources for testing (DB 로드 후 덮어씌워짐)
    facilities: { herb_farm: 1, monster_farm: 1 }, // Initial facility
    lastCollectedAt: {},
    recentAdditions: [],
    activeTab: 'facilities',
    canvasView: 'alchemy_workshop',
    alchemyState: {
        selectedRecipeId: null,
        selectedIngredients: {},
        isBrewing: false,
        brewStartTime: null,
        brewProgress: 0
    },

    // Battle Initial State
    activeDungeon: null,
    battleState: null,

    setPlayerPosition: (x, y) => set((state) => ({ player: { ...state.player, x, y } })),
    addItem: (item) => set((state) => ({ inventory: [...state.inventory, item] })),

    /**
     * resources는 UI 애니메이션용 읽기 전용 캐시입니다.
     * 실제 데이터는 useAlchemyStore.playerMaterials에 저장됩니다.
     * 이 함수는 useAlchemyStore에서 playerMaterials 변경 시 자동 동기화용으로만 사용됩니다.
     */
    setResources: (resources) => set({ resources }),
    setFacilities: (facilities) => set({ facilities }),

    addResources: (newResources, facilityKey) => {
        /**
         * Single Source of Truth 패턴:
         * 1. AlchemyStore.playerMaterials 업데이트 (실제 데이터, DB 저장용)
         * 2. GameStore.resources 업데이트 (UI 애니메이션용 읽기 전용 캐시)
         */

        // 1. AlchemyStore 업데이트 (실제 데이터 소스)
        const { batchSyncCallback, playerMaterials } = useAlchemyStore.getState()
        const alchemyUpdates: Record<string, number> = {}

        for (const [id, amount] of Object.entries(newResources)) {
            // 'empty'는 유효한 재료가 아니므로 제외
            if (amount > 0 && id !== 'empty') {
                // AlchemyStore 로컬 상태 업데이트 (Single Source of Truth)
                alchemyUpdates[id] = (playerMaterials[id] || 0) + amount

                // 배치 동기화 큐에 추가 (DB 저장)
                if (batchSyncCallback) {
                    batchSyncCallback(id, amount)
                }
            }
        }

        // AlchemyStore 상태 업데이트 (실제 데이터)
        if (Object.keys(alchemyUpdates).length > 0) {
            useAlchemyStore.setState(state => ({
                playerMaterials: {
                    ...state.playerMaterials,
                    ...alchemyUpdates
                }
            }))
        }

        // 2. GameStore.resources 업데이트 (UI 애니메이션용 읽기 전용 캐시)
        set((state) => {
            const updatedResources = { ...state.resources }
            const updatedAdditions = [...state.recentAdditions]
            const timers: NodeJS.Timeout[] = []
            const newAdditions: ResourceAddition[] = []

            for (const [id, amount] of Object.entries(newResources)) {
                updatedResources[id] = (updatedResources[id] || 0) + amount

                // Add recent addition visual feedback
                if (amount > 0 && id !== 'empty') {
                    const additionId = `${facilityKey}-${id}-${Date.now()}-${Math.random()}`
                    const addition: ResourceAddition = {
                        id: additionId,
                        resourceId: id,
                        amount,
                        timestamp: Date.now(),
                        facilityKey,
                    }
                    newAdditions.push(addition)

                    // Auto-remove after animation duration with cleanup tracking
                    const timer = setTimeout(() => {
                        set((s) => ({
                            recentAdditions: s.recentAdditions.filter(a => a.id !== additionId)
                        }))
                    }, ALCHEMY.RESOURCE_ANIMATION_DURATION)
                    timers.push(timer)
                }
            }

            return {
                resources: updatedResources,
                recentAdditions: [...updatedAdditions, ...newAdditions]
            }
        })
    },

    removeRecentAddition: (id) => set((state) => ({
        recentAdditions: state.recentAdditions.filter(a => a.id !== id)
    })),

    setLastCollectedAt: (facilityId, timestamp) => set((state) => ({
        lastCollectedAt: {
            ...state.lastCollectedAt,
            [facilityId]: timestamp
        }
    })),

    /**
     * 레거시 함수: 상점에서 레거시 자원 판매용
     *
     * @deprecated 이 함수는 레거시입니다. useAlchemyStore.sellMaterial을 사용하세요.
     *
     * 주의: resources는 읽기 전용 캐시이므로, 실제 검증은 playerMaterials를 사용해야 함
     *
     * @param resourceId - 판매할 자원 ID
     * @param amount - 판매 수량
     * @param pricePerUnit - 개당 가격
     * @returns 판매 성공 여부
     */
    sellResource: async (resourceId, amount, pricePerUnit) => {
        const currentState = get()
        // 주의: resources는 UI 캐시이므로, 실제 검증은 playerMaterials를 사용해야 함
        const currentAmount = currentState.resources[resourceId] || 0

        if (currentAmount < amount) {
            console.warn(`Not enough ${resourceId} to sell`)
            return false
        }

        const goldEarned = amount * pricePerUnit

        // ore_magic과 gem_fragment는 DB에도 동기화 (비동기)
        const shouldSyncToDb = ['ore_magic', 'gem_fragment'].includes(resourceId)

        // DB 연동 대상은 플레이어 재료 수량과 동기화 상태를 우선 확인
        if (shouldSyncToDb) {
            const { userId, playerMaterials, forceSyncCallback } = useAlchemyStore.getState()

            const dbAmount = playerMaterials[resourceId] || 0
            if (dbAmount < amount) {
                console.warn(`⚠️ ${resourceId} DB 수량 부족: 보유(${dbAmount}) < 판매(${amount})`)
                return false
            }

            // 배치 생산분이 남아있으면 우선 강제 동기화
            if (forceSyncCallback) {
                await forceSyncCallback()
            }

            if (userId) {
                try {
                    const api = await import('../lib/alchemyApi')
                    const success = await api.consumeMaterials(userId, { [resourceId]: amount })

                    if (!success) {
                        console.warn(`⚠️ ${resourceId} DB 판매 실패 (재료가 DB에 없음)`)
                        return false
                    }
                } catch (error) {
                    console.error(`❌ ${resourceId} DB 판매 에러:`, error)
                    return false
                }
            }
        }

        set((state) => {
            const availableAmount = state.resources[resourceId] || 0
            if (availableAmount < amount) return state

            const updatedResources = {
                ...state.resources,
                [resourceId]: availableAmount - amount,
                gold: (state.resources.gold || 0) + goldEarned
            }

            // DB 연동 대상은 alchemyStore의 playerMaterials도 함께 갱신해 상태 불일치 방지
            if (shouldSyncToDb) {
                const alchemyState = useAlchemyStore.getState()
                const newPlayerMaterials = {
                    ...alchemyState.playerMaterials,
                    [resourceId]: Math.max(0, (alchemyState.playerMaterials[resourceId] || 0) - amount)
                }
                useAlchemyStore.setState({ playerMaterials: newPlayerMaterials })
            }

            return {
                resources: updatedResources,
            }
        })

        return true
    },

    // 배치 동기화 콜백 (시설용)
    batchFacilitySyncCallback: null as ((facilityId: string, newLevel: number) => void) | null,
    setBatchFacilitySyncCallback: (callback) => set({ batchFacilitySyncCallback: callback }),

    /**
     * 레거시 함수: 시설 업그레이드용
     *
     * @deprecated 이 함수는 레거시입니다. useUnifiedInventory.materialCounts를 사용하세요.
     *
     * 주의: resources는 읽기 전용 캐시이므로, 실제 검증은 playerMaterials를 사용해야 함
     *
     * @param facilityId - 업그레이드할 시설 ID
     * @param cost - 업그레이드 비용 (재료별 수량)
     */
    upgradeFacility: async (facilityId, cost) => {
        const state = get()
        const userId = useAlchemyStore.getState().userId

        if (!userId) {
            console.error('User ID not found')
            return
        }

        // 1. Check affordability
        for (const [res, amount] of Object.entries(cost)) {
            if ((state.resources[res] || 0) < amount) {
                console.warn(`Not enough ${res} to upgrade`)
                return
            }
        }

        try {
            // 2. Deduct from DB
            const { supabase } = await import('../lib/supabase')
            const materialsToDeduct: Record<string, number> = {}

            for (const [res, amount] of Object.entries(cost)) {
                if (res === 'gold') {
                    // Deduct gold from player_resource
                    const { data: goldData } = await supabase
                        .from('player_resource')
                        .select('amount')
                        .eq('user_id', userId)
                        .eq('resource_id', 'gold')
                        .single()

                    const currentGold = goldData?.amount || 0
                    const newGold = currentGold - amount

                    await supabase
                        .from('player_resource')
                        .update({ amount: newGold })
                        .eq('user_id', userId)
                        .eq('resource_id', 'gold')
                } else {
                    // Accumulate materials for batch deduction
                    materialsToDeduct[res] = amount
                }
            }

            // Deduct materials using consumeMaterials
            if (Object.keys(materialsToDeduct).length > 0) {
                const alchemyApi = await import('../lib/alchemyApi')
                await alchemyApi.consumeMaterials(userId, materialsToDeduct)
            }

            // 3. Update DB (Upsert facility level)
            const newLevel = (state.facilities[facilityId] || 0) + 1

            const { error: upsertError } = await supabase
                .from('player_facility')
                .upsert({
                    user_id: userId,
                    facility_id: facilityId,
                    current_level: newLevel
                }, { onConflict: 'user_id,facility_id' })

            if (upsertError) {
                console.error('Failed to save facility level to DB:', upsertError)
                // Optionally revert resource deduction here if critical, but for now just logging
            }

            // 4. Update local state
            set((state) => {
                const newResources = { ...state.resources }
                for (const [res, amount] of Object.entries(cost)) {
                    newResources[res] = (newResources[res] || 0) - amount
                }

                // 배치 동기화 콜백 호출 (시설 레벨 변경)
                if (state.batchFacilitySyncCallback) {
                    state.batchFacilitySyncCallback(facilityId, newLevel)
                }

                return {
                    resources: newResources,
                    facilities: {
                        ...state.facilities,
                        [facilityId]: newLevel
                    }
                }
            })

            // 4. Update AlchemyStore playerMaterials to sync with DB
            const alchemyStore = useAlchemyStore.getState()
            const newPlayerMaterials = { ...alchemyStore.playerMaterials }
            for (const [res, amount] of Object.entries(cost)) {
                if (res !== 'gold') {
                    newPlayerMaterials[res] = Math.max(0, (newPlayerMaterials[res] || 0) - amount)
                } else {
                    newPlayerMaterials['gold'] = Math.max(0, (newPlayerMaterials['gold'] || 0) - amount)
                }
            }
            useAlchemyStore.setState({ playerMaterials: newPlayerMaterials })

            console.log(`✅ Facility upgraded: ${facilityId} -> Level ${(state.facilities[facilityId] || 0) + 1}`)
        } catch (error) {
            console.error('❌ Failed to upgrade facility:', error)
        }
    },

    setActiveTab: (tab) => set({ activeTab: tab }),
    setCanvasView: (view) => set({ canvasView: view }),

    // Alchemy Actions Implementation
    selectRecipe: (recipeId) => set((state) => ({
        alchemyState: {
            ...state.alchemyState,
            selectedRecipeId: recipeId,
            selectedIngredients: {}, // Reset ingredients when selecting new recipe
            isBrewing: false,
            brewProgress: 0
        }
    })),

    addIngredient: (materialId, count) => set((state) => {
        const currentCount = state.alchemyState.selectedIngredients[materialId] || 0
        const newCount = Math.max(0, currentCount + count)
        return {
            alchemyState: {
                ...state.alchemyState,
                selectedIngredients: {
                    ...state.alchemyState.selectedIngredients,
                    [materialId]: newCount
                }
            }
        }
    }),

    startBrewing: () => set((state) => ({
        alchemyState: {
            ...state.alchemyState,
            isBrewing: true,
            brewStartTime: Date.now(),
            brewProgress: 0
        }
    })),

    /**
     * 레거시 함수: 연금술 완료 처리용
     *
     * @deprecated 이 함수는 레거시입니다. useAlchemyStore.completeBrewing을 사용하세요.
     *
     * 주의: resources는 읽기 전용 캐시이므로, 실제 데이터는 useAlchemyStore.completeBrewing을 사용해야 함
     *
     * @param resultMonsterId - 생성된 몬스터 ID
     * @param count - 생성된 몬스터 수량
     * @param materialsUsed - 사용한 재료 목록
     */
    completeBrewing: (resultMonsterId, count, materialsUsed) => set((state) => {
        // 주의: resources는 UI 캐시이므로, 실제 데이터는 useAlchemyStore에서 관리됨
        const newResources = { ...state.resources }

        // Deduct materials (UI 캐시 업데이트)
        for (const [matId, amount] of Object.entries(materialsUsed)) {
            newResources[matId] = Math.max(0, (newResources[matId] || 0) - amount)
        }

        // Add monster (stored as resource for now) (UI 캐시 업데이트)
        newResources[resultMonsterId] = (newResources[resultMonsterId] || 0) + count

        return {
            resources: newResources,
            alchemyState: {
                ...state.alchemyState,
                isBrewing: false,
                brewStartTime: null,
                brewProgress: 0,
                selectedIngredients: {} // Reset ingredients after brew
            }
        }
    }),

    cancelBrewing: () => set((state) => ({
        alchemyState: {
            ...state.alchemyState,
            isBrewing: false,
            brewStartTime: null,
            brewProgress: 0
        }
    })),

    // Battle Actions Implementation
    startBattle: (dungeonId, enemyId, playerMonsterId) => {
        // Find the dungeon and enemy from data
        const dungeon = DUNGEONS.find(d => d.id === dungeonId)
        if (!dungeon) {
            console.error('Dungeon not found:', dungeonId)
            return
        }

        const enemy = dungeon.enemies.find(e => e.id === enemyId)
        if (!enemy) {
            console.error('Enemy not found:', enemyId)
            return
        }

        // Get monster data if provided
        let playerHp = 100
        let playerMaxHp = 100
        let playerAtk = 10
        let playerDef = 5
        let selectedMonsterType: string | null = null

        let monsterName = '플레이어'
        let playerMonsterImage: string | undefined = undefined

        if (playerMonsterId) {
            const { playerMonsters } = useAlchemyStore.getState()
            const playerMonster = playerMonsters.find(m => m.id === playerMonsterId)

            if (playerMonster) {
                // Remove 'monster_' prefix from monster_id
                const monsterRoleId = playerMonster.monster_id.replace(/^monster_/, '')
                const monsterData = MONSTERS[monsterRoleId]

                if (monsterData) {
                    const level = playerMonster.level || 1
                    const rarity = (monsterData.rarity || 'N') as RarityType

                    const roleMap: Record<string, RoleType> = { '탱커': 'TANK', '딜러': 'DPS', '서포터': 'SUPPORT', '하이브리드': 'HYBRID', '생산': 'PRODUCTION' }
                    const role = roleMap[monsterData.role] || 'TANK'

                    // New stat calculation using utility
                    const stats = calculateStats(
                        { hp: monsterData.baseStats.hp, atk: monsterData.baseStats.atk, def: monsterData.baseStats.def },
                        level,
                        rarity
                    )

                    playerHp = stats.hp
                    playerMaxHp = stats.hp
                    playerAtk = stats.atk
                    playerDef = stats.def
                    selectedMonsterType = monsterRoleId

                    monsterName = monsterData.name
                    playerMonsterImage = monsterData.iconUrl

                    // Apply Passive Skills

                    const skills = getUnlockableSkills(monsterRoleId, role, level)
                    const passiveSkills = skills.filter((s: any) => s.type === 'PASSIVE')
                    const initialLogs = [`${monsterName}이(가) ${enemy.name}과(와)의 전투를 시작했습니다!`]

                    // Elemental Analysis Log
                    const pEl = (monsterData.element || 'EARTH').toUpperCase() as any
                    const eEl = ((enemy as any).element || 'EARTH').toUpperCase() as any
                    const pMult = getElementalMultiplier(pEl, eEl)
                    const eMult = getElementalMultiplier(eEl, pEl)

                    if (pMult > 1.0) initialLogs.push(`{{GREEN|상성 우위!}} ${monsterName}의 공격이 효과적입니다.`)
                    if (pMult < 1.0) initialLogs.push(`{{GRAY|상성 불리..}} ${monsterName}의 공격이 반감됩니다.`)
                    if (eMult > 1.0) initialLogs.push(`{{RED|위험!}} 적의 속성이 우세합니다.`)

                    passiveSkills.forEach((skill: any) => {
                        if (skill.effect.type === 'BUFF') {

                            // Getting robust:
                            if (skill.name.includes('방어') || skill.description.includes('방어')) {
                                const defBonus = Math.floor(stats.def * (skill.effect.value / 100))
                                playerDef += defBonus
                                initialLogs.push(`${skill.emoji} [${skill.name}] 효과로 방어력이 ${defBonus} 증가했습니다.`)
                            } else {
                                const atkBonus = Math.floor(stats.atk * (skill.effect.value / 100))
                                playerAtk += atkBonus
                                initialLogs.push(`${skill.emoji} [${skill.name}] 효과로 공격력이 ${atkBonus} 증가했습니다.`)
                            }
                        }
                    })

                    set({
                        activeDungeon: dungeonId,
                        battleState: {
                            isBattling: true,
                            playerHp,
                            playerMaxHp,
                            enemyId,
                            enemyHp: enemy.hp,
                            enemyMaxHp: enemy.hp,
                            enemyImage: MONSTERS[enemyId]?.iconUrl,
                            turn: 1,
                            logs: initialLogs,
                            result: null,
                            rewards: {},
                            selectedMonsterId: playerMonsterId || null,
                            selectedMonsterType,
                            playerAtk,
                            playerDef,
                            playerMonsterImage,
                            playerElement: ((selectedMonsterType ? MONSTERS[selectedMonsterType]?.element : null) || 'EARTH').toUpperCase(),
                            playerStatusEffects: [],
                            enemyAtk: enemy.attack,
                            enemyDef: enemy.defense,
                            enemyElement: ((enemy as any).element || 'EARTH').toUpperCase(),
                            enemyStatusEffects: [],
                            floatingTexts: []
                        }
                    })
                    return // Important: Return here to avoid setting state twice or using old variables
                }
            }
        }

        set({
            activeDungeon: dungeonId,
            battleState: {
                isBattling: true,
                playerHp,
                playerMaxHp,
                enemyId,
                enemyHp: enemy.hp,
                enemyMaxHp: enemy.hp,
                enemyImage: MONSTERS[enemyId]?.iconUrl,
                turn: 1,
                logs: [`${monsterName}이(가) ${enemy.name}과(와)의 전투를 시작했습니다!`],
                result: null,
                rewards: {},
                selectedMonsterId: playerMonsterId || null,
                selectedMonsterType,
                playerAtk,
                playerDef,
                playerMonsterImage,
                playerElement: ((selectedMonsterType ? MONSTERS[selectedMonsterType]?.element : null) || 'EARTH').toUpperCase(),
                playerStatusEffects: [],
                enemyAtk: enemy.attack,
                enemyDef: enemy.defense,
                enemyElement: ((enemy as any).element || 'EARTH').toUpperCase(),
                enemyStatusEffects: [],
                floatingTexts: []
            }
        })

    },

    processTurn: () => set((state) => {
        if (!state.battleState || state.battleState.result) return state

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

        // Get Unlockable Skills (Need to import this dynamically or move logic here to avoid circular dependencies if possible, 
        // but importing from data/monsterSkillData should be fine as it's just data/utils)

        const skills = (selectedMonster && monsterData)
            ? getUnlockableSkills(selectedMonsterType!, role, currentLevel)
            : []

        const activeSkills = skills.filter((s: any) => s.type === 'ACTIVE')

        // Skill Activation Logic (30% Chance)
        let skillLog: string | null = null
        let skillBonusDmg = 0
        let skillHeal = 0
        let skillBuffValue = 0 // Adds to ATK for this turn

        const canTriggerSkill = activeSkills.length > 0 && Math.random() < 0.3

        if (canTriggerSkill) {
            const skill = activeSkills[Math.floor(Math.random() * activeSkills.length)]

            // Skill Effect
            if (skill.effect.type === 'DAMAGE') {
                // value is percentage (e.g., 120 -> 1.2x damage)
                skillBonusDmg = Math.floor(playerAtk * (skill.effect.value / 100))
                skillLog = `${skill.emoji} [${skill.name}] 발동! 강력한 일격!`
            } else if (skill.effect.type === 'HEAL') {
                // value is percentage of Max HP
                skillHeal = Math.floor(playerMaxHp * (skill.effect.value / 100))
                skillLog = `${skill.emoji} [${skill.name}] 발동! 체력을 ${skillHeal} 회복했습니다.`
            } else if (skill.effect.type === 'BUFF') {
                // value is percentage increase
                skillBuffValue = Math.floor(playerAtk * (skill.effect.value / 100))
                skillLog = `${skill.emoji} [${skill.name}] 발동! 공격력이 증가했습니다!`
            } else if (skill.effect.type === 'DEBUFF') {
                // Simplified: Just bonus damage for now as debuffs need state
                skillBonusDmg = Math.floor(playerAtk * 0.5)
                skillLog = `${skill.emoji} [${skill.name}] 발동! 적을 약화시킵니다!`
            } else if (skill.effect.type === 'SPECIAL') {
                skillBonusDmg = Math.floor(playerAtk * 0.3)
                skillLog = `${skill.emoji} [${skill.name}] 발동! 특수 효과!`
            }
        }

        // Get enemy data for defense
        const dungeon = DUNGEONS.find(d => d.id === state.activeDungeon)
        const enemy = dungeon?.enemies.find(e => e.id === enemyId)
        // enemyDef is now from state (real-time)
        // const enemyDef = enemy?.defense || 0

        // Calculate Damage
        // --------------------------------------------------------
        // New Battle Logic using battleUtils
        // --------------------------------------------------------

        // 1. Construct Battle Entities
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
            .map(ft => ({ ...ft, life: ft.life - 1 })) // Reduce life of existing texts

        // 2. Process Status Effects (Start of Turn)
        const playerStatusResult = processStatusEffects(playerEntity)
        const enemyStatusResult = processStatusEffects(enemyEntity)

        playerEntity.statusEffects = playerStatusResult.updatedEntity.statusEffects
        enemyEntity.statusEffects = enemyStatusResult.updatedEntity.statusEffects

        // Apply DoT Damage
        if (playerStatusResult.damageTaken > 0) {
            playerEntity.hp -= playerStatusResult.damageTaken
            floatingTexts.push({
                id: `dot-player-${Date.now()}`,
                x: 0, y: 0,
                text: `-${playerStatusResult.damageTaken}`,
                color: '#a855f7', // Purple for poison/dot
                life: 30,
                target: 'PLAYER'
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
                target: 'ENEMY'
            })
        }

        newLogs.push(...playerStatusResult.logs)
        newLogs.push(...enemyStatusResult.logs)

        // Check Death from Status
        if (playerEntity.hp <= 0 || enemyEntity.hp <= 0) {
            // ... early exit handling will be done at end
        }

        // 3. Player Action
        let playerDmg = 0
        if (playerEntity.hp > 0) { // Only attack if alive
            // Calculate Damage
            const result = calculateDamage(playerEntity, enemyEntity, 100 + skillBuffValue)
            playerDmg = result.damage + skillBonusDmg

            // Apply Skill Effects (Heal, etc) is already handled in old logic variables (skillHeal)
            // But we need to integrate new status effects from skills if any.
            // For now, let's keep the random simple skills and just add specific Status Effects for testing if needed
            // Future: Map skill effects to StatusEffectType

            if (skillLog) newLogs.push(skillLog)

            let isCrit = result.isCritical
            let isWeak = result.multiplier < 1.0
            let isEffective = result.multiplier > 1.0

            // Build Log
            let logMsg = `[PLAYER]${monsterName}이(가) `
            if (isCrit) logMsg += `{{RED|치명타!}} `
            logMsg += `{{RED|${playerDmg}}}의 피해를 입혔습니다!`

            if (isEffective) logMsg += ` {{GREEN|(효과적!)}}`
            if (isWeak) logMsg += ` {{GRAY|(반감됨)}}`

            newLogs.push(logMsg)

            // Apply Damage
            enemyEntity.hp = Math.max(0, enemyEntity.hp - playerDmg)

            // Add Floating Text
            floatingTexts.push({
                id: `dmg-enemy-${Date.now()}`,
                x: 0, // Position handled by View
                y: 0,
                text: `${playerDmg}${isCrit ? '!' : ''}${isEffective ? '↑' : ''}${isWeak ? '↓' : ''}`,
                color: isCrit ? '#ef4444' : (isEffective ? '#fbbf24' : (isWeak ? '#9ca3af' : 'white')),
                life: 40,
                target: 'ENEMY'
            })
        }

        // 4. Enemy Action
        let enemyDmg = 0
        if (enemyEntity.hp > 0 && playerEntity.hp > 0) {
            const result = calculateDamage(enemyEntity, playerEntity, 100)
            enemyDmg = result.damage

            let isCrit = result.isCritical
            let isEffective = result.multiplier > 1.0
            let isWeak = result.multiplier < 1.0

            let logMsg = `[ENEMY]${enemy?.name || '적'}이(가) `
            if (isCrit) logMsg += `{{RED|강력한}} `
            logMsg += `{{RED|${enemyDmg}}}의 피해를 입혔습니다!`

            if (isEffective) logMsg += ` {{RED|(아픔!)}}`
            if (isWeak) logMsg += ` {{GRAY|(저항함)}}`

            newLogs.push(logMsg)

            playerEntity.hp = Math.max(0, playerEntity.hp - enemyDmg)

            floatingTexts.push({
                id: `dmg-player-${Date.now()}`,
                x: 0,
                y: 0,
                text: `${enemyDmg}${isCrit ? '!' : ''}`,
                color: isCrit ? '#ef4444' : (isEffective ? '#fbbf24' : 'white'),
                life: 40,
                target: 'PLAYER'
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
                target: 'PLAYER'
            })
        }

        const newEnemyHp = enemyEntity.hp
        const newPlayerHp = playerEntity.hp


        let result: 'victory' | 'defeat' | null = null
        let rewards: Record<string, number> = {}

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
                            newLogs.push(`획득 경험치: {{GREEN|${earnedExp} XP}}`)
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
                            } catch (e) {
                                console.error('Failed to update monster exp', e)
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

                    newLogs.push(`전리품: ${dropMessages}`)
                }
            }
        } else if (newPlayerHp === 0) {
            result = 'defeat'
            newLogs.push('💀 패배했습니다... 💀')
        }

        // Return new state synchronously
        return {
            battleState: {
                ...state.battleState,
                playerHp: newPlayerHp,
                enemyHp: newEnemyHp,
                logs: newLogs.slice(-50),
                turn: state.battleState.turn + 1,
                result,
                rewards,
                playerStatusEffects: playerEntity.statusEffects,
                enemyStatusEffects: enemyEntity.statusEffects,
                floatingTexts: floatingTexts
            }
        }
    }),

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
