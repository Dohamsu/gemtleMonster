import { useState, useEffect } from 'react'
import type { FacilityData } from '../../types/idle'
import { useGameStore } from '../../store/useGameStore'
import { useAlchemyStore } from '../../store/useAlchemyStore'
import { MONSTER_DATA } from '../../data/monsterData'
import { MATERIALS } from '../../data/alchemyData'
import MonsterAssignmentModal from './MonsterAssignmentModal'
import FacilityIcon from '../FacilityIcon'
import ResourceIcon from '../ResourceIcon'

interface FacilityControlPanelProps {
    facility: FacilityData
    currentLevel: number
    onUpgrade: (facilityId: string, cost: Record<string, number>) => Promise<void>
}

export default function FacilityControlPanel({ facility, currentLevel, onUpgrade }: FacilityControlPanelProps) {
    const { assignedMonsters, assignMonster, resources, lastCollectedAt } = useGameStore()
    const { playerMonsters, playerMaterials } = useAlchemyStore()
    const [showMonsterModal, setShowMonsterModal] = useState(false)
    const [progress, setProgress] = useState(0)

    const levelData = facility.levels.find(l => l.level === currentLevel)
    const nextLevelData = facility.levels.find(l => l.level === currentLevel + 1)

    const assignedPlayerMonsterId = assignedMonsters[facility.id]
    const assignedPlayerMonster = playerMonsters.find(m => m.id === assignedPlayerMonsterId)
    const monsterData = assignedPlayerMonster ? MONSTER_DATA[assignedPlayerMonster.monster_id] : null

    // Calculate Bonuses
    let bonusSpeed = 0
    let bonusAmount = 0
    if (monsterData?.factoryTrait && monsterData.factoryTrait.targetFacility === facility.id) {
        if (monsterData.factoryTrait.effect.includes('속도')) {
            bonusSpeed = monsterData.factoryTrait.value
        } else if (monsterData.factoryTrait.effect === '생산량 증가') {
            bonusAmount = monsterData.factoryTrait.value
        }
    }

    // Effect for progress bar
    useEffect(() => {
        if (!levelData?.stats?.intervalSeconds) {
            setProgress(0)
            return
        }

        const interval = setInterval(() => {
            const lastTime = lastCollectedAt[`${facility.id}-${currentLevel}`]
            if (!lastTime) {
                setProgress(0)
                return
            }

            const intervalSec = levelData.stats.intervalSeconds * (1 - bonusSpeed / 100)
            const elapsed = (Date.now() - lastTime) / 1000
            const p = Math.min(100, (elapsed % intervalSec) / intervalSec * 100)
            setProgress(p)
        }, 100)

        return () => clearInterval(interval)
    }, [facility.id, currentLevel, levelData?.stats?.intervalSeconds, lastCollectedAt, bonusSpeed])

    const canUpgrade = nextLevelData && Object.entries(nextLevelData.upgradeCost).every(([resId, amount]) => {
        const owned = (resources[resId] ?? playerMaterials[resId] ?? 0)
        return owned >= amount
    })

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', maxWidth: '900px', margin: '0 auto' }}>
            {/* Facility Info Header */}
            <div style={{ background: '#2a1810', border: '2px solid #5a4030', borderRadius: '12px', padding: '25px', boxShadow: '0 8px 16px rgba(0,0,0,0.4)', display: 'flex', gap: '20px', alignItems: 'center' }}>
                <div style={{
                    width: '100px',
                    height: '100px',
                    background: '#1a0f0a',
                    borderRadius: '12px',
                    border: '1px solid #5a4030',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    flexShrink: 0
                }}>
                    <FacilityIcon id={facility.id} level={currentLevel} size={80} />
                </div>

                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '2em', color: '#facc15' }}>{facility.name} <span style={{ fontSize: '0.5em', color: '#b0a090', verticalAlign: 'middle' }}>Lv.{currentLevel}</span></h2>
                            <p style={{ margin: '5px 0 0 0', color: '#d0c0b0', fontStyle: 'italic' }}>&quot;{levelData?.name || facility.name}&quot;</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.8em', color: '#b0a090' }}>실시간 생산 현황</div>
                            <div style={{ fontSize: '1.2em', fontWeight: 'bold', color: '#f0d090' }}>{Math.floor(progress)}%</div>
                        </div>
                    </div>

                    {/* Main Progress Bar */}
                    <div style={{ width: '100%', height: '10px', background: '#1a0f0a', borderRadius: '5px', overflow: 'hidden', border: '1px solid #3d2b20' }}>
                        <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, #facc15, #eab308)', boxShadow: '0 0 10px #facc1555', transition: 'width 0.1s linear' }} />
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {/* Production Stats Panel */}
                <div style={{ background: '#2a1810', border: '1px solid #5a4030', borderRadius: '8px', padding: '20px' }}>
                    <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1em', color: '#f0d090', borderBottom: '1px solid #3d2b20', paddingBottom: '10px' }}>생산 효율 정보</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <StatRow label="기본 생산 간격" value={`${levelData?.stats?.intervalSeconds || 0}초`} />
                        <StatRow label="몬스터 가속" value={`-${bonusSpeed}%`} color="#4ade80" />
                        <StatRow label="최종 생산 간격" value={`${((levelData?.stats?.intervalSeconds || 0) * (1 - bonusSpeed / 100)).toFixed(1)}초`} color="#facc15" />
                        <div style={{ height: '1px', background: '#3d2b20', margin: '5px 0' }} />
                        <StatRow label="기본 생산량" value={`x${levelData?.stats?.bundlesPerTick || 0}`} />
                        <StatRow label="몬스터 보너스" value={`+${bonusAmount}%`} color="#4ade80" />
                    </div>
                </div>

                {/* Monster Slot Panel */}
                <div
                    onClick={() => setShowMonsterModal(true)}
                    style={{
                        background: '#231610',
                        border: assignedPlayerMonster ? '1px solid #facc15' : '1px dashed #5a4030',
                        borderRadius: '8px',
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#2a1c15'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#231610'}
                >
                    {assignedPlayerMonster ? (
                        <>
                            <div style={{ fontSize: '3em', marginBottom: '10px' }}>{monsterData?.emoji}</div>
                            <div style={{ color: '#facc15', fontWeight: 'bold' }}>{monsterData?.name}</div>
                            <div style={{ fontSize: '0.8em', color: '#4ade80', marginTop: '5px' }}>
                                {monsterData?.factoryTrait?.effect} +{monsterData?.factoryTrait?.value}%
                            </div>
                            <div style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '0.7em', color: '#b0a090' }}>교체하기</div>
                        </>
                    ) : (
                        <>
                            <div style={{ fontSize: '2.5em', color: '#5a4030', marginBottom: '10px' }}>➕</div>
                            <div style={{ color: '#5a4030', fontWeight: 'bold' }}>몬스터 배치하기</div>
                            <div style={{ fontSize: '0.8em', color: '#5a4030', marginTop: '5px' }}>생산 보너스를 받으세요</div>
                        </>
                    )}
                </div>
            </div>

            {/* Upgrade Section */}
            <div style={{ background: '#2a1810', border: '2px solid #5a4030', borderRadius: '12px', padding: '25px' }}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '1.2em' }}>시설 강화 (Next Lv.{currentLevel + 1})</h3>

                {nextLevelData ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '15px' }}>
                            {Object.entries(nextLevelData.upgradeCost).map(([resId, amount]) => {
                                const owned = (resources[resId] ?? playerMaterials[resId] ?? 0)
                                const enough = owned >= amount
                                return (
                                    <div key={resId} style={{ background: '#1a0f0a', padding: '10px', borderRadius: '6px', border: `1px solid ${enough ? '#3d2b20' : '#ef4444'}`, display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <div style={{ width: '32px', height: '32px', background: '#231610', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                            <ResourceIcon resourceId={resId} size={28} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '0.7em', color: '#b0a090' }}>{resId === 'gold' ? '골드(Gold)' : (MATERIALS[resId]?.name || resId.toUpperCase())}</div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontWeight: 'bold', color: enough ? '#f0d090' : '#ef4444' }}>{amount.toLocaleString()}</span>
                                                <span style={{ fontSize: '0.7em', color: '#888' }}>({owned.toLocaleString()})</span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        <button
                            disabled={!canUpgrade}
                            onClick={() => onUpgrade(facility.id, nextLevelData.upgradeCost)}
                            style={{
                                width: '100%',
                                padding: '15px',
                                background: canUpgrade ? 'linear-gradient(135deg, #5a4030 0%, #3d2b20 100%)' : '#231610',
                                color: canUpgrade ? '#facc15' : '#5a4030',
                                border: canUpgrade ? '2px solid #facc15' : '2px solid #3d2b20',
                                borderRadius: '8px',
                                fontSize: '1.1em',
                                fontWeight: 'bold',
                                cursor: canUpgrade ? 'pointer' : 'not-allowed',
                                boxShadow: canUpgrade ? '0 4px 15px rgba(250, 204, 21, 0.2)' : 'none',
                                transition: 'all 0.2s'
                            }}
                        >
                            {canUpgrade ? '✨ 시설 레벨업 ✨' : '자원이 부족합니다'}
                        </button>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#b0a090' }}>최대 레벨에 도달했습니다</div>
                )}
            </div>

            {/* Monster Selection Modal */}
            {showMonsterModal && (
                <MonsterAssignmentModal
                    facilityId={facility.id}
                    onClose={() => setShowMonsterModal(false)}
                    onAssign={(monsterId: string | null) => {
                        assignMonster(facility.id, monsterId)
                        setShowMonsterModal(false)
                    }}
                />
            )}
        </div>
    )
}

function StatRow({ label, value, color = '#f0d090' }: { label: string, value: string, color?: string }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9em', color: '#b0a090' }}>{label}</span>
            <span style={{ fontWeight: 'bold', color }}>{value}</span>
        </div>
    )
}
