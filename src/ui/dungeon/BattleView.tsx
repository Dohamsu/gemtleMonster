import { useEffect } from 'react'
import { useGameStore } from '../../store/useGameStore'
import { useAlchemyStore } from '../../store/useAlchemyStore'
import { DUNGEONS } from '../../data/dungeonData'
import { MATERIALS } from '../../data/alchemyData'
import { GAME_MONSTERS as MONSTERS } from '../../data/monsterData'

export default function BattleView() {
    const { battleState, processTurn, endBattle, activeDungeon } = useGameStore()

    // Auto-battle loop
    useEffect(() => {
        if (!battleState || battleState.result) return

        const timer = setInterval(() => {
            processTurn()
        }, 1000)

        return () => clearInterval(timer)
    }, [battleState, processTurn])

    if (!battleState) return null

    const dungeon = DUNGEONS.find(d => d.id === activeDungeon)
    const enemy = dungeon?.enemies.find(e => e.id === battleState.enemyId)
    const monsterData = battleState.selectedMonsterType ? MONSTERS[battleState.selectedMonsterType] : null
    const monsterName = monsterData?.name || '나의 몬스터'

    return (
        <div style={{
            padding: '20px',
            color: 'white',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            height: '100%'
        }}>
            <div style={{ position: 'relative', marginBottom: '20px' }}>
                <h2 style={{ color: '#ef4444', margin: 0 }}>⚔️ 전투 중! ⚔️</h2>
                {!battleState.result && (
                    <button
                        onClick={endBattle}
                        style={{
                            position: 'absolute',
                            right: 0,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'rgba(239, 68, 68, 0.2)',
                            border: '1px solid #ef4444',
                            color: '#fca5a5',
                            padding: '5px 12px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#ef4444'
                            e.currentTarget.style.color = 'white'
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'
                            e.currentTarget.style.color = '#fca5a5'
                        }}
                    >
                        🏳️ 전투 중단
                    </button>
                )}
            </div>

            {/* Battle Arena */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                margin: '40px 0',
                padding: '0 20px'
            }}>
                {/* Player */}
                <div style={{ textAlign: 'center' }}>
                    {battleState.playerMonsterImage ? (
                        <img
                            src={battleState.playerMonsterImage}
                            alt={monsterName}
                            style={{
                                width: '80px',
                                height: '80px',
                                objectFit: 'contain',
                                marginBottom: '10px',
                                filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.3))'
                            }}
                        />
                    ) : (
                        <div style={{ fontSize: '40px', marginBottom: '10px' }}>🧙‍♂️</div>
                    )}
                    <div style={{ fontWeight: 'bold' }}>{monsterName}</div>
                    <div style={{
                        width: '100px',
                        height: '10px',
                        background: '#333',
                        borderRadius: '5px',
                        margin: '5px auto',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            width: `${(battleState.playerHp / battleState.playerMaxHp) * 100}%`,
                            height: '100%',
                            background: '#22c55e',
                            transition: 'width 0.3s'
                        }} />
                    </div>
                    <div>{battleState.playerHp} / {battleState.playerMaxHp}</div>

                    {/* Level and Exp Bar */}
                    {battleState.selectedMonsterId && (
                        <div style={{ marginTop: '8px' }}>
                            {(() => {
                                const { playerMonsters } = useAlchemyStore.getState() // Direct access for simplicity in view
                                const monster = playerMonsters.find(m => m.id === battleState.selectedMonsterId)
                                if (!monster) return null

                                const expPercent = (monster.exp / (monster.level * 100)) * 100

                                return (
                                    <>
                                        <div style={{ fontSize: '12px', color: '#fbbf24', fontWeight: 'bold' }}>Lv.{monster.level}</div>
                                        <div style={{
                                            width: '100px',
                                            height: '4px',
                                            background: '#333',
                                            borderRadius: '2px',
                                            margin: '2px auto',
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{
                                                width: `${Math.min(100, expPercent)}%`,
                                                height: '100%',
                                                background: '#3b82f6',
                                                transition: 'width 0.3s'
                                            }} />
                                        </div>
                                    </>
                                )
                            })()}
                        </div>
                    )}
                </div>

                <div style={{ fontSize: '24px', color: '#aaa' }}>VS</div>

                {/* Enemy */}
                <div style={{ textAlign: 'center' }}>
                    {battleState.enemyImage ? (
                        <img
                            src={battleState.enemyImage}
                            alt={enemy?.name}
                            style={{
                                width: '80px',
                                height: '80px',
                                objectFit: 'contain',
                                marginBottom: '10px',
                                filter: 'drop-shadow(0 0 10px rgba(255,0,0,0.3))'
                            }}
                        />
                    ) : (
                        <div style={{ fontSize: '40px', marginBottom: '10px' }}>🦠</div>
                    )}
                    <div style={{ fontWeight: 'bold' }}>{enemy?.name || 'Unknown'}</div>
                    <div style={{
                        width: '100px',
                        height: '10px',
                        background: '#333',
                        borderRadius: '5px',
                        margin: '5px auto',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            width: `${(battleState.enemyHp / battleState.enemyMaxHp) * 100}%`,
                            height: '100%',
                            background: '#ef4444',
                            transition: 'width 0.3s'
                        }} />
                    </div>
                    <div>{battleState.enemyHp} / {battleState.enemyMaxHp}</div>
                </div>
            </div>

            {/* Battle Logs */}
            <div style={{
                flex: 1,
                minHeight: '120px',
                maxHeight: '140px',
                height: '140px',
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '8px',
                padding: '10px',
                overflowY: 'auto',
                marginBottom: '20px',
                textAlign: 'left',
                fontSize: '13px',
                lineHeight: '1.5'
            }}>
                {battleState.logs.map((log, i) => (
                    <div key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '2px 0', color: 'white' }}>
                        {log}
                    </div>
                ))}
            </div>

            {/* Result Actions */}
            {battleState.result && (
                <div>
                    <h3 style={{
                        color: battleState.result === 'victory' ? '#fbbf24' : '#94a3b8',
                        fontSize: '24px',
                        margin: '0 0 20px 0'
                    }}>
                        {battleState.result === 'victory' ? '승리!' : '패배...'}
                    </h3>

                    {/* Show rewards on victory */}
                    {battleState.result === 'victory' && Object.keys(battleState.rewards).length > 0 && (
                        <div style={{
                            background: 'rgba(251, 191, 36, 0.1)',
                            border: '2px solid #fbbf24',
                            borderRadius: '8px',
                            padding: '10px',
                            marginBottom: '15px',
                            maxHeight: '120px',
                            overflowY: 'auto'
                        }}>
                            <h4 style={{ color: '#fbbf24', margin: '0 0 8px 0', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <img src="/assets/bag.png" alt="bag" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
                                획득한 아이템
                            </h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {Object.entries(battleState.rewards).map(([materialId, quantity]) => {
                                    const material = MATERIALS[materialId]
                                    const isImage = material?.iconUrl?.startsWith('/') || material?.iconUrl?.startsWith('http')

                                    return (
                                        <div key={materialId} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            padding: '4px 8px',
                                            background: 'rgba(0,0,0,0.3)',
                                            borderRadius: '4px'
                                        }}>
                                            {isImage ? (
                                                <img
                                                    src={material?.iconUrl}
                                                    alt={material?.name}
                                                    style={{ width: '20px', height: '20px', objectFit: 'contain' }}
                                                />
                                            ) : (
                                                <span style={{ fontSize: '16px' }}>{material?.iconUrl || '📦'}</span>
                                            )}
                                            <span style={{ color: '#e5e7eb', fontSize: '12px', whiteSpace: 'nowrap' }}>{material?.name || materialId}</span>
                                            <span style={{ color: '#fbbf24', fontWeight: 'bold', fontSize: '12px' }}>x{quantity}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    <button
                        onClick={endBattle}
                        style={{
                            padding: '12px 30px',
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        돌아가기
                    </button>
                </div>
            )}
        </div>
    )
}
