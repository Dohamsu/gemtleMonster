import { useState, useEffect } from 'react'

export function useCollectionProgress(
    facilityId: string,
    intervalSeconds: number,
    lastCollectedAt: number = 0,
    isPaused: boolean = false,
    canLoop: boolean = true // 기본값 true (재료가 있거나 비용이 없는 경우)
) {
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        if (isPaused) {
            return
        }

        const duration = intervalSeconds * 1000

        const updateProgress = () => {
            const now = Date.now()
            let elapsed = 0
            if (lastCollectedAt > 0) {
                elapsed = now - lastCollectedAt
            } else {
                elapsed = 0
            }

            // 시각적 리셋 설계:
            // 1. 루핑 가능(canLoop)한 경우: % 100을 사용하여 100%를 넘는 즉시 0%로 보이게 함.
            // 2. 루핑 불가(재료 부족 등)한 경우: 100%에서 멈춤 (Clamp)
            const rawProgress = (elapsed / duration) * 100
            const newProgress = canLoop ? (rawProgress % 100) : Math.min(rawProgress, 100)

            setProgress(newProgress)
        }

        const interval = setInterval(updateProgress, 50)
        updateProgress()

        return () => clearInterval(interval)
    }, [facilityId, intervalSeconds, lastCollectedAt, isPaused, canLoop])

    return progress
}
