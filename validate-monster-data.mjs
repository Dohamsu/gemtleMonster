// Monster Data Consistency Validation Script
import { MONSTER_DATA } from './src/data/monsterData'
import { MONSTER_UNIQUE_SKILLS } from './src/data/monsterSkillData'

console.log('🔍 Validating Monster Data Consistency...\n')

// Extract monster IDs from both sources
const monsterDataIds = Object.keys(MONSTER_DATA).map(id => id.replace(/^monster_/, ''))
const skillDataIds = Object.keys(MONSTER_UNIQUE_SKILLS)

// Find mismatches
const monstersWithoutSkills = monsterDataIds.filter(id => !skillDataIds.includes(id))
const skillsWithoutMonsters = skillDataIds.filter(id => !monsterDataIds.includes(id))

console.log('📊 Statistics:')
console.log(`  Total Monsters in monsterData.ts: ${monsterDataIds.length}`)
console.log(`  Total Monsters in skillData: ${skillDataIds.length}`)
console.log('')

if (monstersWithoutSkills.length > 0) {
    console.log('⚠️  Monsters WITHOUT skill definitions:')
    monstersWithoutSkills.forEach(id => {
        const fullId = `monster_${id}`
        const monster = MONSTER_DATA[fullId]
        console.log(`  - ${id} (${monster?.name || 'Unknown'})`)
    })
    console.log('')
}

if (skillsWithoutMonsters.length > 0) {
    console.log('⚠️  Skill definitions WITHOUT monster data:')
    skillsWithoutMonsters.forEach(id => {
        console.log(`  - ${id}`)
    })
    console.log('')
}

if (monstersWithoutSkills.length === 0 && skillsWithoutMonsters.length === 0) {
    console.log('✅ All monster IDs are perfectly matched!')
} else {
    console.log(`❌ Found ${monstersWithoutSkills.length + skillsWithoutMonsters.length} mismatches`)
}

console.log('\n📋 Full ID Mapping:')
console.log('Monster Data ID → Skill Data ID')
monsterDataIds.slice(0, 10).forEach(id => {
    const hasSkill = skillDataIds.includes(id) ? '✅' : '❌'
    console.log(`  monster_${id} → ${id} ${hasSkill}`)
})
if (monsterDataIds.length > 10) {
    console.log(`  ... and ${monsterDataIds.length - 10} more`)
}
