import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase URL or Service Role Key')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// 개별 재료별 가격 설정
const MATERIAL_PRICES: Record<string, number> = {
    // COMMON (10-20G)
    'herb_common': 10,
    'ore_iron': 10,
    'beast_fang': 12,
    'slime_core': 15,
    'slime_gel': 15,

    // UNCOMMON (30-50G)
    'mushroom_blue': 35,
    'crystal_mana': 40,
    'claw_sharp': 35,
    'hide_tough': 35,
    'spirit_dust': 45,

    // RARE (80-150G)
    'herb_rare': 100,
    'seed_ancient': 120,
    'ore_mythril': 150,
    'slime_mutant': 130,
    'soul_fragment': 140,

    // EPIC (200-400G)
    'herb_special': 300,
    'gem_dark': 350,
    'crown_fragment': 320,
    'essence_light': 380,

    // LEGENDARY (1000G+)
    'bone_dragon': 1500
}

async function addSellPriceColumn() {
    console.log('🔧 material 테이블에 sell_price 컬럼 추가 중...')

    // Note: ALTER TABLE은 Supabase SQL Editor에서 직접 실행해야 합니다.
    console.log('ℹ️  다음 SQL을 Supabase SQL Editor에서 실행하세요:')
    console.log('ALTER TABLE material ADD COLUMN IF NOT EXISTS sell_price INTEGER NOT NULL DEFAULT 0 CHECK (sell_price >= 0);')
    console.log('')
}

async function updateMaterialPrices() {
    console.log('💰 재료 판매 가격 업데이트 시작...\n')

    try {
        // 1. 모든 재료 가져오기
        const { data: materials, error: fetchError } = await supabase
            .from('material')
            .select('id, name, rarity')

        if (fetchError) {
            console.error('❌ 재료 목록 가져오기 실패:', fetchError)
            return
        }

        if (!materials || materials.length === 0) {
            console.error('❌ 재료가 없습니다.')
            return
        }

        console.log(`📦 총 ${materials.length}개 재료 발견\n`)

        // 2. 각 재료의 가격 업데이트
        let successCount = 0
        let errorCount = 0

        for (const material of materials) {
            const sellPrice = MATERIAL_PRICES[material.id]

            if (sellPrice === undefined) {
                console.warn(`⚠️  ${material.name} (${material.id}): 가격 미정의, 기본값 사용`)
                continue
            }

            const { error: updateError } = await supabase
                .from('material')
                .update({ sell_price: sellPrice })
                .eq('id', material.id)

            if (updateError) {
                console.error(`❌ ${material.name} (${material.id}): 업데이트 실패`, updateError.message)
                errorCount++
            } else {
                console.log(`✅ ${material.name} (${material.id}): ${sellPrice}G`)
                successCount++
            }
        }

        console.log('\n📊 업데이트 결과:')
        console.log(`  ✅ 성공: ${successCount}개`)
        console.log(`  ❌ 실패: ${errorCount}개`)

        // 3. 결과 확인
        console.log('\n🔍 가격이 설정된 재료 목록:')
        const { data: updatedMaterials, error: verifyError } = await supabase
            .from('material')
            .select('id, name, rarity, sell_price')
            .order('sell_price', { ascending: false })

        if (verifyError) {
            console.error('❌ 검증 실패:', verifyError)
            return
        }

        if (updatedMaterials) {
            console.log('\n희귀도별 가격 분포:')
            const byRarity: Record<string, any[]> = {}
            updatedMaterials.forEach(m => {
                if (!byRarity[m.rarity]) byRarity[m.rarity] = []
                byRarity[m.rarity].push(m)
            })

            Object.entries(byRarity).forEach(([rarity, items]) => {
                console.log(`\n${rarity}:`)
                items.forEach(item => {
                    console.log(`  - ${item.name}: ${item.sell_price}G`)
                })
            })
        }

        console.log('\n✨ 재료 가격 업데이트 완료!')
    } catch (error) {
        console.error('❌ 업데이트 실패:', error)
        process.exit(1)
    }
}

async function main() {
    await addSellPriceColumn()
    console.log('⏳ 3초 후 가격 업데이트를 시작합니다...\n')
    await new Promise(resolve => setTimeout(resolve, 3000))
    await updateMaterialPrices()
}

main()
