
import { useGameStore } from '../../store/useGameStore'

export default function AlchemyHeader() {
    const { resources } = useGameStore()

    return (
        <div style={{
            padding: '15px 20px',
            background: '#252525',
            borderBottom: '1px solid #333',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <h1 style={{ margin: 0, fontSize: '1.4em', color: '#fff' }}>
                    🧪 몬스터 연금술 공방
                </h1>
                <span style={{
                    background: '#333',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '0.9em',
                    color: '#aaa'
                }}>
                    공방 Lv. 1
                </span>
            </div>

            <div style={{ display: 'flex', gap: '20px', fontSize: '0.95em' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ color: '#ffd700' }}>💰 Gold:</span>
                    <span>{resources['gold']?.toLocaleString() || 0}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#aaa' }}>
                    <span>✨ 성공률 +0%</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#aaa' }}>
                    <span>⚡ 시간 -0%</span>
                </div>
            </div>
        </div>
    )
}
