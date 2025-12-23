import { useState } from 'react'
import { useAlchemyStore } from '../../store/useAlchemyStore'
import { getRequiredExp, getMaxLevel, type RarityType } from '../../lib/monsterLevelUtils'
import type { PlayerMonster } from '../../types/monster'
import { MONSTER_DATA } from '../../data/monsterData'

interface MonsterGrowthModalProps {
    targetMonster: PlayerMonster
    onClose: () => void
    onSuccess?: () => void
}

const COLORS = {
    primary: "#f7ca18", // Light Gold
    primaryDim: "#b48e00",
    secondary: "#f0d090", // Soft Gold
    darkBrown: "#2a1810",
    darkOverlay: "#2a2a2a",
    backgroundLight: "#f8f8f5",
    backgroundDark: "#1a1612", // Deep dark base
    cardBg: "#231f10",
    border: "#494122",
    accentRed: "#ef4444",
    accentGreen: "#0bda1d",
    textMain: "#e0e0e0",
    textSub: "#a0a0a0",
    white: "#ffffff"
}

export default function MonsterGrowthModal({ targetMonster, onClose, onSuccess }: MonsterGrowthModalProps) {
    const { playerMonsters, playerMaterials, feedMonster, feedMonsterBulk } = useAlchemyStore()
    const [feedingState, setFeedingState] = useState<{ loading: boolean, message: string | null }>({ loading: false, message: null })

    // Re-verify monster existence from store just in case
    const liveMonster = playerMonsters.find(m => m.id === targetMonster.id) || targetMonster

    // Basic Data Preparation
    const level = liveMonster.level || 1
    const data = MONSTER_DATA[liveMonster.monster_id]
    const rarity = (data?.rarity || 'N') as RarityType
    const maxLevel = getMaxLevel(rarity)

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 200, // Higher than Detail Modal (100)
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)'
        }} onClick={onClose}>
            <div
                style={{
                    width: '90%', maxWidth: '400px',
                    background: COLORS.backgroundDark,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '16px',
                    padding: '24px',
                    position: 'relative',
                    boxShadow: '0 0 30px rgba(0,0,0,0.8)',
                    transform: 'translateY(0)',
                    animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <h2 style={{
                        margin: 0, fontSize: '20px', color: COLORS.primary,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                    }}>
                        <span style={{ fontSize: '24px' }}>🧪</span> 몬스터 고속 성장
                    </h2>
                    <p style={{ margin: '8px 0 0', fontSize: '13px', color: COLORS.textSub }}>
                        경험치 포션을 사용하여 <br />
                        <span style={{ color: COLORS.white, fontWeight: 'bold' }}>{data?.name || '몬스터'}</span>의 레벨을 올립니다.
                    </p>
                </div>

                {/* Level status */}
                <div style={{
                    marginBottom: '24px', padding: '16px',
                    background: COLORS.cardBg, borderRadius: '12px',
                    border: `1px solid ${COLORS.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}>
                    <div>
                        <div style={{ fontSize: '12px', color: COLORS.textSub }}>현재 레벨</div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: COLORS.white }}>
                            Lv.{level} <span style={{ fontSize: '14px', color: COLORS.textSub }}>/ {maxLevel}</span>
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '12px', color: COLORS.textSub }}>경험치</div>
                        <div style={{ fontSize: '14px', fontWeight: 'bold', color: COLORS.primary, fontFamily: 'monospace' }}>
                            {liveMonster.exp.toLocaleString()} <span style={{ fontSize: '11px', color: '#666' }}>/ {getRequiredExp(level, rarity).toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Action Section */}
                <div style={{ marginBottom: '24px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 'bold', color: COLORS.textMain, marginBottom: '12px' }}>
                        보유 포션
                    </div>
                    {/* Manual Potion Usage */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' }}>
                        {[
                            { id: 'potion_xp_small', name: '소형', exp: 100, color: '#4ade80' },
                            { id: 'potion_xp_medium', name: '중형', exp: 500, color: '#60a5fa' },
                            { id: 'potion_xp_large', name: '대형', exp: 1500, color: '#a855f7' }
                        ].map(potion => {
                            const quantity = playerMaterials[potion.id] || 0
                            const canUse = quantity > 0
                            return (
                                <button
                                    key={potion.id}
                                    disabled={!canUse || feedingState.loading}
                                    onClick={async () => {
                                        if (feedingState.loading) return
                                        setFeedingState({ loading: true, message: null })
                                        const result = await feedMonster(liveMonster.id, potion.id, 1)
                                        setFeedingState({
                                            loading: false,
                                            message: result.message
                                        })
                                        if (result.success && onSuccess) {
                                            // Optional: Call onSuccess if single feed is considered 'success' enough
                                        }
                                        // Clear message after 2s
                                        setTimeout(() => setFeedingState(prev => ({ ...prev, message: null })), 2000)
                                    }}
                                    style={{
                                        background: canUse ? COLORS.cardBg : 'rgba(35, 31, 16, 0.5)',
                                        border: `1px solid ${canUse ? potion.color : COLORS.border}`,
                                        borderRadius: '8px', padding: '10px 4px',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                                        cursor: canUse ? 'pointer' : 'not-allowed',
                                        opacity: canUse ? 1 : 0.5,
                                        transition: 'transform 0.1s',
                                        position: 'relative'
                                    }}
                                    onMouseDown={e => !feedingState.loading && canUse && (e.currentTarget.style.transform = 'scale(0.95)')}
                                    onMouseUp={e => !feedingState.loading && canUse && (e.currentTarget.style.transform = 'scale(1)')}
                                    onMouseLeave={e => !feedingState.loading && canUse && (e.currentTarget.style.transform = 'scale(1)')}
                                >
                                    <div style={{ fontSize: '20px' }}>🧪</div>
                                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'white' }}>{potion.name}</div>
                                    <div style={{ fontSize: '10px', color: potion.color }}>+{potion.exp} EXP</div>
                                    <div style={{
                                        position: 'absolute', top: '4px', right: '4px',
                                        background: '#1a1612', border: `1px solid ${COLORS.border}`,
                                        fontSize: '10px', padding: '1px 4px', borderRadius: '4px',
                                        color: quantity > 0 ? 'white' : '#555'
                                    }}>
                                        {quantity}
                                    </div>
                                </button>
                            )
                        })}
                    </div>

                    {/* Auto Level Up Controls */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        {['NEXT_LEVEL', 'MAX_LEVEL'].map((mode) => {
                            const isMax = mode === 'MAX_LEVEL'
                            const label = isMax ? '최대 레벨 UP' : '+1 레벨 UP'
                            return (
                                <button
                                    key={mode}
                                    disabled={feedingState.loading || level >= maxLevel}
                                    onClick={async () => {
                                        if (feedingState.loading) return

                                        // Dynamic import to avoid potential circular dep issues with heavy data if any
                                        const { calculatePotionsForLevelUp } = await import('../../lib/potionUtils')
                                        const { CONSUMABLE_EFFECTS } = await import('../../data/alchemyData')

                                        const potionDefs = [
                                            { id: 'potion_xp_small', xp: CONSUMABLE_EFFECTS['potion_xp_small']?.value || 100 },
                                            { id: 'potion_xp_medium', xp: CONSUMABLE_EFFECTS['potion_xp_medium']?.value || 500 },
                                            { id: 'potion_xp_large', xp: CONSUMABLE_EFFECTS['potion_xp_large']?.value || 1500 }
                                        ]

                                        const availablePotions = {
                                            'potion_xp_small': playerMaterials['potion_xp_small'] || 0,
                                            'potion_xp_medium': playerMaterials['potion_xp_medium'] || 0,
                                            'potion_xp_large': playerMaterials['potion_xp_large'] || 0,
                                        }

                                        // Calc
                                        const { potionsToUse } = calculatePotionsForLevelUp(
                                            liveMonster.exp,
                                            level,
                                            rarity,
                                            availablePotions,
                                            potionDefs,
                                            mode as 'NEXT_LEVEL' | 'MAX_LEVEL'
                                        )

                                        if (Object.keys(potionsToUse).length === 0) {
                                            setFeedingState({ loading: false, message: '사용 가능한 포션이 부족하거나 이미 최대 레벨입니다.' })
                                            setTimeout(() => setFeedingState(prev => ({ ...prev, message: null })), 2000)
                                            return
                                        }

                                        setFeedingState({ loading: true, message: null })

                                        const result = await feedMonsterBulk(liveMonster.id, potionsToUse)

                                        setFeedingState({
                                            loading: false,
                                            message: result.message
                                        })

                                        if (result.success && onSuccess) {
                                            // Optional success cb
                                        }

                                        setTimeout(() => setFeedingState(prev => ({ ...prev, message: null })), 2000)
                                    }}
                                    style={{
                                        padding: '14px', borderRadius: '8px',
                                        background: isMax ? `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})` : COLORS.cardBg,
                                        border: `1px solid ${isMax ? COLORS.primary : COLORS.border}`,
                                        color: isMax ? COLORS.darkBrown : COLORS.textMain,
                                        fontWeight: 'bold', fontSize: '14px', cursor: level >= maxLevel ? 'not-allowed' : 'pointer',
                                        opacity: level >= maxLevel ? 0.5 : 1,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                        boxShadow: isMax ? `0 0 15px ${COLORS.primary}40` : 'none',
                                        transition: 'transform 0.1s'
                                    }}
                                    onMouseDown={e => !feedingState.loading && level < maxLevel && (e.currentTarget.style.transform = 'scale(0.95)')}
                                    onMouseUp={e => !feedingState.loading && level < maxLevel && (e.currentTarget.style.transform = 'scale(1)')}
                                    onMouseLeave={e => !feedingState.loading && level < maxLevel && (e.currentTarget.style.transform = 'scale(1)')}
                                >
                                    <span>{isMax ? '🚀' : '🔼'}</span> {label}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {feedingState.message && (
                    <div style={{
                        marginTop: '8px', padding: '12px', borderRadius: '8px',
                        background: 'rgba(11, 218, 29, 0.1)', border: '1px solid rgba(11, 218, 29, 0.3)',
                        color: '#4ade80', fontSize: '13px', textAlign: 'center', fontWeight: 'bold',
                        animation: 'fadeIn 0.2s',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                    }}>
                        <span>✨</span> {feedingState.message}
                    </div>
                )}

                {/* Close Button */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute', top: '16px', right: '16px',
                        background: 'transparent', border: 'none', color: COLORS.textSub,
                        fontSize: '20px', cursor: 'pointer', padding: '4px'
                    }}
                >
                    ✕
                </button>
            </div>

            <style>{`
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}</style>
        </div>
    )
}
