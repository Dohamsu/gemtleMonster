import DispatchManager from './DispatchManager'

interface DispatchMainModalProps {
    onClose: () => void
}

export default function DispatchMainModal({ onClose }: DispatchMainModalProps) {
    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 3000,
            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <div style={{
                width: '100%', maxWidth: '600px', height: '100%', maxHeight: '80vh',
                background: '#1a1612', border: '1px solid #494122', borderRadius: '16px',
                display: 'flex', flexDirection: 'column', overflow: 'hidden',
                boxShadow: '0 0 40px rgba(0,0,0,0.5)',
                margin: '20px'
            }}>
                {/* Header */}
                <div style={{
                    padding: '16px 20px', background: '#231f10', borderBottom: '1px solid #3d2b20',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    flexShrink: 0
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '24px' }}>🗺️</span>
                        <h2 style={{ margin: 0, fontSize: '18px', color: '#facc15' }}>자동 던전 파견</h2>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '28px', padding: '0 8px' }}>&times;</button>
                </div>

                <DispatchManager />
            </div>
        </div>
    )
}
