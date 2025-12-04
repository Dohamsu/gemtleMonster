import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase URL or Service Role Key')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Read idleConst.json
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const jsonPath = path.join(__dirname, 'idleConst.json')
const idleConst = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))

async function seedMine() {
    console.log('Starting Mine facility seeding...')

    const mineData = idleConst.facilities.find((f: Record<string, unknown>) => f.id === 'mine')

    if (!mineData) {
        console.error('Mine data not found in idleConst.json')
        return
    }

    try {
        // 1. Insert Facility
        console.log('Upserting facility...')
        const { error: facilityError } = await supabase
            .from('facility')
            .upsert({
                id: mineData.id,
                name: mineData.name,
                category: mineData.category,
                config_version: idleConst.version
            })

        if (facilityError) throw facilityError

        // 2. Insert Unlock Conditions
        console.log('Upserting unlock conditions...')
        // First delete existing conditions to avoid duplicates/stale data
        await supabase.from('facility_unlock_condition').delete().eq('facility_id', mineData.id)

        for (const condition of mineData.unlockConditions) {
            const { error: conditionError } = await supabase
                .from('facility_unlock_condition')
                .insert({
                    facility_id: mineData.id,
                    condition_type: condition.type === 'playerLevel' ? 'player_level' :
                        condition.type === 'questComplete' ? 'quest_complete' :
                            condition.type === 'facilityLevel' ? 'facility_level' : condition.type,
                    min_player_level: condition.min,
                    quest_id: condition.questId,
                    required_facility_id: condition.facilityId,
                    min_facility_level: condition.min // Note: schema uses min_facility_level for facilityLevel condition too?
                    // Let's check schema again. 
                    // Schema: min_facility_level INTEGER
                    // Condition in JSON: { type: 'facilityLevel', facilityId: 'herb_farm', min: 2 }
                })

            if (conditionError) throw conditionError
        }

        // 3. Insert Levels
        console.log('Upserting levels...')
        for (const levelData of mineData.levels) {
            const { error: levelError } = await supabase
                .from('facility_level')
                .upsert({
                    facility_id: mineData.id,
                    level: levelData.level,
                    stats: levelData.stats,
                    upgrade_cost: levelData.upgradeCost
                }, { onConflict: 'facility_id,level' })

            if (levelError) throw levelError
        }

        console.log('Mine facility seeded successfully!')

    } catch (error) {
        console.error('Error seeding mine:', error)
    }
}

seedMine()
