/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from 'react'
import { useGameStore } from '../../store/useGameStore'
import { useAlchemyStore } from '../../store/useAlchemyStore'
import { DUNGEONS } from '../../data/dungeonData'
import { MATERIALS } from '../../data/alchemyData'
import { MONSTER_DATA } from '../../data/monsterData'

export default function BattleView() {
    const { battleState, processTurn, endBattle, activeDungeon, consumeFloatingTexts } = useGameStore()
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
    const [animatingTexts, setAnimatingTexts] = useState<any[]>([])

    // Shake Logic
    const [playerShakeClass, setPlayerShakeClass] = useState('')
    const [enemyShakeClass, setEnemyShakeClass] = useState('')
    const prevPlayerHpRef = useRef<number>(0)
    const prevEnemyHpRef = useRef<number>(0)

    const getShakeClass = (damage: number, maxHp: number) => {
        const percent = (damage / maxHp) * 100
        if (percent < 5) return 'shake-light'
        if (percent < 20) return 'shake-medium'
        return 'shake-heavy'
    }

    useEffect(() => {
        if (!battleState) return

        // Initialize refs on start
        if (prevPlayerHpRef.current === 0) prevPlayerHpRef.current = battleState.playerHp
        if (prevEnemyHpRef.current === 0) prevEnemyHpRef.current = battleState.enemyHp

        if (battleState.playerHp < prevPlayerHpRef.current) {
            const damage = prevPlayerHpRef.current - battleState.playerHp
            const shakeClass = getShakeClass(damage, battleState.playerMaxHp)
            setPlayerShakeClass(shakeClass)
            setTimeout(() => setPlayerShakeClass(''), 500)
        }
        prevPlayerHpRef.current = battleState.playerHp

        if (battleState.enemyHp < prevEnemyHpRef.current) {
            const damage = prevEnemyHpRef.current - battleState.enemyHp
            const shakeClass = getShakeClass(damage, battleState.enemyMaxHp)
            setEnemyShakeClass(shakeClass)
            setTimeout(() => setEnemyShakeClass(''), 500)
        }
        prevEnemyHpRef.current = battleState.enemyHp
    }, [battleState])

    // Animation Loop
    useEffect(() => {
        let animationFrameId: number
        const animate = () => {
            setAnimatingTexts(prev => {
                if (prev.length === 0) return prev
                return prev
                    .map(t => ({
                        ...t,
                        life: t.life - 1,
                        y: t.y - 1 // Float up 1px per frame
                    }))
                    .filter(t => t.life > 0)
            })
            animationFrameId = requestAnimationFrame(animate)
        }
        animationFrameId = requestAnimationFrame(animate)
        return () => cancelAnimationFrame(animationFrameId)
    }, [])

    const playerAreaRef = useRef<HTMLDivElement>(null)
    const enemyAreaRef = useRef<HTMLDivElement>(null)

    // Consume new texts from store with Dynamic Positioning
    useEffect(() => {
        if (battleState?.floatingTexts && battleState.floatingTexts.length > 0) {
            // const containerRect = document.getElementById('battle-arena')?.getBoundingClientRect()

            const newTexts = battleState.floatingTexts.map(t => {
                let startX = t.x
                let startY = t.y

                // Calculate position relative to container
                if (t.target) {
                    const arena = document.getElementById('battle-arena')
                    let targetElement: HTMLElement | null = null

                    if (t.target === 'PLAYER') {
                        targetElement = document.getElementById('player-name-anchor')
                    } else if (t.target === 'ENEMY') {
                        targetElement = document.getElementById('enemy-name-anchor')
                    }

                    if (arena && targetElement) {
                        const arenaRect = arena.getBoundingClientRect()
                        const targetRect = targetElement.getBoundingClientRect()

                        // Calculate relative position
                        // X: Center of target relative to arena
                        startX = (targetRect.left - arenaRect.left) + (targetRect.width / 2)
                        // Y: Top of target relative to arena (minus offset for floating)
                        startY = (targetRect.top - arenaRect.top) - 35 // 35px above name

                        // Add some randomness
                        startX += (Math.random() * 40 - 20)
                        startY += (Math.random() * 20 - 10)
                    }
                }

                return {
                    ...t,
                    life: 60, // 60 frames (~1 sec)
                    x: startX,
                    y: startY
                }
            })
            setAnimatingTexts(prev => [...prev, ...newTexts])
            consumeFloatingTexts()
        }
    }, [battleState?.floatingTexts, consumeFloatingTexts])

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768)
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const logContainerRef = useRef<HTMLDivElement>(null)

    // Auto-scroll logs
    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
        }
    }, [battleState?.logs, battleState?.result])

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
    // Monster Data
    const monsterData = battleState.selectedMonsterType ? MONSTER_DATA[battleState.selectedMonsterType] : null
    const monsterName = monsterData?.name || '나의 몬스터'

    return (
        <div style={{
            paddingLeft: '10px',
            paddingRight: '10px',
            color: 'white',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            height: '100%'
        }}>
            <div style={{
                position: 'relative',
                display: 'flex',
                justifyContent: 'flex-end',
                marginBottom: '10px',
                height: '30px'
            }}>
                {!battleState.result && (
                    <button
                        onClick={endBattle}
                        style={{
                            background: 'rgba(239, 68, 68, 0.2)',
                            border: '1px solid #ef4444',
                            color: '#fca5a5',
                            padding: '5px 12px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
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
                        <span>🏳️</span>
                        <span>전투 중단</span>
                    </button>
                )}
            </div>

            {/* Battle Arena */}
            <div id="battle-arena" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
                padding: '0 20px',
                position: 'relative',
                overflow: 'visible'  // 플로팅 텍스트가 영역 밖으로 나갈 수 있도록
            }}>
                {/* Floating Texts Overlay - 반드시 battle-arena 내부에서 렌더링되어야 함 */}
                {animatingTexts.map(ft => {
                    let className = ''
                    let fontSize = '24px'
                    const zIndex = 100
                    let icon = ''

                    switch (ft.type) {
                        case 'CRIT':
                            className = 'floating-text-crit'
                            icon = '💥'
                            break
                        case 'WEAK':
                            className = 'floating-text-weak'
                            icon = '🔥'
                            break
                        case 'RESIST':
                            fontSize = '18px'
                            ft.color = '#9ca3af' // Force gray
                            break
                        case 'HEAL':
                            className = 'floating-text-heal'
                            icon = '➕'
                            break
                    }

                    return (
                        <div key={ft.id} className={className} style={{
                            position: 'absolute',
                            left: '0',
                            top: '0',
                            transform: `translate(${ft.x}px, ${ft.y}px) translateX(-50%)`,
                            color: ft.color,
                            fontSize: className ? undefined : fontSize,
                            fontWeight: 'bold',
                            pointerEvents: 'none',
                            textShadow: '0 0 4px black',
                            opacity: Math.max(0, ft.life / 20),
                            zIndex,
                            whiteSpace: 'nowrap',
                            transition: 'transform 0.1s'
                        }}>
                            {icon} {ft.text}
                        </div>
                    )
                })}
                {/* Player */}
                <div ref={playerAreaRef} style={{ textAlign: 'center' }}>
                    {battleState.playerMonsterImage ? (
                        <div className={playerShakeClass} style={{ display: 'inline-block' }}>
                            <img
                                src={battleState.playerMonsterImage}
                                alt={monsterName}
                                style={{
                                    width: isMobile ? '120px' : '80px',
                                    height: isMobile ? '120px' : '80px',
                                    objectFit: 'contain',
                                    marginBottom: '10px',
                                    filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.3))'
                                }}
                            />
                        </div>
                    ) : (
                        <div className={playerShakeClass} style={{ fontSize: '40px', marginBottom: '10px', display: 'inline-block' }}>🧙‍♂️</div>
                    )}
                    <div id="player-name-anchor" style={{ fontWeight: 'bold' }}>{monsterName}</div>
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

                    {/* Player Stats */}
                    <div style={{
                        marginTop: '8px',
                        fontSize: '12px',
                        color: '#94a3b8',
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '8px'
                    }}>
                        <span>⚔️ {battleState.playerAtk}</span>
                        <span>🛡️ {battleState.playerDef}</span>
                        <span>{battleState.playerElement === 'FIRE' ? '🔥' :
                            battleState.playerElement === 'WATER' ? '💧' :
                                battleState.playerElement === 'WIND' ? '🌪️' :
                                    battleState.playerElement === 'EARTH' ? '🪨' :
                                        battleState.playerElement === 'LIGHT' ? '✨' :
                                            battleState.playerElement === 'DARK' ? '🌑' : '❓'}</span>
                    </div>

                    {/* Status Effects */}
                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginTop: '4px', minHeight: '20px' }}>
                        {battleState.playerStatusEffects?.map((effect, idx) => {
                            let icon = ''
                            let color = ''
                            switch (effect.type) {
                                case 'BURN': icon = '🔥'; color = '#ef4444'; break;
                                case 'POISON': icon = '☠️'; color = '#a855f7'; break;
                                case 'REGEN': icon = '🌿'; color = '#22c55e'; break;
                                case 'STUN': icon = '💫'; color = '#eab308'; break;
                                case 'ATK_BUFF': icon = '⚔️▲'; color = '#3b82f6'; break;
                                case 'DEF_BUFF': icon = '🛡️▲'; color = '#6b7280'; break;
                            }
                            return (
                                <span key={idx} title={`${effect.type} (${effect.duration} turns)`} style={{ color, fontSize: '14px' }}>
                                    {icon}<sub style={{ fontSize: '10px' }}>{effect.duration}</sub>
                                </span>
                            )
                        })}
                    </div>

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

                <div style={{ fontSize: '24px', color: '#aaa', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                    <span>VS</span>
                    {/* Elemental Advantage Indicator */}
                    {(() => {
                        const pEl = battleState.playerElement
                        const eEl = battleState.enemyElement
                        // Simple helper to check advantage (Logic duplicated from util for UI simplicity)
                        const getRelation = (a: string, b: string) => {
                            if ((a === 'FIRE' && b === 'EARTH') || (a === 'EARTH' && b === 'WIND') || (a === 'WIND' && b === 'WATER') || (a === 'WATER' && b === 'FIRE') || (a === 'LIGHT' && b === 'DARK') || (a === 'DARK' && b === 'LIGHT')) return 'ADV'
                            if ((a === 'FIRE' && b === 'WATER') || (a === 'EARTH' && b === 'FIRE') || (a === 'WIND' && b === 'EARTH') || (a === 'WATER' && b === 'WIND')) return 'DIS'
                            return 'NEUTRAL'
                        }
                        const relation = getRelation(pEl!, eEl!)

                        if (relation === 'ADV') return <div style={{ fontSize: '12px', color: '#4ade80', background: 'rgba(74, 222, 128, 0.2)', padding: '2px 6px', borderRadius: '4px' }}>유리함!</div>
                        if (relation === 'DIS') return <div style={{ fontSize: '12px', color: '#ef4444', background: 'rgba(239, 68, 68, 0.2)', padding: '2px 6px', borderRadius: '4px' }}>불리함...</div>
                        return null
                    })()}
                </div>

                {/* Enemy */}
                <div ref={enemyAreaRef} style={{ textAlign: 'center' }}>
                    {battleState.enemyImage ? (
                        <div className={enemyShakeClass} style={{ display: 'inline-block' }}>
                            <img
                                src={battleState.enemyImage}
                                alt={enemy?.name}
                                style={{
                                    width: isMobile ? '120px' : '80px',
                                    height: isMobile ? '120px' : '80px',
                                    objectFit: 'contain',
                                    marginBottom: '10px',
                                    transition: 'filter 0.5s ease',
                                    filter: battleState.enemyHp <= 0
                                        ? 'grayscale(100%) brightness(50%) opacity(0.8)'
                                        : 'drop-shadow(0 0 10px rgba(255,0,0,0.3))'
                                }}
                            />
                        </div>
                    ) : (
                        <div className={enemyShakeClass} style={{ fontSize: '40px', marginBottom: '10px', display: 'inline-block' }}>🦠</div>
                    )}
                    <div id="enemy-name-anchor" style={{ fontWeight: 'bold' }}>{enemy?.name || 'Unknown'}</div>
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

                    {/* Enemy Stats */}
                    <div style={{
                        marginTop: '8px',
                        fontSize: '12px',
                        color: '#94a3b8',
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '8px'
                    }}>
                        <span>⚔️ {battleState.enemyAtk}</span>
                        <span>🛡️ {battleState.enemyDef}</span>
                        <span>{battleState.enemyElement === 'FIRE' ? '🔥' :
                            battleState.enemyElement === 'WATER' ? '💧' :
                                battleState.enemyElement === 'WIND' ? '🌪️' :
                                    battleState.enemyElement === 'EARTH' ? '🪨' :
                                        battleState.enemyElement === 'LIGHT' ? '✨' :
                                            battleState.enemyElement === 'DARK' ? '🌑' : '❓'}</span>
                    </div>

                    {/* Status Effects */}
                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginTop: '4px', minHeight: '20px' }}>
                        {battleState.enemyStatusEffects?.map((effect, idx) => {
                            let icon = ''
                            let color = ''
                            switch (effect.type) {
                                case 'BURN': icon = '🔥'; color = '#ef4444'; break;
                                case 'POISON': icon = '☠️'; color = '#a855f7'; break;
                                case 'REGEN': icon = '🌿'; color = '#22c55e'; break;
                                case 'STUN': icon = '💫'; color = '#eab308'; break;
                                case 'ATK_BUFF': icon = '⚔️▲'; color = '#3b82f6'; break;
                                case 'DEF_BUFF': icon = '🛡️▲'; color = '#6b7280'; break;
                            }
                            return (
                                <span key={idx} title={`${effect.type} (${effect.duration} turns)`} style={{ color, fontSize: '14px' }}>
                                    {icon}<sub style={{ fontSize: '10px' }}>{effect.duration}</sub>
                                </span>
                            )
                        })}
                    </div>
                </div>
            </div>


            {/* Battle Logs */}
            <div
                ref={logContainerRef}
                style={{
                    flex: 1,
                    minHeight: '120px',
                    background: 'rgba(0,0,0,0.3)',
                    borderRadius: '8px',
                    padding: '10px',
                    overflowY: 'auto',
                    marginBottom: '20px',
                    textAlign: 'left',
                    fontSize: '13px',
                    lineHeight: '1.5',
                    position: 'relative' // For floating text container context if needed
                }}>
                {battleState.logs.map((log, i) => {
                    // Normalize log to string just in case
                    let logText = String(log)
                    let color = 'white'

                    if (logText.startsWith('[PLAYER]')) {
                        color = '#e5e7eb' // Standard text
                        logText = logText.replace('[PLAYER]', '')
                    } else if (logText.startsWith('[ENEMY]')) {
                        color = '#9ca3af' // Dimmed
                        logText = logText.replace('[ENEMY]', '')
                    } else if (logText.startsWith('[CONSUMABLE]')) {
                        color = '#a3e635' // Green highlight for consumable
                        logText = logText.replace('[CONSUMABLE]', '')
                    }

                    // Parsing logic for tags: {{RED|text}}, {{GREEN|text}}, {{GRAY|text}}, {{GOLD|text}} and {{R_RARITY|text}}
                    const parts = logText.split(/({{RED\|[^}]+}}|{{GREEN\|[^}]+}}|{{GRAY\|[^}]+}}|{{GOLD\|[^}]+}}|{{R_[^|]+\|[^}]+}})/g)

                    const getRarityColor = (rarity: string) => {
                        switch (rarity) {
                            case 'N': return '#e5e7eb'
                            case 'R': return '#3b82f6'
                            case 'SR': return '#a855f7'
                            case 'SSR': return '#fbbf24'
                            case 'UR': return '#ef4444'
                            default: return '#e5e7eb'
                        }
                    }

                    return (
                        <div key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '2px 0', color }}>
                            {parts.map((part, idx) => {
                                if (part.startsWith('{{RED|') && part.endsWith('}}')) {
                                    const content = part.slice(6, -2)
                                    return <span key={idx} style={{ color: '#ef4444', fontWeight: 'bold' }}>{content}</span>
                                } else if (part.startsWith('{{GREEN|') && part.endsWith('}}')) {
                                    const content = part.slice(8, -2)
                                    return <span key={idx} style={{ color: '#4ade80', fontWeight: 'bold' }}>{content}</span>
                                } else if (part.startsWith('{{GRAY|') && part.endsWith('}}')) {
                                    const content = part.slice(7, -2)
                                    return <span key={idx} style={{ color: '#9ca3af', fontWeight: 'bold' }}>{content}</span>
                                } else if (part.startsWith('{{GOLD|') && part.endsWith('}}')) {
                                    const content = part.slice(7, -2)
                                    return (
                                        <span key={idx} style={{ color: '#fbbf24', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                                            <img src="/assets/ui/gold_coin.png" alt="골드" style={{ width: '14px', height: '14px', verticalAlign: 'middle' }} />
                                            {content}
                                        </span>
                                    )
                                } else if (part.startsWith('{{R_') && part.endsWith('}}')) {
                                    const match = part.match(/{{R_([^|]+)\|([^}]+)}}/)
                                    if (match) {
                                        const rarity = match[1]
                                        const content = match[2]
                                        return <span key={idx} style={{ color: getRarityColor(rarity), fontWeight: 'bold' }}>{content}</span>
                                    }
                                }
                                return <span key={idx}>{part}</span>
                            })}
                        </div>
                    )
                })}
            </div>



            {/* Result Actions */}
            {battleState.result && (
                <div style={{ paddingBottom: '20px' }}>
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
                                    // Special handling for gold
                                    if (materialId === 'gold') {
                                        return (
                                            <div key={materialId} style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                padding: '4px 8px',
                                                background: 'rgba(0,0,0,0.3)',
                                                borderRadius: '4px'
                                            }}>
                                                <img
                                                    src="/assets/ui/gold_coin.png"
                                                    alt="골드"
                                                    style={{ width: '20px', height: '20px', objectFit: 'contain' }}
                                                />
                                                <span style={{ color: '#fbbf24', fontSize: '12px', whiteSpace: 'nowrap', fontWeight: 'bold' }}>
                                                    골드
                                                </span>
                                                <span style={{ color: '#fbbf24', fontWeight: 'bold', fontSize: '12px' }}>x{quantity}</span>
                                            </div>
                                        )
                                    }

                                    const material = MATERIALS[materialId]
                                    const isImage = material?.iconUrl?.startsWith('/') || material?.iconUrl?.startsWith('http')

                                    // Helper duplicated or moved to outer scope if preferred, but defining locally for safety in this snippet
                                    const getRarityColorForReward = (rarity: string) => {
                                        switch (rarity) {
                                            case 'N': return '#e5e7eb'
                                            case 'R': return '#3b82f6'
                                            case 'SR': return '#a855f7'
                                            case 'SSR': return '#fbbf24'
                                            case 'UR': return '#ef4444'
                                            default: return '#e5e7eb'
                                        }
                                    }
                                    const rarityColor = getRarityColorForReward(material?.rarity || 'N')

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
                                            <span style={{ color: rarityColor, fontSize: '12px', whiteSpace: 'nowrap', fontWeight: 'bold' }}>
                                                {material?.name || materialId}
                                            </span>
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
                    <div style={{ height: '20px' }} /> {/* Extra padding at bottom */}
                </div>
            )}
        </div>
    )
}
