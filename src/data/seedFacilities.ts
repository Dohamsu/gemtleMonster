/* eslint-disable no-console */
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

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const idleConstPath = path.join(__dirname, 'idleConst.json')

async function seedFacilities() {
    try {
        const rawData = fs.readFileSync(idleConstPath, 'utf-8')
        const data = JSON.parse(rawData)
        const facilities = data.facilities

        console.log(`Found ${facilities.length} facilities to seed...`)

        for (const facility of facilities) {
            console.log(`Processing ${facility.name} (${facility.id})...`)

            // 1. Upsert Facility
            const { error: facilityError } = await supabase
                .from('facility')
                .upsert({
                    id: facility.id,
                    name: facility.name,
                    category: facility.category,
                    config_version: data.version
                }, { onConflict: 'id' })

            if (facilityError) {
                console.error(`Error upserting facility ${facility.id}:`, facilityError)
                continue
            }

            // 2. Upsert Unlock Conditions
            // First delete existing conditions to avoid duplicates/stale data
            await supabase.from('facility_unlock_condition').delete().eq('facility_id', facility.id)

            if (facility.unlockConditions && facility.unlockConditions.length > 0) {
                const conditions = facility.unlockConditions.map((cond: Record<string, unknown>) => {
                    const mapped: Record<string, unknown> = {
                        facility_id: facility.id,
                        condition_type: cond.type === 'playerLevel' ? 'player_level' :
                            cond.type === 'questComplete' ? 'quest_complete' :
                                cond.type === 'facilityLevel' ? 'facility_level' : cond.type
                    }

                    if (cond.type === 'playerLevel') {
                        mapped.min_player_level = cond.min
                    } else if (cond.type === 'questComplete') {
                        mapped.quest_id = cond.questId
                    } else if (cond.type === 'facilityLevel') {
                        mapped.required_facility_id = cond.facilityId
                        mapped.min_facility_level = cond.min
                    }
                    return mapped
                })

                const { error: condError } = await supabase
                    .from('facility_unlock_condition')
                    .insert(conditions)

                if (condError) {
                    console.error(`Error inserting conditions for ${facility.id}:`, condError)
                }
            }

            // 3. Upsert Levels
            for (const level of facility.levels) {
                console.log(`  > Seeding level ${level.level}, name: "${level.name || '(no name)'}"`)

                const { error: levelError } = await supabase
                    .from('facility_level')
                    .upsert({
                        facility_id: facility.id,
                        level: level.level,
                        name: level.name || null, // Level-specific name (e.g., "Copper Mine")
                        stats: level.stats,
                        upgrade_cost: level.upgradeCost
                    }, { onConflict: 'facility_id, level' })

                if (levelError) {
                    console.error(`  ❌ Error upserting level ${level.level} for ${facility.id}:`, levelError)
                } else {
                    console.log(`  ✅ Level ${level.level} upserted successfully`)
                }
            }
        }

        console.log('✅ Seeding completed successfully!')
    } catch (error) {
        console.error('Seeding failed:', error)
    }
}

seedFacilities()
