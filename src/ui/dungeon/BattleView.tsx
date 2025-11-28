import { useEffect } from 'react'
import { useGameStore } from '../../store/useGameStore'
import { SLIME_DUNGEON } from '../../data/dungeonData'
import { MATERIALS } from '../../data/alchemyData'

export default function BattleView() {
    const { battleState, processTurn, endBattle } = useGameStore()

    // Auto-battle loop
    useEffect(() => {
        if (!battleState || battleState.result) return

        const timer = setInterval(() => {
            processTurn()
        }, 1000)

        return () => clearInterval(timer)
    }, [battleState, processTurn])

    if (!battleState) return null

    const enemy = SLIME_DUNGEON.enemies.find(e => e.id === battleState.enemyId)

    return (
        <div style={{
            padding: '20px',
            color: 'white',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            height: '100%'
        }}>
            <h2 style={{ color: '#ef4444' }}>⚔️ 전투 중! ⚔️</h2>

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
                    <div style={{ fontSize: '40px', marginBottom: '10px' }}>🧙‍♂️</div>
                    <div style={{ fontWeight: 'bold' }}>나의 몬스터</div>
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
                </div>

                <div style={{ fontSize: '24px', color: '#aaa' }}>VS</div>

                {/* Enemy */}
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '40px', marginBottom: '10px' }}>🦠</div>
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
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '8px',
                padding: '10px',
                overflowY: 'auto',
                marginBottom: '20px',
                textAlign: 'left',
                fontSize: '14px',
                lineHeight: '1.6'
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
                        {battleState.result === 'victory' ? '🎉 승리!' : '💀 패배...'}
                    </h3>

                    {/* Show rewards on victory */}
                    {battleState.result === 'victory' && Object.keys(battleState.rewards).length > 0 && (
                        <div style={{
                            background: 'rgba(251, 191, 36, 0.1)',
                            border: '2px solid #fbbf24',
                            borderRadius: '8px',
                            padding: '15px',
                            marginBottom: '20px'
                        }}>
                            <h4 style={{ color: '#fbbf24', margin: '0 0 10px 0', fontSize: '16px' }}>✨ 획득한 아이템</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                {Object.entries(battleState.rewards).map(([materialId, quantity]) => (
                                    <div key={materialId} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        padding: '5px 10px',
                                        background: 'rgba(0,0,0,0.2)',
                                        borderRadius: '4px'
                                    }}>
                                        <span style={{ color: '#e5e7eb' }}>{MATERIALS[materialId]?.name || materialId}</span>
                                        <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>x{quantity}</span>
                                    </div>
                                ))}
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
