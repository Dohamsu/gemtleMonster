import { MATERIALS } from '../../data/alchemyData'
import ResourceIcon from '../ResourceIcon'

interface DispatchRewardModalProps {
    rewards: Record<string, number>
    onClose: () => void
    isGreatSuccess?: boolean
}

export default function DispatchRewardModal({ rewards, onClose, isGreatSuccess }: DispatchRewardModalProps) {
    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 4000,
            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <div style={{
                width: '90%', maxWidth: '400px',
                background: '#1a1612', border: isGreatSuccess ? '3px solid #facc15' : '2px solid #555', borderRadius: '16px',
                padding: '24px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px',
                boxShadow: isGreatSuccess ? '0 0 80px rgba(250, 204, 21, 0.4)' : '0 0 50px rgba(0,0,0,0.3)',
                animation: isGreatSuccess ? 'pulse 2s infinite' : 'none'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '40px', marginBottom: '10px' }}>
                        {isGreatSuccess ? '🌟' : '🎁'}
                    </div>
                    {isGreatSuccess ? (
                        <h2 style={{
                            margin: 0, color: '#facc15', fontSize: '28px',
                            textShadow: '0 0 10px #facc15'
                        }}>
                            대성공!
                        </h2>
                    ) : (
                        <h2 style={{ margin: 0, color: '#facc15', fontSize: '24px' }}>파견 완료!</h2>
                    )}

                    <p style={{ margin: '8px 0 0 0', color: '#b0a090' }}>
                        {isGreatSuccess
                            ? '동료들이 엄청난 성과를 거두었습니다!'
                            : '고생한 동료들이 전리품을 가져왔습니다.'}
                    </p>
                </div>

                <div style={{
                    width: '100%',
                    background: '#231f10',
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    maxHeight: '300px',
                    overflowY: 'auto'
                }}>
                    {Object.entries(rewards).map(([matId, qty]) => {
                        const material = MATERIALS[matId]
                        const name = material?.name || matId

                        return (
                            <div key={matId} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                background: 'rgba(255, 255, 255, 0.05)',
                                padding: '10px 12px',
                                borderRadius: '8px',
                                border: '1px solid #3d2b20'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        width: '40px', height: '40px',
                                        background: '#000', borderRadius: '8px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        border: '1px solid #5a4030'
                                    }}>
                                        <ResourceIcon resourceId={matId} size={32} />
                                    </div>
                                    <span style={{ color: '#e0e0e0', fontWeight: 'bold' }}>{name}</span>
                                </div>
                                <span style={{ color: '#facc15', fontWeight: 'bold', fontSize: '1.2em' }}>
                                    +{qty}
                                </span>
                            </div>
                        )
                    })}
                </div>

                <button
                    onClick={onClose}
                    style={{
                        width: '100%',
                        padding: '16px',
                        background: 'linear-gradient(135deg, #facc15 0%, #eab308 100%)',
                        border: 'none',
                        borderRadius: '12px',
                        color: '#1a1612',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(234, 179, 8, 0.3)'
                    }}
                >
                    확인
                </button>
            </div>
        </div>
    )
}
