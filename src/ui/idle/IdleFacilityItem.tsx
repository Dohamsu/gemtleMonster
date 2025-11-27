import type { FacilityData } from '../../types/idle'
import { useCollectionProgress } from '../../hooks/useCollectionProgress'
import { useGameStore } from '../../store/useGameStore'
import ResourceIcon from '../ResourceIcon'
import CollectionAnimation from '../CollectionAnimation'
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
    training_token: '훈련 토큰'
}

import FacilityIcon from '../FacilityIcon'

export default function IdleFacilityItem({ facility, currentLevel, isHighestLevel, resources, onUpgrade, isPaused = false }: Props) {
    const { lastCollectedAt, recentAdditions } = useGameStore()
    const levelData = facility.levels.find(l => l.level === currentLevel)
    const nextLevelData = facility.levels.find(l => l.level === currentLevel + 1)
    const [collectedResources, setCollectedResources] = useState<string[]>([])

    // Collection progress
    const intervalSeconds = (levelData?.stats as any)?.intervalSeconds || 1
    // Use unique key for each level
    const progress = useCollectionProgress(
        facility.id,
        intervalSeconds,
        lastCollectedAt[`${facility.id}-${currentLevel}`],
        isPaused
    )

    const facilityKey = `${facility.id}-${currentLevel}`

    // Watch for new additions from this facility
    useEffect(() => {
        const newCollections = recentAdditions
            .filter(addition => addition.facilityKey === facilityKey)
            .map(addition => addition.resourceId)

        if (newCollections.length > 0) {
            // Show the first resource (or you could show all)
            setCollectedResources(newCollections)
        }
    }, [recentAdditions, facilityKey])

    if (!levelData) return null

    const canUpgrade = nextLevelData && Object.entries(nextLevelData.upgradeCost).every(([res, cost]) => (resources[res] || 0) >= cost)

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
                    <h3 style={{ margin: 0 }}>{facility.name} (Lv.{currentLevel})</h3>
                </div>
                <span style={{ fontSize: '0.85em', color: '#aaa' }}>{intervalSeconds}초 / 회</span>
            </div>

            {/* Collection Progress Bar */}
            <div style={{ marginTop: '8px', marginBottom: '8px' }}>
                <div style={{
                    width: '100%',
                    height: '6px',
                    background: '#333',
                    borderRadius: '3px',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        width: `${progress}%`,
                        height: '100%',
                        background: isPaused
                            ? '#888' // 일시정지 시 회색
                            : facility.id === 'mine'
                                ? 'linear-gradient(90deg, #fbbf24, #f59e0b)'
                                : 'linear-gradient(90deg, #4a90e2, #63b3ed)',
                        transition: isPaused ? 'none' : 'width 0.05s linear', // 일시정지 시 애니메이션 제거
                        boxShadow: !isPaused && progress > 90 ? '0 0 8px rgba(255,255,255,0.5)' : 'none',
                        opacity: isPaused ? 0.5 : 1 // 일시정지 시 투명도 낮춤
                    }} />
                </div>
                <div style={{ fontSize: '0.75em', color: '#888', marginTop: '2px', textAlign: 'center' }}>
                    {isPaused ? '⏸️ 일시정지' : `채집 중... ${Math.floor(progress)}%`}
                </div>
            </div>

            <div style={{ fontSize: '0.9em', color: '#aaa', margin: '5px 0', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span>생산:</span>
                {Object.keys(levelData.stats.dropRates).map(key => (
                    <ResourceIcon key={key} resourceId={key} size={18} />
                ))}
            </div>

            {isHighestLevel && nextLevelData ? (
                <div style={{ marginTop: '10px', borderTop: '1px solid #333', paddingTop: '10px' }}>
                    <p style={{ margin: '0 0 5px 0', fontSize: '0.9em' }}>업그레이드 비용:</p>
                    <div style={{ display: 'flex', gap: '10px', fontSize: '0.85em', flexWrap: 'wrap' }}>
                        {Object.entries(nextLevelData.upgradeCost).map(([res, cost]) => (
                            <span key={res} style={{ color: (resources[res] || 0) >= cost ? '#8f8' : '#f88' }}>
                                {RESOURCE_NAMES[res] || res}: {cost}
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

            {/* Collection Animations */}
            {collectedResources.map((resourceId, index) => (
                <CollectionAnimation
                    key={`${resourceId}-${index}`}
                    resourceId={resourceId}
                    onComplete={() => {
                        setCollectedResources(prev => prev.filter((_, i) => i !== index))
                    }}
                // Optional: Pass custom text/icon for 'empty' if CollectionAnimation supports it
                // If not, we might need to modify CollectionAnimation or handle it here
                />
            ))}
        </div>
    )
}
