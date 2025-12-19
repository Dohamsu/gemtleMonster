import { useState, useEffect } from 'react'
import type { FacilityData } from '../../types/idle'
import { useGameStore } from '../../store/useGameStore'
import { useAlchemyStore } from '../../store/useAlchemyStore'
import { MONSTER_DATA } from '../../data/monsterData'
import { MATERIALS } from '../../data/alchemyData'
import MonsterAssignmentModal from './MonsterAssignmentModal'
import FacilityIcon from '../FacilityIcon'
import ResourceIcon from '../ResourceIcon'
import { useProductionPrediction } from '../../hooks/useProductionPrediction'
import { calculateFacilityBonus } from '../../utils/facilityUtils'

interface FacilityControlPanelProps {
    facility: FacilityData
    currentLevel: number
    onUpgrade: (facilityId: string, cost: Record<string, number>) => Promise<void>
}

export default function FacilityControlPanel({ facility, currentLevel, onUpgrade }: FacilityControlPanelProps) {
    const { assignedMonsters, assignMonster, resources, lastCollectedAt, productionModes, setProductionMode } = useGameStore()
    const { playerMonsters, playerMaterials } = useAlchemyStore()
    const [activeSlotIndex, setActiveSlotIndex] = useState<number | null>(null)
    const [progress, setProgress] = useState(0)

    const levelData = facility.levels.find(l => l.level === currentLevel)
    const nextLevelData = facility.levels.find(l => l.level === currentLevel + 1)

    // Production Mode Logic
    const currentModeLevel = productionModes[facility.id] || currentLevel
    const modeLevelData = facility.levels.find(l => l.level === currentModeLevel)
    const effectiveDropRates = modeLevelData?.stats?.dropRates || {}
    const isHighEfficiency = currentModeLevel < currentLevel

    // Handle legacy state or array state safely
    const rawAssignments = assignedMonsters[facility.id]
    const currentAssignments: (string | null)[] = Array.isArray(rawAssignments)
        ? rawAssignments
        : (rawAssignments ? [rawAssignments] : [])

    // Ensure array size matches currentLevel (slots expand with level)
    // We display slots 0 to currentLevel-1
    const slots = Array.from({ length: currentLevel }, (_, i) => ({
        index: i,
        monsterId: currentAssignments[i] || null
    }))

    // Calculate Bonuses from ALL assigned monsters
    const activeTraits: any[] = []
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

    let { speed: bonusSpeed, amount: bonusAmount } = calculateFacilityBonus(activeTraits)

    if (bonusSpeed > 90) bonusSpeed = 90

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

    // Prediction
    const predictedItem = useProductionPrediction({
        facilityId: facility.id,
        currentLevel,
        stats: levelData?.stats ? {
            ...levelData.stats,
            dropRates: effectiveDropRates
        } : undefined,
        lastCollectedAt: lastCollectedAt[`${facility.id}-${currentLevel}`]
    })

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
                            <p style={{ margin: '5px 0 0 0', color: '#d0c0b0', fontStyle: 'italic' }}>
                                &quot;{levelData?.name || facility.name}&quot;
                            </p>

                            {/* Production Mode Selector */}
                            <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                                {isHighEfficiency && (
                                    <span style={{ fontSize: '0.8em', color: '#facc15', background: 'rgba(250, 204, 21, 0.1)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(250, 204, 21, 0.3)' }}>
                                        고효율 모드 (Lv.{currentLevel} 속도)
                                    </span>
                                )}
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.8em', color: '#b0a090', marginBottom: '4px' }}>실시간 생산 현황</div>
                            {predictedItem ? (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px', marginBottom: '4px' }}>
                                    <div style={{ width: '40px', height: '40px' }}>
                                        <ResourceIcon resourceId={predictedItem} size={40} />
                                    </div>
                                    <span style={{ fontSize: '1em', color: '#fff', fontWeight: 'bold' }}>
                                        {MATERIALS[predictedItem]?.name || predictedItem}
                                    </span>
                                </div>
                            ) : null}
                            <div style={{ fontSize: '1.2em', fontWeight: 'bold', color: '#f0d090' }}>{Math.floor(progress)}%</div>
                        </div>
                    </div>

                    {/* Main Progress Bar */}
                    <div style={{ width: '100%', height: '10px', background: '#1a0f0a', borderRadius: '5px', overflow: 'hidden', border: '1px solid #3d2b20' }}>
                        <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, #facc15, #eab308)', boxShadow: '0 0 10px #facc1555', transition: 'width 0.1s linear' }} />
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '20px' }}>
                {/* Production Stats Panel */}
                <div style={{ background: '#2a1810', border: '1px solid #5a4030', borderRadius: '8px', padding: '20px', height: 'fit-content' }}>
                    <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1em', color: '#f0d090', borderBottom: '1px solid #3d2b20', paddingBottom: '10px' }}>생산 효율 정보</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <StatRow label="기본 생산 간격" value={`${levelData?.stats?.intervalSeconds || 0}초`} />
                        <StatRow label="몬스터 가속" value={`-${bonusSpeed}%`} color={bonusSpeed > 0 ? "#4ade80" : "#888"} />
                        <StatRow label="최종 생산 간격" value={`${((levelData?.stats?.intervalSeconds || 0) * (1 - bonusSpeed / 100)).toFixed(1)}초`} color="#facc15" />
                        <div style={{ height: '1px', background: '#3d2b20', margin: '5px 0' }} />
                        <StatRow label="기본 생산량" value={`x${levelData?.stats?.bundlesPerTick || 0}`} />
                        <StatRow label="몬스터 보너스" value={`+${bonusAmount}%`} color={bonusAmount > 0 ? "#4ade80" : "#888"} />
                    </div>

                    {/* Production List (Drop Rates) */}
                    {levelData?.stats?.dropRates && Object.keys(levelData.stats.dropRates).length > 0 && (
                        <>
                            <div style={{ height: '1px', background: '#3d2b20', margin: '15px 0' }} />
                            <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9em', color: '#b0a090', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#facc15' }}>inventory_2</span>
                                생산 목록
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {Object.entries(effectiveDropRates).map(([resId, rate]) => (
                                    <div key={resId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.2)', padding: '6px 10px', borderRadius: '6px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '24px', height: '24px' }}>
                                                <ResourceIcon resourceId={resId} size={24} />
                                            </div>
                                            <span style={{ fontSize: '0.9em', color: '#d0c0b0' }}>
                                                {MATERIALS[resId]?.name || resId}
                                            </span>
                                        </div>
                                        <span style={{ fontSize: '0.9em', color: '#facc15', fontWeight: 'bold' }}>
                                            {(rate as number * 100).toFixed(0)}%
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* Consumption Info (Costs) */}
                    {levelData?.stats?.cost && Object.keys(levelData.stats.cost).length > 0 && (
                        <>
                            <div style={{ height: '1px', background: '#3d2b20', margin: '15px 0' }} />
                            <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9em', color: '#b0a090', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#ef4444' }}>shopping_cart_checkout</span>
                                소모 정보 (틱당 소모량)
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {Object.entries(levelData.stats.cost).map(([resId, amount]) => {
                                    const owned = (resources[resId] ?? playerMaterials[resId] ?? 0)
                                    const enough = owned >= (amount as number)
                                    return (
                                        <div key={resId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.2)', padding: '6px 10px', borderRadius: '6px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ width: '24px', height: '24px' }}>
                                                    <ResourceIcon resourceId={resId} size={24} />
                                                </div>
                                                <span style={{ fontSize: '0.9em', color: enough ? '#d0c0b0' : '#ef4444' }}>
                                                    {MATERIALS[resId]?.name || resId}
                                                </span>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '0.9em', color: enough ? '#facc15' : '#ef4444', fontWeight: 'bold' }}>
                                                    -{amount}
                                                </div>
                                                <div style={{ fontSize: '0.7em', color: '#888' }}>
                                                    (보유: {owned.toLocaleString()})
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </>
                    )}
                </div>

                {/* Monster Slot Panel (Grid) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1em', color: '#f0d090', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="material-symbols-outlined">groups</span>
                        배치 슬롯 ({currentAssignments.filter(Boolean).length}/{currentLevel})
                        {currentLevel < 5 && <span style={{ fontSize: '0.7em', color: '#7a7a7a', fontWeight: 'normal' }}> - 레벨업시 슬롯 추가</span>}
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '15px' }}>
                        {slots.map((slot) => {
                            const assignedPM = slot.monsterId ? playerMonsters.find(m => m.id === slot.monsterId) : null
                            const assignedData = assignedPM ? MONSTER_DATA[assignedPM.monster_id] : null

                            return (
                                <div
                                    key={slot.index}
                                    onClick={() => setActiveSlotIndex(slot.index)}
                                    style={{
                                        background: '#231610',
                                        border: assignedData ? '1px solid #facc15' : '1px dashed #5a4030',
                                        borderRadius: '8px',
                                        padding: '15px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        position: 'relative',
                                        minHeight: '140px',
                                        aspectRatio: '1/1'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    {assignedData ? (
                                        <>
                                            <div style={{ width: '56px', height: '56px', marginBottom: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                {assignedData.iconUrl ? (
                                                    <img src={assignedData.iconUrl} alt={assignedData.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                                ) : (
                                                    <div style={{ fontSize: '3em' }}>{assignedData.emoji}</div>
                                                )}
                                            </div>
                                            <div style={{ color: '#facc15', fontWeight: 'bold', fontSize: '0.9em', textAlign: 'center' }}>{assignedData.name}</div>
                                            {assignedData.factoryTrait?.targetFacility === facility.id ? (
                                                <div style={{ fontSize: '0.75em', color: '#4ade80', marginTop: '4px' }}>
                                                    {assignedData.factoryTrait?.value}% {assignedData.factoryTrait?.effect.includes('속도') ? '가속' : '증가'}
                                                </div>
                                            ) : (
                                                <div style={{ fontSize: '0.75em', color: '#7a7a7a', marginTop: '4px' }}>
                                                    (효과 미적용)
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <div style={{ fontSize: '2em', color: '#5a4030', marginBottom: '8px' }}>➕</div>
                                            <div style={{ color: '#7a7a7a', fontSize: '0.9em' }}>빈 슬롯</div>
                                            <div style={{ fontSize: '0.7em', color: '#5a4030', marginTop: '4px' }}>Level {slot.index + 1}</div>
                                        </>
                                    )}
                                </div>
                            )
                        })}

                    </div>
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
                            onClick={() => {
                                if (nextLevelData) {
                                    onUpgrade(facility.id, nextLevelData.upgradeCost)
                                }
                            }}
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
            {
                activeSlotIndex !== null && (
                    <MonsterAssignmentModal
                        facilityId={facility.id}
                        currentAssignments={currentAssignments}
                        onClose={() => setActiveSlotIndex(null)}
                        onAssign={(monsterId: string | null) => {
                            assignMonster(facility.id, monsterId, activeSlotIndex)
                            setActiveSlotIndex(null)
                        }}
                    />
                )
            }
        </div >
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
