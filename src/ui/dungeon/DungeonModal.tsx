/* eslint-disable no-console */
import { useState, useEffect } from 'react'
import { useGameStore } from '../../store/useGameStore'
import { useAlchemyStore } from '../../store/useAlchemyStore'
import { DUNGEONS } from '../../data/dungeonData'
import { GAME_MONSTERS as MONSTERS } from '../../data/monsterData'
import BattleView from './BattleView'
import ConsumableConfigPanel from './ConsumableConfigPanel'

interface DungeonModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function DungeonModal({ isOpen, onClose }: DungeonModalProps) {
    const { battleState, startBattle } = useGameStore()
    const { playerMonsters, loadPlayerMonsters, userId } = useAlchemyStore()
    const [selectedMonsterId, setSelectedMonsterId] = useState<string | null>(null)
    const [selectedDungeonId, setSelectedDungeonId] = useState<string | null>(null)
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
    const [showConsumableConfig, setShowConsumableConfig] = useState(false)

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768)
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

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
        console.log(`[DungeonModal] handleStartBattle clicked for enemy: ${enemyId}`)
        console.log(`[DungeonModal] Current State: selectedMonsterId=${selectedMonsterId}, selectedDungeonId=${selectedDungeonId}`)

        if (!selectedMonsterId) {
            console.warn('[DungeonModal] No monster selected')
            alert('몬스터를 먼저 선택해주세요!')
            return
        }
        if (!selectedDungeonId) {
            console.error('[DungeonModal] No dungeon selected (unexpected)')
            return
        }

        console.log('[DungeonModal] Calling startBattle...')
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
            padding: '0px'
        }}>
            <div style={{
                width: isMobile ? '100%' : '90%',
                height: isMobile ? '100%' : 'auto',
                maxWidth: '800px',
                maxHeight: isMobile ? '100%' : '95vh',
                background: '#1e293b',
                borderRadius: isMobile ? '0' : '16px',
                border: isMobile ? 'none' : '2px solid #475569',
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {!battleState && (
                            <button
                                onClick={() => setShowConsumableConfig(true)}
                                style={{
                                    background: 'rgba(59, 130, 246, 0.2)',
                                    border: '1px solid #3b82f6',
                                    color: '#60a5fa',
                                    padding: '6px 12px',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}
                            >
                                ⚙️ 소모품
                            </button>
                        )}
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
                            {[...DUNGEONS].sort((a, b) => a.recommendedLevel - b.recommendedLevel).map(dungeon => (
                                <div
                                    key={dungeon.id}
                                    onClick={() => setSelectedDungeonId(dungeon.id)}
                                    style={{
                                        background: '#334155',
                                        padding: '15px',
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        border: '2px solid transparent',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        gap: '15px',
                                        alignItems: 'center'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#a3e635'}
                                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
                                >
                                    {/* Dungeon Image */}
                                    <div style={{
                                        width: '80px',
                                        height: '80px',
                                        borderRadius: '8px',
                                        overflow: 'hidden',
                                        flexShrink: 0,
                                        background: '#1e293b',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <img
                                            src={dungeon.iconUrl}
                                            alt={dungeon.name}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover'
                                            }}
                                            onError={(e) => {
                                                // 이미지 로드 실패 시 이모지로 대체
                                                e.currentTarget.style.display = 'none'
                                                const parent = e.currentTarget.parentElement
                                                if (parent) {
                                                    parent.innerHTML = '<span style="font-size: 40px">🏰</span>'
                                                }
                                            }}
                                        />
                                    </div>
                                    {/* Dungeon Info */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <h3 style={{ margin: '0 0 5px 0', color: '#fff' }}>{dungeon.name}</h3>
                                        <p style={{
                                            margin: 0,
                                            color: '#94a3b8',
                                            fontSize: '13px',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical'
                                        }}>
                                            {dungeon.description}
                                        </p>
                                    </div>
                                    {/* Level Badge */}
                                    <div style={{
                                        background: '#0f172a',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        color: '#a3e635',
                                        fontSize: '11px',
                                        fontWeight: 'bold',
                                        flexShrink: 0
                                    }}>
                                        Lv.{dungeon.recommendedLevel}
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
                                    marginBottom: '20px',
                                }}>
                                    몬스터가 없습니다. 연금술로 몬스터를 만들어보세요! 🧪
                                </div>
                            ) : (
                                <div style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '8px',
                                    marginBottom: '20px',
                                    maxHeight: '300px',
                                    overflowY: 'auto',
                                    padding: '4px'
                                }}>
                                    {playerMonsters.map(monster => {
                                        const monsterKey = monster.monster_id.replace('monster_', '')
                                        const monsterData = MONSTERS[monsterKey]
                                        if (!monsterData) return null

                                        const isSelected = selectedMonsterId === monster.id
                                        return (
                                            <div
                                                key={monster.id}
                                                onClick={() => {
                                                    console.log('[DungeonModal] Selecting monster:', monster.id)
                                                    setSelectedMonsterId(monster.id)
                                                }}
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    background: isSelected ? '#3b82f6' : '#334155',
                                                    padding: '8px',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    border: isSelected ? '2px solid #60a5fa' : '2px solid transparent',
                                                    transition: 'all 0.2s',
                                                    width: '64px',
                                                    flexShrink: 0
                                                }}
                                            >
                                                {/* 몬스터 썸네일 */}
                                                <div style={{
                                                    width: '48px',
                                                    height: '48px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    marginBottom: '4px'
                                                }}>
                                                    {monsterData.iconUrl ? (
                                                        <img
                                                            src={monsterData.iconUrl}
                                                            alt={monsterData.name}
                                                            style={{
                                                                width: '100%',
                                                                height: '100%',
                                                                objectFit: 'contain'
                                                            }}
                                                        />
                                                    ) : (
                                                        <span style={{ fontSize: '28px' }}>🦠</span>
                                                    )}
                                                </div>
                                                {/* 레벨 뱃지 */}
                                                <div style={{
                                                    fontSize: '10px',
                                                    color: isSelected ? '#fff' : '#94a3b8',
                                                    fontWeight: 'bold',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    width: '100%',
                                                    textAlign: 'center'
                                                }}>
                                                    Lv.{monster.level}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}

                            <h3 style={{ color: '#fff', borderBottom: '1px solid #334155', paddingBottom: '10px', fontSize: '14px' }}>
                                출몰 몬스터
                            </h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {selectedDungeon?.enemies.map(enemy => {
                                    const enemyData = MONSTERS[enemy.id]
                                    return (
                                        <div key={enemy.id} style={{
                                            background: '#334155',
                                            padding: '10px 12px',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            gap: '10px'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                                                <div style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    flexShrink: 0
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
                                                        <div style={{ fontSize: '24px' }}>
                                                            {selectedDungeonId === 'dungeon_lake' ? '💧' : '🦠'}
                                                        </div>
                                                    )}
                                                </div>
                                                <div style={{ minWidth: 0 }}>
                                                    <div style={{ fontWeight: 'bold', color: '#fff', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{enemy.name}</div>
                                                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>Lv.{enemy.level} • HP {enemy.hp}</div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    console.log('[DungeonModal] Battle button clicked!')
                                                    handleStartBattle(enemy.id)
                                                }}
                                                disabled={!selectedMonsterId}
                                                style={{
                                                    padding: '6px 12px',
                                                    background: selectedMonsterId ? '#ef4444' : '#6b7280',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    cursor: selectedMonsterId ? 'pointer' : 'not-allowed',
                                                    fontWeight: 'bold',
                                                    opacity: selectedMonsterId ? 1 : 0.5,
                                                    fontSize: '12px',
                                                    flexShrink: 0
                                                }}
                                            >
                                                전투
                                            </button>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Consumable Config Panel */}
            <ConsumableConfigPanel
                isOpen={showConsumableConfig}
                onClose={() => setShowConsumableConfig(false)}
            />
        </div>
    )
}
