import { useState, useEffect } from 'react'
import type { AlchemyContext } from '../types/alchemy'
import { isMobileView } from '../utils/responsiveUtils'

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

        // Update device type on resize REMOVED as per user request to use initial width only
        /*
        const handleResize = () => {
            setContext(prev => {
                const isMobile = isMobileView()
                const newType = isMobile ? 'MOBILE' : 'DESKTOP'
                if (prev.device.type === newType) return prev
                return {
                    ...prev,
                    device: {
                        ...prev.device,
                        type: newType
                    }
                }
            })
        }
        window.addEventListener('resize', handleResize)
        */

        return () => {
            clearInterval(interval)
            document.removeEventListener('visibilitychange', handleVisibilityChange)
            // window.removeEventListener('resize', handleResize)
        }
    }, [])

    return context
}

function getInitialContext(): AlchemyContext {
    const isMobile = isMobileView()
    return {
        time: getRealTimeInfo(),
        env: {
            weather: 'SUNNY', // Mock: Should fetch from API
            temperature: 20,  // Mock
            language: navigator.language,
            country: 'KR'     // Mock: Should fetch from IP
        },
        device: {
            type: isMobile ? 'MOBILE' : 'DESKTOP',
            os: getOSInfo(),
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

function getOSInfo(): string {
    // Use modern navigator.userAgentData if available
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const uaData = (navigator as any).userAgentData
    if (uaData?.platform) {
        return uaData.platform
    }
    // Fallback to user agent string parsing
    const ua = navigator.userAgent
    if (ua.includes('Win')) return 'Windows'
    if (ua.includes('Mac')) return 'macOS'
    if (ua.includes('Linux')) return 'Linux'
    if (ua.includes('Android')) return 'Android'
    if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS'
    return 'Unknown'
}
