
import AlchemyHeader from './AlchemyHeader'
import RecipeList from './RecipeList'
import InventoryPanel from './InventoryPanel'
import CauldronPanel from './CauldronPanel'

export default function AlchemyLayout() {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            background: '#1a1a1a',
            color: '#eee',
            overflow: 'hidden'
        }}>
            {/* Header */}
            <div style={{ flexShrink: 0 }}>
                <AlchemyHeader />
            </div>

            {/* Main Content Area (3 Columns) */}
            <div style={{
                display: 'flex',
                flex: 1,
                overflow: 'hidden',
                padding: '10px',
                gap: '10px'
            }}>
                {/* Left Panel: Recipes */}
                <div style={{
                    width: '300px',
                    background: '#252525',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    border: '1px solid #333'
                }}>
                    <RecipeList />
                </div>

                {/* Center Panel: Cauldron */}
                <div style={{
                    flex: 1,
                    background: '#222',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    border: '1px solid #333',
                    position: 'relative'
                }}>
                    <CauldronPanel />
                </div>

                {/* Right Panel: Inventory */}
                <div style={{
                    width: '300px',
                    background: '#252525',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    border: '1px solid #333'
                }}>
                    <InventoryPanel />
                </div>
            </div>
        </div>
    )
}
