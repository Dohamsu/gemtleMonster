import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useDispatchStore } from '../store/useDispatchStore'
import { useAlchemyStore } from '../store/useAlchemyStore'
import { DISPATCH_REGIONS } from '../data/dispatchData'

describe('useDispatchStore', () => {
    beforeEach(() => {
        // Reset stores
        useDispatchStore.setState({ activeDispatches: [], completedDispatches: [] })
        useAlchemyStore.setState({
            playerMonsters: [
                { id: 'm1', monster_id: 'slime', level: 1, exp: 0, created_at: '', is_locked: false, awakening_level: 0 },
                { id: 'm2', monster_id: 'wolf', level: 5, exp: 0, created_at: '', is_locked: false, awakening_level: 0 }
            ],
            playerMaterials: {}
        })
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('should successfully start a dispatch', () => {
        const { startDispatch } = useDispatchStore.getState()

        const regionId = DISPATCH_REGIONS[0].id
        const duration = 300 // 5 min

        const result = startDispatch(regionId, ['m1'], duration)

        expect(result.success).toBe(true)

        // Re-fetch state to check updates
        const { activeDispatches } = useDispatchStore.getState()
        expect(activeDispatches.length).toBe(1)
        expect(activeDispatches[0].regionId).toBe(regionId)
        expect(activeDispatches[0].monsterIds).toEqual(['m1'])
        expect(activeDispatches[0].status).toBe('ongoing')
    })

    it('should fail to start dispatch if region is invalid', () => {
        const { startDispatch } = useDispatchStore.getState()
        const result = startDispatch('invalid_region', ['m1'], 300)
        expect(result.success).toBe(false)
        expect(result.error).toContain('존재하지 않는 지역')
    })

    it('should fail to start dispatch if monster is invalid', () => {
        const { startDispatch } = useDispatchStore.getState()
        const result = startDispatch(DISPATCH_REGIONS[0].id, ['invalid_m'], 300)
        expect(result.success).toBe(false)
        expect(result.error).toContain('유효하지 않은 몬스터')
    })

    it('should fail to start dispatch if monster is already dispatched', () => {
        const { startDispatch } = useDispatchStore.getState()
        const regionId = DISPATCH_REGIONS[0].id

        startDispatch(regionId, ['m1'], 300)
        const result = startDispatch(regionId, ['m1'], 300)

        expect(result.success).toBe(false)
        expect(result.error).toContain('이미 파견 중')
    })

    it('should complete dispatch after duration passes', () => {
        const { startDispatch, checkDispatches } = useDispatchStore.getState()
        const regionId = DISPATCH_REGIONS[0].id
        const duration = 300

        startDispatch(regionId, ['m1'], duration)

        // Fast forward time
        vi.advanceTimersByTime(duration * 1000 + 100)

        checkDispatches()

        const { activeDispatches } = useDispatchStore.getState()
        expect(activeDispatches[0].status).toBe('completed')
    })

    it('should claim rewards correctly', async () => {
        const { startDispatch, checkDispatches, claimDispatchRewards } = useDispatchStore.getState()
        const regionId = DISPATCH_REGIONS[0].id
        const duration = 300

        startDispatch(regionId, ['m1'], duration)
        const dispatchId = useDispatchStore.getState().activeDispatches[0].id

        vi.advanceTimersByTime(duration * 1000 + 100)
        checkDispatches()

        const result = await claimDispatchRewards(dispatchId)

        expect(result.success).toBe(true)
        expect(result.rewards).toBeDefined()

        // Check if dispatch moved to completed/history and removed from active
        const { activeDispatches, completedDispatches } = useDispatchStore.getState()
        expect(activeDispatches.find(d => d.id === dispatchId)).toBeUndefined()
        expect(completedDispatches.find(d => d.id === dispatchId)?.status).toBe('claimed')
    })

    it('isMonsterDispatched should return correct status', () => {
        const { startDispatch } = useDispatchStore.getState()
        const regionId = DISPATCH_REGIONS[0].id

        expect(useDispatchStore.getState().isMonsterDispatched('m1')).toBe(false)

        startDispatch(regionId, ['m1'], 300)

        expect(useDispatchStore.getState().isMonsterDispatched('m1')).toBe(true)
        expect(useDispatchStore.getState().isMonsterDispatched('m2')).toBe(false)
    })
})
