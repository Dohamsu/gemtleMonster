import type { CanvasImages } from '../../hooks/useCanvasImages'

interface MapRendererProps {
    ctx: CanvasRenderingContext2D
    canvas: HTMLCanvasElement
    images: CanvasImages
    facilities: Record<string, number>
}

/**
 * Renders the map view with facilities
 * Optimized for performance with minimal re-calculations
 */
export function renderMapView({ ctx, canvas, images, facilities }: MapRendererProps) {
    // Clear canvas
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Render herb farm if owned
    if (images.herb_farm && facilities['herb_farm']) {
        const farmX = canvas.width * 0.3 - 64
        const farmY = canvas.height * 0.4 - 64
        ctx.drawImage(images.herb_farm, farmX, farmY, 128, 128)

        // Render level text with shadow
        ctx.fillStyle = 'white'
        ctx.font = 'bold 14px Arial'
        ctx.shadowColor = 'black'
        ctx.shadowBlur = 4
        ctx.fillText(`Lv.${facilities['herb_farm']} `, farmX + 30, farmY + 140)
        ctx.shadowBlur = 0
    }

    // Render mine if owned
    if (images.mine && facilities['mine'] && facilities['mine'] > 0) {
        const mineX = canvas.width * 0.7 - 64
        const mineY = canvas.height * 0.4 - 64
        ctx.drawImage(images.mine, mineX, mineY, 128, 128)

        ctx.fillStyle = 'white'
        ctx.font = 'bold 14px Arial'
        ctx.shadowColor = 'black'
        ctx.shadowBlur = 4
        ctx.fillText(`Lv.${facilities['mine']} `, mineX + 30, mineY + 140)
        ctx.shadowBlur = 0
    }

    // Render alchemy workshop
    if (images.alchemy_workshop) {
        const workshopX = canvas.width * 0.5 - 64
        const workshopY = canvas.height * 0.7 - 64
        ctx.drawImage(images.alchemy_workshop, workshopX, workshopY, 128, 128)

        ctx.fillStyle = 'white'
        ctx.font = 'bold 14px Arial'
        ctx.shadowColor = 'black'
        ctx.shadowBlur = 4
        ctx.fillText('연금술 공방', workshopX + 20, workshopY + 140)
        ctx.shadowBlur = 0
    }

    // Render shop
    if (images.shop_building) {
        const shopX = canvas.width * 0.8 - 64
        const shopY = canvas.height * 0.7 - 64
        ctx.drawImage(images.shop_building, shopX, shopY, 128, 128)

        ctx.fillStyle = 'white'
        ctx.font = 'bold 14px Arial'
        ctx.shadowColor = 'black'
        ctx.shadowBlur = 4
        ctx.fillText('상점', shopX + 45, shopY + 140)
        ctx.shadowBlur = 0
    }

    // Render blacksmith
    if (facilities['blacksmith'] && images.blacksmith) {
        const blacksmithX = canvas.width * 0.8 - 64
        const blacksmithY = canvas.height * 0.25 - 64

        // Determine level and image
        // Level 1: blacksmith_1.png (mapped to 1)
        // Level 2+: forge_{n}.png (mapped to 2,3,4,5)
        const level = facilities['blacksmith'] || 1
        const img = images.blacksmith[level] || images.blacksmith[1]

        if (img) {
            ctx.drawImage(img, blacksmithX, blacksmithY, 128, 128)
        }

        // Draw title
        ctx.fillStyle = 'white'
        ctx.font = 'bold 14px Arial'
        ctx.shadowColor = 'black'
        ctx.shadowBlur = 4
        ctx.fillText('대장간', blacksmithX + 40, blacksmithY + 140)
        ctx.shadowBlur = 0
    }

    // Render dungeon entrance
    if (images.dungeon_forest) {
        const dungeonX = canvas.width * 0.15 - 64
        const dungeonY = canvas.height * 0.7 - 64
        ctx.drawImage(images.dungeon_forest, dungeonX, dungeonY, 128, 128)

        ctx.fillStyle = '#f59e0b' // Amber color for dungeon
        ctx.font = 'bold 14px Arial'
        ctx.shadowColor = 'black'
        ctx.shadowBlur = 4
        ctx.fillText('던전 입구', dungeonX + 32, dungeonY + 140)
        ctx.shadowBlur = 0
    }

    // Render monster farm
    if (images.shop_building) {
        const farmX = canvas.width * 0.5 - 64
        const farmY = canvas.height * 0.4 - 64

        // Use filter to distinguish from shop (slightly reddish tint)
        ctx.filter = 'hue-rotate(-30deg) sepia(0.3)'
        ctx.drawImage(images.shop_building, farmX, farmY, 128, 128)
        ctx.filter = 'none'

        ctx.fillStyle = 'white'
        ctx.font = 'bold 14px Arial'
        ctx.shadowColor = 'black'
        ctx.shadowBlur = 4
        ctx.fillText('몬스터 농장', farmX + 30, farmY + 140)
        ctx.shadowBlur = 0
    }

    // Render Spirit Sanctum if owned (or for debugging)
    if (images.spirit_sanctum && facilities && facilities['spirit_sanctum'] !== undefined) {
        const sanctumX = canvas.width * 0.2 - 64
        const sanctumY = canvas.height * 0.2 - 64

        ctx.drawImage(images.spirit_sanctum, sanctumX, sanctumY, 128, 128)

        ctx.fillStyle = '#a78bfa' // Light purple
        ctx.font = 'bold 14px Arial'
        ctx.shadowColor = 'black'
        ctx.shadowBlur = 4
        // Show level or just name if level is 0/undefined
        const level = facilities['spirit_sanctum'] || 0
        ctx.fillText(`정령의 성소 Lv.${level}`, sanctumX + 10, sanctumY + 140)
        ctx.shadowBlur = 0
    } else {
        // Debug log only if missing (to avoid spamming loop)
        // console.log('Spirit Sanctum missing:', { img: !!images.herb_farm, fac: facilities['spirit_sanctum'] })
    }
}
