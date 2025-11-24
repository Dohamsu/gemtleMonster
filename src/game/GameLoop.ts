export class GameLoop {
    private canvas: HTMLCanvasElement
    private ctx: CanvasRenderingContext2D
    private animationFrameId: number | null = null
    private lastTime: number = 0

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas
        this.ctx = canvas.getContext('2d')!
        this.resize()
        window.addEventListener('resize', () => this.resize())
    }

    private resize() {
        this.canvas.width = window.innerWidth
        this.canvas.height = window.innerHeight
    }

    start() {
        this.lastTime = performance.now()
        this.loop(this.lastTime)
    }

    stop() {
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId)
            this.animationFrameId = null
        }
    }

    private loop(time: number) {
        const deltaTime = time - this.lastTime
        this.lastTime = time

        this.update(deltaTime)
        this.render()

        this.animationFrameId = requestAnimationFrame((t) => this.loop(t))
    }

    private update(_deltaTime: number) {
        // Update game logic here
    }

    private render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

        // Draw something basic
        this.ctx.fillStyle = '#4a90e2'
        this.ctx.fillRect(100, 100, 50, 50)

        this.ctx.fillStyle = 'white'
        this.ctx.font = '20px Arial'
        this.ctx.fillText('Game Canvas Active', 20, 40)
    }
}
