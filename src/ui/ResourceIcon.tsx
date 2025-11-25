interface Props {
    resourceId: string
    size?: number
}

const RESOURCE_ICONS: Record<string, string> = {
    // 약초류
    herb_common: '/assets/materials/herb_common.png',
    herb_rare: '/assets/materials/herb_rare.png',
    herb_special: '/assets/materials/herb_special.png',

    // 몬스터 소재
    slime_core: '/assets/materials/slime_core.png',
    beast_fang: '/assets/materials/beast_fang.png',

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

    // Check if icon is an image path
    if (icon.startsWith('/')) {
        return (
            <img
                src={icon}
                alt={resourceId}
                style={{
                    width: size,
                    height: size,
                    objectFit: 'contain',
                    display: 'inline-block',
                    verticalAlign: 'middle'
                }}
            />
        )
    }

    return (
        <span style={{
            fontSize: `${size}px`,
            display: 'inline-block',
            lineHeight: 1,
            verticalAlign: 'middle'
        }}>
            {icon}
        </span>
    )
}
