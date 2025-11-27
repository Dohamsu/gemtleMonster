import { useGameStore } from '../../store/useGameStore'
import { SLIME_DUNGEON } from '../../data/dungeonData'
import BattleView from './BattleView'

interface DungeonModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function DungeonModal({ isOpen, onClose }: DungeonModalProps) {
    const { battleState, startBattle } = useGameStore()

    if (!isOpen) return null

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
                                            onClick={() => startBattle(SLIME_DUNGEON.id, enemy.id)}
                                            style={{
                                                padding: '8px 16px',
                                                background: '#ef4444',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontWeight: 'bold'
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
