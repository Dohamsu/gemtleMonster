import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DISPATCH_REGIONS } from '../data/dispatchData'
import { MONSTER_DATA } from '../data/monsterData'
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
    maxDispatchSlots: number

    // Actions
    startDispatch: (regionId: string, monsterIds: string[], duration: number) => { success: boolean; error?: string }
    checkDispatches: () => void // Called periodically to update status
    claimDispatchRewards: (dispatchId: string) => Promise<{ success: boolean; rewards?: Record<string, number>; isGreatSuccess?: boolean }>
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
            maxDispatchSlots: 2,

            startDispatch: (regionId, monsterIds, duration) => {
                const { activeDispatches, maxDispatchSlots } = get()
                if (activeDispatches.length >= maxDispatchSlots) {
                    return { success: false, error: `파견 슬롯이 부족합니다. (${activeDispatches.length}/${maxDispatchSlots})` }
                }

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

                // Great Success Logic is calculated below


                // ... Implementation detail: will add import at top later via separate chunk or rely on existing import if any (none yet).
                // Let's assume we will add import.

                /* 
                   We need to refactor this block carefully. 
                   I will insert the MONSTER_DATA import in a separate tool call or a separate chunk if possible? 
                   MultiReplace supports multiple chunks.
                */

                // Let's put the logic here assuming MONSTER_DATA will be available.

                // (This validation is tricky without MONSTER_DATA import. I should have added it. 
                // I will add it in the next step or try to add it now if I can verify it exists.)
                // I see I only read lines 1-177. No MONSTER_DATA import.

                // Okay, I'll add the logic but comment out the MONSTER_DATA part or better, 
                // I will use a simple heuristic or I MUST import it.
                // I will check `monsterData.ts` path: `../data/monsterData`.

                // Let's continue with logic assuming I will add the import in the 3rd chunk.

                // Logic using imported MONSTER_DATA


                const totalLevel = dispatchedMonsters.reduce((sum, m) => sum + m.level, 0)
                const luckFactor = 1 + (totalLevel * 0.01)

                const acquiredItems: Record<string, number> = {}

                let isGreatSuccess = false
                let greatSuccessChance = 0.05
                const regionElement = region.element

                if (regionElement) {
                    const hasElementMatch = dispatchedMonsters.some(pm => {
                        const mData = MONSTER_DATA[pm.monster_id]
                        return mData?.element?.toUpperCase() === regionElement.toUpperCase()
                    })
                    if (hasElementMatch) greatSuccessChance += 0.10
                }

                if (Math.random() < greatSuccessChance) {
                    isGreatSuccess = true
                }

                region.rewards.forEach(rewardTable => {
                    if (Math.random() <= rewardTable.chance * luckFactor) {
                        let amount = Math.floor(Math.random() * (rewardTable.max - rewardTable.min + 1)) + rewardTable.min
                        if (isGreatSuccess) {
                            amount = Math.floor(amount * 1.5)
                            if (amount < 1) amount = 1
                        }

                        if (amount > 0) {
                            acquiredItems[rewardTable.materialId] = (acquiredItems[rewardTable.materialId] || 0) + amount
                        }
                    }
                })

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

                return { success: true, rewards: acquiredItems, isGreatSuccess }
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
                maxDispatchSlots: state.maxDispatchSlots,
                // Do not persist completed history indefinitely to save space
            })
        }
    )
)
