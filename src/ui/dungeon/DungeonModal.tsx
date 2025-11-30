import { useState, useEffect } from 'react'
import { useGameStore } from '../../store/useGameStore'
import { useAlchemyStore } from '../../store/useAlchemyStore'
import { SLIME_DUNGEON } from '../../data/dungeonData'
import { MONSTERS } from '../../data/alchemyData'
import BattleView from './BattleView'

interface DungeonModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function DungeonModal({ isOpen, onClose }: DungeonModalProps) {
    const { battleState, startBattle } = useGameStore()
    const { playerMonsters, loadPlayerMonsters, userId } = useAlchemyStore()
    const [selectedMonsterId, setSelectedMonsterId] = useState<string | null>(null)

    // Load monsters when modal opens
    useEffect(() => {
        if (isOpen && userId) {
            console.log('🔍 [DungeonModal] Loading player monsters for userId:', userId)
            loadPlayerMonsters(userId).then(() => {
                console.log('✅ [DungeonModal] Monsters loaded:', playerMonsters.length)
            })
        }
    }, [isOpen, userId, loadPlayerMonsters])

    // Reset selection when modal closes
    useEffect(() => {
        if (!isOpen) {
            setSelectedMonsterId(null)
        }
    }, [isOpen])

    // Debug log
    useEffect(() => {
        console.log('🐉 [DungeonModal] playerMonsters state:', playerMonsters)
    }, [playerMonsters])

    if (!isOpen) return null

    const handleStartBattle = (enemyId: string) => {
        if (!selectedMonsterId) {
            alert('몬스터를 먼저 선택해주세요!')
            return
        }
        startBattle(SLIME_DUNGEON.id, enemyId, selectedMonsterId)
    }

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '20px'
        }}>
            <div style={{
                width: '90%',
                maxWidth: '800px',
                maxHeight: '90vh',
                background: '#1e293b',
                borderRadius: '16px',
                border: '2px solid #475569',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
            }}>
                {/* Header */}
                <div style={{
                    padding: '16px',
                    background: '#0f172a',
                    borderBottom: '1px solid #334155',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexShrink: 0
                }}>
                    <h2 style={{ margin: 0, color: '#a3e635' }}>🌲 {SLIME_DUNGEON.name}</h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#94a3b8',
                            fontSize: '24px',
                            cursor: 'pointer'
                        }}
                    >
                        ×
                    </button>
                </div>

                {/* Content */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    minHeight: 0
                }}>
                    {battleState ? (
                        <BattleView />
                    ) : (
                        <div style={{ padding: '20px' }}>
                            <p style={{ color: '#cbd5e1', marginBottom: '20px' }}>
                                {SLIME_DUNGEON.description}
                            </p>

                            {/* Monster Selection */}
                            <h3 style={{ color: '#fff', borderBottom: '1px solid #334155', paddingBottom: '10px', marginBottom: '15px' }}>
                                전투에 사용할 몬스터 선택
                            </h3>

                            {playerMonsters.length === 0 ? (
                                <div style={{
                                    background: '#334155',
                                    padding: '20px',
                                    borderRadius: '8px',
                                    textAlign: 'center',
                                    color: '#94a3b8',
                                    marginBottom: '20px'
                                }}>
                                    몬스터가 없습니다. 연금술로 몬스터를 만들어보세요! 🧪
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px', marginBottom: '20px' }}>
                                    {playerMonsters.map(monster => {
                                        // Remove 'monster_' prefix to match MONSTERS keys
                                        const monsterKey = monster.monster_id.replace('monster_', '')
                                        const monsterData = MONSTERS[monsterKey]
                                        console.log('🔍 Looking for:', monsterKey, 'Found:', !!monsterData)
                                        if (!monsterData) return null

                                        const isSelected = selectedMonsterId === monster.id
                                        return (
                                            <div
                                                key={monster.id}
                                                onClick={() => setSelectedMonsterId(monster.id)}
                                                style={{
                                                    background: isSelected ? '#3b82f6' : '#334155',
                                                    padding: '12px',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    border: isSelected ? '2px solid #60a5fa' : '2px solid transparent',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                <div style={{ fontWeight: 'bold', color: '#fff', marginBottom: '5px' }}>
                                                    {monsterData.name}
                                                </div>
                                                <div style={{ fontSize: '12px', color: '#cbd5e1' }}>
                                                    Lv.{monster.level}
                                                </div>
                                                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '5px' }}>
                                                    HP: {monsterData.baseStats.hp} | ATK: {monsterData.baseStats.atk} | DEF: {monsterData.baseStats.def}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}

                            <h3 style={{ color: '#fff', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>
                                출몰 몬스터
                            </h3>

                            <div style={{ display: 'grid', gap: '15px' }}>
                                {SLIME_DUNGEON.enemies.map(enemy => (
                                    <div key={enemy.id} style={{
                                        background: '#334155',
                                        padding: '15px',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            <div style={{ fontSize: '30px' }}>🦠</div>
                                            <div>
                                                <div style={{ fontWeight: 'bold', color: '#fff' }}>{enemy.name}</div>
                                                <div style={{ fontSize: '12px', color: '#94a3b8' }}>Lv.{enemy.level} • HP {enemy.hp}</div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleStartBattle(enemy.id)}
                                            disabled={!selectedMonsterId}
                                            style={{
                                                padding: '8px 16px',
                                                background: selectedMonsterId ? '#ef4444' : '#6b7280',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: selectedMonsterId ? 'pointer' : 'not-allowed',
                                                fontWeight: 'bold',
                                                opacity: selectedMonsterId ? 1 : 0.5
                                            }}
                                        >
                                            전투 시작
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
