/* eslint-disable no-console */
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { FacilityData } from '../types/idle'

interface PlayerFacility {
    facility_id: string
    current_level: number
}

export function useFacilities(userId: string | undefined) {
    const [facilities, setFacilities] = useState<FacilityData[]>([])
    const [playerFacilities, setPlayerFacilities] = useState<Record<string, number>>({})
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!userId) {
            // Reset state on logout
            setFacilities([])
            setPlayerFacilities({})
            setLoading(true)
            return
        }

        const fetchData = async () => {
            setLoading(true) // Start loading for new user

            // Clear stale cache to force fresh fetch
            localStorage.removeItem('facility_master_data')

            // 2. Fetch fresh data
            // Fetch facility master data
            const { data: facilitiesData } = await supabase
                .from('facility')
                .select('id, name, category')

            // Fetch facility levels
            const { data: levelsData } = await supabase
                .from('facility_level')
                .select('facility_id, level, name, stats, upgrade_cost')

            // Fetch player facilities
            const { data: playerFacilitiesData } = await supabase
                .from('player_facility')
                .select('facility_id, current_level')
                .eq('user_id', userId)

            // Combine data
            if (facilitiesData && levelsData) {
                const combined: FacilityData[] = facilitiesData.map(facility => ({
                    id: facility.id,
                    name: facility.name,
                    category: facility.category,
                    unlockConditions: [], // Not needed for now
                    levels: levelsData
                        .filter(l => l.facility_id === facility.id)
                        .map(l => ({
                            level: l.level,
                            name: l.name || undefined, // Level-specific name
                            stats: l.stats,
                            upgradeCost: l.upgrade_cost,
                        }))
                        .sort((a, b) => a.level - b.level),
                }))

                // Update state and cache
                setFacilities(combined)
                localStorage.setItem('facility_master_data', JSON.stringify(combined))
            }

            if (playerFacilitiesData) {
                const playerFacilityMap: Record<string, number> = {}
                playerFacilitiesData.forEach((pf: PlayerFacility) => {
                    playerFacilityMap[pf.facility_id] = pf.current_level
                })
                setPlayerFacilities(playerFacilityMap)
            }

            setLoading(false)
        }

        fetchData()
    }, [userId])

    const upgradeFacility = async (facilityId: string, cost: Record<string, number>) => {
        if (!userId) return

        const currentLevel = playerFacilities[facilityId] || 0
        const newLevel = currentLevel + 1

        // Update or insert facility level (upsert 사용 - 레코드가 없어도 생성되도록)
        const { error: facilityError } = await supabase
            .from('player_facility')
            .upsert({
                user_id: userId,
                facility_id: facilityId,
                current_level: newLevel,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id,facility_id' })

        if (facilityError) {
            console.error('Failed to upgrade facility:', facilityError)
            return
        }

        // Deduct resources
        for (const [resourceId, amount] of Object.entries(cost)) {
            await supabase.rpc('deduct_resource', {
                p_user_id: userId,
                p_resource_id: resourceId,
                p_amount: amount,
            })
        }

        // Update local state
        setPlayerFacilities(prev => ({ ...prev, [facilityId]: newLevel }))
    }

    return { facilities, playerFacilities, loading, upgradeFacility }
}
