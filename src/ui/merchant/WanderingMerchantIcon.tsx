import { useMerchantStore } from '../../store/useMerchantStore'

export default function WanderingMerchantIcon() {
    const { isVisible, openModal } = useMerchantStore()

    if (!isVisible) return null

    return (
        <div
            onClick={openModal}
            className="merchant-icon"
            style={{
                position: 'absolute',
                top: '20%',
                right: '15%',
                zIndex: 50,
                cursor: 'pointer',
                filter: 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.7))',
                transition: 'transform 0.2s',
                animation: 'fadeIn 0.5s ease-out'
            }}
        >
            <div style={{
                fontSize: '3rem',
                animation: 'bounce 2s infinite'
            }}>
                🎒
            </div>
            <div style={{
                background: 'rgba(0,0,0,0.7)',
                color: '#fff',
                padding: '2px 8px',
                borderRadius: '10px',
                fontSize: '0.8rem',
                textAlign: 'center',
                marginTop: '-5px'
            }}>
                방랑 상인
            </div>
            <style>{`
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                @keyframes fadeIn {
                    from { transform: scale(0); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .merchant-icon:hover {
                    transform: scale(1.1);
                }
                .merchant-icon:active {
                    transform: scale(0.9);
                }
            `}</style>
        </div>
    )
}
