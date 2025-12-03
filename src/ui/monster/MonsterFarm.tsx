import { useEffect, useState } from 'react'
import { useGameStore } from '../../store/useGameStore'
import { useAlchemyStore } from '../../store/useAlchemyStore'
import { useAuth } from '../../hooks/useAuth'
import { MONSTER_DATA } from '../../data/monsterData'
import { MATERIALS } from '../../data/alchemyData'

export default function MonsterFarm() {
    const { setCanvasView } = useGameStore()
    const { playerMonsters, loadPlayerMonsters, decomposeMonsters, toggleMonsterLock } = useAlchemyStore()
    const { user } = useAuth()

    const [decomposeMode, setDecomposeMode] = useState(false)
    const [selectedMonsters, setSelectedMonsters] = useState<Set<string>>(new Set())
    const [showConfirmDialog, setShowConfirmDialog] = useState(false)
    const [decomposeResult, setDecomposeResult] = useState<{
        success: boolean
        rewards: Record<string, number>
        count: number
    } | null>(null)

    useEffect(() => {
        if (user) {
            loadPlayerMonsters(user.id)
        }
    }, [user, loadPlayerMonsters])

    const handleBack = () => {
        setCanvasView('map')
    }

    const toggleMonsterSelection = (monsterId: string) => {
        const newSelected = new Set(selectedMonsters)
        if (newSelected.has(monsterId)) {
            newSelected.delete(monsterId)
        } else {
            newSelected.add(monsterId)
        }
        setSelectedMonsters(newSelected)
    }

    const handleLockToggle = async (monsterId: string, currentLocked: boolean, e: React.MouseEvent) => {
        e.stopPropagation()
        try {
            await toggleMonsterLock(monsterId, !currentLocked)
            // Reload monsters to reflect changes
            if (user) {
                await loadPlayerMonsters(user.id)
            }
        } catch (error) {
            console.error('Failed to toggle lock:', error)
        }
    }

    const handleDecompose = async () => {
        if (selectedMonsters.size === 0) return

        try {
            const result = await decomposeMonsters(Array.from(selectedMonsters))

            if (!result.success) {
                console.error('Decompose failed:', result.error)
                setDecomposeResult({
                    success: false,
                    rewards: {},
                    count: 0
                })
            } else {
                setDecomposeResult({
                    success: true,
                    rewards: result.rewards,
                    count: result.deleted_count
                })
                setSelectedMonsters(new Set())
                setShowConfirmDialog(false)
            }

            // Auto-hide result after 5 seconds
            setTimeout(() => setDecomposeResult(null), 5000)
        } catch (error) {
            console.error('Decompose failed:', error)
            setDecomposeResult({
                success: false,
                rewards: {},
                count: 0
            })
            setTimeout(() => setDecomposeResult(null), 5000)
        }
    }

    const getExpectedRewards = () => {
        const rewards: Record<string, number> = {}
        selectedMonsters.forEach(monsterId => {
            const monster = playerMonsters.find(m => m.id === monsterId)
            if (!monster) return

            const data = MONSTER_DATA[monster.monster_id]
            if (!data) return

            // Simple reward calculation based on rarity
            const rarity = data.rarity || 'N'

            // Essence
            const essenceAmount = rarity === 'SSR' ? 30 : rarity === 'SR' ? 10 : rarity === 'R' ? 3 : 1
            rewards['essence'] = (rewards['essence'] || 0) + essenceAmount

            // Base material
            const baseMaterial = rarity === 'SSR' ? 'gem_fragment' : rarity === 'SR' ? 'ore_magic' : rarity === 'R' ? 'ore_iron' : 'slime_fluid'
            const baseAmount = rarity === 'SSR' ? 1 : rarity === 'SR' ? 2 : rarity === 'R' ? 2 : 1
            rewards[baseMaterial] = (rewards[baseMaterial] || 0) + baseAmount

            // Shards (if element exists)
            if (data.element) {
                const shardAmount = rarity === 'SSR' ? 5 : rarity === 'SR' ? 3 : rarity === 'R' ? 1 : 0
                if (shardAmount > 0) {
                    const shardId = `shard_${data.element.toLowerCase()}`
                    rewards[shardId] = (rewards[shardId] || 0) + shardAmount
                }
            }
        })
        return rewards
    }

    return (
        <div style={{
            padding: '20px',
            color: '#eee',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            maxWidth: '1000px',
            margin: '0 auto',
            width: '100%'
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(0,0,0,0.6)',
                padding: '15px',
                borderRadius: '12px',
                backdropFilter: 'blur(4px)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button
                        onClick={handleBack}
                        style={{
                            background: '#4a3020',
                            border: '2px solid #8a6040',
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '14px'
                        }}
                    >
                        ← 나가기
                    </button>
                    <h2 style={{ margin: 0, fontSize: '1.5em', color: '#f0d090' }}>🏰 몬스터 농장</h2>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div style={{ fontSize: '1.2em', fontWeight: 'bold', color: '#facc15' }}>
                        보유 몬스터: {playerMonsters.length}마리
                    </div>
                    <button
                        onClick={() => {
                            setDecomposeMode(!decomposeMode)
                            setSelectedMonsters(new Set())
                        }}
                        style={{
                            background: decomposeMode ? '#dc2626' : '#059669',
                            border: 'none',
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '14px'
                        }}
                    >
                        {decomposeMode ? '❌ 분해 모드 종료' : '⚙️ 분해 모드'}
                    </button>
                </div>
            </div>

            {/* Decompose Mode Info */}
            {decomposeMode && (
                <div style={{
                    background: 'rgba(220, 38, 38, 0.1)',
                    border: '2px solid #dc2626',
                    borderRadius: '12px',
                    padding: '15px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <div style={{ fontWeight: 'bold', color: '#fca5a5', marginBottom: '5px' }}>
                            🔥 분해 모드 활성화
                        </div>
                        <div style={{ fontSize: '0.9em', color: '#cbd5e1' }}>
                            분해할 몬스터를 선택하세요. 잠금된 몬스터는 선택할 수 없습니다.
                        </div>
                    </div>
                    {selectedMonsters.size > 0 && (
                        <button
                            onClick={() => setShowConfirmDialog(true)}
                            style={{
                                background: '#dc2626',
                                border: 'none',
                                color: 'white',
                                padding: '10px 20px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                fontSize: '14px'
                            }}
                        >
                            선택한 {selectedMonsters.size}마리 분해하기
                        </button>
                    )}
                </div>
            )}

            {/* Decompose Result */}
            {decomposeResult && (
                <div style={{
                    background: decomposeResult.success ? 'rgba(34, 197, 94, 0.1)' : 'rgba(220, 38, 38, 0.1)',
                    border: `2px solid ${decomposeResult.success ? '#22c55e' : '#dc2626'}`,
                    borderRadius: '12px',
                    padding: '15px'
                }}>
                    <div style={{ fontWeight: 'bold', color: decomposeResult.success ? '#86efac' : '#fca5a5', marginBottom: '10px' }}>
                        {decomposeResult.success ? '✅ 분해 완료!' : '❌ 분해 실패'}
                    </div>
                    {decomposeResult.success && (
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            {Object.entries(decomposeResult.rewards).map(([materialId, amount]) => (
                                <div key={materialId} style={{
                                    background: 'rgba(0,0,0,0.3)',
                                    padding: '5px 10px',
                                    borderRadius: '6px',
                                    fontSize: '0.9em'
                                }}>
                                    {MATERIALS[materialId]?.name || materialId}: +{amount}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Monster Grid */}
            {playerMonsters.length === 0 ? (
                <div style={{
                    flex: 1,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    background: 'rgba(0,0,0,0.3)',
                    borderRadius: '12px',
                    flexDirection: 'column',
                    gap: '20px'
                }}>
                    <div style={{ fontSize: '4em' }}>🥚</div>
                    <p style={{ color: '#aaa', fontSize: '1.2em' }}>아직 보유한 몬스터가 없습니다.</p>
                    <p style={{ color: '#888' }}>연금술 공방에서 몬스터를 소환해보세요!</p>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '20px',
                    padding: '10px',
                    overflowY: 'auto'
                }}>
                    {playerMonsters.map(monster => {
                        const data = MONSTER_DATA[monster.monster_id]
                        if (!data) return null

                        const isLocked = monster.is_locked || false
                        const isSelected = selectedMonsters.has(monster.id)
                        const canSelect = decomposeMode && !isLocked

                        return (
                            <div key={monster.id} style={{
                                background: isSelected ? 'rgba(220, 38, 38, 0.2)' : 'rgba(30, 41, 59, 0.8)',
                                borderRadius: '12px',
                                border: isSelected ? '2px solid #dc2626' : isLocked ? '2px solid #facc15' : '1px solid #334155',
                                padding: '20px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '15px',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                cursor: canSelect ? 'pointer' : 'default',
                                opacity: (decomposeMode && isLocked) ? 0.5 : 1
                            }}
                                onClick={() => canSelect && toggleMonsterSelection(monster.id)}
                                onMouseEnter={(e) => {
                                    if (canSelect) {
                                        e.currentTarget.style.transform = 'translateY(-5px)'
                                        e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.3)'
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'none'
                                    e.currentTarget.style.boxShadow = 'none'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{
                                        width: '60px',
                                        height: '60px',
                                        background: '#0f172a',
                                        borderRadius: '10px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '30px',
                                        border: '2px solid #334155'
                                    }}>
                                        {data.iconUrl ? (
                                            <img src={data.iconUrl} alt={data.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                        ) : (
                                            data.emoji
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                                        <button
                                            onClick={(e) => handleLockToggle(monster.id, isLocked, e)}
                                            style={{
                                                background: 'transparent',
                                                border: 'none',
                                                cursor: 'pointer',
                                                fontSize: '1.5em',
                                                padding: '5px'
                                            }}
                                            title={isLocked ? '잠금 해제' : '잠금'}
                                        >
                                            {isLocked ? '🔒' : '🔓'}
                                        </button>
                                        <div style={{
                                            background: '#3b82f6',
                                            padding: '4px 10px',
                                            borderRadius: '20px',
                                            fontSize: '0.8em',
                                            fontWeight: 'bold'
                                        }}>
                                            Lv.{monster.level}
                                        </div>
                                    </div>
                                </div>

                                {decomposeMode && isSelected && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '10px',
                                        left: '10px',
                                        background: '#dc2626',
                                        color: 'white',
                                        padding: '5px 10px',
                                        borderRadius: '6px',
                                        fontSize: '0.8em',
                                        fontWeight: 'bold'
                                    }}>
                                        ✓ 선택됨
                                    </div>
                                )}

                                <div>
                                    <h3 style={{ margin: '0 0 5px 0', color: '#f8fafc' }}>{data.name}</h3>
                                    <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
                                        <span style={{
                                            fontSize: '0.7em',
                                            padding: '2px 8px',
                                            borderRadius: '4px',
                                            background: '#475569',
                                            color: '#cbd5e1'
                                        }}>
                                            {data.role}
                                        </span>
                                        <span style={{
                                            fontSize: '0.7em',
                                            padding: '2px 8px',
                                            borderRadius: '4px',
                                            background: '#334155',
                                            color: '#94a3b8'
                                        }}>
                                            EXP: {monster.exp}
                                        </span>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '0.9em', color: '#94a3b8', lineHeight: '1.4' }}>
                                        {data.description}
                                    </p>
                                </div>

                                <div style={{
                                    background: 'rgba(0,0,0,0.2)',
                                    borderRadius: '8px',
                                    padding: '10px',
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr 1fr',
                                    gap: '5px',
                                    textAlign: 'center'
                                }}>
                                    <div>
                                        <div style={{ fontSize: '0.8em', color: '#94a3b8' }}>HP</div>
                                        <div style={{ color: '#ef4444', fontWeight: 'bold' }}>{data.hp}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.8em', color: '#94a3b8' }}>ATK</div>
                                        <div style={{ color: '#eab308', fontWeight: 'bold' }}>{data.attack}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.8em', color: '#94a3b8' }}>DEF</div>
                                        <div style={{ color: '#3b82f6', fontWeight: 'bold' }}>{data.defense}</div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Confirm Dialog */}
            {showConfirmDialog && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.8)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: '#1e293b',
                        borderRadius: '16px',
                        padding: '30px',
                        maxWidth: '500px',
                        width: '90%',
                        border: '2px solid #dc2626'
                    }}>
                        <h3 style={{ margin: '0 0 20px 0', color: '#fca5a5' }}>⚠️ 몬스터 분해 확인</h3>
                        <p style={{ color: '#cbd5e1', marginBottom: '20px' }}>
                            선택한 {selectedMonsters.size}마리의 몬스터를 분해하시겠습니까?<br />
                            <span style={{ color: '#f87171', fontSize: '0.9em' }}>이 작업은 되돌릴 수 없습니다!</span>
                        </p>

                        <div style={{
                            background: 'rgba(0,0,0,0.3)',
                            borderRadius: '8px',
                            padding: '15px',
                            marginBottom: '20px'
                        }}>
                            <div style={{ fontWeight: 'bold', marginBottom: '10px', color: '#86efac' }}>예상 보상:</div>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                {Object.entries(getExpectedRewards()).map(([materialId, amount]) => (
                                    <div key={materialId} style={{
                                        background: 'rgba(34, 197, 94, 0.1)',
                                        border: '1px solid #22c55e',
                                        padding: '5px 10px',
                                        borderRadius: '6px',
                                        fontSize: '0.9em',
                                        color: '#86efac'
                                    }}>
                                        {MATERIALS[materialId]?.name || materialId}: +{amount}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setShowConfirmDialog(false)}
                                style={{
                                    background: '#475569',
                                    border: 'none',
                                    color: 'white',
                                    padding: '10px 20px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold'
                                }}
                            >
                                취소
                            </button>
                            <button
                                onClick={handleDecompose}
                                style={{
                                    background: '#dc2626',
                                    border: 'none',
                                    color: 'white',
                                    padding: '10px 20px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold'
                                }}
                            >
                                분해하기
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
