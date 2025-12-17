
import { MATERIALS } from '../../../data/alchemyData'
import { formatNumber, getRarityColor, getRarityLabel } from '../utils'
import type { ShopItem } from '../types'
import { useAcceleratingValue } from '../hooks/useLongPress'

interface ShopBuyTabProps {
    buyItems: ShopItem[]
    buyQuantities: Record<string, number>
    inventoryCounts: Record<string, number>
    gold: number
    isBuying: boolean
    isMobile: boolean
    onQuantityChange: (id: string, qty: number, max: number, mode: 'buy') => void
    onBuy: (item: ShopItem) => void
}

// Sub-component to handle individual item logic and hooks
function ShopBuyItemCard({
    item,
    buyQty,
    inventoryCount,
    gold,
    isBuying,
    isMobile,
    onQuantityChange,
    onBuy
}: {
    item: ShopItem
    buyQty: number
    inventoryCount: number
    gold: number
    isBuying: boolean
    isMobile: boolean
    onQuantityChange: (id: string, qty: number, max: number, mode: 'buy') => void
    onBuy: (item: ShopItem) => void
}) {
    const isUnlimitedStock = item.count === -1
    const maxQty = isUnlimitedStock ? 999 : item.count

    // We need separate hooks for Increment and Decrement
    // Hooks must be called unconditionally at the top level
    const inc = useAcceleratingValue((step) => {
        onQuantityChange(item.id, Math.min(buyQty + step, maxQty), maxQty, 'buy')
    })

    const dec = useAcceleratingValue((step) => {
        onQuantityChange(item.id, Math.max(buyQty - step, 1), maxQty, 'buy')
    })

    const material = MATERIALS[item.id]
    if (!material) return null

    const totalPrice = item.price * buyQty
    const canAfford = gold >= totalPrice

    const isOutOfStock = !isUnlimitedStock && item.count <= 0
    const rarityColor = getRarityColor(material.rarity)

    return (
        <div
            className="item-card"
            style={{
                padding: isMobile ? '12px' : '16px',
                borderColor: isOutOfStock ? '#444444' : rarityColor + '50'
            }}
            onMouseEnter={(e) => {
                if (!isOutOfStock) {
                    e.currentTarget.style.borderColor = rarityColor
                    e.currentTarget.style.boxShadow = `0 0 20px ${rarityColor}25`
                }
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = isOutOfStock ? '#444444' : rarityColor + '50'
                e.currentTarget.style.boxShadow = 'none'
            }}
        >
            {/* Sold Out Overlay */}
            {isOutOfStock && (
                <div className="sold-out-overlay">
                    <span className="sold-out-badge">{isMobile ? '매진' : 'Sold Out'}</span>
                </div>
            )}

            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', opacity: isOutOfStock ? 0.5 : 1, filter: isOutOfStock ? 'grayscale(1)' : 'none' }}>
                {/* Icon */}
                <div className="item-icon-box" style={{
                    width: isMobile ? '64px' : '80px',
                    height: isMobile ? '64px' : '80px',
                    borderWidth: '2px', borderStyle: 'solid', borderColor: rarityColor, boxShadow: `0 0 10px ${rarityColor}33`
                }}>
                    <div style={{ position: 'absolute', inset: 0, background: `${rarityColor}15` }} />
                    <img
                        src={material.iconUrl}
                        alt={material.name}
                        className="pixelated"
                        style={{ width: isMobile ? '42px' : '56px', height: isMobile ? '42px' : '56px', objectFit: 'contain', zIndex: 10 }}
                    />
                </div>

                {/* Info */}
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '4px 0', flex: 1 }}>
                    <div>
                        <h3 style={{ color: 'white', fontWeight: 700, fontSize: isMobile ? '1rem' : '1.1rem', lineHeight: 1.2, margin: '0 0 4px 0' }}>{material.name}</h3>
                        <span style={{ fontSize: '12px', color: rarityColor, textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>{getRarityLabel(material.rarity)}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                        <div style={{ fontSize: '12px', color: '#9ca3af', background: 'rgba(0,0,0,0.3)', padding: '4px 8px', borderRadius: '4px' }}>
                            {isMobile ? '보유' : 'Owned'}: <span style={{ color: 'white', fontFamily: 'monospace' }}>{inventoryCount || 0}</span>
                        </div>
                        {!isUnlimitedStock && (
                            <div style={{ fontSize: '12px', color: isOutOfStock ? '#f87171' : '#9ca3af', background: isOutOfStock ? 'rgba(127, 29, 29, 0.2)' : 'rgba(0,0,0,0.3)', padding: '4px 8px', borderRadius: '4px', border: isOutOfStock ? '1px solid rgba(127, 29, 29, 0.5)' : 'none' }}>
                                {isMobile ? '재고' : 'Stock'}: <span style={{ color: isOutOfStock ? '#f87171' : 'white', fontFamily: 'monospace' }}>{item.count}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Price Row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', padding: '0 4px', opacity: isOutOfStock ? 0.5 : 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#facc15' }}>
                    <span style={{ fontSize: '18px' }}>●</span>
                    <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{formatNumber(item.price)}</span>
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Per unit</div>
            </div>

            {/* Quantity & Buy Controls */}
            <div style={{ display: 'flex', flexDirection: isMobile ? 'row' : 'column', gap: isMobile ? '8px' : '12px', height: isMobile ? '36px' : 'auto' }}>
                {/* Quantity Input */}
                <div className="qty-input-container" style={{
                    opacity: isOutOfStock ? 0.5 : 1,
                    pointerEvents: isOutOfStock ? 'none' : 'auto',
                    width: 'auto', // Auto width to fit content
                    minWidth: 'fit-content' // Ensure buttons don't wrap/shrink
                }}>
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
                        style={{ width: isMobile ? '32px' : '48px', fontSize: isMobile ? '13px' : '14px' }} // Smaller input on mobile
                        value={buyQty}
                        onChange={(e) => onQuantityChange(item.id, parseInt(e.target.value) || 1, isUnlimitedStock ? 999 : item.count, 'buy')}
                        min={1}
                        max={isUnlimitedStock ? undefined : item.count}
                    />
                    <button
                        className="qty-btn"
                        onMouseDown={inc.start}
                        onMouseUp={inc.stop}
                        onMouseLeave={inc.stop}
                        onTouchStart={inc.start}
                        onTouchEnd={inc.stop}
                    >+</button>
                </div>

                {/* Buy Button */}
                {isOutOfStock ? (
                    <button className="purchase-btn" disabled style={isMobile ? { flex: 1, padding: '0', fontSize: '13px' } : {}}>
                        <span>{isMobile ? '구매 불가' : 'Out of Stock'}</span>
                    </button>
                ) : !canAfford ? (
                    <button className="no-gold-btn" disabled style={isMobile ? { flex: 1, padding: '0', fontSize: '13px' } : {}}>
                        <span>{isMobile ? '골드 부족' : 'Not Enough Gold'}</span>
                    </button>
                ) : (
                    <button
                        className="purchase-btn"
                        onClick={() => onBuy(item)}
                        disabled={isBuying}
                        style={isMobile ? { flex: 1, padding: '0', fontSize: '13px' } : {}}
                    >
                        <span>{isBuying ? (isMobile ? '...' : 'Processing...') : (isMobile ? '구매' : 'Purchase')}</span>
                    </button>
                )}
            </div>
        </div>
    )
}

export function ShopBuyTab({ buyItems, buyQuantities, inventoryCounts, gold, isBuying, isMobile, onQuantityChange, onBuy }: ShopBuyTabProps) {
    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: isMobile ? '12px' : '20px',
            width: '100%'
        }}>
            {buyItems.map(item => (
                <ShopBuyItemCard
                    key={item.id}
                    item={item}
                    buyQty={buyQuantities[item.id] || 1}
                    inventoryCount={inventoryCounts[item.id] || 0}
                    gold={gold}
                    isBuying={isBuying}
                    isMobile={isMobile}
                    onQuantityChange={onQuantityChange}
                    onBuy={onBuy}
                />
            ))}
        </div>
    )
}
