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
