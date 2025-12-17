

interface ShopHeaderProps {
    gold: number
    activeTab: 'buy' | 'sell'
    isMobile: boolean
    onTabChange: (tab: 'buy' | 'sell') => void
    onClose: () => void
}

export function ShopHeader({ gold, activeTab, isMobile, onTabChange, onClose }: ShopHeaderProps) {
    return (
        <header style={{ width: '100%', maxWidth: '1440px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px', position: 'sticky', top: 0, background: 'rgba(28, 25, 23, 0.95)', backdropFilter: 'blur(10px)', zIndex: 50, padding: isMobile ? '16px' : '32px 24px', borderBottom: '1px solid rgba(68, 68, 68, 0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {/* Back Button */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                        onClick={onClose}
                        className="back-btn"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '16px', fontWeight: 600, padding: isMobile ? '8px' : '8px 16px', borderRadius: '8px', transition: 'all 0.2s' }}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: 'currentColor' }}>
                            <path d="M20 11H7.83L13.42 5.41L12 4L4 12L12 20L13.41 18.59L7.83 13H20V11Z" fill="currentColor" />
                        </svg>
                        {!isMobile && <span>나가기</span>}
                    </button>
                </div>

                {/* Title */}
                <h1 style={{ fontSize: isMobile ? '24px' : '42px', fontWeight: 900, color: '#facc15', textTransform: 'uppercase', letterSpacing: '-0.02em', margin: 0, textShadow: '0 0 30px rgba(250, 204, 21, 0.2)', fontFamily: "'Space Grotesk', sans-serif" }}>
                    {isMobile ? '상점' : 'Imperial Outpost'}
                </h1>

                {/* Gold Display */}
                <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '12px', background: 'rgba(58, 53, 32, 0.6)', padding: isMobile ? '6px 12px' : '10px 20px', borderRadius: '9999px', border: '1px solid rgba(234, 179, 8, 0.3)', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                    <img src="/assets/ui/gold_coin.png" alt="Gold" style={{ width: isMobile ? '20px' : '24px', height: isMobile ? '20px' : '24px', objectFit: 'contain' }} />
                    <span style={{ color: 'white', fontWeight: 700, fontSize: isMobile ? '16px' : '20px', fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '0.02em' }}>{gold.toLocaleString()}</span>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                <div style={{ display: 'flex', background: '#1c1917', padding: '4px', borderRadius: '12px', border: '1px solid #444444', position: 'relative' }}>
                    <div style={{
                        position: 'absolute',
                        top: '4px', left: '4px', bottom: '4px',
                        width: 'calc(50% - 4px)',
                        background: '#eab308',
                        borderRadius: '8px',
                        transform: activeTab === 'buy' ? 'translateX(0)' : 'translateX(100%)',
                        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: '0 4px 12px rgba(234, 179, 8, 0.3)'
                    }} />

                    <button
                        onClick={() => onTabChange('buy')}
                        style={{ position: 'relative', width: '140px', padding: isMobile ? '8px 0' : '10px 0', border: 'none', background: 'transparent', color: activeTab === 'buy' ? '#1c1917' : '#9ca3af', fontWeight: 800, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer', transition: 'color 0.2s', zIndex: 10 }}
                    >
                        {isMobile ? '구매' : 'Buy Items'}
                    </button>
                    <button
                        onClick={() => onTabChange('sell')}
                        style={{ position: 'relative', width: '140px', padding: isMobile ? '8px 0' : '10px 0', border: 'none', background: 'transparent', color: activeTab === 'sell' ? '#1c1917' : '#9ca3af', fontWeight: 800, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer', transition: 'color 0.2s', zIndex: 10 }}
                    >
                        {isMobile ? '판매' : 'Sell Loot'}
                    </button>
                </div>
            </div>
        </header>
    )
}
