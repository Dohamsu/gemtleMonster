import { useEquipmentStore } from '../../store/useEquipmentStore'
import type { EquipmentSlot as SlotType, PlayerEquipment } from '../../types/equipment'

interface EquipmentSelectionModalProps {
    slot: SlotType
    monsterId: string
    currentEquippedItem?: PlayerEquipment
    onClose: () => void
}

export default function EquipmentSelectionModal({ slot, monsterId, currentEquippedItem, onClose }: EquipmentSelectionModalProps) {
    const { playerEquipment, allEquipment, equipItem, unequipItem } = useEquipmentStore()

    // Filter items for this slot that are NOT equipped by other monsters
    // Or maybe allow stealing? For now, just show available items.
    const availableItems = playerEquipment.filter(pe => {
        const masterData = allEquipment.find(e => e.id === pe.equipmentId)
        if (!masterData || masterData.slot !== slot) return false

        // Include currently equipped item for this monster (to show "Equipped")
        if (pe.id === currentEquippedItem?.id) return true

        // Exclude items equipped by OTHERS
        if (pe.isEquipped && pe.equippedMonsterId !== monsterId) return false

        return true
    })

    const handleEquip = async (item: PlayerEquipment) => {
        if (item.id === currentEquippedItem?.id) return // Already equipped
        await equipItem(item.id, monsterId)
        onClose()
    }

    const handleUnequip = async () => {
        if (currentEquippedItem) {
            await unequipItem(currentEquippedItem.id)
            onClose()
        }
    }

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 200,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)'
        }} onClick={onClose}>
            <div style={{
                width: '90%', maxWidth: '360px', maxHeight: '70vh',
                background: '#1a1612', border: '1px solid #494122', borderRadius: '12px',
                display: 'flex', flexDirection: 'column', overflow: 'hidden'
            }} onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div style={{ padding: '16px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, color: '#f7ca18' }}>장비 선택 ({slot})</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer' }}>✕</button>
                </div>

                {/* List */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
                    {availableItems.length === 0 && (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                            <div>장착 가능한 아이템이 없습니다.</div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    const store = useEquipmentStore.getState() as any
                                    if (store.debugAddEquipment) {
                                        store.debugAddEquipment()
                                    }
                                }}
                                style={{
                                    marginTop: '12px', padding: '8px 12px',
                                    background: '#333', border: '1px solid #555', borderRadius: '4px',
                                    color: '#ccc', cursor: 'pointer', fontSize: '12px'
                                }}
                            >
                                🧪 테스트 장비 받기 (Debug)
                            </button>
                        </div>
                    )}

                    {availableItems.map(item => {
                        const data = allEquipment.find(e => e.id === item.equipmentId)!
                        const isEquipped = item.id === currentEquippedItem?.id

                        return (
                            <div key={item.id}
                                onClick={() => handleEquip(item)}
                                style={{
                                    display: 'flex', gap: '12px', alignItems: 'center',
                                    background: isEquipped ? 'rgba(247, 202, 24, 0.1)' : '#231f10',
                                    border: `1px solid ${isEquipped ? '#f7ca18' : '#333'}`,
                                    borderRadius: '8px', padding: '12px', marginBottom: '8px',
                                    cursor: 'pointer'
                                }}
                            >
                                <img src={data.iconUrl} alt={data.name} style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ color: '#e0e0e0', fontWeight: 'bold', fontSize: '14px' }}>
                                        {data.name}
                                        {isEquipped && <span style={{ marginLeft: '6px', fontSize: '11px', color: '#f7ca18' }}>[장착중]</span>}
                                    </div>
                                    <div style={{ color: '#888', fontSize: '12px' }}>
                                        {Object.entries(data.stats).map(([k, v]) => `${k} +${v}`).join(', ')}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Footer (Unequip) */}
                {currentEquippedItem && (
                    <div style={{ padding: '16px', borderTop: '1px solid #333' }}>
                        <button
                            onClick={handleUnequip}
                            style={{
                                width: '100%', padding: '12px', borderRadius: '8px',
                                background: '#2a1810', border: '1px solid #e57373', color: '#e57373',
                                cursor: 'pointer'
                            }}
                        >
                            장비 해제
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
