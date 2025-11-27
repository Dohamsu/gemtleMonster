import { useState, useEffect } from 'react'
import type { AlchemyContext } from '../types/alchemy'

export function useAlchemyContext(): AlchemyContext {
    const [context, setContext] = useState<AlchemyContext>(getInitialContext())

    useEffect(() => {
        // Update time every minute
        const interval = setInterval(() => {
            setContext(prev => ({
                ...prev,
                time: getRealTimeInfo(),
                session: {
                    ...prev.session,
                    idleTimeSec: prev.session.idleTimeSec + 60 // Rough increment
                }
            }))
        }, 60000)

        // Listen for visibility change (tab idle)
        const handleVisibilityChange = () => {
            if (document.hidden) {
                // Tab went background
            } else {
                // Tab came foreground
            }
        }
        document.addEventListener('visibilitychange', handleVisibilityChange)

        return () => {
            clearInterval(interval)
            document.removeEventListener('visibilitychange', handleVisibilityChange)
        }
    }, [])

    return context
}

function getInitialContext(): AlchemyContext {
    return {
        time: getRealTimeInfo(),
        env: {
            weather: 'SUNNY', // Mock: Should fetch from API
            temperature: 20,  // Mock
            language: navigator.language,
            country: 'KR'     // Mock: Should fetch from IP
        },
        device: {
            type: /Mobi|Android/i.test(navigator.userAgent) ? 'MOBILE' : 'DESKTOP',
            os: navigator.platform,
            isDarkMode: window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        },
        session: {
            idleTimeSec: 0,
            loginStreak: 1,      // Mock
            dailyPlayTimeMin: 0, // Mock
            recentFailCount: 0   // Mock
        },
        player: {
            alchemyLevel: 1,
            catalysts: [],
            eventFlags: []
        }
    }
}

function getRealTimeInfo() {
    const now = new Date()
    return {
        gameTime: 12, // Mock: Sync with in-game clock if exists
        realTime: now.getHours(),
        realDayOfWeek: now.getDay(),
        realDateStr: `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    }
}
