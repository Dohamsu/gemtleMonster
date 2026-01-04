import { useMerchantStore } from '../../store/useMerchantStore'
import { useAlchemyStore } from '../../store/useAlchemyStore'
import { useEffect, useState } from 'react'

export default function WanderingMerchantModal() {
    const { isModalOpen, inventory, expiryTime, buyItem, closeModal } = useMerchantStore()
    const { playerMaterials } = useAlchemyStore()
    const [timeLeft, setTimeLeft] = useState('')

    useEffect(() => {
        if (!expiryTime) return
        const timer = setInterval(() => {
            const diff = expiryTime - Date.now()
            if (diff <= 0) {
                setTimeLeft('00:00')
                closeModal()
            } else {
                const minutes = Math.floor(diff / 60000)
                const seconds = Math.floor((diff % 60000) / 1000)
                setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`)
            }
        }, 1000)
        return () => clearInterval(timer)
    }, [expiryTime, closeModal])

    const handleBuy = async (item: any) => {
        const success = await buyItem(item)
        if (success) {
            // Optional: Show toast
            // alert('구매 성공!') 
        } else {
            alert('골드가 부족합니다!')
        }
    }

    if (!isModalOpen) return null

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontFamily: "'Inter', sans-serif"
        }} onClick={closeModal}>
            <div
                style={{
                    background: 'linear-gradient(135deg, #2a1a3a 0%, #1a0a2a 100%)',
                    border: '2px solid #ffd700',
                    borderRadius: '15px',
                    padding: '20px',
                    width: '90%',
                    maxWidth: '500px',
                    color: '#fff',
                    boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)',
                    position: 'relative',
                    animation: 'popIn 0.3s ease-out'
                }}
                onClick={e => e.stopPropagation()}
            >
                <button
                    onClick={closeModal}
                    style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: 'none',
                        border: 'none',
                        color: '#fff',
                        fontSize: '1.5rem',
                        cursor: 'pointer'
                    }}
                >
                    ×
                </button>

                <h2 style={{ textAlign: 'center', color: '#ffd700', marginBottom: '5px' }}>방랑 상인</h2>
                <div style={{ textAlign: 'center', fontSize: '0.9rem', color: '#a0a0ff', marginBottom: '20px' }}>
                    떠나기까지: {timeLeft}
                </div>

                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {inventory.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
                            물건이 다 팔렸네! 다음에 또 보세나.
                        </div>
                    ) : (
                        inventory.map((item, idx) => (
                            <div key={idx} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                background: 'rgba(0,0,0,0.3)',
                                padding: '10px',
                                marginBottom: '10px',
                                borderRadius: '8px',
                                border: '1px solid #444'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ fontSize: '1.5rem' }}>🎁</div>
                                    <div>
                                        <div style={{ fontWeight: 'bold' }}>{item.itemId}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#ccc' }}>희귀 물품</div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleBuy(item)}
                                    style={{
                                        background: '#ffd700',
                                        color: '#000',
                                        border: 'none',
                                        padding: '8px 15px',
                                        borderRadius: '5px',
                                        fontWeight: 'bold',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {item.basePrice} 💰
                                </button>
                            </div>
                        ))
                    )}
                </div>

                <div style={{
                    marginTop: '20px',
                    textAlign: 'center',
                    borderTop: '1px solid #444',
                    paddingTop: '10px',
                    fontSize: '0.9rem'
                }}>
                    내 골드: {playerMaterials['gold'] || 0} 💰
                </div>
            </div>
            <style>{`
                @keyframes popIn {
                    from { transform: scale(0.8); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    )
}
