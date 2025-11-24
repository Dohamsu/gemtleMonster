import { useAuth } from '../hooks/useAuth'
import { useGameStore } from '../store/useGameStore'
import { useSaveGame } from '../hooks/useSaveGame'
import IdleFacilityList from './idle/IdleFacilityList'
import Shop from './shop/Shop'
import AlchemyLayout from './alchemy/AlchemyLayout'
import ResourceAnimation from './ResourceAnimation'

const RESOURCE_NAMES: Record<string, string> = {
    gold: '골드',
    herb_common: '일반 약초',
    herb_rare: '희귀 약초',
    herb_special: '특수 약초',
    stone: '돌',
    ore_iron: '철광석',
    ore_magic: '마력석',
    gem_fragment: '보석 파편',
    crack_stone_fragment: '균열석 파편',
    ancient_relic_fragment: '고대 유물 파편',

    training_token: '훈련 토큰',
    // Alchemy Materials
    slime_core: '슬라임 코어',
    beast_fang: '짐승 송곳니',
    spirit_dust: '정령 가루',
    dark_crystal: '어둠의 결정',
    crown_shard: '왕관 파편',
    fire_core: '불 던전 코어'
}

export default function UIOverlay() {
    const { user, loading: authLoading } = useAuth()
    const { resources, recentAdditions, removeRecentAddition, activeTab, setActiveTab } = useGameStore()
    const { saveGame, saving, lastSaved } = useSaveGame()

    if (authLoading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'white' }}>
                로딩 중...
            </div>
        )
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '15px', boxSizing: 'border-box' }}>
            {/* Header / Player Info */}
            <div style={{
                background: '#2a2a2a',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '15px',
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
            }}>
                <h2 style={{ margin: '0 0 10px 0', color: '#fff', fontSize: '1.2em' }}>GemtleMonster</h2>
                <div style={{ fontSize: '0.85em', color: '#aaa', marginBottom: '10px' }}>
                    ID: {user?.id.slice(0, 8)}...
                </div>

                <div style={{ borderTop: '1px solid #444', paddingTop: '10px' }}>
                    <p style={{ margin: '5px 0', color: '#facc15', fontWeight: 'bold' }}>
                        💰 {RESOURCE_NAMES['gold']}: {resources.gold || 0}
                        {(() => {
                            const goldAdditions = recentAdditions.filter(a => a.resourceId === 'gold')
                            if (goldAdditions.length === 0) return null
                            const totalAmount = goldAdditions.reduce((sum, a) => sum + a.amount, 0)
                            const firstId = goldAdditions[0].id
                            return (
                                <ResourceAnimation
                                    key={firstId}
                                    amount={totalAmount}
                                    onComplete={() => {
                                        goldAdditions.forEach(a => removeRecentAddition(a.id))
                                    }}
                                />
                            )
                        })()}
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
                        {Object.entries(resources).filter(([k]) => k !== 'gold').map(([key, value]) => (
                            <p key={key} style={{ margin: '0', fontSize: '0.8em', color: '#ddd' }}>
                                {RESOURCE_NAMES[key] || key}: {value}
                                {(() => {
                                    const additions = recentAdditions.filter(a => a.resourceId === key)
                                    if (additions.length === 0) return null
                                    const totalAmount = additions.reduce((sum, a) => sum + a.amount, 0)
                                    const firstId = additions[0].id
                                    return (
                                        <ResourceAnimation
                                            key={firstId}
                                            amount={totalAmount}
                                            onComplete={() => {
                                                additions.forEach(a => removeRecentAddition(a.id))
                                            }}
                                        />
                                    )
                                })()}
                            </p>
                        ))}
                    </div>
                </div>

                <div style={{ marginTop: '15px' }}>
                    <button
                        onClick={saveGame}
                        disabled={saving}
                        style={{
                            width: '100%',
                            padding: '8px',
                            background: saving ? '#555' : '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: saving ? 'not-allowed' : 'pointer',
                            fontWeight: 'bold',
                            transition: 'background 0.2s'
                        }}
                    >
                        {saving ? '저장 중...' : '저장하기'}
                    </button>
                    {lastSaved && (
                        <div style={{ fontSize: '0.75em', color: '#888', marginTop: '5px', textAlign: 'center' }}>
                            저장됨: {lastSaved.toLocaleTimeString()}
                        </div>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                <button
                    onClick={() => setActiveTab('facilities')}
                    style={{
                        flex: 1,
                        padding: '10px',
                        background: activeTab === 'facilities' ? '#444' : '#2a2a2a',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: activeTab === 'facilities' ? 'bold' : 'normal'
                    }}
                >
                    시설 관리
                </button>
                <button
                    onClick={() => setActiveTab('alchemy')}
                    style={{
                        flex: 1,
                        padding: '10px',
                        background: activeTab === 'alchemy' ? '#444' : '#2a2a2a',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: activeTab === 'alchemy' ? 'bold' : 'normal'
                    }}
                >
                    연금술 공방
                </button>
                <button
                    onClick={() => setActiveTab('shop')}
                    style={{
                        flex: 1,
                        padding: '10px',
                        background: activeTab === 'shop' ? '#444' : '#2a2a2a',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: activeTab === 'shop' ? 'bold' : 'normal'
                    }}
                >
                    상점
                </button>
            </div>

            {/* Content Area */}
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {activeTab === 'facilities' && <IdleFacilityList />}
                {activeTab === 'alchemy' && <AlchemyLayout />}
                {activeTab === 'shop' && <Shop />}
            </div>
        </div>
    )
}
