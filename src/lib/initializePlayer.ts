import { supabase } from './supabase'

export async function initializePlayer(userId: string) {
    try {
        console.log('Checking player status for:', userId)

        // Check if player already exists
        const { data: existingProfile, error: checkError } = await supabase
            .from('player_profile')
            .select('user_id')
            .eq('user_id', userId)
            .single()

        if (checkError && checkError.code !== 'PGRST116') {
            // PGRST116 = no rows returned, which is expected for new players
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

        console.log('✅ Player initialized successfully')
    } catch (error) {
        console.error('Failed to initialize player:', error)
        throw error
    }
}

