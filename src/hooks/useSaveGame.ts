import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useGameStore } from '../store/useGameStore'
import { useAuth } from './useAuth'

export function useSaveGame() {
    const { user } = useAuth()
    const { resources, facilities } = useGameStore()
    const [saving, setSaving] = useState(false)
    const [lastSaved, setLastSaved] = useState<Date | null>(null)

    const saveGame = async () => {
        if (!user) return

        setSaving(true)
        try {
            // Save resources
            const resourceUpdates = Object.entries(resources).map(([id, amount]) => ({
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
