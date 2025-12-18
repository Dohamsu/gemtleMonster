import { useState, useEffect } from 'react'
import { useGameStore } from '../../store/useGameStore'
import { useAlchemyStore } from '../../store/useAlchemyStore'
import { MONSTER_DATA } from '../../data/monsterData'
import FacilityIcon from '../FacilityIcon'
import ResourceIcon from '../ResourceIcon'
import MonsterAssignmentModal from './MonsterAssignmentModal'
import type { FacilityData } from '../../types/facility'

interface FacilityDetailModalProps {
    facility: FacilityData
    currentLevel: number
    onClose: () => void
    onUpgrade: (id: string, cost: Record<string, number>) => Promise<void>
}

export default function FacilityDetailModal({
    facility,
    currentLevel,
    onClose,
    onUpgrade
}: FacilityDetailModalProps) {
    const { assignedMonsters, assignMonster, resources } = useGameStore()
    const { playerMonsters, playerMaterials } = useAlchemyStore()
    const [showMonsterModal, setShowMonsterModal] = useState(false)
    const [progress, setProgress] = useState(0)

    const levelData = facility.levels.find((l) => l.level === currentLevel)
    const nextLevelData = facility.levels.find((l) => l.level === currentLevel + 1)

    const selectedFacilityAssignment = assignedMonsters[facility.id]
    const assignedPlayerMonster = selectedFacilityAssignment ? playerMonsters.find(pm => pm.id === selectedFacilityAssignment) : null
    const monsterData = assignedPlayerMonster ? MONSTER_DATA[assignedPlayerMonster.monster_id] : null

    const bonusSpeed = (assignedPlayerMonster?.level && monsterData?.factoryTrait?.value) ? monsterData.factoryTrait.value : 0

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => (prev >= 100 ? 0 : prev + 1))
        }, 100)
        return () => clearInterval(interval)
    }, [])

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            alignItems: 'flex-end',
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(4px)'
        }}>
            <div style={{
                width: '100%',
                maxHeight: '90vh',
                background: '#1a1612',
                borderTop: '2px solid #facc15',
                borderRadius: '24px 24px 0 0',
                display: 'flex',
                flexDirection: 'column',
                overflowY: 'auto',
                boxShadow: '0 -10px 30px rgba(0,0,0,0.5)',
                padding: '24px 16px 40px 16px'
            }}>
                {/* Modal Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <div style={{
                            width: '64px', height: '64px', background: '#231f10', border: '1px solid #494122',
                            borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
                        }}>
                            <FacilityIcon id={facility.id} level={currentLevel} size={48} />
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '24px', color: '#facc15' }}>{facility.name}</h2>
                            <span style={{ fontSize: '12px', color: '#b0a090', fontWeight: 'bold' }}>LVL {currentLevel}</span>
                        </div>
                    </div>
                    <button onClick={onClose} style={{
                        width: '32px', height: '32px', borderRadius: '50%', background: '#231f10', border: '1px solid #494122',
                        color: '#7a7a7a', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Production Overview */}
                <div style={{
                    background: 'rgba(42, 24, 16, 0.4)', borderRadius: '16px', border: '1px solid #494122',
                    padding: '16px', marginBottom: '20px', backdropFilter: 'blur(4px)'
                }}>
                    <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#f0d090', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#f7ca18' }}>precision_manufacturing</span>
                        Production Overview
                    </h3>
                    <div style={{ marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <span style={{ fontSize: '12px', color: '#f0d090' }}>Current Batch</span>
                            <span style={{ fontSize: '10px', color: '#7a7a7a' }}>Processing...</span>
                        </div>
                        <div style={{ width: '100%', height: '12px', background: '#1a1612', borderRadius: '6px', border: '1px solid rgba(73, 65, 34, 0.5)', overflow: 'hidden' }}>
                            <div style={{
                                width: `${progress}%`, height: '100%',
                                background: 'linear-gradient(90deg, #facc15, #eab308)',
                                boxShadow: '0 0 10px rgba(247, 202, 24, 0.4)',
                                transition: 'width 0.1s linear'
                            }} />
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div style={{ background: '#231f10', padding: '10px', borderRadius: '8px', border: '1px solid rgba(73, 65, 34, 0.5)' }}>
                            <span style={{ fontSize: '10px', color: '#7a7a7a', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Output</span>
                            <div style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#facc15' }}>payments</span>
                                {levelData?.stats?.bundlesPerTick || 0} / tick
                            </div>
                        </div>
                        <div style={{ background: '#231f10', padding: '10px', borderRadius: '8px', border: '1px solid rgba(73, 65, 34, 0.5)' }}>
                            <span style={{ fontSize: '10px', color: '#7a7a7a', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Interval</span>
                            <div style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#facc15' }}>timer</span>
                                {((levelData?.stats?.intervalSeconds || 0) * (1 - bonusSpeed / 100)).toFixed(1)}s
                            </div>
                        </div>
                    </div>
                </div>

                {/* Workforce Allocation */}
                <div style={{
                    background: 'rgba(42, 24, 16, 0.4)', borderRadius: '16px', border: '1px solid #494122',
                    padding: '16px', marginBottom: '20px'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid rgba(73, 65, 34, 0.5)', paddingBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#f0d090' }}>badge</span>
                            <h3 style={{ margin: 0, fontSize: '14px', color: '#f0d090' }}>Workforce Allocation</h3>
                        </div>
                        <div style={{ fontSize: '10px', color: '#f7ca18', background: '#2a1810', padding: '2px 8px', borderRadius: '4px', border: '1px solid #432a1e' }}>
                            {assignedPlayerMonster ? '1 / 1 Slots' : '0 / 1 Slots'}
                        </div>
                    </div>

                    <div
                        onClick={() => setShowMonsterModal(true)}
                        style={{
                            background: '#231f10',
                            border: assignedPlayerMonster ? '1px solid #facc15' : '1px dashed #494122',
                            borderRadius: '12px',
                            padding: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            cursor: 'pointer'
                        }}
                    >
                        {assignedPlayerMonster ? (
                            <>
                                <div style={{
                                    width: '32px', height: '32px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: '#15120e', borderRadius: '4px', border: '1px solid #3a2e18',
                                    fontSize: '20px', overflow: 'hidden'
                                }}>
                                    {monsterData?.iconUrl ? (
                                        <img src={monsterData.iconUrl} alt={monsterData.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                    ) : (
                                        monsterData?.emoji
                                    )}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ color: '#f0d090', fontSize: '14px', fontWeight: 'bold' }}>{monsterData?.name}</div>
                                    <div style={{ color: '#4ade80', fontSize: '10px' }}>{monsterData?.factoryTrait?.effect} +{monsterData?.factoryTrait?.value}%</div>
                                </div>
                                <span className="material-symbols-outlined" style={{ color: '#7a7a7a', fontSize: '18px' }}>sync</span>
                            </>
                        ) : (
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#494122' }}>
                                <span className="material-symbols-outlined">add_circle</span>
                                <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Assign Specialist</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Upgrade Costs */}
                <div style={{
                    background: 'rgba(42, 24, 16, 0.4)', borderRadius: '16px', border: '1px solid #494122',
                    padding: '16px'
                }}>
                    <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#f0d090', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#ef4444' }}>upgrade</span>
                        Upgrade Requirements
                    </h3>
                    {nextLevelData ? (
                        <>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                                {Object.entries(nextLevelData.upgradeCost).map(([resId, amount]) => {
                                    const owned = (resources[resId] ?? playerMaterials[resId] ?? 0)
                                    const enough = owned >= (amount as number)
                                    return (
                                        <div key={resId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <ResourceIcon resourceId={resId} size={20} />
                                                <span style={{ fontSize: '12px', color: '#fff' }}>{(amount as number).toLocaleString()}</span>
                                            </div>
                                            <span style={{ fontSize: '10px', color: enough ? '#0bda1d' : '#ef4444', fontWeight: 'bold' }}>
                                                {enough ? 'OK' : `Missing ${((amount as number) - owned).toLocaleString()}`}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                            <button
                                onClick={() => onUpgrade(facility.id, nextLevelData.upgradeCost)}
                                disabled={!Object.entries(nextLevelData.upgradeCost).every(([resId, amount]) => (resources[resId] ?? playerMaterials[resId] ?? 0) >= (amount as number))}
                                style={{
                                    width: '100%', height: '48px', borderRadius: '8px',
                                    background: Object.entries(nextLevelData.upgradeCost).every(([resId, amount]) => (resources[resId] ?? playerMaterials[resId] ?? 0) >= (amount as number)) ? '#f7ca18' : '#231f10',
                                    color: Object.entries(nextLevelData.upgradeCost).every(([resId, amount]) => (resources[resId] ?? playerMaterials[resId] ?? 0) >= (amount as number)) ? '#2a1810' : '#7a7a7a',
                                    border: 'none', fontWeight: 'bold', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                    opacity: Object.entries(nextLevelData.upgradeCost).every(([resId, amount]) => (resources[resId] ?? playerMaterials[resId] ?? 0) >= (amount as number)) ? 1 : 0.7
                                }}
                            >
                                <span className="material-symbols-outlined">arrow_upward</span>
                                Upgrade to LVL {currentLevel + 1}
                            </button>
                        </>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#f7ca18', fontWeight: 'bold' }}>MAX LEVEL REACHED</div>
                    )}
                </div>
            </div>

            {showMonsterModal && (
                <MonsterAssignmentModal
                    facilityId={facility.id}
                    onClose={() => setShowMonsterModal(false)}
                    onAssign={(monsterId) => {
                        assignMonster(facility.id, monsterId)
                        setShowMonsterModal(false)
                    }}
                />
            )}
        </div>
    )
}
