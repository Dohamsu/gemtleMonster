

interface ShopTimerProps {
    hours: string
    minutes: string
    seconds: string
    isMobile: boolean
}

export function ShopTimer({ hours, minutes, seconds, isMobile }: ShopTimerProps) {
    if (isMobile) {
        return (
            <>
                {/* Timer Section - Mobile: compact inline */}
                <div style={{ width: '100%', background: '#1c1917', border: '1px solid rgba(234, 179, 8, 0.2)', borderRadius: '12px', padding: '12px', marginBottom: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <p style={{ color: '#9ca3af', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>상점 갱신까지</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '1.5rem', fontWeight: 700, color: '#facc15', fontFamily: "'Space Grotesk', sans-serif" }}>
                        <span>{hours}</span>
                        <span style={{ color: '#6b7280', fontSize: '0.875rem', fontWeight: 400, padding: '0 4px' }}>:</span>
                        <span>{minutes}</span>
                        <span style={{ color: '#6b7280', fontSize: '0.875rem', fontWeight: 400, padding: '0 4px' }}>:</span>
                        <span style={{ color: '#e7b308', animation: 'pulse 2s infinite' }}>{seconds}</span>
                    </div>
                </div>

                {/* Filter Chips - Mobile: horizontal scroll */}
                <div style={{ display: 'flex', gap: '8px', overflow: 'auto', paddingBottom: '8px', marginBottom: '16px', width: 'calc(100% + 32px)', marginLeft: '-16px', paddingLeft: '16px', paddingRight: '16px' }}>
                    <button className="filter-chip active" style={{ padding: '6px 12px', borderRadius: '9999px', fontSize: '12px' }}>전체</button>
                    <button className="filter-chip" style={{ padding: '6px 12px', borderRadius: '9999px', fontSize: '12px' }}>소비용품</button>
                    <button className="filter-chip" style={{ padding: '6px 12px', borderRadius: '9999px', fontSize: '12px' }}>장비</button>
                    <button className="filter-chip" style={{ padding: '6px 12px', borderRadius: '9999px', fontSize: '12px' }}>재료</button>
                </div>
            </>
        )
    }

    return (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'row', gap: '24px', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px', borderBottom: '1px solid rgba(68, 68, 68, 0.5)', paddingBottom: '32px', flexWrap: 'wrap' }}>
            {/* Refresh Timer */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <p style={{ color: '#9ca3af', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: '4px', margin: 0 }}>Shop Refreshes In</p>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div className="timer-box">
                        <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white' }}>{hours}</span>
                        <span style={{ fontSize: '10px', color: '#6b7280', textTransform: 'uppercase' }}>Hrs</span>
                    </div>
                    <div style={{ color: '#4b5563' }}>:</div>
                    <div className="timer-box">
                        <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white' }}>{minutes}</span>
                        <span style={{ fontSize: '10px', color: '#6b7280', textTransform: 'uppercase' }}>Min</span>
                    </div>
                    <div style={{ color: '#4b5563' }}>:</div>
                    <div className="timer-box">
                        <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#e7b308', animation: 'pulse 2s infinite' }}>{seconds}</span>
                        <span style={{ fontSize: '10px', color: '#6b7280', textTransform: 'uppercase' }}>Sec</span>
                    </div>
                </div>
            </div>

            {/* Filter Chips (placeholder) */}
            <div style={{ display: 'flex', gap: '8px', overflow: 'auto', paddingBottom: '0' }}>
                <button className="filter-chip active">All Items</button>
                <button className="filter-chip">Consumables</button>
                <button className="filter-chip">Equipment</button>
                <button className="filter-chip">Materials</button>
            </div>
        </div>
    )
}
