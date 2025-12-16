/* eslint-disable no-console */
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { MATERIALS } from './alchemyData'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase URL or Service Role Key')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seedMaterials() {
    console.log('Seeding materials...')

    const materials = Object.values(MATERIALS).map(m => ({
        id: m.id,
        name: m.name,
        type: m.type, // Note: DB might use 'family' or 'type', need to check schema. alchemyData uses 'type' but InventoryPanel uses 'family'.
        description: m.description,
        rarity: m.rarity,
        icon_url: m.iconUrl
    }))

    // Check DB schema for 'type' vs 'family'
    // Based on InventoryPanel.tsx: material.family
    // Based on alchemyData.ts: type: 'PLANT' etc.
    // Let's assume the DB column is 'family' based on typical mapping, or 'type'.
    // Actually, let's check the error if it fails, or check schema first.
    // But for now, I'll map 'type' to 'family' if needed.

    const rarityMap: Record<string, string> = {
        'N': 'COMMON',
        'R': 'RARE',
        'SR': 'EPIC',
        'SSR': 'LEGENDARY',
        'UR': 'LEGENDARY'
    }

    const familyMap: Record<string, string> = {
        'PLANT': 'PLANT',
        'MINERAL': 'MINERAL',
        'BEAST': 'BEAST',
        'SLIME': 'SLIME',
        'SPIRIT': 'SPIRIT',
        'SPECIAL': 'MINERAL',
        'CONSUMABLE': 'CONSUMABLE' // Now correctly mapped
    }

    // Let's try to upsert.

    for (const material of materials) {
        const rarity = rarityMap[material.rarity] || 'COMMON'
        const family = familyMap[material.type] || material.type

        const { error } = await supabase
            .from('material')
            .upsert({
                id: material.id,
                name: material.name,
                family: family,
                description: material.description,
                rarity: rarity,
                icon_url: material.icon_url
            }, { onConflict: 'id' })

        if (error) {
            console.error(`Failed to upsert ${material.id}:`, error)
        } else {
            console.log(`Upserted ${material.id}`)
        }
    }
}

seedMaterials()
