/* eslint-disable no-console */
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { EQUIPMENT_DATA } from './equipmentData'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase URL or Service Role Key')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seedEquipment() {
    try {
        console.log('🛡️ 장비 데이터 시딩 시작...')
        const items = Object.values(EQUIPMENT_DATA)
        console.log(`총 ${items.length}개의 장비 데이터를 처리합니다.`)

        for (const item of items) {
            const payload = {
                id: item.id,
                name: item.name,
                description: item.description,
                slot: item.slot,
                rarity: item.rarity,
                icon_url: item.iconUrl,
                stats: item.stats,
                is_special: item.isSpecial || false
            }

            const { error } = await supabase
                .from('equipment')
                .upsert(payload, { onConflict: 'id' })

            if (error) {
                console.error(`❌ 장비 업로드 실패 (${item.name}):`, error.message)
            } else {
                console.log(`✅ ${item.name} (${item.id})`)
            }
        }

        console.log('\n🎉 장비 데이터 시딩 완료!')

    } catch (error) {
        console.error('❌ 시딩 실패:', error)
        process.exit(1)
    }
}

seedEquipment()
