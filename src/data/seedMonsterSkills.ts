/* eslint-disable no-console */
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { ROLE_SKILLS, MONSTER_UNIQUE_SKILLS } from './monsterSkillData'
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

async function seedSkills() {
    try {
        console.log('⚡ 스킬 데이터 시딩 시작...')
        let totalCount = 0

        // 1. Role Skills
        console.log('🛡️ 역할(Role) 스킬 처리 중...')
        for (const [role, skills] of Object.entries(ROLE_SKILLS)) {
            for (const skill of skills) {
                const { error } = await supabase
                    .from('monster_skill')
                    .upsert({
                        id: skill.id,
                        name: skill.name,
                        description: skill.description,
                        unlock_level: skill.unlockLevel,
                        skill_type: skill.type,
                        effect_type: skill.effect.type,
                        effect_value: skill.effect.value,
                        effect_target: skill.effect.target,
                        cooldown: skill.cooldown,
                        emoji: skill.emoji,
                        role: role,
                        monster_id: null // Role skill
                    }, { onConflict: 'id' })

                if (error) console.error(`Failed to upsert role skill ${skill.name}:`, error.message)
                else totalCount++
            }
        }

        // 2. Unique Skills
        console.log('👾 몬스터 고유 스킬 처리 중...')

        // Iterate MONSTER_DATA to guarantee valid FKs
        for (const [fullMonsterId, data] of Object.entries(MONSTER_DATA)) {
            const shortId = fullMonsterId.replace(/^monster_/, '')
            const uniqueSkills = MONSTER_UNIQUE_SKILLS[shortId]

            if (uniqueSkills && uniqueSkills.length > 0) {
                for (const skill of uniqueSkills) {
                    const { error } = await supabase
                        .from('monster_skill')
                        .upsert({
                            id: skill.id,
                            name: skill.name,
                            description: skill.description,
                            unlock_level: skill.unlockLevel,
                            skill_type: skill.type,
                            effect_type: skill.effect.type,
                            effect_value: skill.effect.value,
                            effect_target: skill.effect.target,
                            cooldown: skill.cooldown,
                            emoji: skill.emoji,
                            role: null, // Unique skill
                            monster_id: fullMonsterId
                        }, { onConflict: 'id' })

                    if (error) console.error(`Failed to upsert unique skill ${skill.name} for ${data.name}:`, error.message)
                    else totalCount++
                }
            }
        }

        console.log(`\n🎉 스킬 데이터 시딩 완료! 총 ${totalCount}개 스킬 처리됨.`)

    } catch (error) {
        console.error('❌ 시딩 실패:', error)
        process.exit(1)
    }
}

seedSkills()
