import { useEffect, useRef, useState, useCallback } from 'react'
import { useGameStore } from '../store/useGameStore'
import { useAlchemyStore } from '../store/useAlchemyStore'
import { useAuth } from '../hooks/useAuth'

import { useUnifiedInventory } from '../hooks/useUnifiedInventory'
import { AlchemyResultModal } from '../ui/alchemy/AlchemyResultModal'
import Shop from '../ui/shop/Shop'
import MonsterFarm from '../ui/monster/MonsterFarm'
import AlchemyWorkshopOverlay from '../ui/alchemy/AlchemyWorkshopOverlay'
import { useCanvasImages } from '../hooks/useCanvasImages'
import { useCanvasClickHandler } from '../hooks/useCanvasClickHandler'
import { useAlchemyContext } from '../hooks/useAlchemyContext'
import { renderMapView } from './renderers/mapRenderer'
import { renderAlchemyWorkshop } from './renderers/alchemyRenderer'
import { renderShopView } from './renderers/shopRenderer'
import { UI, LAYOUT } from '../constants/game'
import DungeonModal from '../ui/dungeon/DungeonModal'
import { MATERIALS } from '../data/alchemyData'
import { isMobileView } from '../utils/responsiveUtils'
import FacilityPage from '../ui/facility/FacilityPage'
import MyPageModal from '../ui/MyPageModal'

/**
 * Optimized GameCanvas Component
 */
interface GameCanvasProps {
    offlineRewards?: {
        claimed: boolean
        rewards: Record<string, number>
        elapsedTime: number
    }
}

export default function GameCanvas(props: GameCanvasProps) {
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
        autoFillIngredients,
        loadAllData,
        playerAlchemy,
        playerRecipes,
        brewResult,
        setAlchemyContext,
    } = useAlchemyStore()

    // 통합 인벤토리 사용 (Single Source of Truth)
    const { materialCounts } = useUnifiedInventory()

    // Advanced Alchemy: Context hook
    const alchemyContext = useAlchemyContext()

    // Phase 3: 오프라인 보상 시스템 (Props로 전달받음)
    // const { claimed, rewards, elapsedTime } = useOfflineRewards(user?.id) // Moved to App.tsx
    const { claimed, rewards, elapsedTime } = props.offlineRewards || { claimed: true, rewards: {}, elapsedTime: 0 }
    const [showOfflineRewardModal, setShowOfflineRewardModal] = useState(false)

    const [showResultModal, setShowResultModal] = useState(false)
    const [lastBrewResult, setLastBrewResult] = useState<{
        success: boolean;
        monsterId?: string;
        itemId?: string; // New
        craftQuantity?: number; // 대용량 제작 수량
        hint?: {
            type: 'INGREDIENT_REVEAL' | 'NEAR_MISS' | 'CONDITION_MISMATCH'
            monsterName?: string
            materialName?: string
            recipeId?: string
            element?: string
            message?: string
            expGain?: number
        }
        expGain?: number
    }>({
        success: false
    })
    const [materialScrollOffset, setMaterialScrollOffset] = useState(0)
    const [mobileTab, setMobileTab] = useState<'recipes' | 'materials' | 'codex'>('recipes') // 모바일 탭 상태
    const [isMobile, setIsMobile] = useState(isMobileView())

    // 반응형 감지
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(isMobileView())
        }
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    // Update alchemy context in store
    useEffect(() => {
        setAlchemyContext(alchemyContext)
    }, [alchemyContext, setAlchemyContext])
    const images = useCanvasImages()

    const [showDungeonModal, setShowDungeonModal] = useState(false)
    const [showMyPageModal, setShowMyPageModal] = useState(false)

    // Optimized click handler
    const baseClickHandler = useCanvasClickHandler({
        canvasView,
        setCanvasView,
        allMaterials,
        selectedIngredients,
        isBrewing,
        removeIngredient,
        setDungeonModalOpen: setShowDungeonModal,
        onOpenMyPage: () => setShowMyPageModal(true)
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
            // LAYOUT 상수에서 탭 위치 가져오기 (중앙 집중식 관리)
            const tabY = LAYOUT.MOBILE_TAB_Y
            const tabHeight = LAYOUT.MOBILE_TAB_HEIGHT
            const tabW = canvas.width / 3 // 3 tabs now

            if (y >= tabY && y <= tabY + tabHeight) {
                if (x < tabW) {
                    setMobileTab('recipes')
                } else if (x < tabW * 2) {
                    setMobileTab('materials')
                } else {
                    setMobileTab('codex')
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
                monsterId: brewResult.monsterId,
                itemId: brewResult.itemId, // New
                craftQuantity: brewResult.craftQuantity, // 대용량 제작 수량
                hint: brewResult.hint,
                expGain: brewResult.expGain
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
        materialScrollOffset,
        mobileTab
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

            {/* Facility UI Overlay */}
            {canvasView === 'facility' && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    zIndex: 2000
                }}>
                    <div style={{ pointerEvents: 'auto', width: '100%', height: '100%' }}>
                        <FacilityPage />
                    </div>
                </div>
            )}

            {/* Alchemy Workshop UI Overlay */}
            {canvasView === 'alchemy_workshop' && (
                <AlchemyWorkshopOverlay
                    recipes={allRecipes}
                    materials={allMaterials}
                    playerMaterials={materialCounts}
                    selectedRecipeId={selectedRecipeId}
                    selectedIngredients={selectedIngredients}
                    isBrewing={isBrewing}
                    onSelectRecipe={(recipeId) => {
                        selectRecipe(recipeId)
                        // 레시피 선택 시 자동으로 재료 배치
                        if (recipeId) {
                            autoFillIngredients(recipeId)
                        }
                    }}
                    onAddIngredient={addIngredient}
                    playerAlchemy={playerAlchemy}
                    playerRecipes={playerRecipes}
                    onStartBrewing={startBrewing}
                    onStartFreeFormBrewing={startFreeFormBrewing}
                    mobileTab={mobileTab}
                    onMobileTabChange={setMobileTab}
                    alchemyContext={alchemyContext}
                />
            )}

            <AlchemyResultModal
                isOpen={showResultModal}
                success={lastBrewResult.success}
                monsterId={lastBrewResult.monsterId}
                itemId={lastBrewResult.itemId} // New
                hint={lastBrewResult.hint}
                expGain={lastBrewResult.expGain}
                craftQuantity={lastBrewResult.craftQuantity} // 대용량 제작 수량
                onClose={() => setShowResultModal(false)}
            />

            <DungeonModal
                isOpen={showDungeonModal}
                onClose={() => setShowDungeonModal(false)}
            />

            {showMyPageModal && (
                <MyPageModal onClose={() => setShowMyPageModal(false)} />
            )}

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
                    zIndex: 1000,
                    padding: isMobile ? '20px' : '0'
                }}>
                    <div style={{
                        background: '#1e293b', // Slate-900
                        border: '2px solid #4a5568', // Slate-600
                        borderRadius: isMobile ? '16px' : '20px',
                        padding: isMobile ? '24px' : '40px',
                        maxWidth: isMobile ? '100%' : '500px',
                        width: isMobile ? '100%' : 'auto',
                        color: '#f1f5f9', // Slate-100
                        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                        textAlign: 'center',
                        maxHeight: isMobile ? '90vh' : 'none',
                        overflowY: isMobile ? 'auto' : 'visible'
                    }}>
                        <h2 style={{
                            margin: '0 0 16px 0',
                            fontSize: isMobile ? '1.5em' : '2em',
                            color: '#fbbf24' // Amber-400 for title
                        }}>오프라인 보상!</h2>
                        <p style={{
                            margin: '0 0 20px 0',
                            fontSize: isMobile ? '1em' : '1.1em',
                            color: '#94a3b8' // Slate-400
                        }}>
                            {Math.floor(elapsedTime / 60)}분 동안 시설이 자원을 생산했습니다!
                        </p>
                        <div style={{
                            background: 'rgba(15, 23, 42, 0.4)', // Slate-950 alpha
                            border: '1px solid #334155', // Slate-700
                            borderRadius: isMobile ? '8px' : '10px',
                            padding: isMobile ? '16px' : '20px',
                            marginBottom: isMobile ? '20px' : '30px'
                        }}>
                            {Object.entries(rewards).map(([materialId, quantity]) => (
                                <div key={materialId} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    padding: isMobile ? '6px 0' : '8px 0',
                                    borderBottom: '1px solid #334155', // Slate-700
                                    fontSize: isMobile ? '0.9em' : '1em',
                                    color: '#e2e8f0' // Slate-200
                                }}>
                                    {/* Material Image */}
                                    <div style={{
                                        width: '28px',
                                        height: '28px',
                                        borderRadius: '4px',
                                        background: '#1e293b',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        overflow: 'hidden',
                                        flexShrink: 0
                                    }}>
                                        {MATERIALS[materialId]?.iconUrl ? (
                                            <img
                                                src={MATERIALS[materialId].iconUrl}
                                                alt={materialId}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'contain'
                                                }}
                                            />
                                        ) : (
                                            <span style={{ fontSize: '14px' }}>📦</span>
                                        )}
                                    </div>
                                    {/* Material Name */}
                                    <span style={{ flex: 1 }}>{MATERIALS[materialId]?.name || materialId}</span>
                                    {/* Quantity */}
                                    <span style={{
                                        fontWeight: 'bold',
                                        color: quantity >= 0 ? '#fbbf24' : '#ef4444'
                                    }}>
                                        {quantity >= 0 ? `+${quantity}` : quantity}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={() => setShowOfflineRewardModal(false)}
                            style={{
                                background: '#3b82f6', // Blue-500
                                color: 'white',
                                border: 'none',
                                borderRadius: isMobile ? '8px' : '10px',
                                padding: isMobile ? '14px 32px' : '15px 40px',
                                minHeight: isMobile ? '48px' : 'auto',
                                fontSize: isMobile ? '1em' : '1.1em',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                transition: 'transform 0.2s',
                                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.05)'
                                e.currentTarget.style.background = '#2563eb' // Blue-600
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)'
                                e.currentTarget.style.background = '#3b82f6' // Blue-500
                            }}
                        >
                            확인
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
