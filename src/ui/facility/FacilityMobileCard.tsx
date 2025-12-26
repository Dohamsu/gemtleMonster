import { MONSTER_DATA } from '../../data/monsterData'
import type { PlayerMonster, MonsterFactoryTrait } from '../../types/monster'
import type { FacilityData } from '../../types/facility'
import FacilityIcon from '../FacilityIcon'
import { useCollectionProgress } from '../../hooks/useCollectionProgress'
import { calculateFacilityBonus } from '../../utils/facilityUtils'

import { useFacilityStore } from '../../store/useFacilityStore'

interface FacilityMobileCardProps {
    facility: FacilityData
    level: number
    lastCollectedAt: Record<string, number>
    assignedMonsters: Record<string, (string | null)[]>
    playerMonsters: PlayerMonster[]
    onClick: () => void
}

export default function FacilityMobileCard({
    facility,
    level,
    lastCollectedAt,
    assignedMonsters,
    playerMonsters,
    onClick
}: FacilityMobileCardProps) {
    const { productionModes } = useFacilityStore()
    const levelData = facility.levels.find((l) => l.level === level)

    const currentModeLevel = productionModes[facility.id] || level
    const modeLevelData = facility.levels.find(l => l.level === currentModeLevel)

    // Calculate Bonuses from assigned monsters
    const currentAssignments = assignedMonsters[facility.id]
    const activeTraits: MonsterFactoryTrait[] = []

    if (Array.isArray(currentAssignments)) {
        currentAssignments.forEach(mId => {
            if (!mId) return
            const pm = playerMonsters.find(m => m.id === mId)
            if (pm) {
                const mData = MONSTER_DATA[pm.monster_id]
                if (mData?.factoryTrait && mData.factoryTrait.targetFacility === facility.id) {
                    activeTraits.push(mData.factoryTrait)
                }
            }
        })
    }

    let { speed: bonusSpeed } = calculateFacilityBonus(activeTraits)

    if (bonusSpeed > 90) bonusSpeed = 90

    // Stats Calculation
    // Interval depends on Facility Level (higher is faster)
    const intervalSeconds = (levelData?.stats?.intervalSeconds || 1) * (1 - bonusSpeed / 100)

    // Bundles/Drop depends on Production Mode (what we are making)
    const bundlesPerTick = modeLevelData?.stats?.bundlesPerTick || levelData?.stats?.bundlesPerTick || 0

    const collectionKey = `${facility.id}-${level}`
    const lastCollected = lastCollectedAt[collectionKey] || 0

    // Progress
    const progress = useCollectionProgress(facility.id, intervalSeconds, lastCollected)

    const prodRate = bundlesPerTick > 0
        ? `${bundlesPerTick}개 / ${intervalSeconds.toFixed(1)}초`
        : 'Inactive'

    return (
        <div
            onClick={onClick}
            style={{
                position: 'relative',
                background: level > 0 ? '#1e1912' : 'rgba(30, 25, 18, 0.7)',
                border: '1px solid #494122',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
                opacity: level > 0 ? 1 : 0.7,
                overflow: 'hidden'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '40px', height: '40px', background: '#1a1612', border: '1px solid #494122',
                        borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
                    }}>
                        <FacilityIcon id={facility.id} level={level} size={32} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <h4 style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold', margin: 0 }}>{facility.name}</h4>
                        {level > 0 ? (
                            <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                                <span style={{
                                    background: '#494122', color: '#f7ca18', fontSize: '10px',
                                    padding: '2px 6px', borderRadius: '4px', border: '1px solid #695d30', fontWeight: 'bold'
                                }}>LVL {level}</span>
                            </div>
                        ) : (
                            <span style={{ color: '#7a7a7a', fontSize: '10px', marginTop: '4px' }}>Not Constructed</span>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {level > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                            <div style={{
                                background: '#2a1810', color: '#ccc08f', fontSize: '12px',
                                padding: '4px 8px', borderRadius: '12px', border: '1px solid #494122',
                                display: 'flex', alignItems: 'center', gap: '4px'
                            }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                                    {facility.id === 'mine' ? 'payments' :
                                        facility.id === 'herb_farm' ? 'forest' :
                                            facility.id === 'blacksmith' ? 'handyman' : 'landscape'}
                                </span>
                                {prodRate}
                            </div>
                            {/* Standalone Progress Bar */}
                            <div style={{ width: '80%', height: '4px', background: '#1a1612', borderRadius: '2px', overflow: 'hidden', border: '1px solid rgba(73, 65, 34, 0.5)' }}>
                                <div style={{
                                    height: '100%', width: `${progress}%`,
                                    background: 'linear-gradient(90deg, #facc15, #eab308)',
                                    transition: 'width 0.1s linear'
                                }} />
                            </div>
                        </div>
                    ) : (
                        <div style={{
                            background: '#2a1810', color: '#7a7a7a', fontSize: '12px',
                            padding: '4px 8px', borderRadius: '12px', border: '1px solid #494122',
                            display: 'flex', alignItems: 'center', gap: '4px'
                        }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>lock</span>
                            Inactive
                        </div>
                    )}
                    <span className="material-symbols-outlined" style={{ color: '#f0d090', fontSize: '18px' }}>chevron_right</span>
                </div>
            </div>
        </div>
    )
}
