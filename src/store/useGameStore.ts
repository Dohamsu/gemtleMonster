import { create } from 'zustand'
import type { AlchemyState } from '../types/alchemy'
import { useAlchemyStore } from './useAlchemyStore'
import { MATERIALS } from '../data/alchemyData'
import { DUNGEONS } from '../data/dungeonData'
import { GAME_MONSTERS as MONSTERS } from '../data/monsterData'

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
    upgradeFacility: (facilityId: string, cost: Record<string, number>) => void
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
    battleState: {
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
    } | null
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

                    // Auto-remove after 2 seconds with cleanup tracking
                    const timer = setTimeout(() => {
                        set((s) => ({
                            recentAdditions: s.recentAdditions.filter(a => a.id !== additionId)
                        }))
                    }, 2000)
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
     * 주의: resources는 읽기 전용 캐시이므로, 실제 검증은 playerMaterials를 사용해야 함
     * TODO: useAlchemyStore.sellMaterial을 사용하도록 마이그레이션 권장
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

    /**
     * 레거시 함수: 시설 업그레이드용
     * 주의: resources는 읽기 전용 캐시이므로, 실제 검증은 playerMaterials를 사용해야 함
     * TODO: useUnifiedInventory.materialCounts를 사용하도록 마이그레이션 권장
     */
    upgradeFacility: (facilityId, cost) => set((state) => {
        // 주의: resources는 UI 캐시이므로, 실제 검증은 playerMaterials를 사용해야 함
        // Check if affordable
        for (const [res, amount] of Object.entries(cost)) {
            if ((state.resources[res] || 0) < amount) {
                return state; // Not enough resources
            }
        }

        // Deduct resources (UI 캐시 업데이트)
        const newResources = { ...state.resources };
        for (const [res, amount] of Object.entries(cost)) {
            newResources[res] -= amount;
        }

        return {
            resources: newResources,
            facilities: {
                ...state.facilities,
                [facilityId]: (state.facilities[facilityId] || 0) + 1
            }
        };
    }),

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
     * 주의: resources는 읽기 전용 캐시이므로, 실제 데이터는 useAlchemyStore.completeBrewing을 사용해야 함
     * TODO: useAlchemyStore.completeBrewing을 사용하도록 마이그레이션 권장
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
                    playerHp = monsterData.baseStats.hp
                    playerMaxHp = monsterData.baseStats.hp
                    playerAtk = monsterData.baseStats.atk
                    playerDef = monsterData.baseStats.def
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
                for (const drop of enemy.drops) {
                    const roll = Math.random() * 100
                    if (roll < drop.chance) {
                        const quantity = Math.floor(
                            Math.random() * (drop.maxQuantity - drop.minQuantity + 1) + drop.minQuantity
                        )
                        rewards[drop.materialId] = (rewards[drop.materialId] || 0) + quantity
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
