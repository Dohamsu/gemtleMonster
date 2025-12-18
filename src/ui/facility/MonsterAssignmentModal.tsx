import { useAlchemyStore } from '../../store/useAlchemyStore'
import { MONSTER_DATA } from '../../data/monsterData'

interface MonsterAssignmentModalProps {
    facilityId: string
    onClose: () => void
    onAssign: (monsterId: string | null) => void
}

export default function MonsterAssignmentModal({ facilityId, onClose, onAssign }: MonsterAssignmentModalProps) {
    const { playerMonsters } = useAlchemyStore()

    // Filter Production-related monsters (optional, showing all for now but sorting)
    const sortedMonsters = [...playerMonsters].sort((a, b) => {
        const traitA = MONSTER_DATA[a.monster_id]?.factoryTrait
        const traitB = MONSTER_DATA[b.monster_id]?.factoryTrait
        const matchedA = traitA?.targetFacility === facilityId ? 1 : 0
        const matchedB = traitB?.targetFacility === facilityId ? 1 : 0
        return matchedB - matchedA // Matched traits first
    })

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 3000
        }}>
            <div style={{
                width: '100%',
                maxWidth: '500px',
                maxHeight: '85vh',
                background: '#1a1612',
                border: '1px solid #494122',
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 0 50px rgba(0,0,0,0.8)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Modal Header */}
                <div style={{
                    padding: '20px',
                    borderBottom: '1px solid #494122',
                    background: '#231f10',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexShrink: 0
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span className="material-symbols-outlined" style={{ color: '#f7ca18', fontSize: '24px' }}>person_add</span>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '18px', color: '#fff', fontWeight: 'bold', lineHeight: 1.2 }}>Assign Specialist</h3>
                            <p style={{ margin: 0, fontSize: '12px', color: '#7a7a7a' }}>Select a worker to boost production</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            width: '32px', height: '32px', borderRadius: '50%', background: 'none', border: 'none',
                            color: '#7a7a7a', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer'
                        }}
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div style={{ overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                    {/* Unassign option */}
                    <div
                        onClick={() => onAssign(null)}
                        style={{
                            padding: '12px',
                            background: '#1a0f0a',
                            border: '1px dashed #5a4030',
                            borderRadius: '8px',
                            textAlign: 'center',
                            cursor: 'pointer',
                            color: '#b0a090'
                        }}
                    >
                        ❌ 배치 해제
                    </div>

                    {sortedMonsters.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#7a7a7a' }}>배치 가능한 몬스터가 없습니다</div>
                    )}
                    {sortedMonsters.map(pm => {
                        const data = MONSTER_DATA[pm.monster_id]
                        const isMatched = data?.factoryTrait?.targetFacility === facilityId

                        return (
                            <div
                                key={pm.id}
                                style={{
                                    background: 'rgba(42, 24, 16, 0.4)',
                                    borderRadius: '12px',
                                    padding: '12px',
                                    border: `1px solid ${isMatched ? '#f7ca1866' : '#3d2b20'}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    transition: 'all 0.2s',
                                    cursor: 'pointer'
                                }}
                                onClick={() => onAssign(pm.id)}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{
                                        width: '48px', height: '48px', background: '#15120e',
                                        borderRadius: '8px', border: '1px solid #3a2e18',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '24px'
                                    }}>
                                        {data?.emoji}
                                    </div>
                                    <div>
                                        <div style={{ color: '#e0e0e0', fontWeight: 'bold', fontSize: '14px' }}>{data?.name}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                            <span style={{ fontSize: '10px', color: '#7a7a7a', background: '#15120e', border: '1px solid #3a2e18', padding: '2px 6px', borderRadius: '4px' }}>
                                                Lvl {pm.level}
                                            </span>
                                            {isMatched && <span style={{ fontSize: '10px', color: '#f0d090' }}>Specialist</span>}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                                    {data?.factoryTrait && (
                                        <div style={{
                                            fontSize: '10px', fontWeight: 'bold', color: isMatched ? '#4ade80' : '#888',
                                            background: isMatched ? 'rgba(74, 222, 128, 0.1)' : 'transparent',
                                            padding: '2px 6px', borderRadius: '4px', border: isMatched ? '1px solid rgba(74, 222, 128, 0.2)' : 'none'
                                        }}>
                                            +{data.factoryTrait.value}% Spd
                                        </div>
                                    )}
                                    <button style={{
                                        padding: '6px 16px', background: '#f7ca18', color: '#2a1810', border: 'none',
                                        borderRadius: '6px', fontSize: '12px', fontWeight: 'bold'
                                    }}>
                                        Assign
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Modal Footer */}
                <div style={{
                    padding: '16px', borderTop: '1px solid #494122', background: '#231f10',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                    <div style={{ fontSize: '12px', color: '#7a7a7a' }}>Showing {sortedMonsters.length} specialists</div>
                </div>
            </div>
        </div>
    )
}
