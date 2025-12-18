import { useGameStore } from '../../store/useGameStore'
import { useAlchemyStore } from '../../store/useAlchemyStore'
import ResourceIcon from '../ResourceIcon'

interface FacilityHeaderProps {
    onBack: () => void
}

export default function FacilityHeader({ onBack }: FacilityHeaderProps) {
    const { resources } = useGameStore()
    const { playerMaterials } = useAlchemyStore()

    const getRes = (id: string) => (resources[id] || playerMaterials[id] || 0)
    const formatRes = (val: number) => val.toLocaleString()

    return (
        <header style={{
            width: '100%',
            maxWidth: '1440px',
            margin: '0 auto',
            background: 'rgba(28, 25, 23, 0.95)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(68, 68, 68, 0.5)',
            zIndex: 50,
            padding: '24px 32px',
            boxSizing: 'border-box'
        }}>
            <div style={{
                width: '100%', // Changed from maxWidth 1440px since parent handles it
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                {/* Back & Title Area */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <button
                        onClick={onBack}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: 'transparent',
                            border: 'none',
                            color: '#9ca3af',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: 600,
                            padding: '8px 16px',
                            borderRadius: '8px',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#f0d090'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: 'currentColor' }}>
                            <path d="M20 11H7.83L13.42 5.41L12 4L4 12L12 20L13.41 18.59L7.83 13H20V11Z" fill="currentColor" />
                        </svg>
                        <span>나가기</span>
                    </button>

                    <h1 style={{
                        fontSize: '36px',
                        fontWeight: 900,
                        color: '#facc15',
                        textTransform: 'uppercase',
                        letterSpacing: '-0.02em',
                        margin: 0,
                        textShadow: '0 0 30px rgba(250, 204, 21, 0.2)',
                        fontFamily: "'Space Grotesk', sans-serif"
                    }}>
                        시설 관리
                    </h1>
                </div>

                {/* Resources Area */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <ResourcePill id="gold" val={formatRes(getRes('gold'))} label="골드" />
                </div>
            </div>
        </header>
    )
}

function ResourcePill({ id, val, label }: { id: string, val: string, label: string }) {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'rgba(58, 53, 32, 0.6)',
            padding: '8px 16px',
            borderRadius: '9999px',
            border: '1px solid rgba(234, 179, 8, 0.3)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
        }}>
            <ResourceIcon resourceId={id} size={24} />
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
                {/* Optional tiny label like Shop? Shop just shows Number and Icon. But with multiple, labels help. */}
                {/* ShopHeader only shows Gold with Icon + Number. No text label. */}
                {/* I will add a tiny text label to distinguish Wood/Stone clearly */}
                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginBottom: '2px', fontWeight: 'bold', textTransform: 'uppercase' }}>{label}</span>
                <span style={{
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '16px',
                    fontFamily: "'Space Grotesk', sans-serif",
                    letterSpacing: '0.02em'
                }}>
                    {val}
                </span>
            </div>
        </div>
    )
}
