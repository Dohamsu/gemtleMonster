import { useEffect, useRef, useState, useCallback } from 'react'
import { useGameStore } from '../store/useGameStore'
import { useAlchemyStore } from '../store/useAlchemyStore'
import { useAuth } from '../hooks/useAuth'
import { useOfflineRewards } from '../hooks/useOfflineRewards'
import { useUnifiedInventory } from '../hooks/useUnifiedInventory'
import { AlchemyResultModal } from '../ui/alchemy/AlchemyResultModal'
import Shop from '../ui/shop/Shop'
import MonsterFarm from '../ui/monster/MonsterFarm'
import { useCanvasImages } from '../hooks/useCanvasImages'
import { useCanvasClickHandler } from '../hooks/useCanvasClickHandler'
import { useAlchemyContext } from '../hooks/useAlchemyContext'
import { renderMapView } from './renderers/mapRenderer'
import { renderAlchemyWorkshop } from './renderers/alchemyRenderer'
import { renderShopView } from './renderers/shopRenderer'
import { UI } from '../constants/game'
import DungeonModal from '../ui/dungeon/DungeonModal'
import { MATERIALS } from '../data/alchemyData'

/**
 * Optimized GameCanvas Component
 */
export default function GameCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const { user } = useAuth()
    const {
        canvasView,
        setCanvasView,
        facilities
    } = useGameStore()
    const {
        allRecipes,
        allMaterials,
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
        setAlchemyContext,
    } = useAlchemyStore()

    // 통합 인벤토리 사용 (Single Source of Truth)
    const { materialCounts } = useUnifiedInventory()

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
    const [mobileTab, setMobileTab] = useState<'recipes' | 'materials'>('recipes') // 모바일 탭 상태

    // Update alchemy context in store
    useEffect(() => {
        setAlchemyContext(alchemyContext)
    }, [alchemyContext, setAlchemyContext])
    const images = useCanvasImages()

    const [showDungeonModal, setShowDungeonModal] = useState(false)

    // Optimized click handler
    const baseClickHandler = useCanvasClickHandler({
        canvasView,
        setCanvasView,
        allRecipes,
        allMaterials,
        playerMaterials: materialCounts, // useUnifiedInventory의 materialCounts 사용
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
        autoFillIngredients,
        setDungeonModalOpen: setShowDungeonModal, // Pass setter
    })

    // 모바일 탭 클릭 처리를 위한 래퍼
    const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = event.currentTarget
        const rect = canvas.getBoundingClientRect()
        const scaleX = canvas.width / rect.width
        const scaleY = canvas.height / rect.height
        const x = (event.clientX - rect.left) * scaleX
        const y = (event.clientY - rect.top) * scaleY

        // 연금술 화면이고 모바일 레이아웃일 때 탭 클릭 처리
        if (canvasView === 'alchemy_workshop' && canvas.width <= 768) {
            const tabY = 60
            const tabHeight = 50
            const tabW = canvas.width / 2

            if (y >= tabY && y <= tabY + tabHeight) {
                if (x < tabW) {
                    setMobileTab('recipes')
                } else {
                    setMobileTab('materials')
                }
                return
            }
        }

        // 기존 클릭 핸들러 호출
        baseClickHandler(event)
    }, [canvasView, baseClickHandler, setMobileTab])

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
                playerMaterials: materialCounts, // useUnifiedInventory의 materialCounts 사용
                selectedRecipeId,
                selectedIngredients,
                isBrewing,
                brewStartTime,
                brewProgress,
                playerAlchemy,
                materialScrollOffset,
                MATERIAL_CELL_SIZE: UI.MATERIAL_CELL_SIZE,
                MATERIAL_GRID_PADDING: UI.MATERIAL_GRID_PADDING,
                mobileTab // 모바일 탭 상태 전달
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
        materialCounts, // playerMaterials 대신 materialCounts 사용
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
                    pointerEvents: 'none'
                }}>
                    <div style={{ pointerEvents: 'auto', width: '100%', height: '100%' }}>
                        <Shop />
                    </div>
                </div>
            )}

            {/* Monster Farm UI Overlay */}
            {canvasView === 'monster_farm' && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none'
                }}>
                    <div style={{ pointerEvents: 'auto', width: '100%', height: '100%' }}>
                        <MonsterFarm />
                    </div>
                </div>
            )}

            <AlchemyResultModal
                isOpen={showResultModal}
                success={lastBrewResult.success}
                monsterId={lastBrewResult.monsterId}
                onClose={() => setShowResultModal(false)}
            />

            <DungeonModal
                isOpen={showDungeonModal}
                onClose={() => setShowDungeonModal(false)}
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
                                    <span>{MATERIALS[materialId]?.name || materialId}</span>
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
