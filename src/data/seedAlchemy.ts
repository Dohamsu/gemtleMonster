/* eslint-disable no-console */
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { getAlchemyDataForDB } from './alchemyData'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase URL or Service Role Key')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// 타입은 alchemyData.ts에서 가져온 데이터를 사용하므로 별도 정의 불필요

async function seedAlchemy() {
    try {
        // TypeScript 파일에서 직접 데이터 가져오기
        const data = getAlchemyDataForDB()

        console.log('🧪 연금술 시스템 데이터 시딩 시작...')
        console.log(`버전: ${data.version}`)
        console.log(`재료 수: ${data.materials.length}`)
        console.log(`레시피 수: ${data.recipes.length}`)

        // 1. 재료(Material) 시딩
        console.log('\n📦 재료 데이터 업로드 중...')

        // 1-0. 로컬에 없는 재료 DB에서 삭제 (Cleanup)
        const localMaterialIds = data.materials.map(m => m.id)
        const { data: existingMaterials, error: fetchError } = await supabase
            .from('material')
            .select('id, name')

        if (fetchError) {
            console.error('⚠️ 기존 재료 조회 실패:', fetchError.message)
        } else if (existingMaterials) {
            const orphanedMaterials = existingMaterials.filter(m => !localMaterialIds.includes(m.id))
            if (orphanedMaterials.length > 0) {
                console.log(`\n🗑️ 로컬에 없는 재료 ${orphanedMaterials.length}개 삭제 중...`)
                for (const orphan of orphanedMaterials) {
                    const { error: deleteError } = await supabase
                        .from('material')
                        .delete()
                        .eq('id', orphan.id)

                    if (deleteError) {
                        console.error(`  ❌ 삭제 실패 (${orphan.id}):`, deleteError.message)
                    } else {
                        console.log(`  🗑️ ${orphan.name} (${orphan.id}) 삭제됨`)
                    }
                }
                console.log('')
            }
        }

        // 1-1. 재료 upsert
        for (const material of data.materials) {
            const { error: materialError } = await supabase
                .from('material')
                .upsert({
                    id: material.id,
                    name: material.name,
                    description: material.description || null,
                    family: material.family,
                    rarity: material.rarity,
                    icon_url: material.icon_url || null,
                    sell_price: material.sellPrice || 0,
                    source_info: material.source_info || null,
                    is_special: material.is_special
                }, { onConflict: 'id' })

            if (materialError) {
                console.error(`❌ 재료 업로드 실패 (${material.id}):`, materialError.message)
            } else {
                console.log(`✅ ${material.name} (${material.id})`)
            }
        }

        // 2. 레시피(Recipe) 시딩
        console.log('\n📜 레시피 데이터 업로드 중...')

        // 2-0. 로컬에 없는 레시피 DB에서 삭제 (Cleanup)
        const localRecipeIds = data.recipes.map(r => r.id)
        const { data: existingRecipes, error: fetchRecipeError } = await supabase
            .from('recipe')
            .select('id, name')

        if (fetchRecipeError) {
            console.error('⚠️ 기존 레시피 조회 실패:', fetchRecipeError.message)
        } else if (existingRecipes) {
            const orphanedRecipes = existingRecipes.filter(r => !localRecipeIds.includes(r.id))
            if (orphanedRecipes.length > 0) {
                console.log(`\n🗑️ 로컬에 없는 레시피 ${orphanedRecipes.length}개 삭제 중...`)
                for (const orphan of orphanedRecipes) {
                    // 레시피 삭제 전에 연관된 ingredient, condition 먼저 삭제
                    await supabase.from('recipe_ingredient').delete().eq('recipe_id', orphan.id)
                    await supabase.from('recipe_condition').delete().eq('recipe_id', orphan.id)

                    const { error: deleteError } = await supabase
                        .from('recipe')
                        .delete()
                        .eq('id', orphan.id)

                    if (deleteError) {
                        console.error(`  ❌ 삭제 실패 (${orphan.id}):`, deleteError.message)
                    } else {
                        console.log(`  🗑️ ${orphan.name} (${orphan.id}) 삭제됨`)
                    }
                }
                console.log('')
            }
        }

        for (const recipe of data.recipes) {
            // 2-1. Recipe 기본 정보 업로드
            const { error: recipeError } = await supabase
                .from('recipe')
                .upsert({
                    id: recipe.id,
                    name: recipe.name,
                    description: recipe.description || null,
                    result_monster_id: recipe.resultMonsterId,
                    result_count: recipe.resultCount,
                    base_success_rate: recipe.baseSuccessRate,
                    craft_time_sec: recipe.craftTimeSec,
                    cost_gold: recipe.costGold,
                    required_alchemy_level: recipe.requiredAlchemyLevel,
                    exp_gain: recipe.expGain,
                    is_hidden: recipe.isHidden,
                    priority: recipe.priority
                }, { onConflict: 'id' })

            if (recipeError) {
                console.error(`❌ 레시피 업로드 실패 (${recipe.id}):`, recipeError.message)
                continue
            }

            console.log(`✅ ${recipe.name} (${recipe.id})`)

            // 2-2. Recipe Ingredients 업로드 (기존 데이터 삭제 후 재생성)
            await supabase.from('recipe_ingredient').delete().eq('recipe_id', recipe.id)

            if (recipe.ingredients && recipe.ingredients.length > 0) {
                const ingredients = recipe.ingredients.map((ing) => ({
                    recipe_id: recipe.id,
                    material_id: ing.materialId,
                    quantity: ing.quantity,
                    is_catalyst: ing.isCatalyst
                }))

                const { error: ingredientError } = await supabase
                    .from('recipe_ingredient')
                    .insert(ingredients)

                if (ingredientError) {
                    console.error(`  ⚠️ 재료 목록 업로드 실패:`, ingredientError.message)
                } else {
                    console.log(`  ✓ 재료 ${ingredients.length}개 등록`)
                }
            }

            // 2-3. Recipe Conditions 업로드 (기존 데이터 삭제 후 재생성)
            await supabase.from('recipe_condition').delete().eq('recipe_id', recipe.id)

            if (recipe.conditions && recipe.conditions.length > 0) {
                const conditions = recipe.conditions
                    .filter(c => ['time_range', 'language'].includes(c.conditionType))
                    .map((cond) => {
                        const mapped: Record<string, unknown> = {
                            recipe_id: recipe.id,
                            condition_type: cond.conditionType
                        }

                        if (cond.conditionType === 'time_range') {
                            mapped.time_start = cond.timeStart
                            mapped.time_end = cond.timeEnd
                        } else if (cond.conditionType === 'language') {
                            mapped.language_code = cond.languageCode
                        }

                        return mapped
                    })

                const { error: conditionError } = await supabase
                    .from('recipe_condition')
                    .insert(conditions)

                if (conditionError) {
                    console.error(`  ⚠️ 조건 업로드 실패:`, conditionError.message)
                } else {
                    console.log(`  ✓ 특수 조건 ${conditions.length}개 등록`)
                }
            }
        }

        console.log('\n🎉 연금술 데이터 시딩 완료!')
        console.log(`\n📊 요약:`)
        console.log(`  - 재료: ${data.materials.length}개`)
        console.log(`  - 레시피: ${data.recipes.length}개`)
        console.log(`  - 기본 레시피: ${data.recipes.filter(r => !r.isHidden).length}개`)
        console.log(`  - 숨겨진 레시피: ${data.recipes.filter(r => r.isHidden).length}개`)

    } catch (error) {
        console.error('❌ 시딩 실패:', error)
        process.exit(1)
    }
}

seedAlchemy()
