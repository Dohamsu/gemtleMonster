import { useEffect, useState } from 'react'

interface Props {
    amount: number
    onComplete?: () => void
}

export default function ResourceAnimation({ amount, onComplete }: Props) {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        // Trigger fade-in
        setTimeout(() => setIsVisible(true), 10)

        // Trigger fade-out
        const fadeOutTimer = setTimeout(() => setIsVisible(false), 1200)

        // Complete and unmount
        const completeTimer = setTimeout(() => {
            if (onComplete) onComplete()
        }, 2000)

        return () => {
            clearTimeout(fadeOutTimer)
            clearTimeout(completeTimer)
        }
    }, [onComplete])

    return (
        <span
            style={{
                marginLeft: '8px',
                color: '#4ade80',
                fontWeight: 'bold',
                fontSize: '0.9em',
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(-5px)',
                transition: 'opacity 0.3s ease-out, transform 0.3s ease-out',
                display: 'inline-block',
                pointerEvents: 'none'
            }}
        >
            +{amount}
        </span>
    )
}
