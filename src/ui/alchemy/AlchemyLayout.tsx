import { useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useAlchemyStore } from '../../store/useAlchemyStore'
import { RecipePanel } from '../RecipePanel'
import { InventoryPanel } from '../InventoryPanel'
import CauldronPanel from './CauldronPanel'

export default function AlchemyLayout() {
    const { user } = useAuth()
    const { loadAllData, addTestMaterials } = useAlchemyStore()

    useEffect(() => {
        if (user) {
            loadAllData(user.id)
        }
    }, [user])

    const handleAddTestMaterials = async () => {
        if (user) {
            await addTestMaterials(user.id)
        }
    }

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
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h1 style={{
                        margin: 0,
                        fontSize: '28px',
                        color: '#f0e68c',
                        textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                    }}>
                        🧪 몬스터 연금술 공방
                    </h1>
                    <button
                        onClick={handleAddTestMaterials}
                        style={{
                            padding: '8px 16px',
                            background: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: 'bold'
                        }}
                    >
                        테스트 재료 추가
                    </button>
                </div>
            </div>

            {/* Main Content Area (3 Columns) */}
            <div style={{
                display: 'flex',
                flex: 1,
                overflow: 'hidden'
            }}>
                {/* Left Panel: Recipes */}
                <RecipePanel />

                {/* Center Panel: Cauldron */}
                <div style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    position: 'relative'
                }}>
                    <CauldronPanel />
                </div>

                {/* Right Panel: Inventory */}
                <InventoryPanel />
            </div>
        </div>
    )
}
