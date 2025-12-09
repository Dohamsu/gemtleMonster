/* eslint-disable no-console */
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase URL or Service Role Key')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function unlockMonsterFarm() {
    console.log('🔓 Unlocking Monster Farm for all users...')

    try {
        // Get all users from player_profile
        const { data: profiles, error: profileError } = await supabase
            .from('player_profile')
            .select('user_id')

        if (profileError) {
            throw profileError
        }

        console.log(`Found ${profiles.length} profiles. Checking facilities...`)

        let unlockedCount = 0

        for (const profile of profiles) {
            // Check if user already has monster_farm
            const { data: existing } = await supabase
                .from('player_facility')
                .select('facility_id')
                .eq('user_id', profile.user_id)
                .eq('facility_id', 'monster_farm')
                .single()

            if (!existing) {
                // Insert monster_farm
                const { error: insertError } = await supabase
                    .from('player_facility')
                    .insert({
                        user_id: profile.user_id,
                        facility_id: 'monster_farm',
                        current_level: 1
                    })

                if (insertError) {
                    console.error(`Failed to unlock for ${profile.user_id}:`, insertError)
                } else {
                    unlockedCount++
                }
            }
        }

        console.log(`✅ Successfully unlocked Monster Farm for ${unlockedCount} users.`)

    } catch (error) {
        console.error('Unlock failed:', error)
    }
}

unlockMonsterFarm()
