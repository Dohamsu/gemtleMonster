
import { MATERIALS } from '../../../data/alchemyData'
import { formatNumber, getRarityColor, getRarityLabel } from '../utils'
import type { ShopItem } from '../types'
import { useAcceleratingValue } from '../hooks/useLongPress'

interface ShopSellTabProps {
    sellItems: ShopItem[]
    sellQuantities: Record<string, number>
    selectedItems: Set<string>
    isBulkSelling: boolean
    isMobile: boolean
    totalSelectedValue: number
    onToggleSelection: (id: string) => void
    onToggleSelectAll: () => void
    onBulkSell: () => void
    onSingleSell: (id: string, qty: number) => void
    onQuantityChange: (id: string, qty: number, max: number, mode: 'sell') => void
}

// Sub-component for quantity controls to handle hooks individually per item
const QuantityControl = ({
    itemId,
    qty,
    max,
    onChange,
    isMobile
}: {
    itemId: string
    qty: number
    max: number
    onChange: (id: string, qty: number, max: number, mode: 'sell') => void
    isMobile?: boolean
}) => {

    const changeBy = (amount: number) => {
        onChange(itemId, Math.min(Math.max(qty + amount, 1), max), max, 'sell')
    }

    // Hooks must be in a component!
    const inc = useAcceleratingValue((step) => changeBy(step))
    const dec = useAcceleratingValue((step) => changeBy(-step))

    // Render
    return (
        <div className="qty-input-container" style={{
            width: isMobile ? '70%' : 'fit-content',
            minWidth: isMobile ? '160px' : 'auto',
            margin: isMobile ? 0 : '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2px'
        }}>
            <button className="qty-btn small" onClick={() => changeBy(-10)} style={{ fontSize: '10px', padding: '0 4px', width: '24px' }}>-10</button>
            <button
                className="qty-btn"
                onMouseDown={dec.start}
                onMouseUp={dec.stop}
                onMouseLeave={dec.stop}
                onTouchStart={dec.start}
                onTouchEnd={dec.stop}
            >−</button>
            <input
                type="number"
                className="qty-input"
                value={qty}
                onChange={(e) => onChange(itemId, parseInt(e.target.value) || 1, max, 'sell')}
                min={1}
                max={max}
                style={{
                    width: isMobile ? '40px' : '48px', // Desktop fixed width
                    textAlign: 'center'
                }}
            />
            <button
                className="qty-btn"
                onMouseDown={inc.start}
                onMouseUp={inc.stop}
                onMouseLeave={inc.stop}
                onTouchStart={inc.start}
                onTouchEnd={inc.stop}
            >+</button>
            <button className="qty-btn small" onClick={() => changeBy(10)} style={{ fontSize: '10px', padding: '0 4px', width: '24px' }}>+10</button>
        </div>
    )
}

export function ShopSellTab({
    sellItems,
    sellQuantities,
    selectedItems,
    isBulkSelling,
    isMobile,
    totalSelectedValue,
    onToggleSelection,
    onToggleSelectAll,
    onBulkSell,
    onSingleSell,
    onQuantityChange
}: ShopSellTabProps) {
    // console.log('ShopSellTab rendered', { onSingleSell: !!onSingleSell })

    if (isMobile) {
        // ======= 모바일: 카드 레이아웃 =======
        return (
            <div style={{ paddingBottom: '80px' }}> {/* Bottom padding for sticky bar */}

                {/* Sell Items Grid (Mobile) */}
                {sellItems.length === 0 ? (
                    <p style={{ color: '#9ca3af', textAlign: 'center', marginTop: '40px' }}>판매할 자원이 없습니다.</p>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', width: '100%' }}>
                        {sellItems.map(item => {
                            const sellQuantity = sellQuantities[item.id] || 1
                            const totalValue = sellQuantity * item.price
                            const isSelected = selectedItems.has(item.id)
                            const material = MATERIALS[item.id]
                            const rarityColor = item.rarity ? getRarityColor(item.rarity) : '#6b7280'

                            return (
                                <div
                                    key={item.id}
                                    className="item-card"
                                    style={{
                                        borderColor: isSelected ? '#e7b308' : '#444444',
                                        background: isSelected ? 'rgba(58, 53, 32, 0.8)' : 'rgba(42, 42, 42, 0.8)',
                                        cursor: 'pointer',
                                        padding: '12px'
                                    }}
                                    onClick={() => onToggleSelection(item.id)}
                                >
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => onToggleSelection(item.id)}
                                            onClick={(e) => e.stopPropagation()}
                                            style={{ width: '18px', height: '18px', cursor: 'pointer', alignSelf: 'center' }}
                                        />
                                        <div style={{ width: '56px', height: '56px', flexShrink: 0, background: 'rgba(0,0,0,0.4)', borderRadius: '8px', border: `2px solid ${rarityColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {material ? (
                                                <img src={material.iconUrl} alt={item.name} className="pixelated" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                                            ) : (
                                                <span style={{ fontSize: '24px' }}>📦</span>
                                            )}
                                        </div>
                                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                            <h3 style={{ color: 'white', fontWeight: 700, fontSize: '14px', margin: 0 }}>{item.name}</h3>
                                            <span style={{ fontSize: '10px', color: rarityColor, textTransform: 'uppercase', fontWeight: 700 }}>{item.rarity ? getRarityLabel(item.rarity) : '재료'}</span>
                                            <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
                                                보유: <span style={{ color: 'white' }}>{item.count}</span> • 단가: <span style={{ color: '#facc15' }}>{item.price}G</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px', height: '36px', alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
                                        <QuantityControl
                                            itemId={item.id}
                                            qty={sellQuantity}
                                            max={item.count}
                                            onChange={onQuantityChange}
                                            isMobile={true}
                                        />
                                        {/* Click to sell button */}
                                        <div
                                            onClick={() => {
                                                if (onSingleSell) {
                                                    onSingleSell(item.id, sellQuantity)
                                                } else {
                                                    console.error('onSingleSell is not defined')
                                                }
                                            }}
                                            style={{
                                                flex: 1,
                                                background: '#3f6212', // Green background for sell action
                                                borderRadius: '8px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontWeight: 700,
                                                color: '#e7b308', // Gold text
                                                border: '1px solid #4d7c0f',
                                                fontSize: '14px',
                                                height: '100%',
                                                cursor: 'pointer',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                                            }}
                                        >
                                            판매 {formatNumber(totalValue)}G
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* Sticky Bulk Action Bar (Bottom) */}
                <div className="sell-action-bar-sticky" style={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: '#1a1a1a',
                    borderTop: '1px solid #333',
                    padding: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    zIndex: 100,
                    boxShadow: '0 -4px 12px rgba(0,0,0,0.5)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={onToggleSelectAll}>
                        <div style={{
                            width: '20px', height: '20px', borderRadius: '4px', border: '2px solid #555',
                            background: sellItems.length > 0 && selectedItems.size === sellItems.length ? '#eab308' : 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            {sellItems.length > 0 && selectedItems.size === sellItems.length && <span style={{ color: 'black', fontSize: '14px' }}>✓</span>}
                        </div>
                        <span style={{ color: '#e5e7eb', fontWeight: 700, fontSize: '14px' }}>
                            {selectedItems.size}개 선택
                        </span>
                    </div>

                    <button
                        className="sell-btn"
                        onClick={onBulkSell}
                        disabled={selectedItems.size === 0 || isBulkSelling}
                        style={{
                            padding: '12px 24px',
                            fontSize: '16px',
                            background: selectedItems.size === 0 ? '#333' : '#ca8a04',
                            color: selectedItems.size === 0 ? '#666' : 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 'bold'
                        }}
                    >
                        {isBulkSelling ? '...' : `총 ${formatNumber(totalSelectedValue)}G 판매`}
                    </button>
                </div>
            </div>
        )
    }

    // ======= 데스크톱: 테이블 레이아웃 =======
    return (
        <>
            {/* Action Panel */}
            <div style={{ width: '100%', background: 'rgba(42, 42, 42, 0.5)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ background: 'rgba(234, 179, 8, 0.2)', padding: '8px', borderRadius: '8px', color: '#eab308' }}>
                        <span style={{ fontSize: '24px' }}>🛒</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ color: 'white', fontWeight: 700, fontSize: '1.1rem' }}>{selectedItems.size} Items Selected</span>
                        <span style={{ color: '#9ca3af', fontSize: '14px' }}>Total Estimate: <span style={{ color: '#facc15', fontWeight: 600 }}>{formatNumber(totalSelectedValue)} G</span></span>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#9ca3af' }}>
                        <input
                            type="checkbox"
                            checked={sellItems.length > 0 && selectedItems.size === sellItems.length}
                            onChange={onToggleSelectAll}
                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: '14px' }}>Select All</span>
                    </label>
                    <button
                        onClick={onBulkSell}
                        disabled={selectedItems.size === 0 || isBulkSelling}
                        style={{
                            background: selectedItems.size === 0 ? '#444444' : '#eab308',
                            color: selectedItems.size === 0 ? '#9ca3af' : '#1a1a1a',
                            fontWeight: 700,
                            padding: '10px 24px',
                            borderRadius: '8px',
                            border: 'none',
                            cursor: selectedItems.size === 0 ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            boxShadow: selectedItems.size > 0 ? '0 0 15px rgba(234,179,8,0.3)' : 'none',
                            transition: 'all 0.2s'
                        }}
                    >
                        <span>{isBulkSelling ? 'Processing...' : 'Sell Selected Items'}</span>
                        <span>→</span>
                    </button>
                </div>
            </div>

            {/* Inventory Table */}
            {sellItems.length === 0 ? (
                <p style={{ color: '#9ca3af', textAlign: 'center', marginTop: '40px' }}>No items to sell.</p>
            ) : (
                <div style={{ width: '100%', background: '#2a2a2a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', position: 'relative' }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(255,255,255,0.05), transparent)', pointerEvents: 'none' }} />
                    <div style={{ overflowX: 'auto', position: 'relative', zIndex: 10 }}>
                        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: 'rgba(0,0,0,0.4)', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                                    <th style={{ padding: '16px', width: '48px', textAlign: 'center' }}></th>
                                    <th style={{ padding: '16px', width: '64px' }}></th>
                                    <th style={{ padding: '16px', minWidth: '200px' }}>Item Info</th>
                                    <th style={{ padding: '16px', textAlign: 'center' }}>Owned</th>
                                    <th style={{ padding: '16px', textAlign: 'center', minWidth: '140px' }}>Sell Qty</th>
                                    <th style={{ padding: '16px', textAlign: 'right' }}>Unit Price</th>
                                    <th style={{ padding: '16px', textAlign: 'right' }}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sellItems.map(item => {
                                    const sellQuantity = sellQuantities[item.id] || 1
                                    const totalValue = sellQuantity * item.price
                                    const isSelected = selectedItems.has(item.id)
                                    const material = MATERIALS[item.id]
                                    const rarityColor = item.rarity ? getRarityColor(item.rarity) : '#6b7280'

                                    return (
                                        <tr
                                            key={item.id}
                                            style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', background: isSelected ? 'rgba(58, 53, 32, 0.5)' : 'transparent', transition: 'background 0.2s', cursor: 'pointer' }}
                                            onClick={() => onToggleSelection(item.id)}
                                            onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = '#333333' }}
                                            onMouseLeave={(e) => { e.currentTarget.style.background = isSelected ? 'rgba(58, 53, 32, 0.5)' : 'transparent' }}
                                        >
                                            <td style={{ padding: '16px', textAlign: 'center' }}>
                                                <input type="checkbox" checked={isSelected} onChange={() => onToggleSelection(item.id)} onClick={(e) => e.stopPropagation()} style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <div style={{ width: '48px', height: '48px', background: 'rgba(0,0,0,0.5)', borderRadius: '8px', border: `1px solid ${rarityColor}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                                    {material ? <img src={material.iconUrl} alt={item.name} className="pixelated" style={{ width: '32px', height: '32px', objectFit: 'contain' }} /> : <span style={{ fontSize: '20px' }}>📦</span>}
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span style={{ color: 'white', fontWeight: 700, fontSize: '1rem' }}>{item.name}</span>
                                                    <span style={{ fontSize: '11px', color: rarityColor, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                        {item.type === 'material' ? 'Material' : 'Resource'} • {item.rarity ? getRarityLabel(item.rarity) : '일반'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px', textAlign: 'center', color: '#cbd5e1', fontWeight: 500 }}>{item.count}</td>
                                            <td style={{ padding: '16px' }} onClick={(e) => e.stopPropagation()}>
                                                <QuantityControl
                                                    itemId={item.id}
                                                    qty={sellQuantity}
                                                    max={item.count}
                                                    onChange={onQuantityChange}
                                                    isMobile={false}
                                                />
                                            </td>
                                            <td style={{ padding: '16px', textAlign: 'right', color: '#facc15', fontWeight: 500 }}>{item.price} G</td>
                                            <td style={{ padding: '16px', textAlign: 'right', color: isSelected ? '#eab308' : '#64748b', fontWeight: 700, fontSize: '1.1rem' }}>{formatNumber(totalValue)} G</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </>
    )
}
