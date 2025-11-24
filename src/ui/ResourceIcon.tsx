interface Props {
    resourceId: string
    size?: number
}

const RESOURCE_ICONS: Record<string, string> = {
    // 허브류
    herb_common: '🌿',
    herb_rare: '🌺',
    herb_special: '✨',

    // 광석류
    ore_iron: '⚙️',
    ore_magic: '💎',
    stone: '🪨',

    // 보석류
    gem_fragment: '💠',
    crack_stone_fragment: '🔮',
    ancient_relic_fragment: '🏺',

    // 기타
    gold: '💰',
    training_token: '🎖️'
}

export default function ResourceIcon({ resourceId, size = 20 }: Props) {
    const icon = RESOURCE_ICONS[resourceId] || '❓'

    return (
        <span style={{
            fontSize: `${size}px`,
            display: 'inline-block',
            lineHeight: 1
        }}>
            {icon}
        </span>
    )
}
