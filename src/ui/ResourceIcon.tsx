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
    ore_iron: '/assets/materials/ore_iron.png',
    ore_magic: '/assets/materials/ore_magic.png',
    stone: '🪨',

    // 보석류
    gem_fragment: '/assets/materials/gem_fragment.png',
    crack_stone_fragment: '/assets/materials/crack_stone_fragment.png',
    ancient_relic_fragment: '/assets/materials/ancient_relic_fragment.png',

    // 정령/특수
    spirit_dust: '✨',
    dark_crystal: '🔮',
    crown_shard: '👑',
    fire_core: '🔥',

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
