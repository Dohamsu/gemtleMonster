import type { PlayerEquipment, EquipmentSlot as SlotType } from '../../types/equipment'
import { useEquipmentStore } from '../../store/useEquipmentStore'

interface EquipmentSlotProps {
    slot: SlotType
    equippedItem?: PlayerEquipment
    onClick: () => void
}

const SLOT_ICONS: Record<SlotType, string> = {
    WEAPON: '⚔️',
    ARMOR: '🛡️',
    ACCESSORY: '💍'
}

const SLOT_NAMES: Record<SlotType, string> = {
    WEAPON: '무기',
    ARMOR: '방어구',
    ACCESSORY: '장신구'
}

export default function EquipmentSlot({ slot, equippedItem, onClick }: EquipmentSlotProps) {
    const { allEquipment } = useEquipmentStore()

    const equipmentData = equippedItem
        ? allEquipment.find(e => e.id === equippedItem.equipmentId)
        : null

    return (
        <div
            onClick={onClick}
            style={{
                width: '64px',
                height: '64px',
                background: '#231f10',
                border: `1px solid ${equipmentData ? '#f7ca18' : '#494122'}`,
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.2s'
            }}
        >
            {equipmentData ? (
                <>
                    <img
                        src={equipmentData.iconUrl}
                        alt={equipmentData.name}
                        style={{ width: '80%', height: '80%', objectFit: 'contain' }}
                    />
                    <div style={{
                        position: 'absolute', bottom: '2px', right: '2px',
                        fontSize: '10px', fontWeight: 'bold',
                        color: getRarityColor(equipmentData.rarity)
                    }}>
                        {equipmentData.rarity}
                    </div>
                </>
            ) : (
                <div style={{ opacity: 0.3, fontSize: '24px' }}>
                    {SLOT_ICONS[slot]}
                </div>
            )}

            <div style={{
                position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)',
                background: '#1a1612', padding: '0 4px', fontSize: '10px', color: '#a0a0a0',
                whiteSpace: 'nowrap'
            }}>
                {SLOT_NAMES[slot]}
            </div>
        </div>
    )
}

function getRarityColor(rarity: string) {
    switch (rarity) {
        case 'N': return '#b0bec5'
        case 'R': return '#42a5f5'
        case 'SR': return '#ab47bc'
        case 'SSR': return '#ffca28'
        default: return '#fff'
    }
}
