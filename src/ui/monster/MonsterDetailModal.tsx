// import React from 'react'
import { MONSTER_DATA } from '../../data/monsterData'
import { calculateStats, getExpProgress, getMaxLevel, getRequiredExp, type RarityType } from '../../lib/monsterLevelUtils'
import { getNextSkillUnlockLevel, getUnlockableSkills } from '../../data/monsterSkillData'
import type { PlayerMonster } from '../../types/monster'
import type { RoleType } from '../../types/alchemy'

interface MonsterDetailModalProps {
    monster: PlayerMonster
    onClose: () => void
    onToggleLock: (monsterId: string, currentLocked: boolean) => void
}

export default function MonsterDetailModal({ monster, onClose, onToggleLock }: MonsterDetailModalProps) {
    const data = MONSTER_DATA[monster.monster_id]
    if (!data) return null

    // Calculate detailed stats
    const level = monster.level || 1
    const rarity = (data.rarity || 'N') as RarityType
    const roleMap: Record<string, RoleType> = { '탱커': 'TANK', '딜러': 'DPS', '서포터': 'SUPPORT', '하이브리드': 'HYBRID', '생산': 'PRODUCTION' }
    const role = roleMap[data.role] || 'TANK'
    const monsterTypeId = monster.monster_id.replace(/^monster_/, '')
    const stats = calculateStats({ hp: data.hp, atk: data.attack, def: data.defense }, level, rarity)
    const expProgress = getExpProgress(monster.exp, level, rarity)
    const maxLevel = getMaxLevel(rarity)
    const skills = getUnlockableSkills(monsterTypeId, role, level)
    const nextSkillLevel = getNextSkillUnlockLevel(monsterTypeId, role, level)

    // Rarity Color
    const getRarityColor = (r: string) => {
        switch (r) {
            case 'SSR': return '#fbbf24' // Amber-400
            case 'SR': return '#c084fc' // Purple-400
            case 'R': return '#60a5fa' // Blue-400
            default: return '#94a3b8' // Slate-400
        }
    }
    const rarityColor = getRarityColor(rarity)

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(5px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 1000, padding: '20px'
        }} onClick={onClose}>
            <div style={{
                background: '#1e293b',
                width: '100%', maxWidth: '450px',
                borderRadius: '16px',
                border: `2px solid ${rarityColor}`,
                overflow: 'hidden',
                boxShadow: `0 0 20px ${rarityColor}40`,
                position: 'relative',
                display: 'flex', flexDirection: 'column',
                maxHeight: '90vh'
            }} onClick={e => e.stopPropagation()}>

                {/* Header / Top Section */}
                <div style={{
                    background: `linear-gradient(180deg, ${rarityColor}20 0%, #1e293b 100%)`,
                    padding: '24px 20px 10px',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px'
                }}>
                    <button onClick={onClose} style={{
                        position: 'absolute', top: '15px', right: '15px',
                        background: 'rgba(0,0,0,0.3)', border: 'none', color: '#cbd5e1',
                        width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer',
                        fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>✕</button>

                    {/* Image Area */}
                    <div style={{
                        width: '120px', height: '120px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '60px',
                        filter: 'drop-shadow(0 8px 8px rgba(0,0,0,0.5))',
                        animation: 'float 3s ease-in-out infinite',
                        position: 'relative',
                        // Add visible border/glow when locked
                        border: monster.is_locked ? '3px solid #facc15' : 'none',
                        borderRadius: '20px', // slightly rounded square for image container if border is present
                        boxShadow: monster.is_locked ? '0 0 15px rgba(250, 204, 21, 0.5)' : 'none',
                        transition: 'all 0.3s ease'
                    }}>
                        {data.iconUrl ?
                            <img src={data.iconUrl} alt={data.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            : data.emoji}

                        {/* Lock Button (Top-Left of Image) */}
                        <button onClick={(e) => {
                            e.stopPropagation()
                            onToggleLock(monster.id, monster.is_locked || false)
                        }} style={{
                            position: 'absolute', top: '-12px', left: '-12px',
                            background: monster.is_locked ? '#facc15' : 'rgba(0,0,0,0.6)', // Gold background if locked
                            border: '2px solid #1e293b',
                            borderRadius: '50%', width: '32px', height: '32px',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            padding: 0, zIndex: 10,
                            transition: 'all 0.2s ease',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.5)'
                        }}>
                            <img
                                src={monster.is_locked ? '/assets/ui/locked.png' : '/assets/ui/unlocked.png'}
                                alt={monster.is_locked ? 'Locked' : 'Unlocked'}
                                style={{
                                    width: '18px', height: '18px', objectFit: 'contain',
                                    filter: monster.is_locked
                                        ? 'none' // No filter for locked, keep it clear
                                        : 'drop-shadow(0 2px 2px rgba(0,0,0,0.5)) invert(1)' // Invert unlocked to make it white-ish on dark bg
                                }}
                            />
                        </button>
                    </div>

                    {/* Name & Basic Info */}
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            display: 'inline-block', padding: '4px 12px', borderRadius: '20px',
                            background: rarityColor, color: '#1e293b', fontWeight: 'bold', fontSize: '12px',
                            marginBottom: '6px'
                        }}>
                            {rarity} GRADE
                        </div>
                        <h2 style={{ margin: '0 0 4px', color: '#f8fafc', fontSize: '1.5em' }}>{data.name}</h2>
                        <div style={{ color: '#94a3b8', fontSize: '0.9em' }}>Lv.{level} {data.role}</div>
                    </div>
                </div>

                {/* Content Body */}
                <div style={{ padding: '0 24px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    {/* Stats Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                        {[
                            { label: 'HP', value: stats.hp, color: '#ef4444' },
                            { label: 'ATK', value: stats.atk, color: '#eab308' },
                            { label: 'DEF', value: stats.def, color: '#3b82f6' }
                        ].map(stat => (
                            <div key={stat.label} style={{
                                background: 'rgba(15, 23, 42, 0.4)', borderRadius: '12px', padding: '12px',
                                textAlign: 'center', border: '1px solid #334155'
                            }}>
                                <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>{stat.label}</div>
                                <div style={{ fontSize: '16px', fontWeight: 'bold', color: stat.color }}>{stat.value}</div>
                            </div>
                        ))}
                    </div>

                    {/* EXP Bar */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#cbd5e1', marginBottom: '6px' }}>
                            <span>경험치</span>
                            <span>{level >= maxLevel ? '(MAX)' : `${Math.floor(expProgress)}%`}</span>
                        </div>
                        <div style={{ height: '8px', background: '#334155', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{
                                width: `${level >= maxLevel ? 100 : expProgress}%`, height: '100%',
                                background: level >= maxLevel ? '#22c55e' : '#3b82f6',
                                transition: 'width 0.5s ease'
                            }} />
                        </div>
                        {level < maxLevel && (
                            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', textAlign: 'right' }}>
                                다음 레벨까지: {getRequiredExp(level, rarity) - monster.exp} EXP
                            </div>
                        )}
                    </div>

                    {/* Skills */}
                    <div>
                        <h3 style={{ fontSize: '1.1em', color: '#f1f5f9', margin: '0 0 12px', paddingBottom: '8px', borderBottom: '1px solid #334155' }}>스킬</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {skills.length === 0 ? (
                                <div style={{ color: '#64748b', fontSize: '0.9em', textAlign: 'center', padding: '10px' }}>
                                    습득한 스킬이 없습니다.
                                </div>
                            ) : (
                                skills.map(skill => (
                                    <div key={skill.id} style={{
                                        background: 'rgba(30, 41, 59, 0.5)', borderRadius: '8px', padding: '12px',
                                        display: 'flex', gap: '12px', alignItems: 'flex-start'
                                    }}>
                                        <div style={{ fontSize: '24px' }}>{skill.emoji}</div>
                                        <div>
                                            <div style={{ fontWeight: 'bold', color: '#e2e8f0', fontSize: '0.95em', marginBottom: '2px' }}>{skill.name}</div>
                                            <div style={{ fontSize: '0.85em', color: '#94a3b8' }}>{skill.description}</div>
                                        </div>
                                    </div>
                                ))
                            )}
                            {nextSkillLevel && (
                                <div style={{
                                    background: 'rgba(251, 191, 36, 0.05)', border: '1px dashed #fbbf24', borderRadius: '8px', padding: '10px',
                                    textAlign: 'center', fontSize: '0.85em', color: '#fbbf24'
                                }}>
                                    Lv.{nextSkillLevel} 달성 시 새로운 스킬 해금!
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Lore / Description */}
                    <div>
                        <h3 style={{ fontSize: '1.1em', color: '#f1f5f9', margin: '0 0 12px', paddingBottom: '8px', borderBottom: '1px solid #334155' }}>소개</h3>
                        <div style={{
                            background: '#0f172a', padding: '15px', borderRadius: '12px',
                            color: '#cbd5e1', fontSize: '0.9em', lineHeight: '1.6', fontStyle: 'italic'
                        }}>
                            &quot;{data.description}&quot;
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}
