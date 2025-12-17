
import type { ModalConfig } from '../types'

interface ShopModalProps {
    config: ModalConfig
    onClose: () => void
}

export function ShopModal({ config, onClose }: ShopModalProps) {
    if (!config.isOpen) return null

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-content"
                style={{
                    border: `1px solid ${config.type === 'success' ? '#eab308' : '#ef4444'}`,
                    boxShadow: `0 25px 50px -12px rgba(0,0,0,0.5), 0 0 30px ${config.type === 'success' ? 'rgba(234, 179, 8, 0.1)' : 'rgba(239, 68, 68, 0.1)'}`
                }}
                onClick={e => e.stopPropagation()}
            >
                <div style={{
                    width: '60px', height: '60px',
                    borderRadius: '50%',
                    background: config.type === 'success' ? 'rgba(234, 179, 8, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '16px',
                    margin: '0 auto 16px',
                    border: `1px solid ${config.type === 'success' ? 'rgba(234, 179, 8, 0.5)' : 'rgba(239, 68, 68, 0.5)'}`
                }}>
                    {config.type === 'success' ? (
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="#eab308" />
                        </svg>
                    ) : (
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="#ef4444" />
                        </svg>
                    )}
                </div>
                <h3 style={{ color: 'white', marginTop: 0, marginBottom: '8px', fontSize: '1.25rem', fontFamily: "'Space Grotesk', sans-serif" }}>{config.title}</h3>
                <p style={{ color: '#9ca3af', marginBottom: '24px', lineHeight: 1.5, fontSize: '14px' }}>{config.message}</p>
                <button
                    onClick={onClose}
                    style={{
                        padding: '12px 24px',
                        background: config.type === 'success' ? '#eab308' : 'rgba(239, 68, 68, 0.1)',
                        color: config.type === 'success' ? '#1a1a1a' : '#ef4444',
                        border: config.type === 'success' ? 'none' : '1px solid #ef4444',
                        borderRadius: '8px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontSize: '14px',
                        width: '100%',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        transition: 'all 0.2s',
                        fontFamily: "'Space Grotesk', sans-serif"
                    }}
                    onMouseEnter={e => {
                        if (config.type === 'success') {
                            e.currentTarget.style.background = '#ca8a04'
                        } else {
                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'
                        }
                    }}
                    onMouseLeave={e => {
                        if (config.type === 'success') {
                            e.currentTarget.style.background = '#eab308'
                        } else {
                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'
                        }
                    }}
                >
                    확인
                </button>
            </div>
        </div>
    )
}
