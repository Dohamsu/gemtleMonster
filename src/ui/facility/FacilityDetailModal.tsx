import { useState } from 'react'
import { useFacilityStore } from '../../store/useFacilityStore'
// import { useGameStore } from '../../store/useGameStore'
import { useAlchemyStore } from '../../store/useAlchemyStore'
import { MONSTER_DATA } from '../../data/monsterData'
import { MATERIALS } from '../../data/alchemyData'
import FacilityIcon from '../FacilityIcon'
import ResourceIcon from '../ResourceIcon'
import MonsterAssignmentModal from './MonsterAssignmentModal'
import { useCollectionProgress } from '../../hooks/useCollectionProgress'
import { useProductionPrediction } from '../../hooks/useProductionPrediction'
import { calculateFacilityBonus } from '../../utils/facilityUtils'
import type { FacilityData } from '../../types/facility'
import type { MonsterFactoryTrait } from '../../types/monster'

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
    const { assignedMonsters, assignMonster, lastCollectedAt, productionModes, setProductionMode } = useFacilityStore()
    const { playerMonsters, playerMaterials } = useAlchemyStore()
    const [activeSlotIndex, setActiveSlotIndex] = useState<number | null>(null)

    const levelData = facility.levels.find((l) => l.level === currentLevel)
    const nextLevelData = facility.levels.find((l) => l.level === currentLevel + 1)

    // Production Mode Logic
    const currentModeLevel = productionModes[facility.id] || currentLevel
    const modeLevelData = facility.levels.find(l => l.level === currentModeLevel)
    // Use mode's drops but current level's interval/bundles for stats display
    const effectiveDropRates = modeLevelData?.stats?.dropRates || {}
    const isHighEfficiency = currentModeLevel < currentLevel

    // Handle legacy state or array state safely
    const rawAssignments = assignedMonsters[facility.id]
    const currentAssignments: (string | null)[] = Array.isArray(rawAssignments)
        ? rawAssignments
        : (rawAssignments ? [rawAssignments] : [])

    // Ensure array size matches currentLevel
    const slots = Array.from({ length: currentLevel }, (_, i) => ({
        index: i,
        monsterId: currentAssignments[i] || null
    }))

    // Calculate Bonuses from ALL assigned monsters
    const activeTraits: MonsterFactoryTrait[] = []
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

    const bonus = calculateFacilityBonus(activeTraits)
    let bonusSpeed = bonus.speed
    const bonusAmount = bonus.amount

    if (bonusSpeed > 90) bonusSpeed = 90

    const intervalSeconds = (levelData?.stats?.intervalSeconds || 1) * (1 - bonusSpeed / 100)

    // Real Progress Sync
    const collectionKey = `${facility.id}-${currentLevel}`
    const lastCollected = lastCollectedAt[collectionKey] || 0
    const progress = useCollectionProgress(facility.id, intervalSeconds, lastCollected)

    // Prediction
    const predictedItem = useProductionPrediction({
        facilityId: facility.id,
        currentLevel,
        stats: levelData?.stats ? {
            ...levelData.stats,
            dropRates: effectiveDropRates
        } : undefined,
        lastCollectedAt: lastCollected
    })

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
                        생산 현황
                        {isHighEfficiency && (
                            <span style={{ fontSize: '10px', background: '#facc15', color: '#000', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                                고효율 모드 가동 중
                            </span>
                        )}
                    </h3>

                    {/* Mode Selector */}
                    <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '12px', color: '#b0a090' }}>생산 단계:</span>
                        <select
                            value={currentModeLevel}
                            onChange={(e) => setProductionMode(facility.id, Number(e.target.value))}
                            style={{
                                background: '#231f10', color: '#facc15', border: '1px solid #494122',
                                borderRadius: '6px', padding: '4px 8px', fontSize: '12px', fontWeight: 'bold'
                            }}
                        >
                            {facility.levels.filter(l => l.level <= currentLevel).map(l => (
                                <option key={l.level} value={l.level}>
                                    Lv.{l.level} {l.name || facility.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', alignItems: 'center' }}>
                            <span style={{ fontSize: '12px', color: '#f0d090' }}>현재 작업</span>
                            {predictedItem ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <div style={{ width: '36px', height: '36px' }}>
                                        <ResourceIcon resourceId={predictedItem} size={36} />
                                    </div>
                                    <span style={{ fontSize: '12px', color: '#fff', fontWeight: 'bold' }}>
                                        {MATERIALS[predictedItem]?.name || predictedItem}
                                    </span>
                                </div>
                            ) : (
                                <span style={{ fontSize: '10px', color: '#7a7a7a' }}>대기 중...</span>
                            )}
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
                            <span style={{ fontSize: '10px', color: '#7a7a7a', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>틱당 생산량</span>
                            <div style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#facc15' }}>payments</span>
                                {levelData?.stats?.bundlesPerTick || 0}
                                {bonusAmount > 0 && <span style={{ fontSize: '10px', color: '#4ade80' }}>(+{bonusAmount}%)</span>}
                            </div>
                        </div>
                        <div style={{ background: '#231f10', padding: '10px', borderRadius: '8px', border: '1px solid rgba(73, 65, 34, 0.5)' }}>
                            <span style={{ fontSize: '10px', color: '#7a7a7a', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>생산 주기</span>
                            <div style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#facc15' }}>timer</span>
                                {intervalSeconds.toFixed(1)}초
                                {bonusSpeed > 0 && <span style={{ fontSize: '10px', color: '#4ade80' }}>(-{bonusSpeed}%)</span>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Production List */}
                {levelData?.stats?.dropRates && Object.keys(levelData.stats.dropRates).length > 0 && (
                    <div style={{
                        background: 'rgba(42, 24, 16, 0.4)', borderRadius: '16px', border: '1px solid #494122',
                        padding: '16px', marginBottom: '20px', backdropFilter: 'blur(4px)'
                    }}>
                        <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#f0d090', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#f7ca18' }}>inventory_2</span>
                            생산 목록
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '10px' }}>
                            {Object.entries(effectiveDropRates).map(([itemId, rate]) => (
                                <div key={itemId} style={{
                                    background: '#231f10', padding: '10px', borderRadius: '8px', border: '1px solid rgba(73, 65, 34, 0.5)',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px'
                                }}>
                                    <div style={{ width: '32px', height: '32px' }}>
                                        <ResourceIcon resourceId={itemId} size={32} />
                                    </div>
                                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#fff' }}>
                                        {((rate as number) * 100).toFixed(0)}%
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Consumption Info (Costs) */}
                {modeLevelData?.stats?.cost && Object.keys(modeLevelData.stats.cost).length > 0 && (
                    <div style={{
                        background: 'rgba(42, 24, 16, 0.4)', borderRadius: '16px', border: '1px solid #494122',
                        padding: '16px', marginBottom: '20px', backdropFilter: 'blur(4px)'
                    }}>
                        <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#f0d090', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#ef4444' }}>shopping_cart_checkout</span>
                            소모 정보 (틱당 소모량)
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {Object.entries(modeLevelData.stats.cost).map(([resId, amount]) => {
                                const owned = (playerMaterials[resId] ?? 0)
                                const enough = owned >= (amount as number)
                                return (
                                    <div key={resId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#231f10', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(73, 65, 34, 0.3)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '28px', height: '28px' }}>
                                                <ResourceIcon resourceId={resId} size={28} />
                                            </div>
                                            <span style={{ fontSize: '13px', color: enough ? '#d0c0b0' : '#ef4444' }}>
                                                {MATERIALS[resId]?.name || resId}
                                            </span>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '13px', color: enough ? '#facc15' : '#ef4444', fontWeight: 'bold' }}>
                                                -{amount}
                                            </div>
                                            <div style={{ fontSize: '10px', color: '#7a7a7a' }}>
                                                ({owned.toLocaleString()} 보유)
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* Workforce Allocation (Horizontal Scroll for Slots) */}
                <div style={{
                    background: 'rgba(42, 24, 16, 0.4)', borderRadius: '16px', border: '1px solid #494122',
                    padding: '16px', marginBottom: '20px'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid rgba(73, 65, 34, 0.5)', paddingBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#f0d090' }}>badge</span>
                            <h3 style={{ margin: '0, fontSize: 14px', color: '#f0d090' }}>노동력 배치</h3>
                        </div>
                        <div style={{ fontSize: '10px', color: '#f7ca18', background: '#2a1810', padding: '2px 8px', borderRadius: '4px', border: '1px solid #432a1e' }}>
                            {currentAssignments.filter(Boolean).length} / {currentLevel} 슬롯
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
                        {slots.map(slot => {
                            const assignedPM = slot.monsterId ? playerMonsters.find(m => m.id === slot.monsterId) : null
                            const assignedData = assignedPM ? MONSTER_DATA[assignedPM.monster_id] : null

                            return (
                                <div
                                    key={slot.index}
                                    onClick={() => setActiveSlotIndex(slot.index)}
                                    style={{
                                        minWidth: '100px',
                                        background: '#231f10',
                                        border: assignedData ? '1px solid #facc15' : '1px dashed #494122',
                                        borderRadius: '12px',
                                        padding: '12px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {assignedData ? (
                                        <>
                                            <div style={{
                                                width: '40px', height: '40px',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                background: '#15120e', borderRadius: '4px', border: '1px solid #3a2e18',
                                                fontSize: '20px', overflow: 'hidden'
                                            }}>
                                                {assignedData.iconUrl ? (
                                                    <img src={assignedData.iconUrl} alt={assignedData.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                                ) : (
                                                    assignedData.emoji
                                                )}
                                            </div>
                                            <div style={{ color: '#f0d090', fontSize: '12px', fontWeight: 'bold', textAlign: 'center' }}>{assignedData.name}</div>
                                            {assignedData.factoryTrait?.targetFacility === facility.id ? (
                                                <div style={{ color: '#4ade80', fontSize: '10px', whiteSpace: 'nowrap' }}>
                                                    {assignedData.factoryTrait?.value}% {assignedData.factoryTrait?.effect.includes('속도') ? '속도' : '생산'}
                                                </div>
                                            ) : (
                                                <div style={{ color: '#7a7a7a', fontSize: '10px', whiteSpace: 'nowrap' }}>
                                                    (효과 미적용)
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#494122' }}>add_circle</span>
                                            <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#5a4030' }}>SLOT {slot.index + 1}</span>
                                        </>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Upgrade Costs */}
                <div style={{
                    background: 'rgba(42, 24, 16, 0.4)', borderRadius: '16px', border: '1px solid #494122',
                    padding: '16px'
                }}>
                    <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#f0d090', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#ef4444' }}>upgrade</span>
                        강화 조건
                    </h3>
                    {nextLevelData ? (
                        <>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                                {Object.entries(nextLevelData.upgradeCost).map(([resId, amount]) => {
                                    const owned = (playerMaterials[resId] ?? 0)
                                    const enough = owned >= (amount as number)
                                    return (
                                        <div key={resId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <ResourceIcon resourceId={resId} size={20} />
                                                <span style={{ fontSize: '12px', color: '#fff' }}>{(amount as number).toLocaleString()}</span>
                                            </div>
                                            <span style={{ fontSize: '10px', color: enough ? '#0bda1d' : '#ef4444', fontWeight: 'bold' }}>
                                                {enough ? '보유' : `${((amount as number) - owned).toLocaleString()} 부족`}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                            <button
                                onClick={() => onUpgrade(facility.id, nextLevelData.upgradeCost)}
                                disabled={!Object.entries(nextLevelData.upgradeCost).every(([resId, amount]) => (playerMaterials[resId] ?? 0) >= (amount as number))}
                                style={{
                                    marginTop: '20px',
                                    width: '100%', height: '48px', borderRadius: '8px',
                                    background: Object.entries(nextLevelData.upgradeCost).every(([resId, amount]) => (playerMaterials[resId] ?? 0) >= (amount as number)) ? '#f7ca18' : '#231f10',
                                    color: Object.entries(nextLevelData.upgradeCost).every(([resId, amount]) => (playerMaterials[resId] ?? 0) >= (amount as number)) ? '#2a1810' : '#7a7a7a',
                                    border: '1px solid #5a4030', fontWeight: 'bold', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                    opacity: Object.entries(nextLevelData.upgradeCost).every(([resId, amount]) => (playerMaterials[resId] ?? 0) >= (amount as number)) ? 1 : 0.7
                                }}
                            >
                                <span className="material-symbols-outlined">arrow_upward</span>
                                Lv.{currentLevel + 1} 강화
                            </button>
                        </>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#f7ca18', fontWeight: 'bold' }}>MAX LEVEL REACHED</div>
                    )}
                </div>
            </div>

            {
                activeSlotIndex !== null && (
                    <MonsterAssignmentModal
                        facilityId={facility.id}
                        currentAssignments={currentAssignments}
                        onClose={() => setActiveSlotIndex(null)}
                        onAssign={(monsterId) => {
                            assignMonster(facility.id, monsterId, activeSlotIndex)
                            setActiveSlotIndex(null)
                        }}
                    />
                )
            }
        </div >
    )
}
