import { create } from 'zustand'
import type { AlchemyState } from '../types/alchemy'
import { useAlchemyStore } from './useAlchemyStore'
import { DUNGEONS } from '../data/dungeonData'

interface ResourceAddition {
    id: string
    resourceId: string
    amount: number
    timestamp: number
    facilityKey?: string // e.g., "herb_farm-1"
}

export type Tab = 'facilities' | 'shop' | 'alchemy'
export type CanvasView = 'map' | 'alchemy_workshop' | 'shop'

interface GameState {
    player: {
        x: number
        y: number
        health: number
    }
    inventory: string[]
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
        turn: number
        logs: string[]
        result: 'victory' | 'defeat' | null
        rewards: Record<string, number>
    } | null
    startBattle: (dungeonId: string, enemyId: string) => void
    processTurn: () => void
    endBattle: () => void
}

export const useGameStore = create<GameState>((set, get) => ({
    player: { x: 0, y: 0, health: 100 },
    inventory: [],
    resources: {
        gold: 1000,
        herb_common: 10,
        slime_core: 5,
        beast_fang: 3,
        magic_ore: 2,
        spirit_dust: 2
    }, // Initial resources for testing
    facilities: { herb_farm: 1 }, // Initial facility
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

    setResources: (resources) => set({ resources }),
    setFacilities: (facilities) => set({ facilities }),

    addResources: (newResources, facilityKey) => {
        // 1. AlchemyStore와 동기화 (DB 저장용)
        const { batchSyncCallback, playerMaterials } = useAlchemyStore.getState()
        const alchemyUpdates: Record<string, number> = {}

        for (const [id, amount] of Object.entries(newResources)) {
            // 'empty'는 유효한 재료가 아니므로 제외
            if (amount > 0 && id !== 'empty') {
                // AlchemyStore 로컬 상태 업데이트 준비
                alchemyUpdates[id] = (playerMaterials[id] || 0) + amount

                // 배치 동기화 큐에 추가 (DB 저장)
                if (batchSyncCallback) {
                    batchSyncCallback(id, amount)
                }
            }
        }

        // AlchemyStore 상태 업데이트 (UI 동기화)
        if (Object.keys(alchemyUpdates).length > 0) {
            useAlchemyStore.setState(state => ({
                playerMaterials: {
                    ...state.playerMaterials,
                    ...alchemyUpdates
                }
            }))
        }

        // 2. GameStore 상태 업데이트 (기존 로직)
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

    sellResource: async (resourceId, amount, pricePerUnit) => {
        const currentState = get()
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

    upgradeFacility: (facilityId, cost) => set((state) => {
        // Check if affordable
        for (const [res, amount] of Object.entries(cost)) {
            if ((state.resources[res] || 0) < amount) {
                return state; // Not enough resources
            }
        }

        // Deduct resources
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

    completeBrewing: (resultMonsterId, count, materialsUsed) => set((state) => {
        const newResources = { ...state.resources }

        // Deduct materials
        for (const [matId, amount] of Object.entries(materialsUsed)) {
            newResources[matId] = Math.max(0, (newResources[matId] || 0) - amount)
        }

        // Add monster (stored as resource for now)
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
    startBattle: (dungeonId, enemyId) => {
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

        set({
            activeDungeon: dungeonId,
            battleState: {
                isBattling: true,
                playerHp: 100, // TODO: Get from actual player stats
                playerMaxHp: 100,
                enemyId,
                enemyHp: enemy.hp,
                enemyMaxHp: enemy.hp,
                turn: 1,
                logs: [`${enemy.name}과(와)의 전투가 시작되었습니다!`],
                result: null,
                rewards: {}
            }
        })
    },

    processTurn: () => set((state) => {
        if (!state.battleState || state.battleState.result) return state

        const { playerHp, enemyHp, logs, enemyId } = state.battleState
        const playerDmg = Math.floor(Math.random() * 10) + 5
        const enemyDmg = Math.floor(Math.random() * 8) + 3

        const newEnemyHp = Math.max(0, enemyHp - playerDmg)
        const newPlayerHp = Math.max(0, playerHp - enemyDmg)
        const newLogs = [...logs, `플레이어가 ${playerDmg}의 피해를 입혔습니다!`, `적이 ${enemyDmg}의 피해를 입혔습니다!`]

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
                        .map(([id, qty]) => `${id} x${qty}`)
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
