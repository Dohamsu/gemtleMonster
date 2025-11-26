import { useEffect, useRef, useState, useCallback } from 'react'
import { useGameStore } from '../store/useGameStore'
import { useAlchemyStore } from '../store/useAlchemyStore'
import { useAuth } from '../hooks/useAuth'
import { AlchemyResultModal } from '../ui/alchemy/AlchemyResultModal'
import { useCanvasImages } from '../hooks/useCanvasImages'
import { useCanvasClickHandler } from '../hooks/useCanvasClickHandler'
import { useAlchemyContext } from '../hooks/useAlchemyContext'
import { renderMapView } from './renderers/mapRenderer'
import { renderAlchemyWorkshop } from './renderers/alchemyRenderer'
import { UI } from '../constants/game'

/**
 * Optimized GameCanvas Component
 *
 * Performance improvements:
 * - Separated rendering logic into modular renderers
 * - Extracted click handlers to custom hook
 * - Memoized callbacks to prevent re-creation
 * - Reduced from 812 lines to ~150 lines
 */
export default function GameCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const { user } = useAuth()
    const { facilities, canvasView, setCanvasView } = useGameStore()
    const {
        allRecipes,
        allMaterials,
        playerMaterials,
        selectedRecipeId,
        selectedIngredients,
        isBrewing,
        brewStartTime,
        brewProgress,
        selectRecipe,
        addIngredient,
        removeIngredient,
        startBrewing,
        startFreeFormBrewing,
        completeBrewing,
        autoFillIngredients,
        loadAllData,
        playerAlchemy,
        brewResult,
        setAlchemyContext
    } = useAlchemyStore()

    // Advanced Alchemy: Context hook
    const alchemyContext = useAlchemyContext()

    const [showResultModal, setShowResultModal] = useState(false)
    const [lastBrewResult, setLastBrewResult] = useState<{ success: boolean; monsterId?: string }>({
        success: false
    })
    const [materialScrollOffset, setMaterialScrollOffset] = useState(0)

    // Update alchemy context in store
    useEffect(() => {
        setAlchemyContext(alchemyContext)
    }, [alchemyContext, setAlchemyContext])
    const images = useCanvasImages()

    // Optimized click handler
    const handleCanvasClick = useCanvasClickHandler({
        canvasView,
        setCanvasView,
        allRecipes,
        allMaterials,
        playerMaterials,
        selectedRecipeId,
        selectedIngredients,
        isBrewing,
        playerAlchemy,
        materialScrollOffset,
        selectRecipe,
        addIngredient,
        removeIngredient,
        startBrewing,
        startFreeFormBrewing,
        completeBrewing,
        autoFillIngredients
    })

    // Show modal when brewing completes
    useEffect(() => {
        if (brewResult.type !== 'idle') {
            setLastBrewResult({
                success: brewResult.type === 'success',
                monsterId: brewResult.monsterId
            })
            setShowResultModal(true)
        }
    }, [brewResult])

    // Load alchemy data on mount
    useEffect(() => {
        if (user) {
            loadAllData(user.id)
        }
    }, [user, loadAllData])

    // Handle wheel scroll for material grid
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const handleWheel = (event: WheelEvent) => {
            if (canvasView !== 'alchemy_workshop') return

            const rect = canvas.getBoundingClientRect()
            const scaleX = canvas.width / rect.width
            const x = (event.clientX - rect.left) * scaleX

            // Check if mouse is over material grid area
            const gridX = canvas.width - 260
            const gridW = 220

            if (x >= gridX && x <= gridX + gridW) {
                event.preventDefault()
                setMaterialScrollOffset((prev) => Math.max(0, prev + event.deltaY * UI.SCROLL_SENSITIVITY))
            }
        }

        canvas.addEventListener('wheel', handleWheel, { passive: false })
        return () => canvas.removeEventListener('wheel', handleWheel)
    }, [canvasView])

    // Main rendering loop - optimized with useCallback
    const render = useCallback(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Resize canvas if needed
        if (canvas.width !== canvas.parentElement?.clientWidth || canvas.height !== canvas.parentElement?.clientHeight) {
            canvas.width = canvas.parentElement?.clientWidth || 800
            canvas.height = canvas.parentElement?.clientHeight || 600
        }

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // Render based on view
        if (canvasView === 'map') {
            renderMapView({ ctx, canvas, images, facilities })
        } else if (canvasView === 'alchemy_workshop') {
            renderAlchemyWorkshop({
                ctx,
                canvas,
                images,
                allRecipes,
                allMaterials,
                playerMaterials,
                selectedRecipeId,
                selectedIngredients,
                isBrewing,
                brewStartTime,
                brewProgress,
                playerAlchemy,
                materialScrollOffset,
                MATERIAL_CELL_SIZE: UI.MATERIAL_CELL_SIZE,
                MATERIAL_GRID_PADDING: UI.MATERIAL_GRID_PADDING
            })
        }
    }, [
        canvasView,
        facilities,
        images,
        allRecipes,
        allMaterials,
        playerMaterials,
        selectedRecipeId,
        selectedIngredients,
        isBrewing,
        brewStartTime,
        brewProgress,
        playerAlchemy,
        materialScrollOffset
    ])

    // Animation frame loop
    useEffect(() => {
        let animationFrameId: number

        const loop = () => {
            render()
            animationFrameId = requestAnimationFrame(loop)
        }

        loop()

        return () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId)
            }
        }
    }, [render])

    return (
        <>
            <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                style={{ width: '100%', height: '100%', display: 'block', cursor: 'pointer' }}
            />
            <AlchemyResultModal
                isOpen={showResultModal}
                success={lastBrewResult.success}
                monsterId={lastBrewResult.monsterId}
                onClose={() => setShowResultModal(false)}
            />
        </>
    )
}
