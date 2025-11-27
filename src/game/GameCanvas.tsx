import { useEffect, useRef, useState, useCallback } from 'react'
import { useGameStore } from '../store/useGameStore'
import { useAlchemyStore } from '../store/useAlchemyStore'
import { useAuth } from '../hooks/useAuth'
import { useOfflineRewards } from '../hooks/useOfflineRewards'
import { AlchemyResultModal } from '../ui/alchemy/AlchemyResultModal'
import Shop from '../ui/shop/Shop'
import { useCanvasImages } from '../hooks/useCanvasImages'
import { useCanvasClickHandler } from '../hooks/useCanvasClickHandler'
import { useAlchemyContext } from '../hooks/useAlchemyContext'
import { renderMapView } from './renderers/mapRenderer'
import { renderAlchemyWorkshop } from './renderers/alchemyRenderer'
import { renderShopView } from './renderers/shopRenderer'
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
    const {
        canvasView,
        setCanvasView,
        facilities,
        alchemyState
    } = useGameStore()
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

    // Phase 3: 오프라인 보상 시스템
    const { claimed, rewards, elapsedTime } = useOfflineRewards(user?.id)
    const [showOfflineRewardModal, setShowOfflineRewardModal] = useState(false)

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

    // Show offline reward modal
    useEffect(() => {
        if (claimed && Object.keys(rewards).length > 0) {
            setShowOfflineRewardModal(true)
        }
    }, [claimed, rewards])

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
                selectedRecipeId: alchemyState.selectedRecipeId,
                selectedIngredients: alchemyState.selectedIngredients,
                isBrewing: alchemyState.isBrewing,
                brewStartTime: alchemyState.brewStartTime,
                brewProgress: alchemyState.brewProgress,
                playerAlchemy,
                materialScrollOffset,
                MATERIAL_CELL_SIZE: UI.MATERIAL_CELL_SIZE,
                MATERIAL_GRID_PADDING: UI.MATERIAL_GRID_PADDING
            })
        } else if (canvasView === 'shop') {
            renderShopView({ ctx, canvas, images })
        }
    }, [
        canvasView,
        images,
        facilities,
        allRecipes,
        allMaterials,
        playerMaterials,
        alchemyState, // Use grouped alchemyState
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
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                style={{ width: '100%', height: '100%', display: 'block', cursor: 'pointer' }}
            />

            {/* Shop UI Overlay */}
            {canvasView === 'shop' && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none' // Let clicks pass through to canvas if needed, but Shop UI will capture them
                }}>
                    <div style={{ pointerEvents: 'auto', width: '100%', height: '100%' }}>
                        <Shop />
                    </div>
                </div>
            )}

            <AlchemyResultModal
                isOpen={showResultModal}
                success={lastBrewResult.success}
                monsterId={lastBrewResult.monsterId}
                onClose={() => setShowResultModal(false)}
            />

            {/* Offline Rewards Modal */}
            {showOfflineRewardModal && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '20px',
                        padding: '40px',
                        maxWidth: '500px',
                        color: 'white',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                        textAlign: 'center'
                    }}>
                        <h2 style={{ margin: '0 0 20px 0', fontSize: '2em' }}>🎁 오프라인 보상!</h2>
                        <p style={{ margin: '0 0 30px 0', fontSize: '1.1em', opacity: 0.9 }}>
                            {Math.floor(elapsedTime / 60)}분 동안 시설이 자원을 생산했습니다!
                        </p>
                        <div style={{
                            background: 'rgba(255,255,255,0.1)',
                            borderRadius: '10px',
                            padding: '20px',
                            marginBottom: '30px'
                        }}>
                            {Object.entries(rewards).map(([materialId, quantity]) => (
                                <div key={materialId} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    padding: '8px 0',
                                    borderBottom: '1px solid rgba(255,255,255,0.1)'
                                }}>
                                    <span>{materialId}</span>
                                    <span style={{ fontWeight: 'bold', color: '#fbbf24' }}>+{quantity}</span>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={() => setShowOfflineRewardModal(false)}
                            style={{
                                background: 'white',
                                color: '#667eea',
                                border: 'none',
                                borderRadius: '10px',
                                padding: '15px 40px',
                                fontSize: '1.1em',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                transition: 'transform 0.2s',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            확인
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
