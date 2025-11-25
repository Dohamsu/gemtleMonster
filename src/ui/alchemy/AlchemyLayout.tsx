import { useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useAlchemyStore } from '../../store/useAlchemyStore'
import { InventoryPanel } from '../InventoryPanel'

export default function AlchemyLayout() {
    const { user } = useAuth()
    const { loadAllData } = useAlchemyStore()

    useEffect(() => {
        if (user) {
            loadAllData(user.id)
        }
    }, [user])

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: '#eee',
            overflow: 'hidden'
        }}>
            {/* Header */}
            <div style={{
                padding: '16px',
                borderBottom: '2px solid #4a5568',
                background: 'linear-gradient(90deg, #1a1a2e 0%, #16213e 100%)'
            }}>
                <h1 style={{
                    margin: 0,
                    fontSize: '24px',
                    color: '#f0e68c',
                    textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                    textAlign: 'center'
                }}>
                    인벤토리
                </h1>
            </div>

            {/* Main Content: Inventory with Monsters and Factory tabs only */}
            <div style={{
                flex: 1,
                display: 'flex',
                overflow: 'hidden'
            }}>
                <InventoryPanel />
            </div>
        </div>
    )
}
