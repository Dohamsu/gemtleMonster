import React from 'react'
import IdleFacilityItem from './IdleFacilityItem'
import IdleFacilityGridItem from './IdleFacilityGridItem'
import { useFacilities } from '../../hooks/useFacilities'
import { useGameStore } from '../../store/useGameStore'
import { useAuth } from '../../hooks/useAuth'


export default function IdleFacilityList() {
    const { user } = useAuth();
    const { facilities, loading: facilitiesLoading } = useFacilities(user?.id);
    const { facilities: playerFacilities, resources, upgradeFacility } = useGameStore();
    const [viewMode, setViewMode] = React.useState<'list' | 'grid'>('list');
    const [allCollapsed, setAllCollapsed] = React.useState(false);

    // Filter facilities that player owns
    const visibleFacilities = facilities.filter(f => playerFacilities[f.id] && playerFacilities[f.id] > 0)

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
            padding: '15px',
            borderRadius: '8px',
            boxShadow: 'inset 0 0 10px rgba(0,0,0,0.3)'
        }}>
            <h2 style={{ color: 'white', marginTop: 0, fontSize: '1.1em', borderBottom: '1px solid #444', paddingBottom: '10px' }}>
                시설 목록
            </h2>
            <button
                onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                style={{
                    marginBottom: '10px',
                    padding: '6px 12px',
                    background: '#444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}
            >
                {viewMode === 'list' ? '그리드 보기' : '리스트 보기'}
            </button>
            <button
                onClick={() => setAllCollapsed(!allCollapsed)}
                style={{
                    marginBottom: '10px',
                    marginLeft: '8px',
                    padding: '6px 12px',
                    background: '#555',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}
            >
                {allCollapsed ? '전체 펼치기' : '전체 접기'}
            </button>
            {viewMode === 'list' ? (
                visibleFacilities.length === 0 ? (
                    <p style={{ color: '#aaa', textAlign: 'center', marginTop: '20px' }}>시설이 없습니다.</p>
                ) : (
                    visibleFacilities.map(facility => {
                        const currentLevel = playerFacilities[facility.id];
                        const levelsToShow = Array.from({ length: currentLevel }, (_, i) => i + 1).reverse();

                        return (
                            <details key={facility.id} open={!allCollapsed} style={{ marginBottom: '20px', background: '#2a2a2a', padding: '10px', borderRadius: '6px' }}>
                                <summary style={{ color: 'white', cursor: 'pointer', fontSize: '1.1em' }}>{facility.name}</summary>
                                <div style={{ marginTop: '10px' }}>
                                    {levelsToShow.map(level => (
                                        <details key={`${facility.id}-${level}`} open={!allCollapsed} style={{ marginBottom: '8px', background: '#3a3a3a', padding: '6px', borderRadius: '4px' }}>
                                            <summary style={{ color: '#ddd', cursor: 'pointer' }}>Level {level}</summary>
                                            <IdleFacilityItem
                                                facility={facility}
                                                currentLevel={level}
                                                isHighestLevel={level === currentLevel}
                                                resources={resources}
                                                onUpgrade={async (fid, cost) => upgradeFacility(fid, cost)}
                                            />
                                        </details>
                                    ))}
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
                                    // Optional: Scroll to item or expand specific details
                                }}
                            />
                        ));
                    })}
                </div>
            )}
        </div>
    )
}
