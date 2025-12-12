import { useState, useEffect } from 'react'
import IdleFacilityItem from './IdleFacilityItem'
import IdleFacilityGridItem from './IdleFacilityGridItem'
import { useFacilities } from '../../hooks/useFacilities'
import { useGameStore } from '../../store/useGameStore'
import { useAuth } from '../../hooks/useAuth'
import { useUnifiedInventory } from '../../hooks/useUnifiedInventory'
import { isMobileView } from '../../utils/responsiveUtils'


export default function IdleFacilityList() {
    const { user } = useAuth();
    const { facilities, loading: facilitiesLoading } = useFacilities(user?.id);
    const { facilities: playerFacilities, upgradeFacility, canvasView } = useGameStore();
    const { materialCounts } = useUnifiedInventory();
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [allCollapsed, setAllCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(isMobileView());

    // 반응형 감지
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(isMobileView())
        }
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, []);

    // Check if production is paused (when shop is open)
    const isPaused = canvasView === 'shop';

    // Show all facilities to allow construction of unbuilt ones
    // Filter out facilities that should be hidden
    const hiddenFacilityIds = ['alchemy_lab', 'training_ground', 'dungeon_dispatch'];
    const visibleFacilities = facilities.filter(f => !hiddenFacilityIds.includes(f.id));

    if (facilitiesLoading) {
        return (
            <div style={{
                width: '300px',
                background: 'rgba(0,0,0,0.8)',
                padding: '15px',
                borderRadius: '10px',
                pointerEvents: 'auto',
                color: 'white'
            }}>
                Loading...
            </div>
        )
    }

    return (
        <div style={{
            flex: 1,
            overflowY: 'auto',
            background: '#2a2a2a',
            padding: isMobile ? '10px' : '15px',
            borderRadius: '8px',
            boxShadow: 'inset 0 0 10px rgba(0,0,0,0.3)',
            position: 'relative', // For overlay positioning if needed
            opacity: isPaused ? 0.6 : 1, // Dim the entire list
            transition: 'opacity 0.3s ease',
            pointerEvents: isPaused ? 'none' : 'auto' // Disable interaction
        }}>
            {/* Paused Indicator Overlay (Optional, but good for clarity) */}
            {isPaused && (
                <div style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                    background: 'rgba(251, 191, 36, 0.2)',
                    color: '#fbbf24',
                    padding: isMobile ? '6px' : '8px',
                    borderRadius: '4px',
                    marginBottom: isMobile ? '8px' : '10px',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    fontSize: isMobile ? '0.8em' : '0.9em',
                    backdropFilter: 'blur(2px)',
                    border: '1px solid rgba(251, 191, 36, 0.4)'
                }}>
                    ⏸️ 상점 이용 중에는 생산이 일시 중지됩니다
                </div>
            )}
            {/* Header with View Toggle */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: isMobile ? '12px' : '15px',
                borderBottom: '1px solid #444',
                paddingBottom: isMobile ? '8px' : '10px'
            }}>
                <h2 style={{
                    color: 'white',
                    margin: 0,
                    fontSize: isMobile ? '1em' : '1.1em'
                }}>
                    시설 목록
                </h2>

                {/* View Mode Toggle */}
                <div style={{
                    display: 'flex',
                    gap: '4px',
                    background: '#1a1a1a',
                    borderRadius: '6px',
                    padding: '4px'
                }}>
                    <button
                        onClick={() => setViewMode('list')}
                        style={{
                            width: isMobile ? '40px' : '32px',
                            height: isMobile ? '40px' : '32px',
                            background: viewMode === 'list' ? '#444' : 'transparent',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            color: viewMode === 'list' ? '#facc15' : '#888',
                            fontSize: isMobile ? '18px' : '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s'
                        }}
                        title="리스트 뷰"
                    >
                        ☰
                    </button>
                    <button
                        onClick={() => setViewMode('grid')}
                        style={{
                            width: isMobile ? '40px' : '32px',
                            height: isMobile ? '40px' : '32px',
                            background: viewMode === 'grid' ? '#444' : 'transparent',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            color: viewMode === 'grid' ? '#facc15' : '#888',
                            fontSize: isMobile ? '18px' : '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s'
                        }}
                        title="썸네일 뷰"
                    >
                        ⊞
                    </button>
                </div>
            </div>

            {/* Collapse All Button (only for list view) */}
            {viewMode === 'list' && (
                <button
                    onClick={() => setAllCollapsed(!allCollapsed)}
                    style={{
                        marginBottom: isMobile ? '8px' : '10px',
                        padding: isMobile ? '10px 16px' : '6px 12px',
                        minHeight: isMobile ? '40px' : 'auto',
                        background: '#555',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: isMobile ? '13px' : '12px'
                    }}
                >
                    {allCollapsed ? '전체 펼치기' : '전체 접기'}
                </button>
            )}

            {viewMode === 'list' ? (
                visibleFacilities.length === 0 ? (
                    <p style={{ color: '#aaa', textAlign: 'center', marginTop: '20px' }}>시설이 없습니다.</p>
                ) : (
                    visibleFacilities.map(facility => {
                        const currentLevel = playerFacilities[facility.id] || 0;
                        const levelsToShow = currentLevel === 0
                            ? [0]
                            : Array.from({ length: currentLevel }, (_, i) => i + 1).reverse();

                        return (
                            <details key={facility.id} open={!allCollapsed} style={{ marginBottom: '20px', background: '#2a2a2a', padding: '10px', borderRadius: '6px' }}>
                                <summary style={{ color: 'white', cursor: 'pointer', fontSize: '1.1em' }}>
                                    {facility.name} {currentLevel === 0 && <span style={{ fontSize: '0.8em', color: '#fbbf24', marginLeft: '8px' }}>(미보유)</span>}
                                </summary>
                                <div style={{ marginTop: '10px' }}>
                                    {levelsToShow.map(level => {
                                        // Find specific level data to get the custom name
                                        const levelData = facility.levels.find(l => l.level === level);
                                        const displayName = levelData?.name ? `${levelData.name} (Lv.${level})` : `Level ${level}`;

                                        return (
                                            <details key={`${facility.id}-${level}`} open={true} style={{ marginBottom: '8px', background: '#3a3a3a', padding: '6px', borderRadius: '4px' }}>
                                                <summary style={{ color: '#ddd', cursor: 'pointer' }}>{level === 0 ? '건설 필요' : displayName}</summary>
                                                <IdleFacilityItem
                                                    facility={facility}
                                                    currentLevel={level}
                                                    isHighestLevel={level === currentLevel}
                                                    resources={materialCounts}
                                                    onUpgrade={async (fid, cost) => upgradeFacility(fid, cost)}
                                                    isPaused={isPaused}
                                                />
                                            </details>
                                        );
                                    })}
                                </div>
                            </details>
                        );
                    })
                )
            ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                    {visibleFacilities.map(facility => {
                        const currentLevel = playerFacilities[facility.id] || 0;
                        const levelsToShow = Array.from({ length: currentLevel }, (_, i) => i + 1).reverse();

                        return levelsToShow.map(level => (
                            <IdleFacilityGridItem
                                key={`${facility.id}-${level}`}
                                facility={facility}
                                level={level}
                                onClick={() => {
                                    setViewMode('list');
                                }}
                                isPaused={isPaused}
                            />
                        ));
                    })}
                </div>
            )}
        </div>
    )
}
