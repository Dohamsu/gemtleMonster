
import { useAlchemyStore } from '../../store/useAlchemyStore'
import { useState } from 'react'
import { MONSTER_DATA } from '../../data/monsterData'
import { calculateStats, getExpProgress, getMaxLevel, getRequiredExp, type RarityType } from '../../lib/monsterLevelUtils'
import { getNextSkillUnlockLevel, getSkillIconUrl, getUnlockableSkills } from '../../data/monsterSkillData'
import type { PlayerMonster } from '../../types/monster'
import type { RoleType } from '../../types/alchemy'
import AwakeningModal from './AwakeningModal'

const COLORS = {
    primary: "#f7ca18", // Light Gold
    secondary: "#f0d090", // Soft Gold
    darkBrown: "#2a1810",
    darkOverlay: "#2a2a2a",
    backgroundLight: "#f8f8f5",
    backgroundDark: "#1a1612", // Deep dark base
    cardBg: "#231f10",
    border: "#494122",
    accentRed: "#ef4444",
    accentGreen: "#0bda1d",
    accentBlue: "#3b82f6",
    textMain: "#e0e0e0",
    textSub: "#a0a0a0",
    rarity: {
        N: "#a0a0a0",
        R: "#3b82f6",
        SR: "#a855f7",
        SSR: "#f59e0b"
    }
}

interface MonsterDetailModalProps {
    monster: PlayerMonster
    onClose: () => void
    onToggleLock: (monsterId: string, currentLocked: boolean) => void
}

export default function MonsterDetailModal({ monster, onClose, onToggleLock }: MonsterDetailModalProps) {
    const { playerMonsters } = useAlchemyStore()
    const [showAwakeningModal, setShowAwakeningModal] = useState(false)
    const data = MONSTER_DATA[monster.monster_id]
    if (!data) return null

    // Calculate detailed stats
    const level = monster.level || 1
    const rarity = (data.rarity || 'N') as RarityType
    const roleMap: Record<string, RoleType> = { '탱커': 'TANK', '딜러': 'DPS', '서포터': 'SUPPORT', '하이브리드': 'HYBRID', '생산': 'PRODUCTION' }
    const role = roleMap[data.role] || 'TANK'
    const monsterTypeId = monster.monster_id.replace(/^monster_/, '')
    const stats = calculateStats({ hp: data.hp, atk: data.attack, def: data.defense }, level, rarity, monster.awakening_level || 0)
    const expProgress = getExpProgress(monster.exp, level, rarity)
    // Awakening Logic
    const awakeningLevel = monster.awakening_level || 0
    const maxLevel = getMaxLevel(rarity)

    // Skills
    const skills = getUnlockableSkills(monsterTypeId, role, level)
    const nextSkillLevel = getNextSkillUnlockLevel(monsterTypeId, role, level)

    // Rarity Color
    const rarityColor = COLORS.rarity[rarity] || COLORS.rarity.N

    // Next stats for preview (used in Transcendence section)
    const nextAwakeningLevel = awakeningLevel + 1
    const canAwaken = awakeningLevel < 5 // Max 5 stars
    const nextStats = canAwaken ? calculateStats({ hp: data.hp, atk: data.attack, def: data.defense }, level, rarity, nextAwakeningLevel) : stats

    const isLocked = monster.is_locked || false

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 100,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'none' // Inner modal will activate pointer events
        }}>
            {/* Backdrop */}
            <div
                style={{
                    position: 'absolute', inset: 0,
                    background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
                    cursor: 'pointer', pointerEvents: 'auto', transition: 'opacity 0.3s'
                }}
                onClick={onClose}
            />

            {/* Modal Content */}
            <div style={{
                position: 'relative',
                width: '100%', maxWidth: '480px',
                height: '85vh', maxHeight: '900px',
                background: COLORS.backgroundDark,
                borderRadius: '16px',
                border: `1px solid ${COLORS.border}`,
                boxShadow: '0 0 50px rgba(0,0,0,0.8)',
                overflow: 'hidden',
                display: 'flex', flexDirection: 'column',
                pointerEvents: 'auto',
                transition: 'transform 0.3s ease-out',
                fontFamily: "'Noto SansKR', sans-serif" // Base font set to KR
            }}>
                {/* Header Section */}
                <div style={{
                    position: 'relative', flexShrink: 0,
                    background: COLORS.cardBg,
                    borderBottom: `1px solid ${COLORS.border}`,
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    padding: '32px 24px 24px'
                }}>
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        style={{
                            position: 'absolute', top: '16px', right: '16px',
                            padding: '8px', color: COLORS.textSub,
                            background: COLORS.darkBrown, borderRadius: '50%',
                            border: `1px solid ${COLORS.border}`,
                            cursor: 'pointer', transition: 'all 0.2s',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                    >
                        <span style={{ fontSize: '20px', lineHeight: 1 }}>✕</span>
                    </button>

                    {/* Image Container */}
                    <div style={{
                        position: 'relative', width: '128px', height: '128px',
                        borderRadius: '16px', background: '#15120e',
                        border: `2px solid ${rarityColor}`,
                        boxShadow: `0 0 20px ${rarityColor}40`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: '20px', overflow: 'visible'
                    }}>
                        {/* Glow Effect */}
                        <div style={{
                            position: 'absolute', inset: 0,
                            background: `radial-gradient(circle, ${rarityColor}40 0%, transparent 70%)`
                        }} />

                        {/* Monster Image */}
                        {data.iconUrl ? (
                            <img
                                src={data.iconUrl}
                                alt={data.name}
                                style={{
                                    width: '96px', height: '96px', objectFit: 'contain',
                                    imageRendering: 'pixelated', position: 'relative', zIndex: 10,
                                    filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))'
                                }}
                            />
                        ) : (
                            <span style={{ fontSize: '64px', position: 'relative', zIndex: 10 }}>{data.emoji}</span>
                        )}

                        {/* Rarity Badge */}
                        <div style={{
                            position: 'absolute', top: '-12px', right: '-12px',
                            width: '36px', height: '36px',
                            borderRadius: '8px',
                            background: `linear-gradient(135deg, ${rarityColor}, ${COLORS.darkBrown})`,
                            border: `2px solid ${COLORS.backgroundDark}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontWeight: '900', fontSize: '12px',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.3)', zIndex: 20
                        }}>
                            {rarity}
                        </div>

                        {/* Lock Toggle (Top Left) */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                onToggleLock(monster.id, isLocked)
                            }}
                            style={{
                                position: 'absolute', top: '-10px', left: '-10px',
                                width: '32px', height: '32px', borderRadius: '50%',
                                background: isLocked ? COLORS.primary : 'rgba(0,0,0,0.6)',
                                border: `2px solid ${COLORS.backgroundDark}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', zIndex: 20, boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                            }}
                        >
                            <span style={{ fontSize: '14px' }}>{isLocked ? '🔒' : '🔓'}</span>
                        </button>
                    </div>

                    {/* Title & Info */}
                    <h2 style={{
                        marginTop: 0, marginBottom: '8px',
                        fontSize: '24px', fontWeight: 'bold', color: 'white',
                        fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '0.02em',
                        textAlign: 'center'
                    }}>
                        {data.name}
                    </h2>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                            fontSize: '11px', fontWeight: 'bold', fontFamily: 'monospace',
                            color: COLORS.primary, background: COLORS.darkBrown,
                            padding: '2px 8px', borderRadius: '4px', border: `1px solid ${COLORS.border}`
                        }}>
                            Lv. {level}
                        </span>
                        <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: COLORS.border }} />
                        <span style={{ fontSize: '12px', fontWeight: '500', color: COLORS.textSub }}>
                            {data.role} ({roleMap[data.role] || '알 수 없음'})
                        </span>
                    </div>
                </div>

                {/* Scrollable Content Body */}
                <div style={{
                    flex: 1, overflowY: 'auto', padding: '20px',
                    background: COLORS.backgroundDark,
                    scrollbarWidth: 'thin',
                    scrollbarColor: `${COLORS.darkBrown} transparent`
                }}>
                    {/* Stats Grid */}
                    <div style={{
                        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px',
                        marginBottom: '24px'
                    }}>
                        {[
                            { label: '체력', value: stats.hp, icon: '❤️', color: 'white' },
                            { label: '공격력', value: stats.atk, icon: '⚔️', color: 'white' },
                            { label: '방어력', value: stats.def, icon: '🛡️', color: 'white' }
                        ].map(stat => (
                            <div key={stat.label} style={{
                                background: 'rgba(42, 24, 16, 0.4)',
                                borderRadius: '12px', border: `1px solid ${COLORS.darkBrown}`,
                                padding: '12px', display: 'flex', flexDirection: 'column',
                                alignItems: 'center', justifyContent: 'center', gap: '4px'
                            }}>
                                <div style={{ fontSize: '18px', marginBottom: '2px' }}>{stat.icon}</div>
                                <div style={{
                                    color: stat.color, fontFamily: 'monospace',
                                    fontWeight: 'bold', fontSize: '14px'
                                }}>{stat.value.toLocaleString()}</div>
                                <div style={{
                                    fontSize: '10px', color: COLORS.textSub, // Slightly larger font for KR readability
                                    fontWeight: 'bold', letterSpacing: '0.05em'
                                }}>{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* EXP Bar */}
                    <div style={{ marginBottom: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4px' }}>
                            <span style={{ fontSize: '12px', color: COLORS.textSub, fontWeight: '500' }}>경험치</span>
                            <span style={{ fontSize: '10px', color: COLORS.primary, fontFamily: 'monospace', fontWeight: 'bold' }}>
                                {monster.exp.toLocaleString()} / {getRequiredExp(level, rarity).toLocaleString()}
                            </span>
                        </div>
                        <div style={{
                            width: '100%', height: '10px',
                            background: '#15120e', borderRadius: '999px',
                            overflow: 'hidden', border: `1px solid ${COLORS.darkBrown}`,
                            position: 'relative'
                        }}>
                            <div style={{
                                width: `${Math.min(100, expProgress)}%`, height: '100%',
                                background: `linear-gradient(90deg, #b48e00, ${COLORS.primary})`,
                                position: 'relative',
                                boxShadow: `0 0 8px ${COLORS.primary}60`
                            }}>
                                {/* Diagonal Stripe Pattern Overlay (simulated via repeating-linear-gradient) */}
                                <div style={{
                                    position: 'absolute', inset: 0, opacity: 0.3,
                                    backgroundImage: 'linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent)',
                                    backgroundSize: '10px 10px'
                                }} />
                            </div>
                        </div>
                        {level < maxLevel && (
                            <div style={{ textAlign: 'right', fontSize: '10px', color: '#555', marginTop: '4px' }}>
                                다음 레벨까지: {getRequiredExp(level, rarity) - monster.exp} EXP
                            </div>
                        )}
                    </div>

                    {/* Transcendence Section */}
                    {canAwaken && (
                        <div style={{
                            background: `linear-gradient(135deg, ${COLORS.darkBrown}, ${COLORS.backgroundDark})`,
                            border: `1px solid ${COLORS.primary}30`,
                            borderRadius: '12px', padding: '16px',
                            position: 'relative', overflow: 'hidden',
                            marginBottom: '24px'
                        }}>
                            {/* Bg Decoration */}
                            <div style={{
                                position: 'absolute', top: 0, right: 0, width: '100%', height: '100%',
                                background: `radial-gradient(circle at top right, ${COLORS.primary}10, transparent 60%)`,
                                pointerEvents: 'none'
                            }} />

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', position: 'relative', zIndex: 10 }}>
                                <h3 style={{
                                    margin: 0, fontSize: '14px', fontWeight: 'bold', color: COLORS.secondary,
                                    display: 'flex', alignItems: 'center', gap: '8px'
                                }}>
                                    <span style={{ fontSize: '18px' }}>✨</span> 초월
                                </h3>
                                {(playerMonsters?.filter(m => m.monster_id === monster.monster_id && m.id !== monster.id).length || 0) > 0 && (
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: '4px',
                                        background: 'rgba(11, 218, 29, 0.1)', border: `1px solid rgba(11, 218, 29, 0.2)`,
                                        padding: '2px 8px', borderRadius: '4px', color: COLORS.accentGreen, fontSize: '9px', fontWeight: 'bold'
                                    }}>
                                        <span>✓</span> 초월 가능
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', position: 'relative', zIndex: 10 }}>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: COLORS.textSub }}>
                                        <span>최대 레벨</span>
                                        <span style={{ color: COLORS.accentGreen, fontWeight: 'bold' }}>
                                            {maxLevel - 5 * awakeningLevel} <span style={{ color: '#555' }}>→</span> {maxLevel - 5 * awakeningLevel + 5}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: COLORS.textSub }}>
                                        <span>기본 능력치</span>
                                        <span style={{ color: COLORS.accentGreen, fontWeight: 'bold' }}>+15%</span>
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#555', marginTop: '4px' }}>
                                        미리보기: 체력 {stats.hp} → <span style={{ color: COLORS.accentGreen }}>{nextStats.hp}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowAwakeningModal(true)}
                                style={{
                                    width: '100%', padding: '10px',
                                    background: COLORS.primary, color: COLORS.darkBrown,
                                    border: 'none', borderRadius: '8px',
                                    fontWeight: 'bold', fontSize: '14px',
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                    boxShadow: `0 0 15px ${COLORS.primary}40`,
                                    transition: 'transform 0.2s', position: 'relative', zIndex: 10
                                }}
                            >
                                <span style={{ fontSize: '16px' }}>⬆️</span> 몬스터 초월
                            </button>
                        </div>
                    )}

                    {/* Skills Section */}
                    <div style={{ marginBottom: '24px' }}>
                        <h3 style={{
                            fontSize: '14px', fontWeight: 'bold', color: 'white',
                            marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '4px'
                        }}>
                            <span style={{ fontSize: '18px', color: COLORS.textSub }}>📖</span> 보유 스킬
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {skills.length > 0 ? skills.map(skill => (
                                <div key={skill.id} style={{
                                    background: COLORS.cardBg, padding: '12px', borderRadius: '12px',
                                    border: `1px solid ${COLORS.border}`, display: 'flex', gap: '12px',
                                    transition: 'border-color 0.2s'
                                }}>
                                    <div style={{
                                        width: '40px', height: '40px', borderRadius: '8px',
                                        background: '#15120e', border: `1px solid ${COLORS.border}`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        flexShrink: 0, boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)'
                                    }}>
                                        <img
                                            src={getSkillIconUrl(skill)}
                                            alt={skill.name}
                                            style={{ width: '80%', height: '80%', objectFit: 'contain', imageRendering: 'pixelated' }}
                                        />
                                    </div>
                                    <div>
                                        <div style={{
                                            display: 'flex', alignItems: 'center', gap: '8px',
                                            fontSize: '14px', fontWeight: 'bold', color: COLORS.secondary, marginBottom: '2px'
                                        }}>
                                            {skill.name}
                                            <span style={{
                                                fontSize: '9px', color: '#555', background: '#1a1612',
                                                border: `1px solid ${COLORS.border}`, padding: '1px 4px', borderRadius: '4px'
                                            }}>Lv 1</span>
                                        </div>
                                        <p style={{ margin: 0, fontSize: '12px', color: COLORS.textSub, lineHeight: '1.4' }}>
                                            {skill.description}
                                        </p>
                                    </div>
                                </div>
                            )) : (
                                <div style={{ textAlign: 'center', padding: '20px', color: COLORS.textSub, fontSize: '13px', fontStyle: 'italic' }}>
                                    해금된 스킬이 없습니다.
                                </div>
                            )}

                            {nextSkillLevel && (
                                <div style={{
                                    background: 'rgba(251, 191, 36, 0.05)', border: '1px dashed #fbbf24', borderRadius: '8px', padding: '10px',
                                    textAlign: 'center', fontSize: '12px', color: '#fbbf24', marginTop: '8px'
                                }}>
                                    Lv.{nextSkillLevel} 달성 시 새로운 스킬 해금!
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Story Section */}
                    <div style={{ paddingBottom: '32px' }}>
                        <h3 style={{
                            fontSize: '14px', fontWeight: 'bold', color: 'white',
                            marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '4px'
                        }}>
                            <span style={{ fontSize: '18px', color: COLORS.textSub }}>📜</span> 배경 이야기
                        </h3>
                        <div style={{
                            fontSize: '12px', color: COLORS.textSub, lineHeight: '1.6',
                            fontStyle: 'italic', borderLeft: `2px solid ${COLORS.border}`,
                            paddingLeft: '16px', paddingTop: '4px', paddingBottom: '4px'
                        }}>
                            &quot;{data.description}&quot;
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div style={{
                    padding: '16px', background: COLORS.cardBg,
                    borderTop: `1px solid ${COLORS.border}`,
                    display: 'flex', gap: '12px'
                }}>
                    <button style={{
                        flex: 1, padding: '12px', borderRadius: '8px',
                        border: `1px solid ${COLORS.border}`, background: 'transparent',
                        color: COLORS.textSub, fontSize: '12px', fontWeight: 'bold',
                        cursor: 'not-allowed', textTransform: 'uppercase', letterSpacing: '0.05em'
                    }} disabled>
                        장비 관리
                    </button>
                    <button
                        onClick={onClose}
                        style={{
                            flex: 1, padding: '12px', borderRadius: '8px',
                            background: COLORS.darkBrown, color: 'white',
                            border: 'none', fontSize: '12px', fontWeight: 'bold',
                            cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em',
                            transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#3a2e18'}
                        onMouseLeave={(e) => e.currentTarget.style.background = COLORS.darkBrown}
                    >
                        닫기
                    </button>
                </div>
            </div>

            {/* Awakening Modal Overlay (Nested) */}
            {showAwakeningModal && (
                <AwakeningModal
                    targetMonster={monster}
                    onClose={() => setShowAwakeningModal(false)}
                    onSuccess={() => {
                        setShowAwakeningModal(false)
                        // Note: Monster details won't auto-update if passed as prop unless parent updates.
                        // Assuming parent updates the monster prop or we trigger a refetch.
                        // Ideally onToggleLock or similar callback triggers re-render.
                    }}
                />
            )}
        </div>
    )
}
