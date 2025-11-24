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

async function checkData() {
    const { data, error } = await supabase
        .from('facility_level')
        .select('*')
        .eq('facility_id', 'herb_farm')
        .eq('level', 1)

    if (error) {
        console.error('Error fetching data:', error)
    } else {
        console.log('Herb Farm Level 1 Data:', JSON.stringify(data, null, 2))
    }
}

checkData()
