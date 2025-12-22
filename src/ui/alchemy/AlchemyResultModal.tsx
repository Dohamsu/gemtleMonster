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
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(4px)'
        }}>
            <div style={{
                background: '#1a1612',
                border: success ? '2px solid #facc15' : '2px solid #ef4444',
                borderRadius: '24px',
                padding: '32px',
                maxWidth: '480px',
                width: '90%',
                boxShadow: success
                    ? '0 0 40px rgba(250, 204, 21, 0.2)'
                    : '0 0 40px rgba(239, 68, 68, 0.2)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Background Pattern/Glow */}
                <div style={{
                    position: 'absolute',
                    top: '-50%',
                    left: '-50%',
                    width: '200%',
                    height: '200%',
                    background: success
                        ? 'radial-gradient(circle, rgba(250, 204, 21, 0.1) 0%, transparent 60%)'
                        : 'radial-gradient(circle, rgba(239, 68, 68, 0.05) 0%, transparent 60%)',
                    pointerEvents: 'none',
                    zIndex: 0
                }} />

                {/* Content Wrapper */}
                <div style={{ position: 'relative', zIndex: 1 }}>
                    {/* Header */}
                    <div style={{
                        textAlign: 'center',
                        marginBottom: '28px'
                    }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            margin: '0 auto 16px',
                            borderRadius: '50%',
                            background: success ? 'rgba(250, 204, 21, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            border: success ? '1px solid rgba(250, 204, 21, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '40px'
                        }}>
                            {success ? <img src="/assets/ui/success_alchemy.png" alt="Success" style={{ width: '48px', height: '48px', objectFit: 'contain' }} /> : <img src="/assets/fail_alchemy.png" alt="Failed" style={{ width: '48px', height: '48px', opacity: 0.8 }} />}
                        </div>
                        <h2 style={{
                            margin: 0,
                            fontSize: '28px',
                            color: success ? '#facc15' : '#ef4444',
                            fontWeight: 'bold',
                            fontFamily: "'Space Grotesk', sans-serif",
                            textShadow: success ? '0 2px 4px rgba(0,0,0,0.3)' : 'none'
                        }}>
                            {success ? 'ALCHEMY SUCCESS' : 'ALCHEMY FAILED'}
                        </h2>
                        <p style={{
                            margin: '8px 0 0',
                            color: '#b0a090',
                            fontSize: '14px'
                        }}>
                            {success ? '연금술에 성공하여 새로운 물질을 만들어냈습니다!' : '연금술에 실패하여 재료가 소실되었습니다...'}
                        </p>
                    </div>

                    {/* Success Content - Item or Monster */}
                    {success && (
                        item ? (
                            /* Item Reward Display */
                            <>
                                <div style={{
                                    position: 'relative',
                                    width: '120px',
                                    height: '120px',
                                    margin: '0 auto 20px',
                                    background: '#231f10',
                                    borderRadius: '20px',
                                    border: '2px solid #facc15',
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {/* Item Icons Stack */}
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
                                                    width: '72px',
                                                    height: '72px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
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
                                                    <span style={{ fontSize: '40px' }}>🧪</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Quantity Badge */}
                                    {craftQuantity > 1 && (
                                        <div style={{
                                            position: 'absolute',
                                            bottom: -10,
                                            background: '#ef4444',
                                            padding: '4px 12px',
                                            borderRadius: '12px',
                                            color: 'white',
                                            fontWeight: 'bold',
                                            fontSize: '14px',
                                            border: '2px solid #1a1612',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                        }}>
                                            x{craftQuantity}
                                        </div>
                                    )}
                                </div>

                                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                                    <h3 style={{
                                        margin: '0 0 8px 0',
                                        fontSize: '20px',
                                        color: '#facc15',
                                        fontWeight: 'bold'
                                    }}>
                                        {item.name}
                                    </h3>
                                    <p style={{
                                        margin: 0,
                                        color: '#9ca3af',
                                        fontSize: '13px',
                                        lineHeight: '1.5'
                                    }}>
                                        {item.description}
                                    </p>
                                </div>
                            </>
                        ) : (monster && (
                            /* Monster Reward Display */
                            <>
                                <div style={{
                                    width: '100%',
                                    background: '#231f10',
                                    borderRadius: '16px',
                                    border: '1px solid #494122',
                                    padding: '20px',
                                    marginBottom: '24px'
                                }}>
                                    <div style={{
                                        width: '120px',
                                        height: '120px',
                                        margin: '0 auto 16px',
                                        background: '#15120e',
                                        borderRadius: '12px',
                                        border: '1px solid #3a2e18',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        overflow: 'hidden' // Pixel art containment
                                    }}>
                                        {monster.iconUrl ? (
                                            <img
                                                src={monster.iconUrl}
                                                alt={monster.name}
                                                style={{
                                                    width: '90%',
                                                    height: '90%',
                                                    objectFit: 'contain',
                                                    imageRendering: 'pixelated'
                                                }}
                                            />
                                        ) : (
                                            <span style={{ fontSize: '64px' }}>{monster.emoji}</span>
                                        )}
                                    </div>

                                    <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                                        <h3 style={{
                                            margin: '0 0 4px 0',
                                            fontSize: '20px',
                                            color: '#facc15',
                                            fontWeight: 'bold'
                                        }}>
                                            {monster.name}
                                        </h3>
                                        <span style={{
                                            fontSize: '12px',
                                            padding: '2px 8px',
                                            background: '#334155',
                                            borderRadius: '4px',
                                            color: '#cbd5e1'
                                        }}>
                                            {monster.role}
                                        </span>
                                    </div>

                                    {/* Stats Grid */}
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 1fr 1fr',
                                        gap: '8px',
                                        borderTop: '1px solid #3a2e18',
                                        paddingTop: '16px'
                                    }}>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '11px', color: '#7a7a7a', marginBottom: '2px' }}>HP</div>
                                            <div style={{ fontSize: '14px', color: '#22c55e', fontWeight: 'bold' }}>{monster.hp}</div>
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '11px', color: '#7a7a7a', marginBottom: '2px' }}>ATK</div>
                                            <div style={{ fontSize: '14px', color: '#ef4444', fontWeight: 'bold' }}>{monster.attack}</div>
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '11px', color: '#7a7a7a', marginBottom: '2px' }}>DEF</div>
                                            <div style={{ fontSize: '14px', color: '#3b82f6', fontWeight: 'bold' }}>{monster.defense}</div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )))}

                    {/* Failure Content */}
                    {!success && (
                        <div style={{ marginBottom: '24px' }}>
                            <div style={{
                                background: 'rgba(34, 197, 94, 0.1)',
                                border: '1px solid rgba(34, 197, 94, 0.2)',
                                borderRadius: '8px',
                                padding: '12px',
                                textAlign: 'center',
                                marginBottom: '20px'
                            }}>
                                <span style={{ fontSize: '13px', color: '#4ade80', fontWeight: 'bold' }}>
                                    ✨ 실패 보상: 경험치 +{expGain || 0} XP
                                </span>
                            </div>

                            {hint && (
                                <div style={{
                                    background: '#231f10',
                                    border: '1px solid #facc15',
                                    borderRadius: '12px',
                                    padding: '16px',
                                    position: 'relative'
                                }}>
                                    <div style={{
                                        position: 'absolute',
                                        top: -10,
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        background: '#facc15',
                                        color: '#1a1612',
                                        padding: '2px 12px',
                                        borderRadius: '12px',
                                        fontSize: '11px',
                                        fontWeight: 'bold',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        ALCHEMY HINT
                                    </div>
                                    <div style={{ marginTop: '8px' }}>
                                        {getHintContent()}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Action Button */}
                    <button
                        onClick={onClose}
                        style={{
                            width: '100%',
                            padding: '16px',
                            background: success ? '#facc15' : '#231f10',
                            color: success ? '#1a1612' : '#9ca3af',
                            border: success ? 'none' : '1px solid #494122',
                            borderRadius: '12px',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            fontFamily: "'Space Grotesk', sans-serif",
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                        onMouseEnter={(e) => {
                            if (success) {
                                e.currentTarget.style.transform = 'translateY(-2px)'
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(250, 204, 21, 0.3)'
                            } else {
                                e.currentTarget.style.background = '#2a2418'
                                e.currentTarget.style.borderColor = '#716645'
                                e.currentTarget.style.color = '#facc15'
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (success) {
                                e.currentTarget.style.transform = 'translateY(0)'
                                e.currentTarget.style.boxShadow = 'none'
                            } else {
                                e.currentTarget.style.background = '#231f10'
                                e.currentTarget.style.borderColor = '#494122'
                                e.currentTarget.style.color = '#9ca3af'
                            }
                        }}
                    >
                        {success ? '수령하기' : '확인'}
                    </button>
                </div>
            </div>
        </div>
    )
}
