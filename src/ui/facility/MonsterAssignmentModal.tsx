import { useAlchemyStore } from '../../store/useAlchemyStore'
import { MONSTER_DATA } from '../../data/monsterData'

interface MonsterAssignmentModalProps {
    facilityId: string
    currentAssignments: (string | null)[]
    onClose: () => void
    onAssign: (monsterId: string | null) => void
}

const FACILITY_NAMES: Record<string, string> = {
    'herb_farm': '약초 농장',
    'mine': '광산',
    'blacksmith': '대장간',
    'alchemy_workshop': '연금술 공방',
    'dungeon_dispatch': '자동 던전 파견소',
    'training_ground': '훈련장',
    'monster_farm': '몬스터 농장',
    'spirit_sanctum': '정령의 성소',
    'lumber_mill': '벌목장',
    'magic_tower': '마법의 탑'
}

export default function MonsterAssignmentModal({ facilityId, currentAssignments, onClose, onAssign }: MonsterAssignmentModalProps) {
    const { playerMonsters } = useAlchemyStore()

    // Filter Production-related monsters
    // We now include assigned monsters to show them as "Assigned"
    // But we might want to filter out monsters assigned to OTHER facilities if we had that info.
    // For now, simple filter: just show everything available in playerMonsters.
    const availableMonsters = playerMonsters

    const sortedMonsters = [...availableMonsters].sort((a, b) => {
        const isAssignedA = currentAssignments.includes(a.id) ? 1 : 0
        const isAssignedB = currentAssignments.includes(b.id) ? 1 : 0

        // Assigned items first? Or last? User asked to "highlight" them.
        // Usually assigned ones are at the top to see current state, or filtered.
        // Let's put them at top.
        if (isAssignedA !== isAssignedB) return isAssignedB - isAssignedA

        const traitA = MONSTER_DATA[a.monster_id]?.factoryTrait
        const traitB = MONSTER_DATA[b.monster_id]?.factoryTrait
        const matchedA = traitA?.targetFacility === facilityId ? 1 : 0
        const matchedB = traitB?.targetFacility === facilityId ? 1 : 0

        if (matchedA !== matchedB) return matchedB - matchedA
        return b.level - a.level
    })

    const targetFacilityName = FACILITY_NAMES[facilityId] || '시설'

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
                            <h3 style={{ margin: 0, fontSize: '18px', color: '#fff', fontWeight: 'bold', lineHeight: 1.2 }}>동료 배치</h3>
                            <p style={{ margin: 0, fontSize: '12px', color: '#7a7a7a' }}>{targetFacilityName}의 생산을 도울 몬스터를 선택하세요</p>
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
                            color: '#b0a090',
                            fontSize: '14px'
                        }}
                    >
                        ❌ 배치 해제
                    </div>

                    {sortedMonsters.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#7a7a7a' }}>
                            배치 가능한 몬스터가 없습니다.<br />
                            <span style={{ fontSize: '12px', opacity: 0.7 }}>(이미 다른 시설에 배치되었거나 보유한 몬스터가 없습니다)</span>
                        </div>
                    )}

                    {sortedMonsters.map(pm => {
                        const data = MONSTER_DATA[pm.monster_id]
                        const trait = data?.factoryTrait
                        const isMatched = trait?.targetFacility === facilityId
                        const isAssigned = currentAssignments.includes(pm.id)

                        // Effect Text Generation
                        let effectText = '특수 효과 없음'
                        let effectColor = '#7a7a7a'

                        if (trait) {
                            const traitFacName = FACILITY_NAMES[trait.targetFacility] || trait.targetFacility

                            // Standardize Effect Name
                            // Logic borrowed from facilityUtils.ts
                            let standardizedEffect = '생산량 증가'
                            const effectLower = trait.effect

                            if (effectLower.includes('속도') || effectLower.includes('빠른') || effectLower.includes('열기') ||
                                effectLower.includes('수분') || effectLower.includes('효율') || effectLower.includes('습도')) {
                                standardizedEffect = '생산 속도 증가'
                            } else {
                                // Default to Amount for everything else ('생산량', '비료', '응축', '보조', etc.)
                                standardizedEffect = '생산량 증가'
                            }

                            if (isMatched) {
                                effectText = `✅ ${standardizedEffect} +${trait.value}%`
                                effectColor = '#4ade80' // Green for match
                            } else {
                                effectText = `⚠️ [${traitFacName}] ${standardizedEffect} +${trait.value}%`
                                effectColor = '#fbbf24' // Yellow/Orange for mismatch
                            }
                        }

                        return (
                            <div
                                key={pm.id}
                                style={{
                                    background: isAssigned
                                        ? 'rgba(247, 202, 24, 0.1)' // Golden tint for assigned
                                        : (isMatched ? 'rgba(50, 40, 20, 0.6)' : 'rgba(30, 24, 20, 0.4)'),
                                    borderRadius: '12px',
                                    padding: '12px',
                                    border: isAssigned
                                        ? '1px solid #f7ca18' // Gold border for assigned
                                        : `1px solid ${isMatched ? '#f7ca1866' : '#3d2b20'}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    transition: 'all 0.2s',
                                    cursor: isAssigned ? 'default' : 'pointer',
                                    position: 'relative'
                                }}
                                onClick={() => !isAssigned && onAssign(pm.id)}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{
                                        width: '52px', height: '52px', background: '#15120e',
                                        borderRadius: '8px',
                                        border: isAssigned ? '2px solid #f7ca18' : `1px solid ${isMatched ? '#f7ca18' : '#3a2e18'}`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '28px', overflow: 'hidden',
                                        boxShadow: (isMatched || isAssigned) ? '0 0 10px rgba(247, 202, 24, 0.2)' : 'none'
                                    }}>
                                        {data?.iconUrl ? (
                                            <img src={data.iconUrl} alt={data.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                        ) : (
                                            data?.emoji
                                        )}
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <span style={{ color: '#e0e0e0', fontWeight: 'bold', fontSize: '15px' }}>{data?.name}</span>
                                            <span style={{ fontSize: '11px', color: '#94a3b8', background: '#0f172a', padding: '1px 5px', borderRadius: '3px', border: '1px solid #1e293b' }}>
                                                Lv.{pm.level}
                                            </span>
                                            {isAssigned && (
                                                <span style={{
                                                    fontSize: '10px', fontWeight: 'bold',
                                                    color: '#1a1612', background: '#f7ca18',
                                                    padding: '2px 6px', borderRadius: '10px'
                                                }}>
                                                    배치중
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ marginTop: '6px', fontSize: '13px', color: effectColor, fontWeight: isMatched ? 'bold' : 'normal' }}>
                                            {effectText}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                                    <button
                                        disabled={isAssigned}
                                        style={{
                                            padding: '6px 14px',
                                            background: isAssigned ? '#494122' : (isMatched ? '#f7ca18' : '#3a2e18'),
                                            color: isAssigned ? '#7a7a7a' : (isMatched ? '#2a1810' : '#888'),
                                            border: 'none',
                                            borderRadius: '6px',
                                            fontSize: '12px',
                                            fontWeight: 'bold',
                                            cursor: isAssigned ? 'not-allowed' : 'pointer',
                                            transition: 'background 0.2s'
                                        }}
                                    >
                                        {isAssigned ? '배치됨' : (isMatched ? '배치' : '선택')}
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
                    <div style={{ fontSize: '12px', color: '#7a7a7a' }}>배치 가능한 몬스터 {sortedMonsters.length}마리</div>
                    <div style={{ fontSize: '12px', color: '#555' }}>
                        💡 적합한 시설에 배치하면 효율이 증가합니다
                    </div>
                </div>
            </div>
        </div>
    )
}
