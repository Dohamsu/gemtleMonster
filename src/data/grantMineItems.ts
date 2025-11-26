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

async function grantMineItems() {
    console.log('Granting mine items to all users...')

    const { data: profiles, error: profileError } = await supabase
        .from('player_profile')
        .select('user_id')

    if (profileError || !profiles) {
        console.error('Error fetching profiles:', profileError)
        return
    }

    const items = ['ore_iron', 'ore_magic', 'gem_fragment', 'crack_stone_fragment', 'ancient_relic_fragment']

    for (const profile of profiles) {
        for (const item of items) {
            const { error } = await supabase
                .from('player_resource')
                .upsert({
                    user_id: profile.user_id,
                    resource_id: item,
                    amount: 10,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id,resource_id' })

            if (error) console.error(`Failed to grant ${item} to ${profile.user_id}:`, error)
        }
        console.log(`Granted items to ${profile.user_id}`)
    }
}

grantMineItems()
