import { useRef } from 'react'
import { MATERIALS } from '../../../data/alchemyData'
import { formatNumber, getRarityColor, getRarityLabel } from '../utils'
import type { ShopItem } from '../types'
import { useacceleratingValue } from '../hooks/useLongPress'

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

export function ShopBuyTab({ buyItems, buyQuantities, inventoryCounts, gold, isBuying, isMobile, onQuantityChange, onBuy }: ShopBuyTabProps) {
    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: isMobile ? '12px' : '20px',
            width: '100%'
        }}>
            {buyItems.map(item => {
                const material = MATERIALS[item.id]
                const buyQty = buyQuantities[item.id] || 1
                if (!material) return null

                const totalPrice = item.price * buyQty
                const canAfford = gold >= totalPrice

                const isUnlimitedStock = item.count === -1
                const isOutOfStock = !isUnlimitedStock && item.count <= 0
                const rarityColor = getRarityColor(material.rarity)

                // Acceleration Hook
                const maxQty = isUnlimitedStock ? 999 : item.count
                const handleUpdate = (amount: number) => {
                    // Re-read current quantity from prop if possible, but hook callback is closured.
                    // We need to pass the *current latest* value or updater.
                    // But onQuantityChange takes absolute value.
                    // React state updates might be async.
                    // Better to pass the *calculation* logic to the parent? 
                    // No, parent exposes `onQuantityChange(id, qty)`.
                    // We can use a ref for the current quantity to ensure we add to latest.
                    // But `buyQty` changes on every render.
                    // Let's rely on the closure? buyQty updates on re-render.
                    // The accelerating hook triggers effects.
                    // If we close over `buyQty`, we need to make sure the callback updates when buyQty changes?
                    // No, `useacceleratingValue` uses a ref for the callback!
                    // So we can define the callback inline and it will always see the fresh `buyQty`.

                    const newQty = Math.max(1, Math.min(buyQty + amount, maxQty))
                    onQuantityChange(item.id, newQty, maxQty, 'buy')
                }

                // We need separate hooks for Increment and Decrement
                const inc = useacceleratingValue((step) => {
                    onQuantityChange(item.id, Math.min(buyQty + step, maxQty), maxQty, 'buy')
                })

                const dec = useacceleratingValue((step) => {
                    onQuantityChange(item.id, Math.max(buyQty - step, 1), maxQty, 'buy')
                })

                // Wait, if `buyQty` is stale inside the callback ref...
                // `useacceleratingValue` updates `updateFnRef.current` on every render.
                // So when the interval ticks, it calls the `updateFn` which closes over the *current* render's `buyQty`.
                // However, if the interval ticks *faster* than the re-render (unlikely with 80ms), we might skip steps.
                // But for UI interactions, it's generally fine.
                // Critical: `buyQty` must be fresh.
                // `useacceleratingValue` dependence on `updateFn` changing ensures freshness.

                return (
                    <div
                        key={item.id}
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
                                        {isMobile ? '보유' : 'Owned'}: <span style={{ color: 'white', fontFamily: 'monospace' }}>{inventoryCounts[item.id] || 0}</span>
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
            })}
        </div>
    )
}
