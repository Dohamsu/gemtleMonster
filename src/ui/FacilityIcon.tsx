import React from 'react'

interface Props {
    id: string
    level: number
    size?: string | number
    style?: React.CSSProperties
}

export default function FacilityIcon({ id, level, size = 40, style }: Props) {
    const getImagePath = () => {
        // Use level-specific images for facilities that have them
        if (id === 'herb_farm') {
            // herb_farm has level-specific images: herb_farm_1.png, herb_farm_2.png, herb_farm_3.png
            const imageLevel = Math.min(level, 3) // Cap at 3 since we only have 3 images
            return `/assets/facility/herb_farm_${imageLevel}.png`
        }

        if (id === 'mine') {
            // mine has level-specific images: mine_1.png, mine_2.png, mine_3.png
            const imageLevel = Math.min(level, 3) // Cap at 3 since we only have 3 images
            return `/assets/facility/mine_${imageLevel}.png`
        }

        // For other facilities, you can add similar logic when images are available
        // For now, return null to show a fallback
        return null
    }

    const imagePath = getImagePath()
    const sizeValue = typeof size === 'string' ? size : `${size}px`

    if (imagePath) {
        return (
            <img
                src={imagePath}
                alt={`${id} level ${level}`}
                style={{
                    width: sizeValue,
                    height: sizeValue,
                    objectFit: 'contain',
                    ...style
                }}
            />
        )
    }

    // Fallback to emoji if no image is available
    const getIconContent = () => {
        if (id === 'herb_farm') {
            const colors = ['#4ade80', '#22c55e', '#16a34a', '#15803d', '#facc15']
            const color = colors[Math.min(level - 1, 4)]
            return { emoji: '🌿', color }
        }
        if (id === 'mine') {
            const colors = ['#9ca3af', '#d1d5db', '#e5e7eb', '#f3f4f6', '#facc15']
            const color = colors[Math.min(level - 1, 4)]
            return { emoji: '⛏️', color }
        }
        if (id === 'alchemy_lab') {
            const colors = ['#a78bfa', '#8b5cf6', '#7c3aed', '#6d28d9', '#facc15']
            const color = colors[Math.min(level - 1, 4)]
            return { emoji: '⚗️', color }
        }
        if (id === 'dungeon_dispatch') {
            const colors = ['#f87171', '#ef4444', '#dc2626', '#b91c1c', '#facc15']
            const color = colors[Math.min(level - 1, 4)]
            return { emoji: '⚔️', color }
        }
        if (id === 'training_ground') {
            const colors = ['#fb923c', '#f97316', '#ea580c', '#c2410c', '#facc15']
            const color = colors[Math.min(level - 1, 4)]
            return { emoji: '🏋️', color }
        }
        return { emoji: '🏠', color: 'white' }
    }

    const { emoji, color } = getIconContent()

    return (
        <span style={{
            fontSize: typeof size === 'string' ? size : `${size}px`,
            filter: `drop-shadow(0 0 5px ${color})`,
            ...style
        }}>
            {emoji}
        </span>
    )
}
