/* eslint-disable no-console */
import { useState, useMemo } from 'react'
import { MONSTER_DATA } from '../../data/monsterData'
import { useAlchemyStore } from '../../store/useAlchemyStore'
import { awakenMonster } from '../../lib/monsterApi'
import { useAuth } from '../../hooks/useAuth'
import type { PlayerMonster } from '../../types/monster'

interface AwakeningModalProps {
    targetMonster: PlayerMonster
    onClose: () => void
    onSuccess: () => void
}

export default function AwakeningModal({ targetMonster, onClose, onSuccess }: AwakeningModalProps) {
    const { user } = useAuth()
    const { playerMonsters, loadPlayerMonsters } = useAlchemyStore()

    // Refresh data on mount to ensure fresh state
    useState(() => {
        if (user) {
            loadPlayerMonsters(user.id).catch(console.error)
        }
    })
    const [selectedMaterialIds, setSelectedMaterialIds] = useState<string[]>([])
    const [isProcessing, setIsProcessing] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [animationState, setAnimationState] = useState<'SELECT' | 'ANIMATING' | 'SUCCESS'>('SELECT')
    const [resultLevel, setResultLevel] = useState<number | null>(null)

    // Filter available materials: Same monster_id, not locked, not the target itself
    const availableMaterials = useMemo(() => {
        return playerMonsters.filter(m =>
            m.monster_id === targetMonster.monster_id && // Same species
            m.id !== targetMonster.id && // Not self
            !m.is_locked // Not locked
        )
    }, [playerMonsters, targetMonster])

    const toggleSelection = (id: string) => {
        if (selectedMaterialIds.includes(id)) {
            setSelectedMaterialIds(prev => prev.filter(mid => mid !== id))
        } else {
            // Allow selection even if it exceeds max level, but show warning later
            setSelectedMaterialIds(prev => [...prev, id])
        }
    }

    // Calculate projected level
    const currentLevel = targetMonster.awakening_level || 0
    const addedValue = selectedMaterialIds.reduce((sum, id) => {
        const mat = availableMaterials.find(m => m.id === id)
        return sum + (1 + (mat?.awakening_level || 0))
    }, 0)
    const projectedLevel = currentLevel + addedValue
    const isOverMax = projectedLevel > 5

    const handleAwaken = async () => {
        console.log('🌟 [Awakening] Attempting to awaken:', { target: targetMonster.id, materials: selectedMaterialIds })

        if (!user) {
            console.error('❌ [Awakening] No user found')
            setError('로그인이 필요합니다.')
            return
        }

        if (selectedMaterialIds.length === 0) return

        setIsProcessing(true)
        setError(null)
        setAnimationState('ANIMATING')

        try {
            // Start animation (visual only first part)
            await new Promise(resolve => setTimeout(resolve, 1500)) // Fake delay for build-up

            // Actual API call
            const result = await awakenMonster(user.id, targetMonster.id, selectedMaterialIds)
            console.log('✅ [Awakening] API Result:', result)

            if (result.success) {
                // Success Flash
                setResultLevel(result.newAwakeningLevel) // Store result
                setAnimationState('SUCCESS')
                await loadPlayerMonsters(user.id)
                console.log('✅ [Awakening] Player data refreshed')

                // Show success state for a moment
                await new Promise(resolve => setTimeout(resolve, 2000)) // Increased duration slightly for reading

                onSuccess() // Trigger parent refresh
                onClose()
            } else {
                console.error('❌ [Awakening] Failed:', result.error)
                setError(result.error || '초월에 실패했습니다.')
                setAnimationState('SELECT')
            }
        } catch (err) {
            console.error('❌ [Awakening] Exception:', err)
            setError('시스템 오류가 발생했습니다.')
            setAnimationState('SELECT')
        } finally {
            setIsProcessing(false)
        }
    }

    const data = MONSTER_DATA[targetMonster.monster_id]
    if (!data) return null

    // Helper to get color
    function getRarityColor(r: string) {
        switch (r) {
            case 'SSR': return '#fbbf24';
            case 'SR': return '#c084fc';
            case 'R': return '#60a5fa';
            default: return '#94a3b8';
        }
    }

    // Animation Styles
    const animationStyles = `
        @keyframes pulse-glow {
            0% { transform: scale(1); filter: drop-shadow(0 0 10px ${getRarityColor(data.rarity || 'N')}); }
            50% { transform: scale(1.1); filter: drop-shadow(0 0 30px ${getRarityColor(data.rarity || 'N')}) brightness(1.5); }
            100% { transform: scale(1); filter: drop-shadow(0 0 10px ${getRarityColor(data.rarity || 'N')}); }
        }
        @keyframes success-pop {
            0% { transform: scale(0.5); opacity: 0; }
            70% { transform: scale(1.2); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
        }
        @keyframes rays {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 1100, padding: '20px',
            pointerEvents: 'auto'
        }} onClick={animationState === 'SELECT' ? onClose : undefined}>
            <style>{animationStyles}</style>

            <div style={{
                background: '#1e293b',
                width: '100%', maxWidth: '500px',
                borderRadius: '16px',
                border: `2px solid ${animationState === 'SELECT' ? '#fbbf24' : 'transparent'}`,
                padding: '24px',
                display: 'flex', flexDirection: 'column', gap: '20px',
                position: 'relative',
                boxShadow: animationState === 'ANIMATING' ? '0 0 100px rgba(251, 191, 36, 0.5)' : '0 0 30px rgba(0,0,0,0.5)',
                transition: 'all 0.5s ease',
                overflow: 'hidden'
            }} onClick={e => e.stopPropagation()}>

                {/* ANIMATING / SUCCESS VIEW */}
                {(animationState === 'ANIMATING' || animationState === 'SUCCESS') && (
                    <div style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        minHeight: '300px', gap: '20px', position: 'relative'
                    }}>
                        {/* Background Rays - Only on SUCCESS */}
                        {animationState === 'SUCCESS' && (
                            <div style={{
                                position: 'absolute',
                                top: 0, left: 0, right: 0, bottom: 0,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                overflow: 'visible',
                                pointerEvents: 'none'
                            }}>
                                <div style={{
                                    width: 'min(80vw, 80vh, 400px)',
                                    height: 'min(80vw, 80vh, 400px)',
                                    background: `repeating-conic-gradient(from 0deg, ${getRarityColor(data.rarity || 'N')}30 0deg 10deg, transparent 10deg 20deg)`,
                                    animation: 'rays 10s linear infinite',
                                    borderRadius: '50%',
                                    opacity: 0.8,
                                    filter: 'blur(3px)'
                                }}></div>
                            </div>
                        )}

                        {/* Main Monster */}
                        <div style={{
                            zIndex: 1,
                            animation: animationState === 'ANIMATING' ? 'pulse-glow 1.5s infinite ease-in-out' : 'success-pop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                            filter: `drop-shadow(0 0 25px ${getRarityColor(data.rarity || 'N')})`,
                            position: 'relative', textAlign: 'center'
                        }}>
                            {data.iconUrl
                                ? <img src={data.iconUrl} alt={data.name} style={{ width: 'min(120px, 30vw)', height: 'min(120px, 30vw)', objectFit: 'contain' }} />
                                : <span style={{ fontSize: 'min(80px, 20vw)' }}>{data.emoji}</span>
                            }
                            {animationState === 'SUCCESS' && (
                                <div style={{
                                    position: 'absolute', bottom: '-25px', left: '50%', transform: 'translateX(-50%)',
                                    fontSize: 'clamp(16px, 5vw, 24px)', color: '#fbbf24', textShadow: '0 0 10px #f59e0b',
                                    whiteSpace: 'nowrap', fontWeight: 'bold'
                                }}>
                                    ✨ SUCCESS! ✨
                                </div>
                            )}
                        </div>

                        <div style={{ zIndex: 1, color: '#cbd5e1', fontSize: 'clamp(1em, 4vw, 1.2em)', fontWeight: 'bold', textAlign: 'center', marginTop: '10px' }}>
                            {animationState === 'ANIMATING' ? '초월 진행 중...' : (
                                <>
                                    초월 성공!<br />
                                    <span style={{ color: '#fbbf24', fontSize: '1.2em' }}>
                                        Lv.{resultLevel ?? targetMonster.awakening_level} 달성
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* SELECTION VIEW */}
                {animationState === 'SELECT' && (
                    <>
                        <h2 style={{ margin: 0, color: '#fbbf24', textAlign: 'center' }}>✨ 몬스터 초월</h2>

                        <div style={{ textAlign: 'center', color: '#cbd5e1', fontSize: '0.95em' }}>
                            <span style={{ color: '#93c5fd', fontWeight: 'bold' }}>{data.name}</span>을(를) 초월하시겠습니까?<br />
                            <span style={{ fontSize: '0.85em', color: '#94a3b8' }}>
                                선택된 <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>{selectedMaterialIds.length}</span>마리의 재료는
                                <span style={{ color: '#f87171' }}> 소멸</span>됩니다.<br />
                                <span style={{ color: isOverMax ? '#ef4444' : '#fbbf24' }}>
                                    예상 결과: Lv.{targetMonster.awakening_level || 0} → Lv.{projectedLevel}
                                </span>
                            </span>
                        </div>

                        {/* Selection Area */}
                        <div style={{
                            background: 'rgba(15, 23, 42, 0.5)', borderRadius: '12px', padding: '15px',
                            minHeight: '150px', maxHeight: '300px', overflowY: 'auto'
                        }}>
                            <h3 style={{ margin: '0 0 10px', fontSize: '0.9em', color: '#e2e8f0' }}>재료 선택 (중복 몬스터)</h3>

                            {availableMaterials.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                                    사용 가능한 재료 몬스터가 없습니다.<br />
                                    <span style={{ fontSize: '0.8em' }}>(잠금 해제된 동일 몬스터 필요)</span>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', gap: '10px' }}>
                                    {availableMaterials.map(mat => {
                                        const isSelected = selectedMaterialIds.includes(mat.id)
                                        return (
                                            <div key={mat.id}
                                                onClick={() => toggleSelection(mat.id)}
                                                style={{
                                                    cursor: 'pointer',
                                                    border: isSelected ? '2px solid #fbbf24' : '1px solid #334155',
                                                    borderRadius: '8px', padding: '5px',
                                                    background: isSelected ? 'rgba(251, 191, 36, 0.2)' : 'rgba(30, 41, 59, 0.8)',
                                                    textAlign: 'center', transition: 'all 0.2s',
                                                    transform: isSelected ? 'scale(1.05)' : 'scale(1)'
                                                }}
                                            >
                                                <div style={{
                                                    width: '100%', aspectRatio: '1/1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: '24px', overflow: 'hidden', padding: '5px', position: 'relative'
                                                }}>
                                                    {data.iconUrl
                                                        ? <img src={data.iconUrl} alt={data.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                                        : data.emoji
                                                    }
                                                    <div style={{
                                                        position: 'absolute', bottom: '0', right: '0',
                                                        background: '#3b82f6', color: 'white', fontSize: '10px',
                                                        padding: '1px 4px', borderRadius: '4px', fontWeight: 'bold',
                                                        boxShadow: '0 1px 2px rgba(0,0,0,0.5)'
                                                    }}>
                                                        Lv.{mat.level}
                                                    </div>
                                                    {/* Awakening Stars */}
                                                    {(mat.awakening_level || 0) > 0 && (
                                                        <div style={{
                                                            position: 'absolute', top: '2px', left: '2px',
                                                            color: '#fbbf24', fontSize: '10px', fontWeight: 'bold',
                                                            textShadow: '0 0 2px #000',
                                                            display: 'flex', gap: '1px'
                                                        }}>
                                                            {'★'.repeat(mat.awakening_level || 0)}
                                                        </div>
                                                    )}
                                                    {isSelected && (
                                                        <div style={{
                                                            position: 'absolute', top: '2px', right: '2px',
                                                            background: '#fbbf24', borderRadius: '50%', width: '16px', height: '16px',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            fontSize: '10px', color: '#000', fontWeight: 'bold'
                                                        }}>
                                                            ✓
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Warning or Error Message */}
                        {(error || isOverMax) && (
                            <div style={{
                                color: '#ef4444', textAlign: 'center', fontSize: '0.9em',
                                background: 'rgba(220, 38, 38, 0.1)', padding: '8px', borderRadius: '8px'
                            }}>
                                {error || `최대 초월 레벨(5)을 초과할 수 없습니다. (예상: Lv.${projectedLevel})`}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                            <button onClick={onClose} style={{
                                padding: '10px 20px', borderRadius: '8px', border: 'none',
                                background: '#475569', color: 'white', cursor: 'pointer'
                            }}>취소</button>

                            <button
                                onClick={handleAwaken}
                                disabled={selectedMaterialIds.length === 0 || isProcessing || animationState !== 'SELECT' || isOverMax}
                                style={{
                                    padding: '10px 20px', borderRadius: '8px', border: 'none',
                                    background: (selectedMaterialIds.length === 0 || isProcessing || animationState !== 'SELECT' || isOverMax) ? '#94a3b8' : '#fbbf24',
                                    color: (selectedMaterialIds.length === 0 || isProcessing || animationState !== 'SELECT' || isOverMax) ? '#e2e8f0' : '#451a03',
                                    cursor: (selectedMaterialIds.length === 0 || isProcessing || animationState !== 'SELECT' || isOverMax) ? 'not-allowed' : 'pointer',
                                    fontWeight: 'bold', display: 'flex', gap: '8px', alignItems: 'center'
                                }}
                            >
                                {isProcessing ? '처리 중...' : `초월하기 (+${addedValue})`}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
