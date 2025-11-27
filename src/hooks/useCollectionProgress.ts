import { useState, useEffect } from 'react'

export function useCollectionProgress(
    facilityId: string,
    intervalSeconds: number,
    lastCollectedAt: number = 0,
    isPaused: boolean = false
) {
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        // 일시정지 상태일 때는 업데이트를 중단
        if (isPaused) {
            return
        }

        const duration = intervalSeconds * 1000

        const updateProgress = () => {
            const now = Date.now()
            // If we have a last collected time, calculate from there
            // Otherwise, just loop (fallback)
            let elapsed = 0
            if (lastCollectedAt > 0) {
                elapsed = now - lastCollectedAt
            } else {
                // Fallback if no collection yet (start from 0)
                elapsed = now % duration // This might be desynced but better than nothing
            }

            // Cap at 100% if we want, or loop
            // Since auto-collection loops, we loop the visual too
            // But to sync perfectly, we should base it on the *next* expected collection
            // For now, simple modulo based on last collection is good enough
            const cycleElapsed = elapsed % duration
            const newProgress = (cycleElapsed / duration) * 100
            setProgress(newProgress)
        }

        const interval = setInterval(updateProgress, 50) // Update every 50ms for smooth animation
        updateProgress() // Initial call

        return () => clearInterval(interval)
    }, [facilityId, intervalSeconds, lastCollectedAt, isPaused])

    return progress
}

