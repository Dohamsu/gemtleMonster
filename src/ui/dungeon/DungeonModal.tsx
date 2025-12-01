import { useState, useEffect } from 'react'
import { useGameStore } from '../../store/useGameStore'
import { useAlchemyStore } from '../../store/useAlchemyStore'
import { DUNGEONS } from '../../data/dungeonData'
import { GAME_MONSTERS as MONSTERS } from '../../data/monsterData'
import BattleView from './BattleView'

interface DungeonModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function DungeonModal({ isOpen, onClose }: DungeonModalProps) {
    const { battleState, startBattle } = useGameStore()
    const { playerMonsters, loadPlayerMonsters, userId } = useAlchemyStore()
    const [selectedMonsterId, setSelectedMonsterId] = useState<string | null>(null)
    const [selectedDungeonId, setSelectedDungeonId] = useState<string | null>(null)

    // Load monsters when modal opens
    useEffect(() => {
        if (isOpen && userId) {
            loadPlayerMonsters(userId)
        }
    }, [isOpen, userId, loadPlayerMonsters])

    // Reset selection when modal closes
    useEffect(() => {
        if (!isOpen) {
            setSelectedMonsterId(null)
            setSelectedDungeonId(null)
        }
    }, [isOpen])

    if (!isOpen) return null

    const handleStartBattle = (enemyId: string) => {
        if (!selectedMonsterId) {
            alert('몬스터를 먼저 선택해주세요!')
            return
        }
        if (!selectedDungeonId) return
        startBattle(selectedDungeonId, enemyId, selectedMonsterId)
    }

    const selectedDungeon = DUNGEONS.find(d => d.id === selectedDungeonId)

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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {selectedDungeonId && !battleState && (
                            <button
                                onClick={() => setSelectedDungeonId(null)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#94a3b8',
                                    cursor: 'pointer',
                                    fontSize: '18px',
                                    padding: '0 5px'
                                }}
                            >
                                ←
                            </button>
                        )}
                        <h2 style={{ margin: 0, color: '#a3e635' }}>
                            {battleState ? '전투 중!' : (selectedDungeon ? selectedDungeon.name : '던전 선택')}
                        </h2>
                    </div>
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
                    ) : !selectedDungeonId ? (
                        // Dungeon List View
                        <div style={{ padding: '20px', display: 'grid', gap: '15px' }}>
                            {DUNGEONS.map(dungeon => (
                                <div
                                    key={dungeon.id}
                                    onClick={() => setSelectedDungeonId(dungeon.id)}
                                    style={{
                                        background: '#334155',
                                        padding: '20px',
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        border: '2px solid transparent',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#a3e635'}
                                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
                                >
                                    <div>
                                        <h3 style={{ margin: '0 0 5px 0', color: '#fff' }}>{dungeon.name}</h3>
                                        <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px' }}>
                                            {dungeon.description}
                                        </p>
                                    </div>
                                    <div style={{
                                        background: '#0f172a',
                                        padding: '5px 10px',
                                        borderRadius: '6px',
                                        color: '#cbd5e1',
                                        fontSize: '12px'
                                    }}>
                                        권장 Lv.{dungeon.recommendedLevel}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        // Dungeon Detail View
                        <div style={{ padding: '20px' }}>
                            <p style={{ color: '#cbd5e1', marginBottom: '20px' }}>
                                {selectedDungeon?.description}
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
                                        const monsterKey = monster.monster_id.replace('monster_', '')
                                        const monsterData = MONSTERS[monsterKey]
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
                                {selectedDungeon?.enemies.map(enemy => {
                                    const enemyData = MONSTERS[enemy.id]
                                    return (
                                        <div key={enemy.id} style={{
                                            background: '#334155',
                                            padding: '15px',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                <div style={{
                                                    width: '50px',
                                                    height: '50px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    {enemyData?.iconUrl ? (
                                                        <img
                                                            src={enemyData.iconUrl}
                                                            alt={enemy.name}
                                                            style={{
                                                                width: '100%',
                                                                height: '100%',
                                                                objectFit: 'contain',
                                                                filter: 'drop-shadow(0 0 5px rgba(255,0,0,0.3))'
                                                            }}
                                                        />
                                                    ) : (
                                                        <div style={{ fontSize: '30px' }}>
                                                            {selectedDungeonId === 'dungeon_lake' ? '💧' : '🦠'}
                                                        </div>
                                                    )}
                                                </div>
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
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
