import React from 'react'
import { getSkillTypeColor, getSkillIconUrl } from '../../data/monsterSkillData'
import type { MonsterSkill } from '../../data/monsterSkillData'

interface SkillDetailModalProps {
    skill: MonsterSkill
    onClose: () => void
}

export default function SkillDetailModal({ skill, onClose }: SkillDetailModalProps) {
    // Prevent click propagation to close modal when clicking inside content
    const handleContentClick = (e: React.MouseEvent) => {
        e.stopPropagation()
    }

    const typeColor = getSkillTypeColor(skill.type)
    const typeLabel = skill.type === 'ACTIVE' ? '액티브' : '패시브'

    const getTargetLabel = (target: string) => {
        switch (target) {
            case 'SELF': return '자신'
            case 'ENEMY': return '단일 적'
            case 'ALL_ALLIES': return '아군 전체'
            case 'ALL_ENEMIES': return '적 전체'
            default: return target
        }
    }

    const getEffectTypeLabel = (type: string) => {
        switch (type) {
            case 'DAMAGE': return '공격'
            case 'HEAL': return '회복'
            case 'BUFF': return '강화'
            case 'DEBUFF': return '약화'
            case 'SPECIAL': return '특수'
            default: return type
        }
    }

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.7)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 1000,
                backdropFilter: 'blur(4px)'
            }}
        >
            <div
                onClick={handleContentClick}
                style={{
                    background: '#1e293b',
                    border: `2px solid ${typeColor}`,
                    borderRadius: '16px',
                    padding: '24px',
                    width: '90%',
                    maxWidth: '400px',
                    position: 'relative',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                }}
            >
                {/* Header with Icon and Name */}
                <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        background: 'rgba(15, 23, 42, 0.6)',
                        borderRadius: '12px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        overflow: 'hidden', // Ensure image stays within bounds
                        border: '1px solid #334155'
                    }}>
                        <img
                            src={getSkillIconUrl(skill)}
                            alt={skill.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                                e.currentTarget.style.display = 'none'
                                e.currentTarget.parentElement!.innerText = skill.emoji
                                e.currentTarget.parentElement!.style.fontSize = '32px'
                            }}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start'
                        }}>
                            <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.4em' }}>{skill.name}</h3>
                            <span style={{
                                background: typeColor,
                                color: 'white',
                                fontSize: '0.8em',
                                padding: '4px 10px',
                                borderRadius: '20px',
                                fontWeight: 'bold'
                            }}>
                                {typeLabel}
                            </span>
                        </div>
                        <div style={{ color: '#94a3b8', fontSize: '0.9em', marginTop: '4px' }}>
                            해금 레벨: Lv.{skill.unlockLevel}
                        </div>
                    </div>
                </div>

                {/* Description */}
                <p style={{
                    color: '#e2e8f0',
                    fontSize: '1em',
                    lineHeight: '1.5',
                    background: 'rgba(51, 65, 85, 0.5)',
                    padding: '12px',
                    borderRadius: '8px',
                    margin: '0 0 20px 0'
                }}>
                    {skill.description}
                </p>

                {/* Details Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px',
                    fontSize: '0.9em'
                }}>
                    <div style={detailBoxStyle}>
                        <span style={labelStyle}>효과 타입</span>
                        <span style={{ color: '#baae9f' }}>{getEffectTypeLabel(skill.effect.type)}</span>
                    </div>
                    <div style={detailBoxStyle}>
                        <span style={labelStyle}>대상</span>
                        <span style={{ color: '#baae9f' }}>{getTargetLabel(skill.effect.target)}</span>
                    </div>
                    <div style={detailBoxStyle}>
                        <span style={labelStyle}>수치</span>
                        <span style={{ color: '#ef4444', fontWeight: 'bold' }}>{skill.effect.value}</span>
                    </div>
                    {skill.cooldown && (
                        <div style={detailBoxStyle}>
                            <span style={labelStyle}>쿨타임</span>
                            <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>{skill.cooldown} 턴</span>
                        </div>
                    )}
                    {skill.effect.duration && (
                        <div style={detailBoxStyle}>
                            <span style={labelStyle}>지속 시간</span>
                            <span style={{ color: '#eab308' }}>{skill.effect.duration} 턴</span>
                        </div>
                    )}
                </div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    style={{
                        width: '100%',
                        background: '#334155',
                        border: 'none',
                        color: 'white',
                        padding: '12px',
                        borderRadius: '8px',
                        marginTop: '24px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '1em',
                        transition: 'background 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#475569'}
                    onMouseOut={(e) => e.currentTarget.style.background = '#334155'}
                >
                    닫기
                </button>
            </div>
        </div>
    )
}

const detailBoxStyle = {
    background: 'rgba(15, 23, 42, 0.4)',
    padding: '10px',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px'
}

const labelStyle = {
    color: '#64748b',
    fontSize: '0.8em',
    fontWeight: 'bold' as const
}
