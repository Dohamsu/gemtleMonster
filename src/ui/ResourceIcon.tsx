interface Props {
    resourceId: string
    size?: number
    iconUrl?: string
}

const RESOURCE_ICONS: Record<string, string> = {
    // 약초류
    herb_common: '/assets/materials/herb_common.png',
    herb_rare: '/assets/materials/herb_rare.png',
    herb_special: '/assets/materials/herb_special.png',

    // 몬스터 소재
    slime_core: '/assets/materials/slime_core.png',
    slime_fluid: '/assets/materials/slime_fluid.png',
    slime_gel: '/assets/materials/slime_gel.png',
    beast_fang: '/assets/materials/beast_fang.png',
    // Beast Forest Materials
    claw_sharp: '/assets/materials/claw_sharp.png',
    leather_beast: '/assets/materials/hide_tough.png', // Reusing tough hide image for now
    ore_iron: '/assets/materials/ore_iron.png',
    ore_magic: '/assets/materials/ore_magic.png',


    // 보석류
    gem_fragment: '/assets/materials/gem_fragment.png',
    crack_stone_fragment: '/assets/materials/crack_stone_fragment.png',
    ancient_relic_fragment: '/assets/materials/ancient_relic_fragment.png',
    crystal_mana: '/assets/materials/crystal_mana.png',

    // 버섯류
    mushroom_blue: '/assets/materials/mushroom_blue.png',

    // 정령/특수
    spirit_dust: '/assets/materials/spirit_dust.png',
    dark_crystal: '🔮',
    fire_core: '🔥',

    // 눈꽃/얼음 재료
    snowflake: '/assets/materials/snowflake.png',
    ice_shard: '/assets/materials/ice_shard.png',
    frozen_dew: '/assets/materials/frozen_dew.png',
    frost_essence: '/assets/materials/frost_essence.png',

    // 추가된 정령 재료
    essence_light: '/assets/materials/essence_light.png',
    soul_fragment: '/assets/materials/soul_fragment.png',
    rune_world: '/assets/materials/rune_world.png',

    // 속성 파편
    shard_water: '/assets/materials/shard_water.png',
    shard_earth: '/assets/materials/shard_earth.png',
    shard_fire: '/assets/materials/shard_fire.png',
    shard_dark: '/assets/materials/shard_dark.png',
    shard_wind: '/assets/materials/shard_wind.png',
    shard_light: '/assets/materials/shard_light.png',

    // 기타
    gold: '💰',
    training_token: '🎖️',

    // New Basic Materials (Placeholders)
    scrap_leather: '/assets/materials/scrap_leather.png',
    scrap_cloth: '/assets/materials/scrap_cloth.png',
    feather_common: '/assets/materials/feather_common.png',
    bone_fragment: '/assets/materials/bone_fragment.png',
    wood_branch: '/assets/materials/wood_branch.png',

    // Mining
    stone: '/assets/materials/stone.png',
    ore_copper: '/assets/materials/ore_copper.png',
    ore_silver: '/assets/materials/ore_silver.png',
    ore_gold: '/assets/materials/ore_gold.png',
    ore_platinum: '/assets/materials/ore_platinum.png',
    diamond: '/assets/materials/diamond.png',

    // Herbs
    herb_roots: '/assets/materials/herb_roots.png',
    herb_mystic: '/assets/materials/herb_mystic.png',
    herb_yggdrasil: '/assets/materials/herb_yggdrasil.png',

    // Elemental Essences
    essence_fire: '🔥',
    essence_water: '💧',
    essence_earth: '🪨',
    essence_wind: '🌪️',
}

export default function ResourceIcon({ resourceId, size = 20, iconUrl }: Props) {
    // 1. iconUrl prop이 있으면 최우선 사용
    // 2. 없으면 RESOURCE_ICONS 맵에서 조회
    // 3. 그래도 없으면 물음표
    const icon = iconUrl || RESOURCE_ICONS[resourceId] || '❓'

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
