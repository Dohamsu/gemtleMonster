import { useGameStore } from '../../store/useGameStore'
import { useAlchemyStore } from '../../store/useAlchemyStore'
import { useUnifiedInventory } from '../../hooks/useUnifiedInventory'

interface ConsumableConfigPanelProps {
    isOpen: boolean
    onClose: () => void
}

export default function ConsumableConfigPanel({ isOpen, onClose }: ConsumableConfigPanelProps) {
    const { consumableSlots, updateConsumableSlot } = useGameStore()
    const { allMaterials } = useAlchemyStore()
    const { materialCounts } = useUnifiedInventory()

    if (!isOpen) return null

    // 소모품만 필터링 (InventoryPanel과 동일한 방식)
    // allMaterials는 DB에서 로드된 데이터로 family 필드 사용
    const consumables = allMaterials.filter((m: { family?: string; type?: string }) =>
        m.family === 'CONSUMABLE' || m.type === 'CONSUMABLE'
    )

    const hpSlot = consumableSlots.find(s => s.id === 'hp')
    const statusSlot = consumableSlots.find(s => s.id === 'status')

    const statusTypes = ['BURN', 'POISON', 'STUN']

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3000
        }}>
            <div style={{
                width: '90%',
                maxWidth: '500px',
                background: '#1e293b',
                borderRadius: '16px',
                border: '2px solid #475569',
                overflow: 'hidden'
            }}>
                {/* Header */}
                <div style={{
                    padding: '16px',
                    background: '#0f172a',
                    borderBottom: '1px solid #334155',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h2 style={{ margin: 0, color: '#a3e635', fontSize: '18px' }}>
                        ⚙️ 소모품 자동 사용 설정
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#94a3b8',
                            fontSize: '24px',
                            cursor: 'pointer'
                        }}
                    >
                        ×
                    </button>
                </div>

                {/* Content */}
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    {/* HP 조건 설정 */}
                    <div style={{
                        background: '#334155',
                        borderRadius: '12px',
                        padding: '16px'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '12px'
                        }}>
                            <h3 style={{ margin: 0, color: '#4ade80', fontSize: '14px' }}>
                                ❤️ HP 조건
                            </h3>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={hpSlot?.enabled || false}
                                    onChange={(e) => updateConsumableSlot('hp', { enabled: e.target.checked })}
                                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                />
                                <span style={{ color: '#cbd5e1', fontSize: '12px' }}>활성화</span>
                            </label>
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                            <label style={{ color: '#94a3b8', fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                                HP가 {hpSlot?.threshold || 30}% 이하일 때:
                            </label>
                            <input
                                type="range"
                                min="10"
                                max="90"
                                step="10"
                                value={hpSlot?.threshold || 30}
                                onChange={(e) => updateConsumableSlot('hp', { threshold: parseInt(e.target.value) })}
                                style={{ width: '100%' }}
                            />
                        </div>

                        <select
                            value={hpSlot?.consumableId || ''}
                            onChange={(e) => updateConsumableSlot('hp', { consumableId: e.target.value || null })}
                            style={{
                                width: '100%',
                                padding: '10px',
                                background: '#1e293b',
                                color: '#e2e8f0',
                                border: '1px solid #475569',
                                borderRadius: '8px',
                                fontSize: '13px'
                            }}
                        >
                            <option value="">소모품 선택...</option>
                            {consumables.map(c => {
                                const count = materialCounts[c.id] || 0
                                return (
                                    <option key={c.id} value={c.id} disabled={count === 0}>
                                        {c.name} (보유: {count}개)
                                    </option>
                                )
                            })}
                        </select>
                    </div>

                    {/* 상태이상 조건 설정 */}
                    <div style={{
                        background: '#334155',
                        borderRadius: '12px',
                        padding: '16px'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '12px'
                        }}>
                            <h3 style={{ margin: 0, color: '#a855f7', fontSize: '14px' }}>
                                💫 상태이상 조건
                            </h3>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={statusSlot?.enabled || false}
                                    onChange={(e) => updateConsumableSlot('status', { enabled: e.target.checked })}
                                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                />
                                <span style={{ color: '#cbd5e1', fontSize: '12px' }}>활성화</span>
                            </label>
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                            <label style={{ color: '#94a3b8', fontSize: '12px', display: 'block', marginBottom: '8px' }}>
                                아래 상태이상에 걸리면:
                            </label>
                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                {statusTypes.map(type => {
                                    const isSelected = statusSlot?.statusTypes?.includes(type) || false
                                    const emoji = type === 'BURN' ? '🔥' : type === 'POISON' ? '☠️' : '💫'
                                    const label = type === 'BURN' ? '화상' : type === 'POISON' ? '독' : '기절'
                                    return (
                                        <label key={type} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            cursor: 'pointer',
                                            padding: '6px 10px',
                                            background: isSelected ? '#475569' : '#1e293b',
                                            borderRadius: '6px',
                                            border: isSelected ? '1px solid #a855f7' : '1px solid #334155'
                                        }}>
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => {
                                                    const currentTypes = statusSlot?.statusTypes || []
                                                    const newTypes = isSelected
                                                        ? currentTypes.filter(t => t !== type)
                                                        : [...currentTypes, type]
                                                    updateConsumableSlot('status', { statusTypes: newTypes })
                                                }}
                                                style={{ display: 'none' }}
                                            />
                                            <span>{emoji} {label}</span>
                                        </label>
                                    )
                                })}
                            </div>
                        </div>

                        <select
                            value={statusSlot?.consumableId || ''}
                            onChange={(e) => updateConsumableSlot('status', { consumableId: e.target.value || null })}
                            style={{
                                width: '100%',
                                padding: '10px',
                                background: '#1e293b',
                                color: '#e2e8f0',
                                border: '1px solid #475569',
                                borderRadius: '8px',
                                fontSize: '13px'
                            }}
                        >
                            <option value="">소모품 선택...</option>
                            {consumables.map(c => {
                                const count = materialCounts[c.id] || 0
                                return (
                                    <option key={c.id} value={c.id} disabled={count === 0}>
                                        {c.name} (보유: {count}개)
                                    </option>
                                )
                            })}
                        </select>
                    </div>

                    {/* 안내 */}
                    <div style={{
                        background: '#0f172a',
                        borderRadius: '8px',
                        padding: '12px',
                        fontSize: '11px',
                        color: '#64748b',
                        lineHeight: '1.5'
                    }}>
                        💡 <strong style={{ color: '#94a3b8' }}>팁:</strong> 전투 중 조건이 충족되면 턴 시작 시 자동으로 소모품을 사용합니다.
                        한 턴에 한 종류의 소모품만 사용됩니다.
                    </div>
                </div>

                {/* Footer */}
                <div style={{
                    padding: '16px',
                    borderTop: '1px solid #334155',
                    display: 'flex',
                    justifyContent: 'flex-end'
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '10px 24px',
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        확인
                    </button>
                </div>
            </div>
        </div>
    )
}
