import { create } from 'zustand'
import type { BattleState } from '../types'
import type { AlchemyState } from '../types/alchemy'
import { useAlchemyStore } from './useAlchemyStore'
import { MATERIALS } from '../data/alchemyData'
import { DUNGEONS } from '../data/dungeonData'
import { GAME_MONSTERS as MONSTERS } from '../data/monsterData'
import { ALCHEMY } from '../constants/game'

interface ResourceAddition {
    id: string
    resourceId: string
    amount: number
    timestamp: number
    facilityKey?: string // e.g., "herb_farm-1"
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

            // 3. Update local state
            set((state) => {
                const newResources = { ...state.resources }
                for (const [res, amount] of Object.entries(cost)) {
                    newResources[res] = (newResources[res] || 0) - amount
                }

                const newLevel = (state.facilities[facilityId] || 0) + 1

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
                const monsterKey = playerMonster.monster_id.replace('monster_', '')
                const monsterData = MONSTERS[monsterKey]

                if (monsterData) {
                    // Level scaling: 10% increase per level
                    const level = playerMonster.level || 1
                    const multiplier = 1 + (level - 1) * 0.1

                    playerHp = Math.floor(monsterData.baseStats.hp * multiplier)
                    playerMaxHp = playerHp
                    playerAtk = Math.floor(monsterData.baseStats.atk * multiplier)
                    playerDef = Math.floor(monsterData.baseStats.def * multiplier)
                    selectedMonsterType = monsterKey

                    monsterName = monsterData.name
                    playerMonsterImage = monsterData.iconUrl
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
                playerMonsterImage
            }
        })
    },

    processTurn: () => set((state) => {
        if (!state.battleState || state.battleState.result) return state

        const { playerHp, enemyHp, logs, enemyId, playerAtk, playerDef, selectedMonsterType } = state.battleState

        // Get monster name for logs
        const monsterData = selectedMonsterType ? MONSTERS[selectedMonsterType] : null
        const monsterName = monsterData?.name || '플레이어'

        // Get enemy data for defense
        const dungeon = DUNGEONS.find(d => d.id === state.activeDungeon)
        const enemy = dungeon?.enemies.find(e => e.id === enemyId)
        const enemyDef = enemy?.defense || 0

        // Calculate damage with stats and randomness
        const basePlayerDmg = playerAtk + Math.floor(Math.random() * 6) - 3 // atk ± 3
        const playerDmg = Math.max(1, basePlayerDmg - enemyDef) // Apply enemy defense

        const baseEnemyDmg = (enemy?.attack || 5) + Math.floor(Math.random() * 6) - 3
        const enemyDmg = Math.max(1, baseEnemyDmg - playerDef) // Apply player defense

        const newEnemyHp = Math.max(0, enemyHp - playerDmg)
        const newPlayerHp = Math.max(0, playerHp - enemyDmg)
        const newLogs = [...logs, `${monsterName}이(가) ${playerDmg}의 피해를 입혔습니다!`, `${enemy?.name || '적'}이(가) ${enemyDmg}의 피해를 입혔습니다!`]

        let result: 'victory' | 'defeat' | null = null
        let rewards: Record<string, number> = {}

        if (newEnemyHp === 0) {
            result = 'victory'

            // Calculate drops on victory
            const dungeon = DUNGEONS.find(d => d.id === state.activeDungeon)
            const enemy = dungeon?.enemies.find(e => e.id === enemyId)

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

                // Monster EXP Logic
                const { selectedMonsterId } = state.battleState
                const userId = useAlchemyStore.getState().userId

                if (selectedMonsterId && userId) {
                    const { playerMonsters } = useAlchemyStore.getState()
                    const playerMonster = playerMonsters.find(m => m.id === selectedMonsterId)

                    if (playerMonster) {
                        const earnedExp = enemy.exp
                        newLogs.push(`획득 경험치: ${earnedExp} XP`)

                        // Update DB and Local State (Async)
                        import('../lib/monsterApi').then(async ({ updateMonsterExp }) => {
                            try {
                                const { level, leveledUp } = await updateMonsterExp(
                                    userId,
                                    selectedMonsterId,
                                    playerMonster.level,
                                    playerMonster.exp,
                                    earnedExp
                                )

                                if (leveledUp) {
                                    // Use a callback or store action to push log if possible, 
                                    // but state might have changed. Ideally logs should be updated here.
                                    // For now, we will just update the playerMonsters list.
                                    useGameStore.setState(s => {
                                        if (s.battleState && s.battleState.isBattling) {
                                            return {
                                                battleState: {
                                                    ...s.battleState,
                                                    logs: [...s.battleState.logs, `🎉 레벨 업! Lv.${level} 달성!`]
                                                }
                                            }
                                        }
                                        return s
                                    })
                                }

                                // Reload monsters to update UI
                                await useAlchemyStore.getState().loadPlayerMonsters(userId)
                            } catch (e) {
                                console.error('Failed to update monster exp', e)
                            }
                        })
                    }
                }

                // Add drop messages to logs
                if (Object.keys(rewards).length > 0) {
                    const dropMessages = Object.entries(rewards)
                        .map(([id, qty]) => {
                            const materialName = MATERIALS[id]?.name || id
                            return `${materialName} x${qty}`
                        })
                        .join(', ')
                    newLogs.push(`전리품: ${dropMessages}`)
                }
            }
        } else if (newPlayerHp === 0) {
            result = 'defeat'
        }

        if (result) {
            newLogs.push(result === 'victory' ? '승리했습니다!' : '패배했습니다...')
        }

        return {
            battleState: {
                ...state.battleState,
                playerHp: newPlayerHp,
                enemyHp: newEnemyHp,
                logs: newLogs.slice(-6), // Keep last 6 logs to show drops
                turn: state.battleState.turn + 1,
                result,
                rewards
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
