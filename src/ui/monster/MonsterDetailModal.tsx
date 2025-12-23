import { useState } from 'react'
import { MONSTER_DATA } from '../../data/monsterData'
import { useAlchemyStore } from '../../store/useAlchemyStore'
import { getRequiredExp, getRarityColor, type RarityType } from '../../lib/monsterLevelUtils'
import { getUnlockableSkills, getSkillTypeColor } from '../../data/monsterSkillData'
import type { PlayerMonster } from '../../types/monster'
import type { RoleType } from '../../types/alchemy'
import AwakeningModal from './AwakeningModal'
import MonsterGrowthModal from './MonsterGrowthModal'

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
    white: '#ffffff'
}

interface MonsterDetailModalProps {
    monster: PlayerMonster
    onClose: () => void
}

export default function MonsterDetailModal({ monster, onClose }: MonsterDetailModalProps) {
    const { playerMonsters, toggleMonsterLock } = useAlchemyStore()

    // Subscribe to the specific monster's updates
    const liveMonster = playerMonsters.find(m => m.id === monster.id) || monster

    const [showAwakeningModal, setShowAwakeningModal] = useState(false)
    const [showGrowthModal, setShowGrowthModal] = useState(false)
    const data = MONSTER_DATA[liveMonster.monster_id]
    if (!data) return null

    // Safe Rarity Handling
    const rarity = (data.rarity || 'N') as RarityType
    const level = liveMonster.level || 1
    // const maxLevel = getMaxLevel(rarity) // Unused for awakening condition now, but used for EXP calc if needed

    // Awakening Condition: Level 30
    const AWAKENING_REQUIRED_LEVEL = 30
    const canAwaken = level >= AWAKENING_REQUIRED_LEVEL

    // Role Mapping (Korean -> English Enum)
    const mapRoleToEnum = (rawRole: string): RoleType => {
        if (rawRole === '탱커' || rawRole === 'TANKER') return 'TANK'
        if (rawRole === '딜러' || rawRole === 'DEALER') return 'DPS'
        if (rawRole === '서포터' || rawRole === 'SUPPORT' || rawRole === 'HEALER') return 'SUPPORT'
        if (rawRole === '생산' || rawRole === 'PRODUCTION') return 'PRODUCTION'
        if (rawRole === '하이브리드' || rawRole === 'HYBRID') return 'HYBRID'
        return 'TANK' // Fallback
    }
    const roleEnum = mapRoleToEnum(data.role)

    // Skills
    const skills = getUnlockableSkills(liveMonster.monster_id, roleEnum, level)

    // Role Badge Colors
    const getRoleBadgeStyle = (role: RoleType) => {
        switch (role) {
            case 'TANK':
            case 'TANKER' as RoleType: // legacy support
                return { bg: '#2c3e50', color: '#aab7b8', icon: '🛡️', iconUrl: '/assets/ui/tanker_icon.png' }
            case 'DPS':
            case 'DEALER' as RoleType:
                return { bg: '#4a2323', color: '#e57373', icon: '⚔️', iconUrl: '/assets/ui/dealer_icon.png' }
            case 'SUPPORT':
            case 'HEALER' as RoleType:
                return { bg: '#1b4f2e', color: '#81c784', icon: '🌿', iconUrl: '/assets/ui/healder_icon.png' }
            case 'PRODUCTION':
                return { bg: '#4a148c', color: '#ce93d8', icon: '⚒️', iconUrl: null }
            default: return { bg: '#333', color: '#ccc', icon: '❓', iconUrl: null }
        }
    }
    // Cast strict check
    const roleStyle = getRoleBadgeStyle(roleEnum)

    // Calculate Stats
    const baseAtk = data.attack || 10
    const baseHp = data.hp || 100
    const baseDef = data.defense || 5

    // Simple stat scaling formula (visual only)
    const atk = Math.floor(baseAtk * (1 + (level - 1) * 0.1))
    const hp = Math.floor(baseHp * (1 + (level - 1) * 0.1))
    const def = Math.floor(baseDef * (1 + (level - 1) * 0.05))

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 100,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)'
        }} onClick={onClose}>
            {/* Modal Content */}
            <div
                style={{
                    width: '90%', maxWidth: '400px', maxHeight: '90vh', overflowY: 'auto',
                    background: COLORS.backgroundDark,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '16px',
                    padding: '0',
                    position: 'relative',
                    boxShadow: '0 0 30px rgba(0,0,0,0.8)',
                    transform: 'translateY(0)',
                    animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute', top: '16px', right: '16px', zIndex: 10,
                        background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%',
                        width: '32px', height: '32px', color: COLORS.white,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '18px', cursor: 'pointer'
                    }}
                >
                    ✕
                </button>

                {/* Hero Image Section */}
                <div style={{
                    height: '220px', position: 'relative',
                    background: `radial-gradient(circle at center, ${roleStyle.bg} 0%, ${COLORS.backgroundDark} 100%)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden', borderBottom: `1px solid ${COLORS.border}`
                }}>
                    <div style={{
                        position: 'absolute', inset: 0,
                        backgroundImage: 'url(/assets/ui/noise_overlay.png)', opacity: 0.1
                    }} />

                    {/* Monster Image */}
                    <img
                        src={data.iconUrl || '/assets/monsters/monster_unknown.png'}
                        alt={data.name}
                        style={{
                            height: '80%', objectFit: 'contain',
                            filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.6))',
                            zIndex: 1
                        }}
                    />

                    {/* Rarity & Role Badges (Top Left) */}
                    <div style={{ position: 'absolute', top: '16px', left: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{
                            background: 'rgba(0,0,0,0.6)', padding: '4px 8px', borderRadius: '8px',
                            color: getRarityColor(rarity), fontWeight: 'bold', fontSize: '12px',
                            border: `1px solid ${COLORS.border}`, display: 'flex', alignItems: 'center', gap: '4px'
                        }}>
                            <span style={{
                                display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%',
                                background: getRarityColor(rarity)
                            }} />
                            {rarity}
                        </div>
                        <div style={{
                            background: roleStyle.bg, padding: '4px 8px', borderRadius: '8px',
                            color: roleStyle.color, fontWeight: 'bold', fontSize: '12px',
                            border: `1px solid rgba(255,255,255,0.1)`, display: 'flex', alignItems: 'center', gap: '4px'
                        }}>
                            {roleStyle.iconUrl ? (
                                <img src={roleStyle.iconUrl} alt={data.role} style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
                            ) : (
                                <span>{roleStyle.icon}</span>
                            )}
                            {data.role}
                        </div>
                    </div>

                    {/* Lock Button (Bottom Right) */}
                    <button
                        onClick={() => {
                            toggleMonsterLock(liveMonster.id, !liveMonster.is_locked)
                        }}
                        style={{
                            position: 'absolute', bottom: '16px', right: '16px',
                            background: liveMonster.is_locked ? 'rgba(239, 68, 68, 0.2)' : 'rgba(0,0,0,0.4)',
                            border: `1px solid ${liveMonster.is_locked ? COLORS.accentRed : COLORS.border}`,
                            color: liveMonster.is_locked ? COLORS.accentRed : COLORS.textSub,
                            padding: '6px 12px', borderRadius: '20px', fontSize: '12px',
                            cursor: 'pointer', zIndex: 5,
                            display: 'flex', alignItems: 'center', gap: '4px'
                        }}
                    >
                        {liveMonster.is_locked ? '🔒 Locked' : '🔓 Unlock'}
                    </button>
                </div>

                {/* Info Content */}
                <div style={{ padding: '24px' }}>
                    {/* Name & Title */}
                    <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                        <h2 style={{ margin: 0, fontSize: '24px', color: COLORS.primary, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                            {data.name}
                        </h2>
                        <div style={{ marginTop: '4px', color: COLORS.textSub, fontSize: '14px' }}>
                            {/* data.species is not in interface, remove it or use default */}
                            {data.role} 계열 | Lv.{level}
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div style={{
                        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px',
                        marginBottom: '24px'
                    }}>
                        {[
                            { label: '공격력', value: atk, icon: '⚔️', color: '#e57373' },
                            { label: '체력', value: hp, icon: '❤️', color: '#81c784' },
                            { label: '방어력', value: def, icon: '🛡️', color: '#64b5f6' },
                        ].map((stat) => (
                            <div key={stat.label} style={{
                                background: COLORS.cardBg, padding: '12px', borderRadius: '12px',
                                border: `1px solid ${COLORS.border}`, textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '20px', marginBottom: '4px' }}>{stat.icon}</div>
                                <div style={{ fontSize: '12px', color: COLORS.textSub }}>{stat.label}</div>
                                <div style={{ fontSize: '16px', fontWeight: 'bold', color: stat.color }}>{stat.value}</div>
                            </div>
                        ))}
                    </div>

                    {/* EXP & Growth Section */}
                    <div style={{ marginBottom: '24px', padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px', color: COLORS.textSub }}>
                            <span>경험치</span>
                            <span>{liveMonster.exp.toLocaleString()} / {getRequiredExp(level, rarity).toLocaleString()}</span>
                        </div>
                        {/* EXP Bar BG */}
                        <div style={{ height: '8px', background: '#333', borderRadius: '4px', overflow: 'hidden', marginBottom: '16px' }}>
                            {/* EXP Fill */}
                            <div style={{
                                height: '100%', width: `${Math.min(100, (liveMonster.exp / getRequiredExp(level, rarity)) * 100)}%`,
                                background: `linear-gradient(90deg, ${COLORS.primaryDim}, ${COLORS.primary})`,
                                borderRadius: '4px',
                                transition: 'width 0.3s ease-out'
                            }} />
                        </div>

                        {/* Action Buttons: Fast Growth & Awakening */}
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {/* Fast Growth Button */}
                            <button
                                onClick={() => setShowGrowthModal(true)}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    borderRadius: '8px',
                                    background: COLORS.cardBg,
                                    border: `1px solid ${COLORS.primary}`,
                                    color: COLORS.primary,
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                                }}
                            >
                                🧪 고속 성장
                            </button>

                            {/* Awakening Button (Only if Level >= 30) */}
                            <div style={{ flex: 1 }}>
                                {canAwaken ? (
                                    <button
                                        onClick={() => setShowAwakeningModal(true)}
                                        style={{
                                            width: '100%', height: '100%',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            background: `linear-gradient(135deg, ${COLORS.accentRed}, #b71c1c)`,
                                            border: 'none',
                                            color: 'white',
                                            fontWeight: 'bold',
                                            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
                                            cursor: 'pointer',
                                            animation: 'pulse 2s infinite',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                                        }}
                                    >
                                        ✨ 초월하기
                                    </button>
                                ) : (
                                    <div style={{
                                        height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: 'rgba(0,0,0,0.2)', border: `1px solid ${COLORS.border}`, borderRadius: '8px',
                                        color: COLORS.textSub, fontSize: '12px',
                                        opacity: 0.7
                                    }}>
                                        Lv.30 달성 시 초월 가능
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Skill List */}
                    <div style={{ marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '16px', color: COLORS.textMain, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '18px' }}>⚡</span> 보유 스킬
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {skills.length > 0 ? (
                                skills.map((skill) => (
                                    <div key={skill.id} style={{
                                        display: 'flex', gap: '12px', alignItems: 'center',
                                        background: COLORS.cardBg, padding: '12px', borderRadius: '12px',
                                        border: `1px solid ${COLORS.border}`
                                    }}>
                                        <div style={{
                                            width: '40px', height: '40px', borderRadius: '8px',
                                            background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '24px', flexShrink: 0
                                        }}>
                                            {skill.emoji}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                                                <span style={{ color: COLORS.textMain, fontWeight: 'bold', fontSize: '14px' }}>{skill.name}</span>
                                                <span style={{
                                                    fontSize: '10px', padding: '2px 6px', borderRadius: '4px',
                                                    background: getSkillTypeColor(skill.type) + '33', // 20% opacity
                                                    color: getSkillTypeColor(skill.type),
                                                    border: `1px solid ${getSkillTypeColor(skill.type)}`
                                                }}>
                                                    {skill.type === 'ACTIVE' ? '액티브' : '패시브'}
                                                </span>
                                            </div>
                                            <div style={{ color: COLORS.textSub, fontSize: '12px', lineHeight: '1.4' }}>
                                                {skill.description}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{ textAlign: 'center', padding: '20px', color: COLORS.textSub, fontSize: '13px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                                    습득한 스킬이 없습니다.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Description or Flavor Text (Optional) */}
                    <div style={{
                        fontSize: '13px', color: COLORS.textSub, lineHeight: '1.5',
                        padding: '16px', borderTop: `1px solid ${COLORS.border}`,
                        textAlign: 'center', fontStyle: 'italic'
                    }}>
                        &quot;{data.description || '이 몬스터에 대한 알려진 정보가 없습니다.'}&quot;
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showAwakeningModal && (
                <AwakeningModal
                    targetMonster={liveMonster}
                    onClose={() => setShowAwakeningModal(false)}
                    onSuccess={() => setShowAwakeningModal(false)}
                />
            )}

            {showGrowthModal && (
                <MonsterGrowthModal
                    targetMonster={liveMonster}
                    onClose={() => setShowGrowthModal(false)}
                />
            )}

            <style>{`
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @keyframes pulse {
                    0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
                    70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
                }
            `}</style>
        </div>
    )
}
