import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { MONSTER_DATA } from './monsterData'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase URL or Service Role Key')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seedMonsters() {
    try {
        console.log('👾 몬스터 데이터 시딩 시작...')
        const monsters = Object.entries(MONSTER_DATA)
        console.log(`총 ${monsters.length}마리의 몬스터 데이터를 처리합니다.`)

        for (const [id, data] of monsters) {
            // Map monsterData.ts format to DB schema
            const monsterPayload = {
                id: id,
                name: data.name,
                description: data.description,
                role: mapRole(data.role),
                element: (data.element || 'earth').toUpperCase(), // Default to EARTH if missing
                rarity: data.rarity || 'N',
                base_hp: data.hp,
                base_atk: data.attack,
                base_def: data.defense,
                icon_url: data.iconUrl || null,
                // Default values for fields not in monsterData.ts
                is_special: data.rarity === 'SSR' || data.rarity === 'SR'
            }

            const { error } = await supabase
                .from('monster')
                .upsert(monsterPayload, { onConflict: 'id' })

            if (error) {
                console.error(`❌ 몬스터 업로드 실패 (${data.name}):`, error.message)
            } else {
                console.log(`✅ ${data.name} (${id})`)
            }
        }

        console.log('\n🎉 몬스터 데이터 시딩 완료!')

    } catch (error) {
        console.error('❌ 시딩 실패:', error)
        process.exit(1)
    }
}

// Helper to map Korean roles to DB enum values
function mapRole(koreanRole: string): string {
    const roleMap: Record<string, string> = {
        '탱커': 'TANK',
        '딜러': 'DPS',
        '서포터': 'SUPPORT',
        '하이브리드': 'HYBRID',
        '생산': 'PRODUCTION'
    }
    return roleMap[koreanRole] || 'TANK' // Default to TANK if unknown
}

seedMonsters()
