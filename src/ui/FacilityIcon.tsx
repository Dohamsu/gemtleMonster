import React from 'react'

interface Props {
    id: string
    level: number
    size?: string | number
    style?: React.CSSProperties
}

// Refactored function to get the image path based on id and level
const getFacilityIconUrl = (id: string, level: number): string | null => {
    // Check for blacksmith/forge progression
    if (id === 'blacksmith') {
        const lv = level || 1
        // Level 1: blacksmith_1.png
        // Level 2: forge_1.png
        // Level 3: forge_2.png
        // Level 4: forge_3.png
        // Level 5: forge_4.png
        if (lv === 1) return '/assets/facility/blacksmith_1.png'
        if (lv >= 2 && lv <= 5) return `/assets/facility/forge_${lv - 1}.png`
        if (lv > 5) return '/assets/facility/forge_4.png' // Fallback for higher levels
    }

    switch (id) {
        case 'herb_farm': {
            const herbFarmImageLevel = Math.min(level, 3)
            return `/assets/facility/herb_farm_${herbFarmImageLevel}.png`
        }
        case 'mine': {
            const mineImageLevel = Math.min(level, 3)
            return `/assets/facility/mine_${mineImageLevel}.png`
        }
        case 'spirit_sanctum':
            return '/assets/facility/spirit_santuary.png'
        case 'alchemy_lab':
        case 'alchemy_workshop':
            return '/assets/facility/alchemy_workshop.png'
        case 'shop_building':
            return '/assets/facility/shop_building.png'
        case 'dungeon_dispatch':
            return '/assets/facility/dungeon_center.png'
        case 'training_ground':
            return '/assets/facility/training_center.png'
        case 'monster_farm':
            return '/assets/facility/monster_farm.png'
        case 'lumber_mill': {
            const levelIdx = Math.min(level, 3)
            return `/assets/facility/lumber_mill_${levelIdx}.png`
        }
        case 'magic_tower': {
            const levelIdx = Math.min(level, 3)
            return `/assets/facility/magic_tower_${levelIdx}.png`
        }
        default:
            return null
    }
}

export default function FacilityIcon({ id, level, size = 40, style }: Props) {
    const imagePath = getFacilityIconUrl(id, level)
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
        if (id === 'monster_farm') {
            const colors = ['#fca5a5', '#f87171', '#ef4444', '#dc2626', '#facc15']
            const color = colors[Math.min(level - 1, 4)]
            return { emoji: '🏡', color }
        }
        if (id === 'lumber_mill') {
            const colors = ['#a0522d', '#8b4513', '#d2691e', '#cd853f', '#f4a460']
            const color = colors[Math.min(level - 1, 4)]
            return { emoji: '🪵', color }
        }
        if (id === 'magic_tower') {
            const colors = ['#9370db', '#8a2be2', '#4b0082', '#483d8b', '#7b68ee']
            const color = colors[Math.min(level - 1, 4)]
            return { emoji: '🔮', color }
        }
        if (id === 'blacksmith') {
            const colors = ['#fdba74', '#fb923c', '#f97316', '#ea580c', '#c2410c'] // Orange/Fire
            const color = colors[Math.min(level - 1, 4)]
            return { emoji: '⚒️', color }
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
        if (id === 'spirit_sanctum') {
            const colors = ['#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8', '#facc15']
            const color = colors[Math.min(level - 1, 4)]
            return { emoji: '🧚', color }
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
