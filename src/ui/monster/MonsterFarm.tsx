import { useEffect, useState } from 'react'
import { useGameStore } from '../../store/useGameStore'
import { useAlchemyStore } from '../../store/useAlchemyStore'
import { useAuth } from '../../hooks/useAuth'
import { MONSTER_DATA } from '../../data/monsterData'
import { MATERIALS } from '../../data/alchemyData'
import { calculateStats, getRequiredExp, getExpProgress, getMaxLevel, type RarityType } from '../../lib/monsterLevelUtils'
// import { getUnlockableSkills } from '../../data/monsterSkillData'
// import type { RoleType } from '../../types/alchemy'
import type { PlayerMonster } from '../../types/monster'
import CustomSelect from '../CustomSelect'
import MonsterDetailModal from './MonsterDetailModal'

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

    const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

    // Filter & Sort States
    const [filterElement, setFilterElement] = useState<string>('ALL')
    const [filterRole, setFilterRole] = useState<string>('ALL')
    const [filterRarity, setFilterRarity] = useState<string>('ALL')
    const [sortType, setSortType] = useState<string>('LEVEL_DESC')

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

            // Update the modal's monster state immediately to reflect the change in UI
            if (selectedMonsterForModal && selectedMonsterForModal.id === monsterId) {
                setSelectedMonsterForModal({
                    ...selectedMonsterForModal,
                    is_locked: !currentLocked
                })
            }

            // Reload monsters to reflect changes in the list - REMOVED for optimization
            // The store's toggleMonsterLock already updates the local state optimistically.
            // if (user) {
            //     await loadPlayerMonsters(user.id)
            // }
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
                console.error('Decompose failed:', result.error)
                setDecomposeResult({
                    success: false,
                    rewards: {},
                    count: 0
                })
            } else {
                setDecomposeResult({
                    success: true,
                    rewards: result.rewards,
                    count: result.deleted_count
                })
                setSelectedMonsters(new Set())
                setShowConfirmDialog(false)
            }

            // Auto-hide result after 5 seconds
            setTimeout(() => setDecomposeResult(null), 5000)
        } catch (error) {
            console.error('Decompose failed:', error)
            setDecomposeResult({
                success: false,
                rewards: {},
                count: 0
            })
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

            // Simple reward calculation based on rarity
            const rarity = data.rarity || 'N'

            // Essence
            const essenceAmount = rarity === 'SSR' ? 30 : rarity === 'SR' ? 10 : rarity === 'R' ? 3 : 1
            rewards['essence'] = (rewards['essence'] || 0) + essenceAmount

            // Base material
            const baseMaterial = rarity === 'SSR' ? 'gem_fragment' : rarity === 'SR' ? 'ore_magic' : rarity === 'R' ? 'ore_iron' : 'slime_fluid'
            const baseAmount = rarity === 'SSR' ? 1 : rarity === 'SR' ? 2 : rarity === 'R' ? 2 : 1
            rewards[baseMaterial] = (rewards[baseMaterial] || 0) + baseAmount

            // Shards (if element exists)
            if (data.element) {
                const shardAmount = rarity === 'SSR' ? 5 : rarity === 'SR' ? 3 : rarity === 'R' ? 1 : 0
                if (shardAmount > 0) {
                    const shardId = `shard_${data.element.toLowerCase()}`
                    rewards[shardId] = (rewards[shardId] || 0) + shardAmount
                }
            }
        })
        return rewards
    }

    // Filter Logic
    const filteredMonsters = playerMonsters.filter(monster => {
        const data = MONSTER_DATA[monster.monster_id]
        if (!data) return false

        // Element Filter
        if (filterElement !== 'ALL') {
            const el = data.element?.toUpperCase() || 'EARTH' // Default fallback
            if (filterElement === 'OTHER' && !data.element) return true // No element
            if (el !== filterElement) return false
        }

        // Role Filter (Data uses Korean keys)
        if (filterRole !== 'ALL') {
            // Map English filter to Korean data
            const roleMap: Record<string, string> = {
                'TANK': '탱커',
                'DPS': '딜러',
                'SUPPORT': '서포터',
                'HYBRID': '하이브리드',
                'PRODUCTION': '생산'
            }
            if (data.role !== roleMap[filterRole]) return false
        }

        // Rarity Filter
        if (filterRarity !== 'ALL') {
            const rarity = data.rarity || 'N'
            if (rarity !== filterRarity) return false
        }

        return true
    }).sort((a, b) => {
        const dataA = MONSTER_DATA[a.monster_id]
        const dataB = MONSTER_DATA[b.monster_id]

        const rarityScore = (r?: string) => {
            if (r === 'SSR') return 4
            if (r === 'SR') return 3
            if (r === 'R') return 2
            return 1
        }

        switch (sortType) {
            case 'LEVEL_DESC':
                return (b.level || 1) - (a.level || 1)
            case 'LEVEL_ASC':
                return (a.level || 1) - (b.level || 1)
            case 'RARITY_DESC':
                const rA = rarityScore(dataA?.rarity)
                const rB = rarityScore(dataB?.rarity)
                if (rA !== rB) return rB - rA
                // If same rarity, sort by level
                return (b.level || 1) - (a.level || 1)
            case 'NEWEST':
                return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
            case 'OLDEST':
                return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
            default:
                return 0
        }
    })

    return (
        <div style={{
            padding: isMobile ? '10px' : '20px',
            color: '#eee',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: isMobile ? '10px' : '20px',
            maxWidth: '1000px',
            margin: '0 auto',
            width: '100%',
            overflow: 'hidden'
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                flexDirection: 'column', // Changed for filter bar
                gap: '15px'
            }}>
                <div style={{
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    justifyContent: 'space-between',
                    alignItems: isMobile ? 'stretch' : 'center',
                    background: 'rgba(0,0,0,0.6)',
                    padding: isMobile ? '12px' : '15px',
                    borderRadius: '12px',
                    backdropFilter: 'blur(4px)',
                    gap: isMobile ? '10px' : '0'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '10px' : '15px' }}>
                        <button
                            onClick={handleBack}
                            style={{
                                background: '#4a3020',
                                border: '2px solid #8a6040',
                                color: 'white',
                                padding: isMobile ? '8px 12px' : '8px 16px',
                                minHeight: isMobile ? '40px' : 'auto',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                fontSize: isMobile ? '13px' : '14px',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            ← 나가기
                        </button>
                        <h2 style={{
                            margin: 0,
                            fontSize: isMobile ? '1.2em' : '1.5em',
                            color: '#f0d090',
                            whiteSpace: 'nowrap'
                        }}>
                            🏰 몬스터 농장
                        </h2>
                    </div>
                    <div style={{
                        display: 'flex',
                        gap: '10px',
                        alignItems: 'center',
                        justifyContent: isMobile ? 'space-between' : 'flex-end'
                    }}>
                        <div style={{ fontSize: isMobile ? '1em' : '1.2em', fontWeight: 'bold', color: '#facc15' }}>
                            보유: {playerMonsters.length}마리
                        </div>
                        <button
                            onClick={() => {
                                setDecomposeMode(!decomposeMode)
                                setSelectedMonsters(new Set())
                            }}
                            style={{
                                background: decomposeMode ? '#dc2626' : '#059669',
                                border: 'none',
                                color: 'white',
                                padding: isMobile ? '8px 12px' : '8px 16px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                fontSize: isMobile ? '13px' : '14px',
                                minHeight: isMobile ? '40px' : 'auto'
                            }}
                        >
                            {decomposeMode ? '❌ 종료' : '⚙️ 분해'}
                        </button>
                    </div>
                </div>

                {/* Filter & Sort Bar (Custom Select) */}
                <div style={{
                    display: 'flex', flexWrap: 'wrap', gap: '8px',
                    background: 'rgba(15, 23, 42, 0.6)', padding: '10px', borderRadius: '12px', border: '1px solid #334155',
                    alignItems: 'center'
                }}>
                    <CustomSelect
                        value={filterElement} onChange={setFilterElement}
                        options={[
                            { value: 'ALL', label: '🔮 모든 속성' }, { value: 'FIRE', label: '🔥 불' }, { value: 'WATER', label: '💧 물' },
                            { value: 'EARTH', label: '🌳 대지' }, { value: 'WIND', label: '🌪️ 바람' }, { value: 'LIGHT', label: '✨ 빛' }, { value: 'DARK', label: '� 어둠' }
                        ]} style={{ flex: isMobile ? '1 1 45%' : '0 0 140px' }}
                    />
                    <CustomSelect
                        value={filterRole} onChange={setFilterRole}
                        options={[
                            { value: 'ALL', label: '⚔️ 모든 역할' }, { value: 'TANK', label: '🛡️ 탱커' }, { value: 'DPS', label: '⚔️ 딜러' },
                            { value: 'SUPPORT', label: '🌿 서포터' }, { value: 'HYBRID', label: '⚖️ 하이브리드' }, { value: 'PRODUCTION', label: '⚒️ 생산' }
                        ]} style={{ flex: isMobile ? '1 1 45%' : '0 0 140px' }}
                    />
                    <CustomSelect
                        value={filterRarity} onChange={setFilterRarity}
                        options={[
                            { value: 'ALL', label: '⭐ 모든 등급' }, { value: 'SSR', label: '🟨 SSR' }, { value: 'SR', label: '� SR' },
                            { value: 'R', label: '🟦 R' }, { value: 'N', label: '⬜ N' }
                        ]} style={{ flex: isMobile ? '1 1 45%' : '0 0 140px' }}
                    />
                    {!isMobile && <div style={{ width: '1px', height: '20px', background: '#475569', margin: '0 5px' }} />}
                    <CustomSelect
                        value={sortType} onChange={setSortType}
                        options={[
                            { value: 'LEVEL_DESC', label: '⬇️ 레벨 높은 순' }, { value: 'LEVEL_ASC', label: '⬆️ 레벨 낮은 순' },
                            { value: 'RARITY_DESC', label: '⭐ 등급 높은 순' }, { value: 'NEWEST', label: '🕒 최신순' }, { value: 'OLDEST', label: '�️ 오래된 순' }
                        ]} style={{ flex: isMobile ? '1 1 45%' : '0 0 160px' }}
                    />
                </div>
            </div>

            {/* Decompose Mode Info */}
            {decomposeMode && (
                <div style={{
                    background: 'rgba(220, 38, 38, 0.1)',
                    border: '2px solid #dc2626',
                    borderRadius: '12px',
                    padding: '15px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <div style={{ fontWeight: 'bold', color: '#fca5a5', marginBottom: '5px' }}>
                            🔥 분해 모드 활성화
                        </div>
                        <div style={{ fontSize: '0.9em', color: '#cbd5e1' }}>
                            분해할 몬스터를 선택하세요. 잠금된 몬스터는 선택할 수 없습니다.
                        </div>
                    </div>
                    {selectedMonsters.size > 0 && (
                        <button
                            onClick={() => setShowConfirmDialog(true)}
                            style={{
                                background: '#dc2626',
                                border: 'none',
                                color: 'white',
                                padding: '10px 20px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                fontSize: '14px'
                            }}
                        >
                            선택한 {selectedMonsters.size}마리 분해하기
                        </button>
                    )}
                </div>
            )}

            {/* Decompose Result */}
            {decomposeResult && (
                <div style={{
                    background: decomposeResult.success ? 'rgba(34, 197, 94, 0.1)' : 'rgba(220, 38, 38, 0.1)',
                    border: `2px solid ${decomposeResult.success ? '#22c55e' : '#dc2626'}`,
                    borderRadius: '12px',
                    padding: '15px'
                }}>
                    <div style={{ fontWeight: 'bold', color: decomposeResult.success ? '#86efac' : '#fca5a5', marginBottom: '10px' }}>
                        {decomposeResult.success ? '✅ 분해 완료!' : '❌ 분해 실패'}
                    </div>
                    {decomposeResult.success && (
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            {Object.entries(decomposeResult.rewards).map(([materialId, amount]) => (
                                <div key={materialId} style={{
                                    background: 'rgba(0,0,0,0.3)',
                                    padding: '5px 10px',
                                    borderRadius: '6px',
                                    fontSize: '0.9em'
                                }}>
                                    {MATERIALS[materialId]?.name || materialId}: +{amount}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Monster Grid */}
            {filteredMonsters.length === 0 ? (
                <div style={{
                    flex: 1,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    background: 'rgba(0,0,0,0.3)',
                    borderRadius: '12px',
                    flexDirection: 'column',
                    gap: '20px'
                }}>
                    <div style={{ fontSize: '4em' }}>🔍</div>
                    <p style={{ color: '#aaa', fontSize: '1.2em' }}>
                        {playerMonsters.length === 0 ? '아직 보유한 몬스터가 없습니다.' : '조건에 맞는 몬스터가 없습니다.'}
                    </p>
                    {playerMonsters.length === 0 && (
                        <p style={{ color: '#888' }}>연금술 공방에서 몬스터를 소환해보세요!</p>
                    )}
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', // Keep card width reasonable
                    gap: '15px', // Reduced gap for tighter layout
                    padding: '10px',
                    overflowY: 'auto'
                }}>
                    {filteredMonsters.map(monster => {
                        const data = MONSTER_DATA[monster.monster_id]
                        if (!data) return null

                        const isLocked = monster.is_locked || false
                        const isSelected = selectedMonsters.has(monster.id)
                        const canSelect = decomposeMode && !isLocked

                        // Calculated Stats
                        const level = monster.level || 1
                        const rarity = (data.rarity || 'N') as RarityType
                        // const roleMap: Record<string, RoleType> = { '탱커': 'TANK', '딜러': 'DPS', '서포터': 'SUPPORT', '하이브리드': 'HYBRID', '생산': 'PRODUCTION' }
                        // const role = roleMap[data.role] || 'TANK'
                        // const monsterTypeId = monster.monster_id.replace(/^monster_/, '')
                        const stats = calculateStats({ hp: data.hp, atk: data.attack, def: data.defense }, level, rarity)
                        const expProgress = getExpProgress(monster.exp, level, rarity)
                        const requiredExp = getRequiredExp(level, rarity)
                        const maxLevel = getMaxLevel(rarity)

                        return (
                            <div key={monster.id} style={{
                                background: isSelected ? 'rgba(220, 38, 38, 0.2)' : 'rgba(30, 41, 59, 0.8)',
                                borderRadius: '12px',
                                border: isSelected ? '2px solid #dc2626' : isLocked ? '2px solid #facc15' : '1px solid #334155',
                                padding: '12px', // Reduced padding
                                display: 'flex', flexDirection: 'column', gap: '10px',
                                transition: 'all 0.2s',
                                cursor: 'pointer', // Always pointer
                                opacity: (decomposeMode && isLocked) ? 0.5 : 1,
                                position: 'relative',
                                transform: isSelected ? 'scale(0.98)' : 'scale(1)',
                            }}
                                onClick={() => {
                                    if (decomposeMode) {
                                        if (canSelect) toggleMonsterSelection(monster.id)
                                    } else {
                                        setSelectedMonsterForModal(monster)
                                    }
                                }}
                            >
                                {/* --- Simplified Layout: Flex Row --- */}
                                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                    {/* Left: Image */}
                                    <div style={{
                                        flexShrink: 0, width: '64px', height: '64px', background: '#0f172a', // Smaller Icon
                                        borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '32px', border: '2px solid #475569', position: 'relative'
                                    }}>
                                        {data.iconUrl ? <img src={data.iconUrl} alt={data.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : data.emoji}

                                        <div style={{
                                            position: 'absolute', bottom: '-6px', width: '100%', textAlign: 'center'
                                        }}>
                                            <span style={{
                                                background: '#3b82f6', color: 'white', fontSize: '10px', fontWeight: 'bold',
                                                padding: '1px 6px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.5)'
                                            }}>Lv.{level}</span>
                                        </div>
                                    </div>

                                    {/* Right: Info (Simplified) */}
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <span style={{
                                                fontSize: '0.7em', padding: '2px 6px', borderRadius: '4px',
                                                background: '#475569', color: '#cbd5e1', whiteSpace: 'nowrap'
                                            }}>{data.role}</span>
                                            <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.05em' }}>{data.name}</h3>
                                        </div>

                                        {/* EXP Bar (Mini) - Main visual indicator of progress */}
                                        <div style={{ width: '100%' }} title={`EXP: ${monster.exp} / ${requiredExp}`}>
                                            <div style={{ height: '4px', background: '#1e293b', borderRadius: '2px', overflow: 'hidden' }}>
                                                <div style={{
                                                    width: `${level >= maxLevel ? 100 : expProgress}%`, height: '100%',
                                                    background: level >= maxLevel ? '#22c55e' : '#3b82f6'
                                                }} />
                                            </div>
                                        </div>

                                        {/* Simplified Stats Row */}
                                        <div style={{ display: 'flex', gap: '10px', fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                                            <span>❤️ {stats.hp}</span>
                                            <span>⚔️ {stats.atk}</span>
                                            <span>🛡️ {stats.def}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Lock Button (Top-Right of Card) */}
                                <button onClick={(e) => handleLockToggle(monster.id, isLocked, e)} style={{
                                    position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.5)', border: 'none',
                                    borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    padding: 0, zIndex: 10
                                }}>
                                    <img
                                        src={isLocked ? '/assets/ui/locked.png' : '/assets/ui/unlocked.png'}
                                        alt={isLocked ? 'Locked' : 'Unlocked'}
                                        style={{
                                            width: '20px', height: '20px', objectFit: 'contain',
                                            filter: isLocked
                                                ? 'grayscale(100%) brightness(70%) drop-shadow(0 2px 2px rgba(0,0,0,0.5))'
                                                : 'drop-shadow(0 2px 2px rgba(0,0,0,0.5))'
                                        }}
                                    />
                                </button>

                                {decomposeMode && isSelected && (
                                    <div style={{
                                        position: 'absolute', top: '10px', right: '10px', background: '#dc2626', color: 'white',
                                        padding: '4px 8px', borderRadius: '6px', fontSize: '0.8em', fontWeight: 'bold', zIndex: 10
                                    }}>✓ 선택됨</div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Confirm Dialog */}
            {showConfirmDialog && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.8)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: '#1e293b',
                        borderRadius: '16px',
                        padding: '30px',
                        maxWidth: '500px',
                        width: '90%',
                        border: '2px solid #dc2626'
                    }}>
                        <h3 style={{ margin: '0 0 20px 0', color: '#fca5a5' }}>⚠️ 몬스터 분해 확인</h3>
                        <p style={{ color: '#cbd5e1', marginBottom: '20px' }}>
                            선택한 {selectedMonsters.size}마리의 몬스터를 분해하시겠습니까?<br />
                            <span style={{ color: '#f87171', fontSize: '0.9em' }}>이 작업은 되돌릴 수 없습니다!</span>
                        </p>

                        <div style={{
                            background: 'rgba(0,0,0,0.3)',
                            borderRadius: '8px',
                            padding: '15px',
                            marginBottom: '20px'
                        }}>
                            <div style={{ fontWeight: 'bold', marginBottom: '10px', color: '#86efac' }}>예상 보상:</div>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                {Object.entries(getExpectedRewards()).map(([materialId, amount]) => (
                                    <div key={materialId} style={{
                                        background: 'rgba(34, 197, 94, 0.1)',
                                        border: '1px solid #22c55e',
                                        padding: '5px 10px',
                                        borderRadius: '6px',
                                        fontSize: '0.9em',
                                        color: '#86efac'
                                    }}>
                                        {MATERIALS[materialId]?.name || materialId}: +{amount}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setShowConfirmDialog(false)}
                                style={{
                                    background: '#475569',
                                    border: 'none',
                                    color: 'white',
                                    padding: '10px 20px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold'
                                }}
                            >
                                취소
                            </button>
                            <button
                                onClick={handleDecompose}
                                style={{
                                    background: '#dc2626',
                                    border: 'none',
                                    color: 'white',
                                    padding: '10px 20px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold'
                                }}
                            >
                                분해하기
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Monster Detail Modal */}
            {selectedMonsterForModal && (
                <MonsterDetailModal
                    monster={selectedMonsterForModal}
                    onClose={() => setSelectedMonsterForModal(null)}
                    onToggleLock={handleLockToggleCore}
                />
            )}
        </div>
    )
}
