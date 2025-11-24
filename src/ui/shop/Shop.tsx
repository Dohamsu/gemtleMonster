import { useGameStore } from '../../store/useGameStore'

const SELL_PRICES: Record<string, number> = {
    'herb_common': 10,
    'herb_rare': 50,
    'herb_special': 200,
    'ore_iron': 30,
    'ore_magic': 100,
    'gem_fragment': 500
}

const RESOURCE_NAMES: Record<string, string> = {
    'herb_common': '일반 허브',
    'herb_rare': '희귀 허브',
    'herb_special': '특수 허브',
    'ore_iron': '철광석',
    'ore_magic': '마력석',
    'gem_fragment': '보석 파편'
}

export default function Shop() {
    const { resources, sellResource } = useGameStore()

    const handleSell = (resourceId: string) => {
        const amount = resources[resourceId] || 0
        if (amount > 0) {
            const price = SELL_PRICES[resourceId] || 0
            sellResource(resourceId, amount, price)
        }
    }

    const sellableResources = Object.keys(SELL_PRICES).filter(id => (resources[id] || 0) > 0)

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
                상점 (자원 판매)
            </h2>

            {sellableResources.length === 0 ? (
                <p style={{ color: '#aaa', textAlign: 'center', marginTop: '20px' }}>판매할 자원이 없습니다.</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {sellableResources.map(resourceId => {
                        const count = resources[resourceId] || 0
                        const price = SELL_PRICES[resourceId]
                        const totalValue = count * price

                        return (
                            <div key={resourceId} style={{
                                background: '#333',
                                padding: '10px',
                                borderRadius: '6px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div>
                                    <div style={{ color: '#ddd', fontWeight: 'bold' }}>{RESOURCE_NAMES[resourceId]}</div>
                                    <div style={{ color: '#aaa', fontSize: '0.85em' }}>
                                        보유: {count}개 (개당 {price}G)
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleSell(resourceId)}
                                    style={{
                                        background: '#eab308',
                                        color: 'black',
                                        border: 'none',
                                        padding: '5px 10px',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontWeight: 'bold',
                                        fontSize: '0.9em'
                                    }}
                                >
                                    모두 판매 (+{totalValue}G)
                                </button>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
