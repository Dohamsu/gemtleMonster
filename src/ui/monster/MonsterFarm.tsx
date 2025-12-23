/* eslint-disable no-console */
import { useEffect, useState, useMemo } from 'react'
import { useGameStore } from '../../store/useGameStore'
import { useAlchemyStore } from '../../store/useAlchemyStore'
import { useAuth } from '../../hooks/useAuth'
import { MONSTER_DATA } from '../../data/monsterData'
import { MATERIALS } from '../../data/alchemyData'
import { calculateStats, getExpProgress, getMaxLevel, type RarityType } from '../../lib/monsterLevelUtils'
import type { PlayerMonster } from '../../types/monster'
import MonsterDetailModal from './MonsterDetailModal'

// --- Constants & Styles ---
const COLORS = {
    primary: "#f7ca18", // Light Gold
    secondary: "#f0d090", // Soft Gold
    darkBrown: "#2a1810",
    backgroundLight: "#f8f8f5",
    backgroundDark: "#1a1612", // Deep dark base
    cardBg: "#231f10",
    border: "#494122",
    accentRed: "#ef4444",
    accentGreen: "#0bda1d",
    accentBlue: "#3b82f6",
    textMain: "#e0e0e0",
    textSub: "#7a7a7a",
    rarity: {
        N: "#a0a0a0",
        R: "#3b82f6",
        SR: "#a855f7",
        SSR: "#f59e0b"
    }
}

export default function MonsterFarm() {
    const { setCanvasView } = useGameStore()
    const { playerMonsters, loadPlayerMonsters, decomposeMonsters, toggleMonsterLock } = useAlchemyStore()
    const { user } = useAuth()

    const [decomposeMode, setDecomposeMode] = useState(false)
    const [selectedMonsters, setSelectedMonsters] = useState<Set<string>>(new Set())
    const [showConfirmDialog, setShowConfirmDialog] = useState(false)
    const [decomposeResult, setDecomposeResult] = useState<{
        success: boolean
        rewards: Record<string, number>
        count: number
    } | null>(null)
    const [selectedMonsterForModal, setSelectedMonsterForModal] = useState<PlayerMonster | null>(null)

    // Filter & Search States
    const [searchTerm, setSearchTerm] = useState('')
    const [filterRole, setFilterRole] = useState<string>('ALL') // 'ALL' | 'TANK' | 'DPS' | 'SUPPORT' | 'PRODUCTION'
    const [sortType, setSortType] = useState<string>('LEVEL_DESC') // 'LEVEL_DESC' | 'RARITY_DESC' | 'NEWEST'
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768)
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    useEffect(() => {
        if (user) {
            loadPlayerMonsters(user.id)
        }
    }, [user, loadPlayerMonsters])

    const handleBack = () => {
        setCanvasView('map')
    }

    const toggleMonsterSelection = (monsterId: string) => {
        const newSelected = new Set(selectedMonsters)
        if (newSelected.has(monsterId)) {
            newSelected.delete(monsterId)
        } else {
            newSelected.add(monsterId)
        }
        setSelectedMonsters(newSelected)
    }

    // Lock function passed to Modal
    const handleLockToggleCore = async (monsterId: string, currentLocked: boolean) => {
        try {
            await toggleMonsterLock(monsterId, !currentLocked)
            if (selectedMonsterForModal && selectedMonsterForModal.id === monsterId) {
                setSelectedMonsterForModal({
                    ...selectedMonsterForModal,
                    is_locked: !currentLocked
                })
            }
        } catch (error) {
            console.error('Failed to toggle lock:', error)
        }
    }

    const handleLockToggle = async (monsterId: string, currentLocked: boolean, e: React.MouseEvent) => {
        e.stopPropagation()
        await handleLockToggleCore(monsterId, currentLocked)
    }

    const handleDecompose = async () => {
        if (selectedMonsters.size === 0) return
        try {
            const result = await decomposeMonsters(Array.from(selectedMonsters))
            if (!result.success) {
                setDecomposeResult({ success: false, rewards: {}, count: 0 })
            } else {
                setDecomposeResult({ success: true, rewards: result.rewards, count: result.deleted_count })
                setSelectedMonsters(new Set())
                setShowConfirmDialog(false)
            }
            setTimeout(() => setDecomposeResult(null), 5000)
        } catch (error) {
            console.error('Decompose failed:', error)
            setDecomposeResult({ success: false, rewards: {}, count: 0 })
            setTimeout(() => setDecomposeResult(null), 5000)
        }
    }

    const getExpectedRewards = () => {
        const rewards: Record<string, number> = {}
        selectedMonsters.forEach(monsterId => {
            const monster = playerMonsters.find(m => m.id === monsterId)
            if (!monster) return
            const data = MONSTER_DATA[monster.monster_id]
            if (!data) return
            const rarity = data.rarity || 'N'
            const essenceAmount = rarity === 'SSR' ? 30 : rarity === 'SR' ? 10 : rarity === 'R' ? 3 : 1
            rewards['essence'] = (rewards['essence'] || 0) + essenceAmount
            const baseMaterial = rarity === 'SSR' ? 'gem_fragment' : rarity === 'SR' ? 'ore_magic' : rarity === 'R' ? 'ore_iron' : 'slime_fluid'
            const baseAmount = rarity === 'SSR' ? 1 : rarity === 'SR' ? 2 : rarity === 'R' ? 2 : 1
            rewards[baseMaterial] = (rewards[baseMaterial] || 0) + baseAmount
        })
        return rewards
    }

    // Filter Logic
    const filteredMonsters = useMemo(() => {
        return playerMonsters.filter(monster => {
            const data = MONSTER_DATA[monster.monster_id]
            if (!data) return false

            // Search (Name)
            if (searchTerm && !data.name.includes(searchTerm)) return false

            // Role Filter
            const roleMap: Record<string, string> = {
                'TANK': '탱커', 'DPS': '딜러', 'SUPPORT': '서포터', 'HYBRID': '하이브리드', 'PRODUCTION': '생산'
            }
            if (filterRole !== 'ALL' && data.role !== roleMap[filterRole]) return false

            return true
        }).sort((a, b) => {
            const dataA = MONSTER_DATA[a.monster_id]
            const dataB = MONSTER_DATA[b.monster_id]
            const rarityScore = (r?: string) => {
                if (r === 'SSR') return 4; if (r === 'SR') return 3; if (r === 'R') return 2; return 1
            }

            switch (sortType) {
                case 'LEVEL_DESC': return (b.level || 1) - (a.level || 1)
                case 'LEVEL_ASC': return (a.level || 1) - (b.level || 1)
                case 'RARITY_DESC': {
                    const rA = rarityScore(dataA?.rarity); const rB = rarityScore(dataB?.rarity)
                    if (rA !== rB) return rB - rA
                    return (b.level || 1) - (a.level || 1)
                }
                case 'NEWEST': return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
                default: return 0
            }
        })
    }, [playerMonsters, searchTerm, filterRole, sortType])

    // Role Filter Options
    const roleFilters = [
        { id: 'ALL', label: '전체' },
        { id: 'DPS', label: '공격형' },
        { id: 'TANK', label: '방어형' },
        { id: 'SUPPORT', label: '지원형' },
        { id: 'PRODUCTION', label: '자원형' },
    ]

    return (
        <div style={{
            fontFamily: "'Noto SansKR', sans-serif",
            background: COLORS.backgroundDark,
            color: COLORS.textMain,
            height: '100%',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative'
        }}>
            {/* Header - Aligned with Shop/Facility Header */}
            <header style={{
                position: 'sticky', top: 0, zIndex: 40,
                background: 'rgba(28, 25, 23, 0.95)', // Matches ShopHeader
                backdropFilter: 'blur(10px)',
                borderBottom: `1px solid rgba(68, 68, 68, 0.5)`,
                padding: isMobile ? '12px 16px' : '20px 32px',
                flexShrink: 0
            }}>
                <div style={{
                    maxWidth: '1440px', margin: '0 auto',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}>
                    {/* Left: Back & Title */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '12px' : '24px' }}>
                        <button
                            onClick={handleBack}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                background: 'transparent', border: 'none',
                                color: '#9ca3af', cursor: 'pointer',
                                fontSize: '16px', fontWeight: 600,
                                padding: '8px', borderRadius: '8px',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#f0d090'}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: 'currentColor' }}>
                                <path d="M20 11H7.83L13.42 5.41L12 4L4 12L12 20L13.41 18.59L7.83 13H20V11Z" fill="currentColor" />
                            </svg>
                            {!isMobile && <span>나가기</span>}
                        </button>

                        <h1 style={{
                            fontSize: isMobile ? '20px' : '36px',
                            fontWeight: 900,
                            color: '#facc15', // Gold
                            textTransform: 'uppercase',
                            letterSpacing: '-0.02em',
                            margin: 0,
                            textShadow: '0 0 30px rgba(250, 204, 21, 0.2)',
                            fontFamily: "'Space Grotesk', sans-serif",
                            display: 'flex', alignItems: 'center', gap: '8px'
                        }}>
                            {/* <span>🏰</span> */}
                            Monster Farm
                        </h1>
                    </div>

                    {/* Right: Actions & Stats */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {/* Monster Count Pill */}
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            background: 'rgba(58, 53, 32, 0.6)',
                            padding: isMobile ? '6px 12px' : '8px 16px',
                            borderRadius: '9999px',
                            border: '1px solid rgba(234, 179, 8, 0.3)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                        }}>
                            <span style={{ fontSize: isMobile ? '14px' : '16px' }}>🐾</span>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                                <span style={{
                                    color: 'white', fontWeight: 700,
                                    fontSize: isMobile ? '14px' : '18px',
                                    fontFamily: "'Space Grotesk', sans-serif"
                                }}>{playerMonsters.length}</span>
                                <span style={{ color: '#7a7a7a', fontSize: '12px', fontWeight: 600 }}>/ 100</span>
                            </div>
                        </div>

                        {/* Decompose Button */}
                        <button
                            onClick={() => {
                                setDecomposeMode(!decomposeMode)
                                setSelectedMonsters(new Set())
                            }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                background: decomposeMode ? 'rgba(239, 68, 68, 0.2)' : 'rgba(42, 24, 16, 0.8)',
                                border: `1px solid ${decomposeMode ? '#ef4444' : '#494122'}`,
                                color: decomposeMode ? '#ef4444' : '#9ca3af',
                                padding: isMobile ? '6px 12px' : '8px 16px',
                                borderRadius: '8px', cursor: 'pointer',
                                transition: 'all 0.2s',
                                height: '100%'
                            }}
                        >
                            <span style={{ fontSize: isMobile ? '16px' : '20px' }}>{decomposeMode ? '✕' : '⚙️'}</span>
                            {!isMobile && <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{decomposeMode ? '취소' : '분해'}</span>}
                        </button>
                    </div>
                </div>
            </header>

            {/* Sticky Search & Filter Bar */}
            <div style={{
                position: 'sticky', top: '64px', zIndex: 30,
                background: 'rgba(26, 22, 18, 0.95)',
                borderBottom: `1px solid ${COLORS.border}`,
                backdropFilter: 'blur(8px)',
                flexShrink: 0
            }}>
                <div style={{ maxWidth: '480px', margin: '0 auto', padding: '12px 16px' }}>
                    {/* Search Input Row */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
                            <input
                                type="text"
                                placeholder="이름 검색..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    width: '100%',
                                    background: COLORS.darkBrown,
                                    border: `1px solid ${COLORS.border}`,
                                    borderRadius: '8px',
                                    padding: '8px 12px 8px 36px',
                                    color: 'white',
                                    fontSize: '13px',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>
                        <button
                            onClick={() => {
                                // Cycle Sort Types
                                const types = ['LEVEL_DESC', 'RARITY_DESC', 'NEWEST']
                                const nextIndex = (types.indexOf(sortType) + 1) % types.length
                                setSortType(types[nextIndex])
                            }}
                            style={{
                                padding: '8px', borderRadius: '8px',
                                background: COLORS.darkBrown, border: `1px solid ${COLORS.border}`,
                                color: COLORS.textSub, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                            title="정렬 변경"
                        >
                            <span style={{ fontSize: '18px' }}>
                                {sortType === 'LEVEL_DESC' ? '⬇️' : sortType === 'RARITY_DESC' ? '⭐' : '🕒'}
                            </span>
                        </button>
                    </div>

                    {/* Filter Chips (Scrollable) */}
                    <div style={{
                        display: 'flex', gap: '8px', overflowX: 'auto',
                        paddingBottom: '4px', scrollbarWidth: 'none', msOverflowStyle: 'none'
                    }}>
                        {roleFilters.map(filter => (
                            <button
                                key={filter.id}
                                onClick={() => setFilterRole(filter.id)}
                                style={{
                                    flexShrink: 0,
                                    padding: '6px 12px',
                                    borderRadius: '999px',
                                    fontSize: '11px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    border: `1px solid ${filterRole === filter.id ? COLORS.primary : COLORS.border}`,
                                    background: filterRole === filter.id ? COLORS.primary : COLORS.darkBrown,
                                    color: filterRole === filter.id ? COLORS.darkBrown : COLORS.textSub,
                                    transition: 'all 0.2s'
                                }}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Info Message for Decompose */}
            {decomposeMode && (
                <div style={{
                    background: 'rgba(239, 68, 68, 0.1)', borderBottom: '1px solid #ef4444',
                    padding: '8px', textAlign: 'center', color: '#fca5a5', fontSize: '12px', fontWeight: 'bold'
                }}>
                    몬스터를 선택하여 분해하세요 ({selectedMonsters.size} 선택됨)
                </div>
            )}

            {/* Decompose Result Toast */}
            {decomposeResult && (
                <div style={{
                    position: 'absolute', top: '140px', left: '50%', transform: 'translateX(-50%)',
                    zIndex: 100, width: '90%', maxWidth: '400px',
                    background: decomposeResult.success ? 'rgba(6, 78, 59, 0.95)' : 'rgba(127, 29, 29, 0.95)',
                    border: `1px solid ${decomposeResult.success ? '#34d399' : '#f87171'}`,
                    padding: '12px', borderRadius: '8px', color: 'white',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
                }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                        {decomposeResult.success ? '✅ 분해 성공!' : '❌ 분해 실패'}
                    </div>
                    {decomposeResult.success && (
                        <div style={{ fontSize: '12px', opacity: 0.9 }}>
                            {Object.entries(decomposeResult.rewards).map(([k, v]) => `${MATERIALS[k]?.name || k} x${v}`).join(', ')}
                        </div>
                    )}
                </div>
            )}

            {/* Main Content (Grid) */}
            <main style={{
                flex: 1, overflowY: 'auto', padding: '16px',
                width: '100%', maxWidth: '480px', margin: '0 auto', boxSizing: 'border-box'
            }}>
                {filteredMonsters.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: COLORS.textSub }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                        <p>조건에 맞는 몬스터가 없습니다.</p>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', // Mobile adaptable grid
                        gap: '12px'
                    }}>
                        {filteredMonsters.map(monster => {
                            const data = MONSTER_DATA[monster.monster_id]
                            if (!data) return null

                            const isLocked = monster.is_locked || false
                            const isSelected = selectedMonsters.has(monster.id)
                            const canSelect = decomposeMode && !isLocked

                            const level = monster.level || 1
                            const rarity = (data.rarity || 'N') as RarityType
                            const stats = calculateStats({ hp: data.hp, atk: data.attack, def: data.defense }, level, rarity, monster.awakening_level || 0)
                            const expProgress = getExpProgress(monster.exp, level, rarity)
                            const maxLevel = getMaxLevel(rarity)

                            const borderColor = decomposeMode && isSelected ? COLORS.accentRed :
                                (data.rarity === 'SSR' ? COLORS.rarity.SSR :
                                    data.rarity === 'SR' ? COLORS.rarity.SR :
                                        data.rarity === 'R' ? COLORS.rarity.R : COLORS.rarity.N)

                            const bgGradient = `linear-gradient(135deg, ${borderColor}10 0%, transparent 100%)`

                            return (
                                <div
                                    key={monster.id}
                                    onClick={() => {
                                        if (decomposeMode) {
                                            if (canSelect) toggleMonsterSelection(monster.id)
                                        } else {
                                            setSelectedMonsterForModal(monster)
                                        }
                                    }}
                                    style={{
                                        position: 'relative',
                                        background: COLORS.cardBg,
                                        borderRadius: '12px',
                                        border: `1px solid ${borderColor}40`,
                                        overflow: 'hidden',
                                        cursor: 'pointer',
                                        transform: isSelected ? 'scale(0.95)' : 'none',
                                        transition: 'transform 0.2s',
                                        boxShadow: isSelected ? `0 0 0 2px ${COLORS.accentRed}` : '0 4px 6px rgba(0,0,0,0.2)'
                                    }}
                                >
                                    {/* Gradient Overlay */}
                                    <div style={{ position: 'absolute', inset: 0, background: bgGradient, pointerEvents: 'none' }} />

                                    {/* Lock Icon */}
                                    <button
                                        onClick={(e) => handleLockToggle(monster.id, isLocked, e)}
                                        style={{
                                            position: 'absolute', top: '8px', right: '8px', zIndex: 10,
                                            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                                            color: isLocked ? borderColor : COLORS.textSub,
                                            opacity: isLocked ? 1 : 0.5
                                        }}
                                    >
                                        <span style={{ fontSize: '16px' }}>{isLocked ? '🔒' : '🔓'}</span>
                                    </button>

                                    <div style={{ display: 'flex', height: '100%' }}>
                                        {/* Left: Image Column */}
                                        <div style={{
                                            width: '35%', background: '#15120e', borderRight: `1px solid ${COLORS.border}`,
                                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                            padding: '8px', position: 'relative'
                                        }}>
                                            {/* Stars */}
                                            {(monster.awakening_level || 0) > 0 && (
                                                <div style={{ position: 'absolute', top: '4px', left: '4px', display: 'flex', flexDirection: 'column', lineHeight: 0.8 }}>
                                                    {Array.from({ length: monster.awakening_level || 0 }).map((_, i) => (
                                                        <span key={i} style={{ color: borderColor, fontSize: '8px' }}>★</span>
                                                    ))}
                                                </div>
                                            )}

                                            <div style={{
                                                width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '32px', filter: 'drop-shadow(0 4px 4px rgba(0,0,0,0.5))'
                                            }}>
                                                {data.iconUrl ?
                                                    <img src={data.iconUrl} alt={data.name} style={{ width: '100%', height: '100%', objectFit: 'contain', imageRendering: 'pixelated' }} />
                                                    : data.emoji}
                                            </div>

                                            <div style={{
                                                marginTop: '4px', background: COLORS.darkBrown,
                                                padding: '2px 6px', borderRadius: '4px',
                                                fontSize: '10px', fontWeight: 'bold', color: borderColor,
                                                border: `1px solid ${borderColor}40`, fontFamily: 'monospace'
                                            }}>
                                                Lv.{level}
                                            </div>
                                        </div>

                                        {/* Right: Info Column */}
                                        <div style={{ flex: 1, padding: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                                                    <h3 style={{ margin: 0, fontSize: '13px', fontWeight: 'bold', color: COLORS.textMain, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '80px' }}>
                                                        {data.name}
                                                    </h3>
                                                </div>
                                                <span style={{
                                                    display: 'inline-block',
                                                    fontSize: '9px', fontWeight: 'bold',
                                                    padding: '2px 6px', borderRadius: '4px',
                                                    background: `${borderColor}20`,
                                                    color: borderColor,
                                                    border: `1px solid ${borderColor}40`
                                                }}>
                                                    {data.role}
                                                </span>
                                            </div>

                                            {/* EXP Bar */}
                                            <div style={{ width: '100%', height: '6px', background: '#1a1612', borderRadius: '3px', overflow: 'hidden', margin: '6px 0', border: `1px solid ${COLORS.border}` }}>
                                                <div style={{
                                                    height: '100%', width: `${level >= maxLevel ? 100 : expProgress}%`,
                                                    background: `linear-gradient(90deg, ${borderColor}, white)`
                                                }} />
                                            </div>

                                            {/* Stats Grid */}
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '10px', color: '#ccc' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                                    <span style={{ color: '#ef4444' }}>⚔️</span> {stats.atk}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                                    <span style={{ color: '#3b82f6' }}>🛡️</span> {stats.def}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </main>

            {/* Floating Action Button for Summon (Optional/Future) - Or Decompose Action */}
            {decomposeMode && selectedMonsters.size > 0 && (
                <div style={{
                    position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
                    zIndex: 50, width: '90%', maxWidth: '400px'
                }}>
                    <button
                        onClick={() => setShowConfirmDialog(true)}
                        style={{
                            width: '100%',
                            background: COLORS.accentRed,
                            color: 'white',
                            border: 'none',
                            padding: '14px',
                            borderRadius: '12px',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            boxShadow: '0 4px 12px rgba(220, 38, 38, 0.4)',
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                        }}
                    >
                        <span>🗑️</span> 선택한 {selectedMonsters.size}마리 분해하기
                    </button>
                </div>
            )}

            {/* Confirm Dialog */}
            {showConfirmDialog && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
                    padding: '20px'
                }}>
                    <div style={{
                        background: COLORS.backgroundDark, borderRadius: '16px', padding: '24px',
                        maxWidth: '400px', width: '100%', border: `1px solid ${COLORS.accentRed}`,
                        boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                    }}>
                        <h3 style={{ margin: '0 0 16px 0', color: '#fca5a5', fontSize: '18px' }}>⚠️ 몬스터 분해 확인</h3>
                        <p style={{ color: COLORS.textSub, marginBottom: '20px', lineHeight: '1.5', fontSize: '14px' }}>
                            선택한 <strong style={{ color: 'white' }}>{selectedMonsters.size}마리</strong>의 몬스터를 분해하시겠습니까?<br />
                            <span style={{ color: '#f87171', fontSize: '12px' }}>이 작업은 되돌릴 수 없습니다!</span>
                        </p>

                        <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '12px', marginBottom: '20px' }}>
                            <div style={{ fontWeight: 'bold', marginBottom: '8px', color: COLORS.accentGreen, fontSize: '13px' }}>예상 보상:</div>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {Object.entries(getExpectedRewards()).map(([materialId, amount]) => (
                                    <div key={materialId} style={{
                                        background: 'rgba(34, 197, 94, 0.1)', border: '1px solid #22c55e',
                                        padding: '4px 8px', borderRadius: '4px', fontSize: '11px', color: '#86efac'
                                    }}>
                                        {MATERIALS[materialId]?.name || materialId}: +{amount}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={() => setShowConfirmDialog(false)}
                                style={{
                                    flex: 1, padding: '12px', borderRadius: '8px',
                                    background: COLORS.darkBrown, border: `1px solid ${COLORS.border}`,
                                    color: COLORS.textSub, fontWeight: 'bold', cursor: 'pointer'
                                }}
                            >
                                취소
                            </button>
                            <button
                                onClick={handleDecompose}
                                style={{
                                    flex: 1, padding: '12px', borderRadius: '8px',
                                    background: COLORS.accentRed, border: 'none',
                                    color: 'white', fontWeight: 'bold', cursor: 'pointer'
                                }}
                            >
                                분해하기
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {selectedMonsterForModal && (
                <MonsterDetailModal
                    monster={selectedMonsterForModal}
                    onClose={() => setSelectedMonsterForModal(null)}
                />
            )}
        </div>
    )
}
