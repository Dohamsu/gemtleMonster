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
        if (!userId) return

        const fetchData = async () => {
            // 1. Try to load from cache first
            const cachedData = localStorage.getItem('facility_master_data')
            if (cachedData) {
                try {
                    const parsed = JSON.parse(cachedData)
                    setFacilities(parsed)
                    setLoading(false) // Show cached data immediately
                } catch (e) {
                    console.error('Failed to parse cached facility data', e)
                }
            }

            // 2. Fetch fresh data (Stale-while-revalidate)
            // Fetch facility master data
            const { data: facilitiesData } = await supabase
                .from('facility')
                .select('id, name, category')

            // Fetch facility levels
            const { data: levelsData } = await supabase
                .from('facility_level')
                .select('facility_id, level, stats, upgrade_cost')

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

        // Update facility level
        const { error: facilityError } = await supabase
            .from('player_facility')
            .update({ current_level: newLevel })
            .eq('user_id', userId)
            .eq('facility_id', facilityId)

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
