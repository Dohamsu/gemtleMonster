/* eslint-disable no-console */
import { supabase } from './supabase'

export async function initializePlayer(userId: string) {
    try {
        console.log('Checking player status for:', userId)

        // Check if player already exists (use maybeSingle to avoid 406 error)
        const { data: existingProfile, error: checkError } = await supabase
            .from('player_profile')
            .select('user_id')
            .eq('user_id', userId)
            .maybeSingle()

        if (checkError) {
            console.error('Error checking player profile:', checkError)
            throw checkError
        }

        if (existingProfile) {
            console.log('Player already initialized')
            return // Player already initialized
        }

        console.log('Initializing new player:', userId)

        // Create player profile
        const { error: profileError } = await supabase.from('player_profile').insert({
            user_id: userId,
            player_level: 1,
            experience: 0,
        })

        if (profileError) {
            console.error('Error creating player profile:', profileError)
            throw profileError
        }

        // Initialize starting resources
        const { error: resourceError } = await supabase.from('player_resource').insert([
            { user_id: userId, resource_id: 'gold', amount: 1000 },
        ])

        if (resourceError) {
            console.error('Error creating player resources:', resourceError)
            throw resourceError
        }

        // Initialize starting facility (herb_farm at level 1)
        const { error: facilityError } = await supabase.from('player_facility').insert({
            user_id: userId,
            facility_id: 'herb_farm',
            current_level: 1,
        })

        if (facilityError) {
            console.error('Error creating player facility:', facilityError)
            throw facilityError
        }

        // Initialize player_alchemy (use upsert to avoid duplicate key error)
        const { error: alchemyError } = await supabase.from('player_alchemy').upsert({
            user_id: userId,
            level: 1,
            experience: 0,
            workshop_level: 1,
            global_success_bonus: 0,
            global_time_reduction: 0,
        }, { onConflict: 'user_id' })

        if (alchemyError) {
            console.error('Error creating player alchemy:', alchemyError)
            throw alchemyError
        }

        console.log('✅ Player initialized successfully')
    } catch (error) {
        console.error('Failed to initialize player:', error)
        throw error
    }
}
