import React from 'react'

interface Props {
    id: string
    level: number
    size?: string
    style?: React.CSSProperties
}

export default function FacilityIcon({ id, level, size = '1.5em', style }: Props) {
    const getIconContent = () => {
        if (id === 'herb_farm') {
            const colors = ['#4ade80', '#22c55e', '#16a34a', '#15803d', '#facc15'] // Green to Gold
            const color = colors[Math.min(level - 1, 4)]
            return { emoji: '🌿', color }
        }
        if (id === 'mine') {
            const colors = ['#9ca3af', '#d1d5db', '#e5e7eb', '#f3f4f6', '#facc15'] // Gray to Gold
            const color = colors[Math.min(level - 1, 4)]
            return { emoji: '⛏️', color }
        }
        if (id === 'alchemy_lab') {
            const colors = ['#a78bfa', '#8b5cf6', '#7c3aed', '#6d28d9', '#facc15'] // Purple to Gold
            const color = colors[Math.min(level - 1, 4)]
            return { emoji: '⚗️', color }
        }
        if (id === 'dungeon_dispatch') {
            const colors = ['#f87171', '#ef4444', '#dc2626', '#b91c1c', '#facc15'] // Red to Gold
            const color = colors[Math.min(level - 1, 4)]
            return { emoji: '⚔️', color }
        }
        if (id === 'training_ground') {
            const colors = ['#fb923c', '#f97316', '#ea580c', '#c2410c', '#facc15'] // Orange to Gold
            const color = colors[Math.min(level - 1, 4)]
            return { emoji: '🏋️', color }
        }
        return { emoji: '🏠', color: 'white' }
    }

    const { emoji, color } = getIconContent()

    return (
        <span style={{
            fontSize: size,
            filter: `drop-shadow(0 0 5px ${color})`,
            ...style
        }}>
            {emoji}
        </span>
    )
}
