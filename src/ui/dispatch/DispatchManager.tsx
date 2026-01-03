import { useState, useEffect } from 'react'
import { useDispatchStore } from '../../store/useDispatchStore'
import { DISPATCH_REGIONS } from '../../data/dispatchData'
import { useAlchemyStore } from '../../store/useAlchemyStore'
import { MONSTER_DATA } from '../../data/monsterData'
import { getLocalizedError } from '../../utils/errorUtils'
import DispatchRewardModal from './DispatchRewardModal'

export default function DispatchManager() {
    const {
        activeDispatches,
        startDispatch,
        claimDispatchRewards,
        checkDispatches,
        isMonsterDispatched,
        maxDispatchSlots
    } = useDispatchStore()

    useEffect(() => {
        checkDispatches()
        const interval = setInterval(checkDispatches, 1000)
        return () => clearInterval(interval)
    }, [checkDispatches])

    const [view, setView] = useState<'list' | 'new'>('list')
    const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null)
    const [selectedMonsterIds, setSelectedMonsterIds] = useState<string[]>([])
    const [selectedDuration, setSelectedDuration] = useState<number>(0)
    const [rewardData, setRewardData] = useState<{ rewards: Record<string, number>; isGreatSuccess?: boolean } | null>(null)

    const { playerMonsters } = useAlchemyStore()

    const handleStartDispatch = () => {
        if (!selectedRegionId || selectedMonsterIds.length === 0 || selectedDuration === 0) return
        const result = startDispatch(selectedRegionId, selectedMonsterIds, selectedDuration)
        if (result.success) {
            setView('list')
            setSelectedRegionId(null)
            setSelectedMonsterIds([])
        } else {
            alert(getLocalizedError(result.error || 'Failed'))
        }
    }

    const handleClaim = async (dispatchId: string) => {
        const result = await claimDispatchRewards(dispatchId)
        if (result.success && result.rewards) {
            setRewardData({ rewards: result.rewards, isGreatSuccess: result.isGreatSuccess })
        }
    }

    return (
        <>
            {rewardData && (
                <DispatchRewardModal
                    rewards={rewardData.rewards}
                    isGreatSuccess={rewardData.isGreatSuccess}
                    onClose={() => setRewardData(null)}
                />
            )}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                overflowY: 'auto',
                padding: '20px',
                color: '#e0e0e0',
                height: '100%'
            }}>
                {view === 'list' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {activeDispatches.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                                진행 중인 파견이 없습니다.
                            </div>
                        ) : (
                            activeDispatches.map(dispatch => {
                                const region = DISPATCH_REGIONS.find(r => r.id === dispatch.regionId)
                                const regionName = region?.name || dispatch.regionId
                                const isCompleted = dispatch.status === 'completed'
                                const timeLeft = Math.max(0, Math.ceil((dispatch.endTime - Date.now()) / 1000))
                                const progress = Math.min(100, ((Date.now() - dispatch.startTime) / (dispatch.duration * 1000)) * 100)

                                return (
                                    <div key={dispatch.id} style={{
                                        position: 'relative',
                                        background: '#2a2218',
                                        borderRadius: '12px',
                                        border: isCompleted ? '1px solid #4ade80' : '1px solid #3d2b20',
                                        overflow: 'hidden',
                                        minHeight: '140px'
                                    }}>
                                        {region?.imageUrl && (
                                            <>
                                                <div style={{
                                                    position: 'absolute', inset: 0,
                                                    backgroundImage: `url(${region.imageUrl})`,
                                                    backgroundSize: 'cover',
                                                    backgroundPosition: 'center',
                                                    filter: 'brightness(0.5)'
                                                }} />
                                                {!isCompleted && (
                                                    <div style={{
                                                        position: 'absolute', bottom: '40px', left: 0, width: '100%', height: '60px',
                                                        overflow: 'hidden'
                                                    }}>
                                                        <div style={{
                                                            display: 'flex', gap: '8px',
                                                            animation: 'dispatch-walk 10s linear infinite',
                                                            width: 'max-content'
                                                        }}>
                                                            {dispatch.monsterIds.map(mid => (
                                                                <div key={mid} style={{
                                                                    width: '48px', height: '48px',
                                                                    background: `url(${MONSTER_DATA[mid]?.iconUrl}) no-repeat center/contain`,
                                                                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))'
                                                                }} />
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        )}

                                        <div style={{ position: 'relative', padding: '16px', zIndex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                <span style={{ fontWeight: 'bold', color: '#e2e8f0', textShadow: '0 1px 2px black' }}>{regionName}</span>
                                                <span style={{
                                                    color: isCompleted ? '#4ade80' : '#facc15',
                                                    fontSize: '14px', fontWeight: 'bold', textShadow: '0 1px 2px black'
                                                }}>
                                                    {isCompleted ? '완료됨' : `${Math.floor(timeLeft / 60)}분 ${timeLeft % 60}초 남음`}
                                                </span>
                                            </div>

                                            <div style={{ width: '100%', height: '6px', background: 'rgba(0,0,0,0.5)', borderRadius: '3px', overflow: 'hidden', marginBottom: '12px' }}>
                                                <div style={{
                                                    width: `${progress}%`, height: '100%',
                                                    background: isCompleted ? '#4ade80' : '#facc15',
                                                    transition: 'width 1s linear',
                                                    boxShadow: '0 0 10px rgba(250, 204, 21, 0.5)'
                                                }} />
                                            </div>

                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '40px' }}>
                                                <div style={{ fontSize: '12px', color: '#ccc', textShadow: '0 1px 2px black' }}>
                                                    파견 인원: {dispatch.monsterIds.length}명
                                                </div>
                                                {isCompleted ? (
                                                    <button
                                                        onClick={() => handleClaim(dispatch.id)}
                                                        style={{
                                                            padding: '6px 12px', background: '#22c55e', color: 'white',
                                                            border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer',
                                                            boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                                                        }}
                                                    >
                                                        보상 수령
                                                    </button>
                                                ) : (
                                                    <button
                                                        disabled
                                                        style={{
                                                            padding: '6px 12px', background: 'rgba(0,0,0,0.5)', color: '#ccc',
                                                            border: '1px solid #555', borderRadius: '6px', cursor: 'not-allowed'
                                                        }}
                                                    >
                                                        진행 중...
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                        <button
                            onClick={() => setView('new')}
                            style={{
                                width: '100%', padding: '16px', marginTop: '10px',
                                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                border: 'none', borderRadius: '12px',
                                color: 'white', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer',
                                boxShadow: '0 4px 6px rgba(37, 99, 235, 0.3)'
                            }}
                        >
                            + 새 파견 보내기
                        </button>
                        <button
                            onClick={() => {
                                if (activeDispatches.length >= maxDispatchSlots) {
                                    alert(`파견 슬롯이 가득 찼습니다. (${activeDispatches.length}/${maxDispatchSlots})`)
                                    return
                                }
                                setView('new')
                            }}
                            style={{
                                width: '100%', padding: '16px', marginTop: '10px',
                                background: activeDispatches.length >= maxDispatchSlots
                                    ? '#334155'
                                    : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                border: 'none', borderRadius: '12px',
                                color: activeDispatches.length >= maxDispatchSlots ? '#94a3b8' : 'white',
                                fontSize: '16px', fontWeight: 'bold', cursor: 'pointer',
                                boxShadow: activeDispatches.length >= maxDispatchSlots ? 'none' : '0 4px 6px rgba(37, 99, 235, 0.3)'
                            }}
                        >
                            {activeDispatches.length >= maxDispatchSlots
                                ? `슬롯 가득 참 (${activeDispatches.length}/${maxDispatchSlots})`
                                : `+ 새 파견 보내기 (${activeDispatches.length}/${maxDispatchSlots})`}
                        </button>
                    </div>
                )}

                {view === 'new' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <h3 style={{ color: '#ccc', fontSize: '14px', marginBottom: '8px' }}>지역 선택</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {DISPATCH_REGIONS.map(region => (
                                    <div
                                        key={region.id}
                                        onClick={() => { setSelectedRegionId(region.id); setSelectedDuration(0); }}
                                        style={{
                                            position: 'relative',
                                            width: '100%',
                                            height: '100px',
                                            borderRadius: '12px',
                                            overflow: 'hidden',
                                            border: selectedRegionId === region.id ? '2px solid #facc15' : '1px solid #3d2b20',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            transform: selectedRegionId === region.id ? 'scale(1.02)' : 'scale(1)'
                                        }}
                                    >
                                        <div style={{
                                            position: 'absolute', inset: 0,
                                            backgroundImage: `url(${region.imageUrl})`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                            filter: selectedRegionId === region.id ? 'brightness(1)' : 'brightness(0.6)'
                                        }} />
                                        <div style={{
                                            position: 'absolute', inset: 0,
                                            background: 'linear-gradient(90deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0) 100%)',
                                            padding: '16px',
                                            display: 'flex', flexDirection: 'column', justifyContent: 'center'
                                        }}>
                                            <div style={{
                                                fontSize: '18px', fontWeight: 'bold',
                                                color: selectedRegionId === region.id ? '#facc15' : '#e2e8f0',
                                                textShadow: '0 2px 4px rgba(0,0,0,0.8)'
                                            }}>
                                                {region.name}
                                            </div>
                                            <div style={{ fontSize: '13px', color: '#ccc', marginTop: '4px', maxWidth: '80%' }}>
                                                {region.description}
                                            </div>
                                            <div style={{
                                                marginTop: '8px', fontSize: '12px',
                                                color: '#facc15', background: 'rgba(0,0,0,0.6)',
                                                padding: '4px 8px', borderRadius: '4px',
                                                alignSelf: 'flex-start'
                                            }}>
                                                권장 레벨 Lv.{region.recommendedLevel}+
                                            </div>
                                        </div>
                                        {selectedRegionId === region.id && (
                                            <div style={{
                                                position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)',
                                                fontSize: '24px', color: '#facc15',
                                                background: 'rgba(0,0,0,0.6)', borderRadius: '50%', padding: '4px'
                                            }}>
                                                ✓
                                            </div>
                                        )}
                                        {selectedRegionId === region.id && region.element && (
                                            <div style={{
                                                position: 'absolute', right: '60px', top: '50%', transform: 'translateY(-50%)',
                                                display: 'flex', alignItems: 'center', gap: '6px'
                                            }}>
                                                <span style={{
                                                    color: '#fff',
                                                    background: region.element === 'FIRE' ? '#ef4444' :
                                                        region.element === 'WATER' ? '#3b82f6' :
                                                            region.element === 'EARTH' ? '#10b981' :
                                                                region.element === 'WIND' ? '#8b5cf6' :
                                                                    region.element === 'LIGHT' ? '#f59e0b' :
                                                                        region.element === 'DARK' ? '#6366f1' : '#ccc',
                                                    padding: '2px 6px', borderRadius: '4px', fontSize: '11px'
                                                }}>
                                                    {region.element}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {selectedRegionId && (
                            <div>
                                <h3 style={{ color: '#ccc', fontSize: '14px', marginBottom: '8px' }}>파견 시간</h3>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    {DISPATCH_REGIONS.find(r => r.id === selectedRegionId)?.durationOptions.map(dur => (
                                        <button
                                            key={dur}
                                            onClick={() => setSelectedDuration(dur)}
                                            style={{
                                                padding: '8px 16px',
                                                background: selectedDuration === dur ? '#3b82f6' : '#1e293b',
                                                border: '1px solid #334155', borderRadius: '6px',
                                                color: 'white', cursor: 'pointer'
                                            }}
                                        >
                                            {dur < 3600 ? `${dur / 60}분` : `${dur / 3600}시간`}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {selectedRegionId && selectedDuration > 0 && (
                            <div>
                                <h3 style={{ color: '#ccc', fontSize: '14px', marginBottom: '8px' }}>
                                    동료 선택 ({selectedMonsterIds.length}명)
                                </h3>
                                <div style={{
                                    flex: 1,
                                    overflowY: 'auto',
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                                    gap: '12px',
                                    padding: '4px' // Padding for outline/shadow visibility
                                }}>
                                    {playerMonsters.map(monster => {
                                        const isDispatched = isMonsterDispatched(monster.id)
                                        const isSelected = selectedMonsterIds.includes(monster.id)
                                        const region = selectedRegionId ? DISPATCH_REGIONS.find(r => r.id === selectedRegionId) : null
                                        const mData = MONSTER_DATA[monster.monster_id]
                                        const isElementMatch = region && mData?.element === region.element

                                        return (
                                            <div
                                                key={monster.id}
                                                onClick={() => {
                                                    if (isDispatched) return
                                                    if (isSelected) setSelectedMonsterIds(prev => prev.filter(id => id !== monster.id))
                                                    else setSelectedMonsterIds(prev => [...prev, monster.id])
                                                }}
                                                style={{
                                                    position: 'relative',
                                                    aspectRatio: '1/1',
                                                    background: isSelected ? '#3b82f640' : '#2a2218',
                                                    border: isSelected ? '2px solid #3b82f6' : '1px solid #3d2b20',
                                                    borderRadius: '12px',
                                                    cursor: isDispatched ? 'not-allowed' : 'pointer',
                                                    display: 'flex', flexDirection: 'column',
                                                    alignItems: 'center', justifyContent: 'center',
                                                    transition: 'all 0.1s ease',
                                                    transform: isSelected ? 'scale(0.95)' : 'scale(1)',
                                                    opacity: isDispatched ? 0.5 : 1
                                                }}
                                            >
                                                {/* Icon */}
                                                <div style={{ width: '60%', height: '60%', position: 'relative' }}>
                                                    {mData?.iconUrl ? (
                                                        <img
                                                            src={mData.iconUrl}
                                                            alt={mData.name}
                                                            style={{
                                                                width: '100%', height: '100%',
                                                                objectFit: 'contain',
                                                                filter: isDispatched ? 'grayscale(100%)' : 'none'
                                                            }}
                                                        />
                                                    ) : (
                                                        <span style={{ fontSize: '32px' }}>{mData?.emoji || '👾'}</span>
                                                    )}
                                                </div>

                                                {/* Name (Optional, small) */}
                                                <div style={{
                                                    fontSize: '10px', color: '#ccc',
                                                    marginTop: '4px', textAlign: 'center',
                                                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                                    width: '90%'
                                                }}>
                                                    {mData?.name}
                                                </div>

                                                {/* Level Badge */}
                                                <div style={{
                                                    position: 'absolute', bottom: '4px', right: '4px',
                                                    background: 'rgba(0,0,0,0.7)', color: '#fff',
                                                    fontSize: '10px', padding: '1px 4px', borderRadius: '4px'
                                                }}>
                                                    Lv.{monster.level}
                                                </div>

                                                {/* Element Match Star */}
                                                {isElementMatch && (
                                                    <div style={{
                                                        position: 'absolute', top: '4px', right: '4px',
                                                        fontSize: '14px', filter: 'drop-shadow(0 0 2px gold)'
                                                    }}>
                                                        🌟
                                                    </div>
                                                )}

                                                {/* Checkmark */}
                                                {isSelected && (
                                                    <div style={{
                                                        position: 'absolute', top: '4px', left: '4px',
                                                        background: '#3b82f6', color: 'white',
                                                        borderRadius: '50%', width: '16px', height: '16px',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontSize: '10px'
                                                    }}>
                                                        ✓
                                                    </div>
                                                )}

                                                {/* Dispatched Text */}
                                                {isDispatched && (
                                                    <div style={{
                                                        position: 'absolute', inset: 0,
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        background: 'rgba(0,0,0,0.3)', borderRadius: '10px',
                                                        color: '#facc15', fontSize: '12px', fontWeight: 'bold'
                                                    }}>
                                                        파견중
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                            <button
                                onClick={() => setView('list')}
                                style={{
                                    flex: 1, padding: '12px', background: 'transparent',
                                    border: '1px solid #494122', borderRadius: '8px',
                                    color: '#888', cursor: 'pointer'
                                }}
                            >
                                취소
                            </button>
                            <button
                                onClick={handleStartDispatch}
                                disabled={!selectedRegionId || selectedMonsterIds.length === 0}
                                style={{
                                    flex: 2, padding: '12px',
                                    background: (!selectedRegionId || selectedMonsterIds.length === 0) ? '#334155' : '#facc15',
                                    color: (!selectedRegionId || selectedMonsterIds.length === 0) ? '#64748b' : '#1a1612',
                                    border: 'none', borderRadius: '8px', fontWeight: 'bold',
                                    cursor: 'pointer'
                                }}
                            >
                                파견 시작
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}
