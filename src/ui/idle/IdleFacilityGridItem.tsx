import React from 'react'
import type { FacilityData } from '../../types/idle'
import { useGameStore } from '../../store/useGameStore'
import FacilityIcon from '../FacilityIcon'

interface Props {
    facility: FacilityData
    level: number
    onClick: () => void
    isPaused?: boolean
}

export default function IdleFacilityGridItem({ facility, level, onClick, isPaused = false }: Props) {
    const { lastCollectedAt } = useGameStore()

    // Calculate progress
    const levelData = facility.levels.find(l => l.level === level)
    const intervalSeconds = (levelData?.stats as any)?.intervalSeconds || 1
    const facilityKey = `${facility.id}-${level}`
    const lastCollected = lastCollectedAt[facilityKey] || 0

    const overlayRef = React.useRef<HTMLDivElement>(null)
    const animationRef = React.useRef<number>(0)

    React.useEffect(() => {
        // isPaused일 때는 애니메이션을 실행하지 않음
        if (isPaused) {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current)
            }
            return
        }

        const duration = intervalSeconds * 1000

        const animate = () => {
            if (!overlayRef.current) return

            const now = Date.now()
            let elapsed = 0
            if (lastCollected > 0) {
                elapsed = now - lastCollected
            } else {
                elapsed = now % duration
            }

            const cycleElapsed = elapsed % duration
            // Progress 0% -> Height 100% (Full Dim)
            // Progress 100% -> Height 0% (No Dim)
            const progress = cycleElapsed / duration
            const heightPercentage = (1 - progress) * 100

            overlayRef.current.style.height = `${heightPercentage}%`

            animationRef.current = requestAnimationFrame(animate)
        }

        animationRef.current = requestAnimationFrame(animate)

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current)
        }
    }, [intervalSeconds, lastCollected, isPaused])

    return (
        <div
            onClick={onClick}
            style={{
                width: '100px',
                height: '100px',
                background: '#2a2a2a',
                borderRadius: '8px',
                padding: '10px',
                textAlign: 'center',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid #444'
            }}
        >
            {/* Progress Overlay (Dimmed effect) */}
            <div
                ref={overlayRef}
                style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    height: '100%', // Initial state
                    background: 'rgba(0, 0, 0, 0.7)',
                    zIndex: 1,
                    pointerEvents: 'none',
                    willChange: 'height' // Optimize for animation
                }}
            />

            <div style={{ marginBottom: '8px', zIndex: 2, position: 'relative' }}>
                <FacilityIcon id={facility.id} level={level} size="2.5em" />
            </div>
            <div style={{ fontSize: '0.9em', marginBottom: '2px', fontWeight: 'bold', zIndex: 2, position: 'relative' }}>
                {facility.name}
            </div>
            <div style={{ fontSize: '0.8em', color: '#aaa', zIndex: 2, position: 'relative' }}>
                Lv {level}
            </div>
        </div>
    )
}
