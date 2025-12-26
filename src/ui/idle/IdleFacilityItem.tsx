import type { FacilityData } from '../../types/idle'
import { useCollectionProgress } from '../../hooks/useCollectionProgress'
import { useFacilityStore } from '../../store/useFacilityStore'
import { useGameStore } from '../../store/useGameStore'
import ResourceIcon from '../ResourceIcon'
import CollectionAnimation from '../CollectionAnimation'
import FacilityIcon from '../FacilityIcon'
import { MATERIALS } from '../../data/alchemyData'
import { useState, useEffect } from 'react'

interface Props {
    facility: FacilityData
    currentLevel: number
    isHighestLevel: boolean
    resources: Record<string, number>
    onUpgrade: (facilityId: string, cost: Record<string, number>) => Promise<void>
    isPaused?: boolean
}

const RESOURCE_NAMES: Record<string, string> = {
    gold: '골드',
    herb_common: '일반 약초',
    herb_rare: '희귀 약초',
    herb_special: '특수 약초',
    stone: '돌',
    ore_iron: '철광석',
    ore_magic: '마력석',
    gem_fragment: '보석 파편',
    training_token: '훈련 토큰',
    spirit_dust: '정령 가루',
    essence_light: '빛의 정수',
    soul_fragment: '영혼 파편',
    crack_stone_fragment: '균열석 파편',
    potion_hp_small: '소형 체력 포션',
    potion_mp_small: '소형 마나 포션'
}

// Helper to get localized resource name
const getResourceName = (key: string) => {
    if (RESOURCE_NAMES[key]) return RESOURCE_NAMES[key]
    if (MATERIALS[key]) return MATERIALS[key].name
    return key
}

// Helper to get action text
const getActionText = (facilityId: string) => {
    switch (facilityId) {
        case 'blacksmith': return '제련 중...'
        case 'mine': return '채광 중...'
        case 'herb_farm': return '채집 중...'
        default: return '생산 중...'
    }
}

export default function IdleFacilityItem({ facility, currentLevel, isHighestLevel, resources, onUpgrade, isPaused = false }: Props) {
    const { lastCollectedAt, productionModes } = useFacilityStore()
    const { recentAdditions } = useGameStore()
    const levelData = facility.levels.find(l => l.level === currentLevel)

    // Production Mode Logic: displayed cost comes from production mode
    const currentModeLevel = productionModes[facility.id] || currentLevel
    const modeLevelData = facility.levels.find(l => l.level === currentModeLevel)

    // Check if production can continue (has enough resources if cost exists)
    // Use modeLevelData for cost check
    const cost = modeLevelData?.stats.cost
    const hasEnoughResources = !cost || Object.entries(cost).every(([res, amount]) => (resources[res] || 0) >= amount)

    // Collection progress
    const intervalSeconds = levelData?.stats.intervalSeconds || 1
    // Use unique key for each level
    const progress = useCollectionProgress(
        facility.id,
        intervalSeconds,
        lastCollectedAt[`${facility.id}-${currentLevel}`],
        isPaused,
        hasEnoughResources // canLoop: 재료가 있을 때만 0%로 리셋
    )

    const isStalled = !hasEnoughResources && progress >= 100
    const facilityKey = `${facility.id}-${currentLevel}`
    const [collectedResources, setCollectedResources] = useState<string[]>([])

    // Watch for new additions from this facility
    useEffect(() => {
        const newCollections = recentAdditions
            .filter(addition => addition.facilityKey === facilityKey)
            .map(addition => addition.resourceId)

        if (newCollections.length > 0) {
            setCollectedResources(newCollections)
        }
    }, [recentAdditions, facilityKey])

    // If level 0, verify if we can construct (upgrade to level 1)
    if (currentLevel === 0) {
        const nextLevelData0 = facility.levels.find(l => l.level === 1)
        const canUpgrade0 = nextLevelData0 && Object.entries(nextLevelData0.upgradeCost).every(([res, cost]) => (resources[res] || 0) >= cost)

        const handleUpgrade0 = () => {
            if (nextLevelData0) {
                onUpgrade(facility.id, nextLevelData0.upgradeCost)
            }
        }

        return (
            <div style={{
                border: '1px solid #444',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '10px',
                background: '#222',
                color: '#aaa',
                position: 'relative'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <FacilityIcon id={facility.id} level={1} style={{ marginRight: '10px', filter: 'grayscale(1)' }} />
                        <h3 style={{ margin: 0 }}>{facility.name} (미보유)</h3>
                    </div>
                    <span style={{ fontSize: '0.85em', color: '#666' }}>-</span>
                </div>

                <div style={{ marginTop: '10px', borderTop: '1px solid #333', paddingTop: '10px' }}>
                    <p style={{ margin: '0 0 5px 0', fontSize: '0.9em', color: '#fbbf24' }}>건설 비용:</p>
                    {nextLevelData0 && (
                        <div style={{ display: 'flex', gap: '10px', fontSize: '0.85em', flexWrap: 'wrap' }}>
                            {Object.entries(nextLevelData0.upgradeCost).map(([res, costVal]) => (
                                <span key={res} style={{ color: (resources[res] || 0) >= costVal ? '#8f8' : '#f88' }}>
                                    {getResourceName(res)}: {costVal}
                                </span>
                            ))}
                        </div>
                    )}
                    <button
                        onClick={handleUpgrade0}
                        disabled={!canUpgrade0}
                        style={{
                            marginTop: '8px',
                            padding: '6px 12px',
                            background: canUpgrade0 ? '#f59e0b' : '#555',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: canUpgrade0 ? 'pointer' : 'not-allowed',
                            fontSize: '0.9em',
                            fontWeight: 'bold',
                            width: '100%'
                        }}
                    >
                        건설하기
                    </button>
                </div>
            </div>
        )
    }

    if (!levelData || !modeLevelData) return null

    const nextLevelData = facility.levels.find(l => l.level === currentLevel + 1)
    const canUpgrade = nextLevelData && Object.entries(nextLevelData.upgradeCost).every(([res, costVal]) => (resources[res] || 0) >= (costVal as number))

    const handleUpgrade = () => {
        if (nextLevelData) {
            onUpgrade(facility.id, nextLevelData.upgradeCost)
        }
    }

    return (
        <div style={{
            border: '1px solid #444',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '10px',
            background: '#222',
            color: '#eee',
            opacity: isHighestLevel ? 1 : 0.7,
            transform: isHighestLevel ? 'scale(1)' : 'scale(0.98)',
            position: 'relative'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <FacilityIcon id={facility.id} level={currentLevel} style={{ marginRight: '10px' }} />
                    <h3 style={{ margin: 0 }}>{levelData?.name || facility.name} (Lv.{currentLevel})</h3>
                </div>
                <span style={{ fontSize: '0.85em', color: '#aaa' }}>{intervalSeconds}초 / 회</span>
            </div>

            {levelData.stats.intervalSeconds && (
                <div style={{ marginTop: '8px', marginBottom: '8px' }}>
                    <div style={{
                        width: '100%',
                        height: '6px',
                        background: '#333',
                        borderRadius: '3px',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            width: `${Math.min(progress, 100)}%`,
                            height: '100%',
                            background: isPaused
                                ? '#888'
                                : isStalled
                                    ? '#ef4444'
                                    : facility.id === 'mine'
                                        ? 'linear-gradient(90deg, #fbbf24, #f59e0b)'
                                        : 'linear-gradient(90deg, #4a90e2, #63b3ed)',
                            transition: (isPaused || isStalled) ? 'none' : 'width 0.05s linear',
                            boxShadow: (!isPaused && !isStalled && progress > 90) ? '0 0 8px rgba(255,255,255,0.5)' : 'none',
                            opacity: (isPaused || isStalled) ? 0.7 : 1
                        }} />
                    </div>
                    <div style={{ fontSize: '0.75em', color: isStalled ? '#ef4444' : '#888', marginTop: '2px', textAlign: 'center', fontWeight: isStalled ? 'bold' : 'normal' }}>
                        {isPaused ? '⏸️ 일시정지' : isStalled ? '⚠️ 재료 부족 (생산 중단됨)' : `${getActionText(facility.id)} ${Math.floor(progress)}%`}
                    </div>
                </div>
            )}

            {modeLevelData.stats.dropRates && (
                <div style={{ fontSize: '0.9em', color: '#aaa', margin: '5px 0', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ color: '#4ade80' }}>생산:</span>
                    {Object.keys(modeLevelData.stats.dropRates).map(key => (
                        <ResourceIcon key={key} resourceId={key} size={18} />
                    ))}
                    {currentModeLevel < currentLevel && (
                        <span style={{ fontSize: '0.7em', color: '#fbbf24', marginLeft: 'auto' }}>
                            (Lv.{currentModeLevel} 모드)
                        </span>
                    )}
                </div>
            )}

            {modeLevelData.stats.cost && (
                <div style={{ fontSize: '0.9em', color: '#ef4444', margin: '5px 0', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span>소모:</span>
                    {Object.entries(modeLevelData.stats.cost).map(([key, amount]) => (
                        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '2px', background: 'rgba(239, 68, 68, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                            <ResourceIcon resourceId={key} size={16} />
                            <span style={{ fontSize: '0.85em' }}>-{amount}</span>
                        </div>
                    ))}
                </div>
            )}

            {levelData.stats.capacity && (
                <div style={{ fontSize: '0.9em', color: '#aaa', margin: '5px 0' }}>
                    <span>수용량: {levelData.stats.capacity}마리</span>
                </div>
            )}

            {isHighestLevel && nextLevelData ? (
                <div style={{ marginTop: '10px', borderTop: '1px solid #333', paddingTop: '10px' }}>
                    <p style={{ margin: '0 0 5px 0', fontSize: '0.9em' }}>업그레이드 비용:</p>
                    <div style={{ display: 'flex', gap: '10px', fontSize: '0.85em', flexWrap: 'wrap' }}>
                        {Object.entries(nextLevelData.upgradeCost).map(([res, costVal]) => (
                            <span key={res} style={{ color: (resources[res] || 0) >= costVal ? '#8f8' : '#f88' }}>
                                {getResourceName(res)}: {costVal}
                            </span>
                        ))}
                    </div>
                    <button
                        onClick={handleUpgrade}
                        disabled={!canUpgrade}
                        style={{
                            marginTop: '8px',
                            padding: '6px 12px',
                            background: canUpgrade ? '#4a90e2' : '#555',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: canUpgrade ? 'pointer' : 'not-allowed',
                            fontSize: '0.9em'
                        }}
                    >
                        Lv.{nextLevelData.level}로 업그레이드
                    </button>
                </div>
            ) : isHighestLevel ? (
                <div style={{ color: '#8f8', marginTop: '10px', fontSize: '0.9em' }}>최대 레벨 달성</div>
            ) : null}

            {collectedResources.map((resourceId, index) => (
                <CollectionAnimation
                    key={`${resourceId}-${index}`}
                    resourceId={resourceId}
                    onComplete={() => {
                        setCollectedResources(prev => prev.filter((_, i) => i !== index))
                    }}
                />
            ))}
        </div>
    )
}
