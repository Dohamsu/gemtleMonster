import React, { useMemo } from 'react'
import { getMonsterData } from '../../data/monsterData'
import { MATERIALS } from '../../data/alchemyData'

interface AlchemyResultModalProps {
    isOpen: boolean
    success: boolean
    hint?: {
        type: 'INGREDIENT_REVEAL' | 'NEAR_MISS' | 'CONDITION_MISMATCH'
        monsterName?: string
        materialName?: string
        recipeId?: string
        element?: string
        message?: string
    }
    monsterId?: string
    itemId?: string
    expGain?: number
    craftQuantity?: number // 대용량 제작 수량
    onClose: () => void
}

export const AlchemyResultModal: React.FC<AlchemyResultModalProps> = ({
    isOpen,
    success,
    monsterId,
    itemId,
    hint,
    expGain,
    craftQuantity = 1,
    onClose
}) => {
    const itemStyles = useMemo(() => {
        if (!isOpen || !itemId) return []
        const count = Math.min(craftQuantity, 5)
        return Array.from({ length: count }).map((_, idx) => {
            if (count === 1) {
                // 1개는 정중앙 강조
                return {
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%) scale(1.2)',
                    zIndex: 10
                }
            }

            // 랜덤 배치 생성 (-5 ~ 5px 범위)
            const randomAngle = Math.random() * 360
            const distance = Math.random() * 6 // 중심에서의 거리 (최대 6px)

            const offsetX = Math.cos(randomAngle * (Math.PI / 180)) * distance
            const offsetY = Math.sin(randomAngle * (Math.PI / 180)) * distance

            const rotate = (Math.random() - 0.5) * 20 // -10 ~ 10도 회전
            const scale = 0.9 + Math.random() * 0.2 // 0.9 ~ 1.1 크기

            return {
                top: '50%',  // 부모의 중앙
                left: '50%', // 부모의 중앙
                marginTop: offsetY,  // 랜덤 오프셋 Y
                marginLeft: offsetX, // 랜덤 오프셋 X
                transform: `translate(-50%, -50%) rotate(${rotate}deg) scale(${scale})`, // 중앙 정렬 보정 + 회전/크기
                zIndex: idx + 1
            }
        })
    }, [isOpen, itemId, craftQuantity])

    if (!isOpen) return null

    const monster = monsterId ? getMonsterData(monsterId) : null
    const item = itemId ? MATERIALS[itemId] : null

    const getHintContent = () => {
        if (!hint) return null

        switch (hint.type) {
            case 'NEAR_MISS':
                return (
                    <>
                        <h4 style={{ margin: '0 0 8px 0', color: '#fbbf24', fontWeight: 'bold', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <span>⚖️</span> 배합 비율 힌트
                        </h4>
                        <p style={{ margin: 0, fontSize: '14px', color: '#e2e8f0', lineHeight: '1.5' }}>
                            재료의 종류는 맞는 것 같지만...<br />
                            <span style={{ color: '#facc15', fontWeight: 'bold' }}>배합 비율</span>이 조금 어긋난 것 같습니다.
                        </p>
                    </>
                )
            case 'CONDITION_MISMATCH':
                return (
                    <>
                        <h4 style={{ margin: '0 0 8px 0', color: '#60a5fa', fontWeight: 'bold', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <span>🕰️</span> 환경 조건 힌트
                        </h4>
                        <p style={{ margin: 0, fontSize: '14px', color: '#e2e8f0', lineHeight: '1.5' }}>
                            재료와 비율은 완벽한 것 같지만...<br />
                            <span style={{ color: '#60a5fa', fontWeight: 'bold' }}>타이밍이나 환경</span>이 맞지 않는 것 같습니다.
                        </p>
                    </>
                )

            case 'INGREDIENT_REVEAL':
            default:
                return (
                    <>
                        <h4 style={{ margin: '0 0 8px 0', color: '#fbbf24', fontWeight: 'bold', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <span>💡</span> 힌트 발견!
                        </h4>
                        <p style={{ margin: 0, fontSize: '14px', color: '#e2e8f0', lineHeight: '1.5' }}>
                            <span style={{ color: '#facc15', fontWeight: 'bold' }}>&apos;{hint.monsterName || '???'}&apos;</span>의 조합법 힌트를 얻었다!<br />
                            <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>{hint.materialName || '???'}</span>이(가) 확정적으로 들어가는 것 같다!
                        </p>
                    </>
                )
        }
    }

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
                        marginBottom: '12px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        {success ? '✅' : <img src="/assets/fail_alchemy.png" alt="Failed" style={{ width: '64px', height: '64px' }} />}
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

                {/* Success Content - Item or Monster */}
                {success && (
                    item ? (
                        /* Item Reward Display */
                        <>
                            {/* 스택된 이미지 컨테이너 (하나의 박스) */}
                            <div style={{
                                position: 'relative',
                                width: '130px', // 이미지가 겹쳐질 공간 확보
                                height: '130px',
                                margin: '0 auto 16px',
                                background: 'linear-gradient(135deg, #2c1810 0%, #0f0f0f 100%)',
                                borderRadius: '16px',
                                border: '3px solid #facc15',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'visible' // 이미지가 약간 튀어나와도 자연스럽게
                            }}>
                                {/* 최대 5개까지 이미지만 스택으로 표시 */}
                                <div style={{
                                    position: 'relative',
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {itemStyles.map((style, idx) => (
                                        <div
                                            key={idx}
                                            style={{
                                                position: 'absolute',
                                                width: '80px',
                                                height: '80px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))',
                                                transition: 'all 0.3s ease',
                                                ...style
                                            }}
                                        >
                                            {item.iconUrl ? (
                                                <img
                                                    src={item.iconUrl}
                                                    alt={item.name}
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'contain'
                                                    }}
                                                />
                                            ) : (
                                                <span style={{ fontSize: '50px' }}>🧪</span>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* 5개 이상일 때 뱃지 */}
                                {craftQuantity > 5 && (
                                    <div style={{
                                        position: 'absolute',
                                        bottom: -5,
                                        right: -5,
                                        background: '#ea580c', // 더 눈에 띄는 색상
                                        borderRadius: '12px',
                                        padding: '2px 8px',
                                        fontSize: '14px',
                                        fontWeight: 'bold',
                                        color: 'white',
                                        border: '2px solid #fff',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                        zIndex: 10
                                    }}>
                                        +{craftQuantity - 5}
                                    </div>
                                )}
                            </div>
                            <h3 style={{
                                margin: '0 0 8px 0',
                                fontSize: '24px',
                                color: '#facc15',
                                fontWeight: 'bold',
                                textAlign: 'center'
                            }}>
                                {item.name} {craftQuantity > 1 ? `x${craftQuantity}` : ''} 획득!
                            </h3>
                            <p style={{
                                textAlign: 'center',
                                color: '#cbd5e1',
                                fontSize: '14px',
                                marginBottom: '24px'
                            }}>
                                {item.description}
                            </p>
                        </>
                    ) : (monster && (
                        /* Monster Reward Display */
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
                    )))}

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
                            재료가 소모되었습니다.<br />
                            <span style={{ color: '#22c55e', fontWeight: 'bold' }}>
                                실패했지만 경험치는 획득했습니다! {expGain ? `(+${expGain} XP)` : ''}
                            </span>
                        </p>

                        {/* Hint Message */}
                        {hint && (
                            <div style={{
                                marginTop: '20px',
                                padding: '16px',
                                background: 'rgba(251, 191, 36, 0.1)',
                                border: '1px solid #fbbf24',
                                borderRadius: '8px',
                                animation: 'pulse 2s infinite'
                            }}>
                                {getHintContent()}
                            </div>
                        )}
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
