import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DISPATCH_REGIONS } from '../data/dispatchData'
import { useAlchemyStore } from './useAlchemyStore'

export interface DispatchMission {
    id: string
    regionId: string
    monsterIds: string[]
    startTime: number
    duration: number // seconds
    endTime: number
    status: 'ongoing' | 'completed' | 'claimed'
    rewards?: { materialId: string; quantity: number }[]
    logs?: string[]
}

interface DispatchState {
    activeDispatches: DispatchMission[]
    completedDispatches: DispatchMission[] // History? Or just keep in active until claimed

    // Actions
    startDispatch: (regionId: string, monsterIds: string[], duration: number) => { success: boolean; error?: string }
    checkDispatches: () => void // Called periodically to update status
    claimDispatchRewards: (dispatchId: string) => Promise<{ success: boolean; rewards?: Record<string, number> }>
    cancelDispatch: (dispatchId: string) => void

    // Helpers
    getAvailableMonsters: () => string[] // IDs of monsters NOT dispatched
    isMonsterDispatched: (monsterId: string) => boolean
}

export const useDispatchStore = create<DispatchState>()(
    persist(
        (set, get) => ({
            activeDispatches: [],
            completedDispatches: [],

            startDispatch: (regionId, monsterIds, duration) => {
                const region = DISPATCH_REGIONS.find(r => r.id === regionId)
                if (!region) return { success: false, error: '존재하지 않는 지역입니다.' }

                // Check dependencies
                const { playerMonsters } = useAlchemyStore.getState()
                const validMonsters = monsterIds.filter(id => playerMonsters.find(pm => pm.id === id))
                if (validMonsters.length === 0) return { success: false, error: '유효하지 않은 몬스터입니다.' }

                // Check if already dispatched
                const currentDispatched = get().activeDispatches.flatMap(d => d.monsterIds)
                if (monsterIds.some(id => currentDispatched.includes(id))) {
                    return { success: false, error: '이미 파견 중인 몬스터가 포함되어 있습니다.' }
                }

                const now = Date.now()
                const newDispatch: DispatchMission = {
                    id: `dispatch_${now}_${Math.random().toString(36).substr(2, 9)}`,
                    regionId,
                    monsterIds: validMonsters,
                    startTime: now,
                    duration,
                    endTime: now + (duration * 1000),
                    status: 'ongoing'
                }

                set(state => ({
                    activeDispatches: [...state.activeDispatches, newDispatch]
                }))

                return { success: true }
            },

            checkDispatches: () => {
                const now = Date.now()
                set(state => {
                    const updated = state.activeDispatches.map(dispatch => {
                        if (dispatch.status === 'ongoing' && now >= dispatch.endTime) {
                            return { ...dispatch, status: 'completed' as const }
                        }
                        return dispatch
                    })

                    // Only update if changes
                    if (JSON.stringify(updated) !== JSON.stringify(state.activeDispatches)) {
                        return { activeDispatches: updated }
                    }
                    return {}
                })
            },

            claimDispatchRewards: async (dispatchId) => {
                const dispatch = get().activeDispatches.find(d => d.id === dispatchId)
                if (!dispatch) return { success: false }
                if (dispatch.status === 'ongoing') {
                    // Check if actually done (in case checkDispatch wasn't called)
                    if (Date.now() < dispatch.endTime) return { success: false }
                    // If time passed but status not updated, proceed as completed
                }

                const region = DISPATCH_REGIONS.find(r => r.id === dispatch.regionId)
                if (!region) return { success: false }

                // Calculate Rewards
                // Logic: Iterate reward table. 
                // Bonuses: Monster level, attributes? For now simple implementation.

                const { playerMonsters } = useAlchemyStore.getState()
                const dispatchedMonsters = playerMonsters.filter(pm => dispatch.monsterIds.includes(pm.id))

                // Total Level Bonus
                const totalLevel = dispatchedMonsters.reduce((sum, m) => sum + m.level, 0)
                const luckFactor = 1 + (totalLevel * 0.01) // 1% bonus per level total

                const acquiredItems: Record<string, number> = {}

                region.rewards.forEach(rewardTable => {
                    if (Math.random() <= rewardTable.chance * luckFactor) {
                        const amount = Math.floor(Math.random() * (rewardTable.max - rewardTable.min + 1)) + rewardTable.min
                        if (amount > 0) {
                            acquiredItems[rewardTable.materialId] = (acquiredItems[rewardTable.materialId] || 0) + amount
                        }
                    }
                })

                // Add to inventory
                // Add to inventory
                const { addMaterials } = useAlchemyStore.getState()

                if (addMaterials) {
                    await addMaterials(acquiredItems)
                } else {
                    const currentMaterials = useAlchemyStore.getState().playerMaterials
                    const newMaterials = { ...currentMaterials }

                    Object.entries(acquiredItems).forEach(([matId, qty]) => {
                        newMaterials[matId] = (newMaterials[matId] || 0) + qty
                    })

                    useAlchemyStore.setState({ playerMaterials: newMaterials })
                }

                // Remove from active list
                set(state => ({
                    activeDispatches: state.activeDispatches.filter(d => d.id !== dispatchId),
                    completedDispatches: [...state.completedDispatches, { ...dispatch, status: 'claimed' }]
                }))

                return { success: true, rewards: acquiredItems }
            },

            cancelDispatch: (dispatchId) => {
                set(state => ({
                    activeDispatches: state.activeDispatches.filter(d => d.id !== dispatchId)
                }))
            },

            getAvailableMonsters: () => {
                const { playerMonsters } = useAlchemyStore.getState()
                const dispatchedIds = get().activeDispatches.flatMap(d => d.monsterIds)
                return playerMonsters
                    .filter(pm => !dispatchedIds.includes(pm.id))
                    .map(pm => pm.id)
            },

            isMonsterDispatched: (monsterId) => {
                return get().activeDispatches.some(d => d.monsterIds.includes(monsterId))
            }
        }),
        {
            name: 'dispatch-storage',
            partialize: (state) => ({
                activeDispatches: state.activeDispatches,
                // Do not persist completed history indefinitely to save space
            })
        }
    )
)
