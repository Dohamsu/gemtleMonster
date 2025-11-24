import { useEffect, useRef } from 'react'
import { useGameStore } from '../store/useGameStore'

export default function GameCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const { facilities } = useGameStore()

    // Image refs
    const imagesRef = useRef<{
        background: HTMLImageElement | null
        herb_farm: HTMLImageElement | null
        mine: HTMLImageElement | null
    }>({
        background: null,
        herb_farm: null,
        mine: null
    })

    // Load images
    useEffect(() => {
        const loadImage = (src: string) => {
            return new Promise<HTMLImageElement>((resolve, reject) => {
                const img = new Image()
                img.src = src
                img.onload = () => resolve(img)
                img.onerror = reject
            })
        }

        Promise.all([
            loadImage('/assets/background.png'),
            loadImage('/assets/herb_farm.png'),
            loadImage('/assets/mine.png')
        ]).then(([bg, herbFarm, mine]) => {
            imagesRef.current = {
                background: bg,
                herb_farm: herbFarm,
                mine: mine
            }
        }).catch(err => console.error('Failed to load images:', err))
    }, [])

    // Animation Loop
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        let animationFrameId: number

        const render = () => {
            // Resize canvas to fit parent
            if (canvas.width !== canvas.parentElement?.clientWidth || canvas.height !== canvas.parentElement?.clientHeight) {
                canvas.width = canvas.parentElement?.clientWidth || 800
                canvas.height = canvas.parentElement?.clientHeight || 600
            }

            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            const imgs = imagesRef.current

            // Draw Background (Tiled)
            // Draw Background (Tiled)
            // Temporary: User requested black background
            ctx.fillStyle = '#000000'
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            /* Original Background Logic - Preserved for later
            if (imgs.background) {
                const pattern = ctx.createPattern(imgs.background, 'repeat')
                if (pattern) {
                    ctx.fillStyle = pattern
                    ctx.fillRect(0, 0, canvas.width, canvas.height)
                }
            } else {
                ctx.fillStyle = '#2c3e50'
                ctx.fillRect(0, 0, canvas.width, canvas.height)
            }
            */

            // Draw Facilities
            // Herb Farm Position: Center-Left (Fixed position to look like part of the farm)
            if (imgs.herb_farm && facilities['herb_farm']) {
                const farmX = canvas.width * 0.3 - 64
                const farmY = canvas.height * 0.4 - 64
                ctx.drawImage(imgs.herb_farm, farmX, farmY, 128, 128)

                // Draw Level Text
                ctx.fillStyle = 'white'
                ctx.font = 'bold 14px Arial'
                ctx.shadowColor = 'black'
                ctx.shadowBlur = 4
                ctx.fillText(`Lv.${facilities['herb_farm']} `, farmX + 30, farmY + 140)
                ctx.shadowBlur = 0
            }

            // Mine Position: Center-Right (Only if unlocked)
            if (imgs.mine && facilities['mine'] && facilities['mine'] > 0) {
                const mineX = canvas.width * 0.7 - 64
                const mineY = canvas.height * 0.4 - 64
                ctx.drawImage(imgs.mine, mineX, mineY, 128, 128)

                ctx.fillStyle = 'white'
                ctx.font = 'bold 14px Arial'
                ctx.shadowColor = 'black'
                ctx.shadowBlur = 4
                ctx.fillText(`Lv.${facilities['mine']} `, mineX + 30, mineY + 140)
                ctx.shadowBlur = 0
            }

            animationFrameId = requestAnimationFrame(render)
        }

        render()

        return () => {
            cancelAnimationFrame(animationFrameId)
        }
    }, [facilities])

    return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
}