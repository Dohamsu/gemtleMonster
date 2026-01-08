import type { CanvasImages } from '../../hooks/useCanvasImages'

interface MapRendererProps {
    ctx: CanvasRenderingContext2D
    canvas: HTMLCanvasElement
    images: CanvasImages
    facilities: Record<string, number>
}

/**
 * Renders the map view with facilities
 * Layout:
 * - Center Top: My Home
 * - Center Mid: Monster Farm
 * - Center Bottom Left: Alchemy Workshop
 * - Center Bottom Right: Shop
 * - Far Left Bottom: Dungeon Entrance
 * - Left Bottom: Dispatch
 * - Left Mid: Herb Farm
 * - Left Top: Spirit Sanctum
 * - Right Mid: Mine
 * - Right Top: Blacksmith
 */
export function renderMapView({ ctx, canvas, images, facilities }: MapRendererProps) {
    // Clear canvas - Black background for clean look
    ctx.fillStyle = '#111111' // Slightly softer black
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Helper to get coordinates
    const getCoord = (cx: number, cy: number) => ({
        x: canvas.width * cx,
        y: canvas.height * cy
    })

    // Drawing Utilities
    const drawPath = (x1: number, y1: number, x2: number, y2: number) => {
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.strokeStyle = '#4b5563' // Slate-600, visible but subtle
        ctx.lineWidth = 6
        ctx.lineCap = 'round'
        ctx.setLineDash([12, 12]) // Larger, cleaner dashes
        ctx.stroke()
        ctx.setLineDash([]) // Reset
    }

    // --- Connection Paths (Roads) ---
    // Define coordinates
    const hub = getCoord(0.5, 0.45) // Approx center of hub (Monster Farm)
    const dungeon = getCoord(0.15, 0.75) // Dungeon
    const dispatch = getCoord(0.25, 0.60) // Dispatch
    const herb = getCoord(0.20, 0.40) // Herb Farm
    const sanctum = getCoord(0.20, 0.20) // Sanctum
    const mine = getCoord(0.80, 0.45) // Mine
    const smith = getCoord(0.80, 0.25) // Blacksmith
    const home = getCoord(0.5, 0.20) // Home (Top)
    const alchemy = getCoord(0.38, 0.75) // Alchemy
    const shop = getCoord(0.62, 0.75) // Shop

    // Draw paths - Clean straight lines
    // Main Arteries from Hub
    drawPath(hub.x, hub.y, dungeon.x, dungeon.y)
    drawPath(hub.x, hub.y, mine.x, mine.y)
    drawPath(hub.x, hub.y, home.x, home.y)
    drawPath(hub.x, hub.y, alchemy.x, alchemy.y)
    drawPath(hub.x, hub.y, shop.x, shop.y)

    // West Loop (Nature)
    drawPath(dungeon.x, dungeon.y, dispatch.x, dispatch.y)
    drawPath(dispatch.x, dispatch.y, herb.x, herb.y)
    drawPath(herb.x, herb.y, sanctum.x, sanctum.y)
    drawPath(sanctum.x, sanctum.y, home.x, home.y)

    // East Loop (Industry)
    drawPath(mine.x, mine.y, smith.x, smith.y)
    drawPath(smith.x, smith.y, home.x, home.y)

    // Helper for drawing centered images with labels
    const drawFacility = (
        img: HTMLImageElement | null,
        cx: number, // Center X (0-1)
        cy: number, // Center Y (0-1)
        label: string,
        level?: number,
        color: string = 'white',
        scale: number = 1.0
    ) => {
        if (!img) return

        const x = canvas.width * cx
        const y = canvas.height * cy
        const size = 128 * scale

        // Draw image (No bobbing)
        ctx.drawImage(img, x - size / 2, y - size / 2, size, size)

        // Draw Text Label
        ctx.fillStyle = color
        ctx.font = 'bold 15px Arial' // Slightly larger font
        ctx.textAlign = 'center'

        const textY = y + size / 2 + 20

        ctx.shadowColor = 'black'
        ctx.shadowBlur = 4
        ctx.lineWidth = 3
        ctx.strokeText(label, x, textY)
        ctx.fillText(label, x, textY)

        if (level) {
            ctx.fillStyle = '#fbbf24' // Amber-400
            ctx.fillText(`Lv.${level}`, x, textY + 18)
        }

        ctx.shadowBlur = 0
        ctx.textAlign = 'start' // Reset
    }

    // --- Hub Area (Center) ---
    if (images.my_home) {
        drawFacility(images.my_home, 0.5, 0.20, '마이 홈', undefined, '#fef3c7', 0.8)
    }

    // Monster Farm (Center Middle)
    if (images.monster_farm) {
        drawFacility(images.monster_farm, 0.5, 0.45, '몬스터 농장', facilities['monster_farm'])
    }

    // Alchemy Workshop (Center Bottom Left)
    if (images.alchemy_workshop) {
        drawFacility(images.alchemy_workshop, 0.38, 0.75, '연금술 공방')
    }

    // Shop (Center Bottom Right)
    if (images.shop_building) {
        drawFacility(images.shop_building, 0.62, 0.75, '상점')
    }

    // --- Adventure / Nature (West) ---

    // Dungeon Entrance (Far Left Bottom)
    // Always visible
    drawFacility(images.dungeon_forest, 0.15, 0.75, '던전 입구', undefined, '#f59e0b')

    // Dungeon Dispatch (Left Bottom, near Dungeon)
    if (facilities['dungeon_dispatch'] && images.dungeon_dispatch) {
        drawFacility(images.dungeon_dispatch, 0.25, 0.60, '파견소', facilities['dungeon_dispatch'])
    }

    // Herb Farm (Left Middle)
    if (facilities['herb_farm'] && images.herb_farm) {
        drawFacility(images.herb_farm, 0.20, 0.40, '약초 농장', facilities['herb_farm'])
    }

    // Spirit Sanctum (Left Top)
    if (facilities['spirit_sanctum'] !== undefined && images.spirit_sanctum) {
        drawFacility(images.spirit_sanctum, 0.20, 0.20, '정령의 성소', facilities['spirit_sanctum'], '#a78bfa')
    }

    // --- Industry (East) ---

    // Mine (Right Middle)
    if (facilities['mine'] && images.mine) {
        drawFacility(images.mine, 0.80, 0.45, '광산', facilities['mine'])
    }

    // Blacksmith (Right Top)
    if (facilities['blacksmith'] && images.blacksmith) {
        const level = facilities['blacksmith'] || 1
        const img = images.blacksmith[level] || images.blacksmith[1]
        drawFacility(img, 0.80, 0.25, '대장간', level)
    }
}
