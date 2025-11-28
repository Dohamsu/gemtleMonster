import { useEffect } from 'react'
import GameCanvas from './game/GameCanvas'
import UIOverlay from './ui/UIOverlay'
import { useAuth } from './hooks/useAuth'
import { useAutoCollection } from './hooks/useAutoCollection'
import { initializePlayer } from './lib/initializePlayer'
import { useGameStore } from './store/useGameStore'
import { useResources } from './hooks/useResources'
import { useFacilities } from './hooks/useFacilities'

function App() {
    const { user } = useAuth()
    const { setResources, setFacilities } = useGameStore()

    // Fetch initial data from DB
    const { resources: dbResources } = useResources(user?.id)
    const { playerFacilities: dbFacilities } = useFacilities(user?.id)

    // Sync DB data to local store when loaded
    useEffect(() => {
        if (Object.keys(dbResources).length > 0) {
            setResources(dbResources)
        }
    }, [dbResources, setResources])

    useEffect(() => {
        if (Object.keys(dbFacilities).length > 0) {
            setFacilities(dbFacilities)
        }
    }, [dbFacilities, setFacilities])

    // Auto-collect resources from facilities (updates local store)
    useAutoCollection(user?.id)

    useEffect(() => {
        if (user) {
            initializePlayer(user.id).catch(err => {
                console.error('Player initialization failed:', err)
            })
        }

        // Add syncMaterials to window for manual material synchronization
        const syncMaterials = async () => {
            if (!user) {
                console.error('User not logged in')
                return
            }

            const { supabase } = await import('./lib/supabase')
            const alchemyData = await import('./data/alchemyData.json')
            const materials = alchemyData.materials

            console.log(`🔄 Syncing ${materials.length} materials...`)

            for (const material of materials) {
                const { error } = await supabase
                    .from('material')
                    .upsert({
                        id: material.id,
                        name: material.name,
                        family: material.family,
                        description: material.description,
                        rarity: material.rarity,
                        icon_url: material.iconUrl,
                        is_special: material.isSpecial,
                        sell_price: 0
                    }, { onConflict: 'id' })

                if (error) {
                    console.error(`❌ Failed to sync ${material.id}:`, error)
                } else {
                    console.log(`✅ Synced ${material.id}`)
                }
            }

            console.log('✅ Material sync complete!')
        }

            ; (window as any).syncMaterials = syncMaterials
            ; (window as any).useGameStore = useGameStore
    }, [user])

    return (
        <div style={{
            display: 'flex',
            width: '100vw',
            height: '100vh',
            overflow: 'hidden',
            backgroundColor: '#000'
        }}>
            {/* Game Area (Left) */}
            <div style={{
                flex: 1,
                position: 'relative',
                backgroundColor: '#2c3e50',
                overflow: 'hidden'
            }}>
                <GameCanvas />
            </div>

            {/* UI Sidebar (Right) */}
            <div style={{
                width: '350px',
                height: '100%',
                backgroundColor: '#1a1a1a',
                borderLeft: '2px solid #333',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 10
            }}>
                <UIOverlay />
            </div>
        </div>
    )
}

export default App
