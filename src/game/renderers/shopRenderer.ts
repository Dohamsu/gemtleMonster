import type { CanvasImages } from '../../hooks/useCanvasImages'

interface ShopRendererProps {
    ctx: CanvasRenderingContext2D
    canvas: HTMLCanvasElement
    images: CanvasImages
}

/**
 * Renders the shop interior background
 */
export function renderShopView(props: ShopRendererProps) {
    const { ctx, canvas, images } = props

    // Background
    ctx.fillStyle = '#1a1a1a'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Render Shop Interior Image
    if (images.shop_interior) {
        // Draw image to cover the canvas while maintaining aspect ratio
        const img = images.shop_interior
        const scale = Math.max(canvas.width / img.width, canvas.height / img.height)
        const x = (canvas.width / 2) - (img.width / 2) * scale
        const y = (canvas.height / 2) - (img.height / 2) * scale

        ctx.drawImage(img, x, y, img.width * scale, img.height * scale)
    } else {
        // Fallback text if image not loaded
        ctx.fillStyle = '#f0d090'
        ctx.font = 'bold 32px Arial'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('🏪 상점 내부', canvas.width / 2, canvas.height / 2)
    }

    // Overlay a slight dark tint to make UI pop
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
}
