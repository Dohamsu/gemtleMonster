import { useEffect, useState } from 'react'
import ResourceIcon from './ResourceIcon'

interface Props {
    resourceId: string
    onComplete?: () => void
}

export default function CollectionAnimation({ resourceId, onComplete }: Props) {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        // Trigger fade-in immediately
        const fadeInTimer = setTimeout(() => setIsVisible(true), 50)

        // Trigger fade-out after 800ms
        const fadeOutTimer = setTimeout(() => setIsVisible(false), 800)

        // Complete and unmount after 1400ms
        const completeTimer = setTimeout(() => {
            if (onComplete) onComplete()
        }, 1400)

        return () => {
            clearTimeout(fadeInTimer)
            clearTimeout(fadeOutTimer)
            clearTimeout(completeTimer)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []) // Only run once on mount

    return (
        <div
            style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: isVisible
                    ? 'translate(-50%, -80%)'
                    : 'translate(-50%, -50%)',
                opacity: isVisible ? 1 : 0,
                transition: 'all 0.5s ease-out',
                pointerEvents: 'none',
                zIndex: 10,
                filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.8))',
            }}
        >
            <ResourceIcon resourceId={resourceId} size={32} />
        </div>
    )
}
