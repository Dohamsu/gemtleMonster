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

async function unlockMine() {
    console.log('Unlocking Mine for all users...')

    // 1. Get all user IDs from player_profile
    const { data: profiles, error: profileError } = await supabase
        .from('player_profile')
        .select('user_id')

    if (profileError) {
        console.error('Error fetching profiles:', profileError)
        return
    }

    if (!profiles || profiles.length === 0) {
        console.log('No users found.')
        return
    }

    console.log(`Found ${profiles.length} users. Granting Mine facility...`)

    for (const profile of profiles) {
        const { error: insertError } = await supabase
            .from('player_facility')
            .upsert({
                user_id: profile.user_id,
                facility_id: 'mine',
                current_level: 3,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id,facility_id' })

        if (insertError) {
            console.error(`Failed to unlock mine for user ${profile.user_id}:`, insertError)
        } else {
            console.log(`Unlocked mine for user ${profile.user_id}`)
        }
    }

    console.log('Unlock process complete.')
}

unlockMine()
