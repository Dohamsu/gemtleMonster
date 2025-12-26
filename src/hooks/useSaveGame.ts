/* eslint-disable no-console */
import { useState } from 'react'
import { supabase } from '../lib/supabase'
// import { useGameStore } from '../store/useGameStore'
import { useFacilityStore } from '../store/useFacilityStore'
import { useAuth } from './useAuth'
import { useUnifiedInventory } from './useUnifiedInventory'

export function useSaveGame() {
    const { user } = useAuth()
    const { facilities } = useFacilityStore()
    const { materialCounts } = useUnifiedInventory()
    const [saving, setSaving] = useState(false)
    const [lastSaved, setLastSaved] = useState<Date | null>(null)

    const saveGame = async () => {
        if (!user) return

        setSaving(true)
        try {
            /**
             * 레거시 player_resource 테이블에 저장
             * 주의: 실제 데이터는 player_material 테이블에 저장되므로,
             * 이 함수는 레거시 호환성을 위한 것입니다.
             * TODO: 레거시 시스템 제거 시 이 함수도 제거 필요
             */
            const resourceUpdates = Object.entries(materialCounts).map(([id, amount]) => ({
                user_id: user.id,
                resource_id: id,
                amount: Math.floor(amount) // Ensure integer
            }))

            if (resourceUpdates.length > 0) {
                const { error: resError } = await supabase
                    .from('player_resource')
                    .upsert(resourceUpdates, { onConflict: 'user_id,resource_id' })

                if (resError) throw resError
            }

            // Save facilities
            const facilityUpdates = Object.entries(facilities).map(([id, level]) => ({
                user_id: user.id,
                facility_id: id,
                current_level: level
            }))

            if (facilityUpdates.length > 0) {
                const { error: facError } = await supabase
                    .from('player_facility')
                    .upsert(facilityUpdates, { onConflict: 'user_id,facility_id' })

                if (facError) throw facError
            }

            setLastSaved(new Date())
            console.log('Game saved successfully')
        } catch (error) {
            console.error('Failed to save game:', error)
        } finally {
            setSaving(false)
        }
    }

    return { saveGame, saving, lastSaved }
}
