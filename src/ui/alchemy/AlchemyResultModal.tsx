import React from 'react'
import { getMonsterData } from '../../data/monsterData'

interface AlchemyResultModalProps {
    isOpen: boolean
    success: boolean
    monsterId?: string
    onClose: () => void
}

export const AlchemyResultModal: React.FC<AlchemyResultModalProps> = ({
    isOpen,
    success,
    monsterId,
    onClose
}) => {
    if (!isOpen) return null

    const monster = monsterId ? getMonsterData(monsterId) : null

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
            zIndex: 1000
        }}>
            <div style={{
                background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
                border: success ? '3px solid #22c55e' : '3px solid #ef4444',
                borderRadius: '16px',
                padding: '32px',
                maxWidth: '500px',
                width: '90%',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
            }}>
                {/* Header */}
                <div style={{
                    textAlign: 'center',
                    marginBottom: '24px'
                }}>
                    <div style={{
                        fontSize: '48px',
                        marginBottom: '12px'
                    }}>
                        {success ? '✅' : '❌'}
                    </div>
                    <h2 style={{
                        margin: 0,
                        fontSize: '28px',
                        color: success ? '#22c55e' : '#ef4444',
                        fontWeight: 'bold'
                    }}>
                        {success ? '연금술 성공!' : '연금술 실패...'}
                    </h2>
                </div>

                {/* Monster Info - Only for Success */}
                {success && monster && (
                    <>
                        {/* Monster Image */}
                        <div style={{
                            width: '200px',
                            height: '200px',
                            margin: '0 auto 24px',
                            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '3px solid #facc15',
                            overflow: 'hidden'
                        }}>
                            {monster.iconUrl ? (
                                <img
                                    src={monster.iconUrl}
                                    alt={monster.name}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'contain',
                                        imageRendering: 'pixelated'
                                    }}
                                />
                            ) : (
                                <span style={{ fontSize: '120px' }}>{monster.emoji}</span>
                            )}
                        </div>

                        {/* Monster Name & Role */}
                        <div style={{
                            textAlign: 'center',
                            marginBottom: '20px'
                        }}>
                            <h3 style={{
                                margin: '0 0 8px 0',
                                fontSize: '24px',
                                color: '#facc15',
                                fontWeight: 'bold'
                            }}>
                                {monster.name}
                            </h3>
                            <div style={{
                                display: 'inline-block',
                                padding: '4px 12px',
                                background: '#334155',
                                borderRadius: '12px',
                                fontSize: '14px',
                                color: '#cbd5e1',
                                fontWeight: 'bold'
                            }}>
                                {monster.role}
                            </div>
                        </div>

                        {/* Stats */}
                        <div style={{
                            background: '#1e293b',
                            borderRadius: '8px',
                            padding: '16px',
                            marginBottom: '16px'
                        }}>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr 1fr',
                                gap: '12px',
                                textAlign: 'center'
                            }}>
                                <div>
                                    <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>HP</div>
                                    <div style={{ fontSize: '18px', color: '#22c55e', fontWeight: 'bold' }}>{monster.hp}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>공격력</div>
                                    <div style={{ fontSize: '18px', color: '#ef4444', fontWeight: 'bold' }}>{monster.attack}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>방어력</div>
                                    <div style={{ fontSize: '18px', color: '#3b82f6', fontWeight: 'bold' }}>{monster.defense}</div>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div style={{
                            background: '#0f172a',
                            borderRadius: '8px',
                            padding: '14px',
                            marginBottom: '24px'
                        }}>
                            <div style={{
                                fontSize: '14px',
                                color: '#cbd5e1',
                                lineHeight: '1.6'
                            }}>
                                {monster.description}
                            </div>
                        </div>
                    </>
                )}

                {/* Failure Message */}
                {!success && (
                    <div style={{
                        textAlign: 'center',
                        padding: '24px',
                        marginBottom: '24px'
                    }}>
                        <p style={{
                            margin: 0,
                            fontSize: '16px',
                            color: '#94a3b8',
                            lineHeight: '1.6'
                        }}>
                            연금술이 실패했습니다.<br />
                            재료가 소모되었습니다.
                        </p>
                    </div>
                )}

                {/* Close Button */}
                <button
                    onClick={onClose}
                    style={{
                        width: '100%',
                        padding: '14px',
                        background: success ? '#22c55e' : '#64748b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '0.8'
                        e.currentTarget.style.transform = 'translateY(-2px)'
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '1'
                        e.currentTarget.style.transform = 'translateY(0)'
                    }}
                >
                    확인
                </button>
            </div>
        </div>
    )
}
