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

    // Render forest dungeon
    if (images.dungeon_forest) {
        const dungeonX = canvas.width * 0.15 - 64
        const dungeonY = canvas.height * 0.7 - 64
        ctx.drawImage(images.dungeon_forest, dungeonX, dungeonY, 128, 128)

        ctx.fillStyle = '#a3e635' // Lime green for slime/forest feel
        ctx.font = 'bold 14px Arial'
        ctx.shadowColor = 'black'
        ctx.shadowBlur = 4
        ctx.fillText('슬라임 숲', dungeonX + 35, dungeonY + 140)
        ctx.shadowBlur = 0
    }

    // Render monster farm
    if (images.shop_building && facilities['monster_farm']) {
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
}
