import { supabase } from '../lib/supabase'
import { MATERIALS } from '../data/alchemyData'

// DB Enum Mappings
const RARITY_MAP: Record<string, string> = {
    'N': 'COMMON',
    'R': 'RARE',
    'SR': 'EPIC',
    'SSR': 'LEGENDARY',
    'UR': 'LEGENDARY'
}

const FAMILY_MAP: Record<string, string> = {
    'PLANT': 'PLANT',
    'MINERAL': 'MINERAL',
    'BEAST': 'BEAST',
    'SLIME': 'SLIME',
    'SPIRIT': 'SPIRIT',
    'SPECIAL': 'MINERAL' // Map SPECIAL to MINERAL as fallback, set is_special=true
}

export async function syncMaterialsToDB() {
    console.log('🔄 [Sync] Starting material synchronization...')

    const materialsToUpsert = Object.values(MATERIALS).map(mat => {
        const family = FAMILY_MAP[mat.type] || 'MINERAL'
        const rarity = RARITY_MAP[mat.rarity] || 'COMMON'
        const isSpecial = mat.type === 'SPECIAL'

        return {
            id: mat.id,
            name: mat.name,
            description: mat.description,
            family: family,
            rarity: rarity,
            icon_url: mat.iconUrl,
            is_special: isSpecial,
            updated_at: new Date().toISOString()
        }
    })

    console.log(`📦 [Sync] Prepared ${materialsToUpsert.length} materials for sync.`)

    const { data, error } = await supabase
        .from('material')
        .upsert(materialsToUpsert, { onConflict: 'id' })
        .select()

    if (error) {
        console.error('❌ [Sync] Failed to sync materials:', error)
        return { success: false, error }
    }

    console.log(`✅ [Sync] Successfully synced ${data.length} materials!`)
    return { success: true, count: data.length }
}
