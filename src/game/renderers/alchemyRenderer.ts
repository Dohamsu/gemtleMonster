/**
 * 연금술 공방 렌더러 - 반응형 구현
 * 
 * [반응형 구현 방식]
 * 1. 레이아웃 감지: getAlchemyLayout()을 통해 캔버스 크기 기반으로 모바일/데스크톱 판별
 *    - 모바일: 캔버스 너비 <= 768px
 *    - 데스크톱: 캔버스 너비 > 768px
 * 
 * 2. 레이아웃 분기:
 *    - 모바일: 탭 기반 UI (레시피/재료 탭 전환), 세로 레이아웃
 *    - 데스크톱: 좌우 패널 레이아웃 (레시피 왼쪽, 재료 오른쪽)
 * 
 * 3. 모바일 최적화:
 *    - 터치 친화적 크기 (재료 셀 60px, 슬롯 50px)
 *    - 탭 전환으로 화면 공간 효율화
 *    - 세로 스크롤 지원
 *    - 작은 폰트 및 간격 조정
 * 
 * 4. 동적 크기 조정:
 *    - 모든 UI 요소는 캔버스 크기에 따라 동적으로 계산됨
 *    - responsiveUtils.ts의 getAlchemyLayout()에서 중앙 집중식 레이아웃 관리
 *    - constants/game.ts의 LAYOUT 상수로 공통 값 관리
 */

import type { CanvasImages } from '../../hooks/useCanvasImages'
import type { Recipe, Material, PlayerAlchemy } from '../../lib/alchemyApi'
import { ALCHEMY, LAYOUT } from '../../constants/game'
import { getAlchemyLayout } from '../../utils/responsiveUtils'

import type { AlchemyLayoutParams } from '../../utils/responsiveUtils'

interface AlchemyRendererProps {
    ctx: CanvasRenderingContext2D
    canvas: HTMLCanvasElement
    images: CanvasImages
    allRecipes: Recipe[]
    allMaterials: Material[]
    playerMaterials: Record<string, number>
    selectedRecipeId: string | null
    selectedIngredients: Record<string, number>
    isBrewing: boolean
    brewStartTime: number | null
    brewProgress: number
    playerAlchemy: PlayerAlchemy | null
    materialScrollOffset: number
    MATERIAL_CELL_SIZE: number
    MATERIAL_GRID_PADDING: number
    mobileTab?: 'recipes' | 'materials' // 모바일 탭 상태
}

// Helper function for rarity colors
function getRarityColor(rarity: string): string {
    switch (rarity.toUpperCase()) {
        case 'COMMON':
            return '#9ca3af'
        case 'UNCOMMON':
            return '#22c55e'
        case 'RARE':
            return '#3b82f6'
        case 'EPIC':
            return '#a855f7'
        case 'LEGENDARY':
            return '#eab308'
        default:
            return '#9ca3af'
    }
}

// Icon mapping for material families
const ICON_MAP: Record<string, string> = {
    PLANT: '🌿',
    MINERAL: '💎',
    BEAST: '🦴',
    SLIME: '🟢',
    SPIRIT: '✨'
}

/**
 * 연금술 공방 메인 렌더링 함수
 * 
 * [반응형 레이아웃 분기 로직]
 * 1. getAlchemyLayout()으로 현재 캔버스 크기에 맞는 레이아웃 파라미터 획득
 * 2. layout.isMobile 플래그로 모바일/데스크톱 렌더링 분기
 * 
 * [모바일 레이아웃 특징]
 * - 탭 기반 UI: 레시피와 재료를 탭으로 전환하여 표시
 * - 세로 배치: 가마솥 → 재료 슬롯 → 탭 컨텐츠 → 버튼 → XP바
 * - props.mobileTab으로 현재 활성 탭 제어 ('recipes' | 'materials')
 * 
 * [데스크톱 레이아웃 특징]
 * - 좌우 패널: 레시피(왼쪽), 재료(오른쪽)
 * - 중앙 배치: 가마솥과 재료 슬롯이 화면 중앙에 위치
 * - 모든 정보 동시 표시
 */
export function renderAlchemyWorkshop(props: AlchemyRendererProps) {
    const { ctx, canvas } = props
    // 반응형 레이아웃 파라미터 계산 (캔버스 크기 기반)
    const layout = getAlchemyLayout(canvas.width, canvas.height)

    // 배경 렌더링
    ctx.fillStyle = '#2a1810'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    if (layout.isMobile) {
        // ===== 모바일 레이아웃 =====
        // 탭 기반 UI로 레시피/재료를 전환하여 표시
        renderBackButton(ctx)
        renderTitle(ctx, canvas)
        renderMobileTabs(ctx, canvas, props.mobileTab || 'recipes') // 탭 UI 렌더링
        renderCentralCauldronMobile(ctx, canvas, props.images, layout) // 작은 가마솥
        renderIngredientSlotsMobile(ctx, canvas, props, layout) // 작은 재료 슬롯

        // 현재 활성 탭에 따라 레시피 또는 재료 그리드 표시
        // 한 번에 하나의 패널만 표시하여 화면 공간 절약
        if (props.mobileTab === 'materials') {
            renderMaterialGridMobile(ctx, canvas, props, layout)
        } else {
            renderRecipeListMobile(ctx, canvas, props, layout)
        }

        renderBrewButtonMobile(ctx, canvas, props, layout)
        renderXPBarMobile(ctx, canvas, props.playerAlchemy, layout)
    } else {
        // ===== 데스크톱 레이아웃 =====
        // 모든 패널을 동시에 표시하는 전통적인 레이아웃
        renderBackButton(ctx)
        renderTitle(ctx, canvas)
        renderCentralCauldron(ctx, canvas, props.images) // 큰 가마솥 (중앙)
        renderIngredientSlots(ctx, canvas, props) // 재료 슬롯 (가마솥 아래)
        renderRecipeList(ctx, canvas, props) // 레시피 목록 (왼쪽 패널)
        renderMaterialGrid(ctx, canvas, props) // 재료 그리드 (오른쪽 패널)
        renderBrewButton(ctx, canvas, props)
        renderXPBar(ctx, canvas, props.playerAlchemy)
    }

    // 텍스트 정렬 초기화 (다른 렌더링에 영향 방지)
    ctx.textAlign = 'left'
    ctx.textBaseline = 'alphabetic'
}

function renderBackButton(ctx: CanvasRenderingContext2D) {
    const backBtnX = 20
    const backBtnY = 20
    const backBtnW = 100
    const backBtnH = 40

    ctx.fillStyle = '#4a3020'
    ctx.fillRect(backBtnX, backBtnY, backBtnW, backBtnH)
    ctx.strokeStyle = '#8a6040'
    ctx.lineWidth = 2
    ctx.strokeRect(backBtnX, backBtnY, backBtnW, backBtnH)

    ctx.fillStyle = 'white'
    ctx.font = 'bold 16px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('← 돌아가기', backBtnX + backBtnW / 2, backBtnY + backBtnH / 2)
}

function renderTitle(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    ctx.fillStyle = '#f0d090'
    ctx.font = 'bold 32px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('🧪 연금술 공방', canvas.width / 2, 60)
}

function renderCentralCauldron(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    images: CanvasImages
) {
    const cauldronX = canvas.width / 2 - 100
    const cauldronY = canvas.height / 2 - 100
    const cauldronSize = 200

    // Cauldron circle background
    ctx.fillStyle = '#1a1410'
    ctx.beginPath()
    ctx.arc(cauldronX + cauldronSize / 2, cauldronY + cauldronSize / 2, cauldronSize / 2, 0, Math.PI * 2)
    ctx.fill()

    ctx.strokeStyle = '#6a4020'
    ctx.lineWidth = 4
    ctx.stroke()

    // Cauldron image or emoji
    if (images.cauldron_pixel) {
        const imgSize = 128
        ctx.drawImage(
            images.cauldron_pixel,
            cauldronX + cauldronSize / 2 - imgSize / 2,
            cauldronY + cauldronSize / 2 - imgSize / 2,
            imgSize,
            imgSize
        )
    } else {
        ctx.font = 'bold 80px Arial'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('🍯', cauldronX + cauldronSize / 2, cauldronY + cauldronSize / 2)
    }
}

function renderIngredientSlots(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    props: AlchemyRendererProps
) {
    const { allRecipes, allMaterials, selectedRecipeId, selectedIngredients } = props

    const slotSize = 60
    const slotGap = 10
    const cauldronSize = 200
    const cauldronY = canvas.height / 2 - 100
    const totalSlotsWidth = slotSize * ALCHEMY.MAX_INGREDIENT_SLOTS + slotGap * (ALCHEMY.MAX_INGREDIENT_SLOTS - 1)
    const slotsX = canvas.width / 2 - totalSlotsWidth / 2
    const slotsY = cauldronY + cauldronSize + 20

    // Get required amounts from selected recipe
    const selectedRecipe = allRecipes.find((r) => r.id === selectedRecipeId)
    const requiredMap: Record<string, number> = {}
    if (selectedRecipe && selectedRecipe.ingredients) {
        selectedRecipe.ingredients.forEach((ing) => {
            requiredMap[ing.material_id] = ing.quantity
        })
    }

    const ingredientEntries = Object.entries(selectedIngredients)

    for (let i = 0; i < ALCHEMY.MAX_INGREDIENT_SLOTS; i++) {
        const slotX = slotsX + i * (slotSize + slotGap)

        // Draw slot background
        ctx.fillStyle = '#2a2520'
        ctx.fillRect(slotX, slotsY, slotSize, slotSize)
        ctx.strokeStyle = '#7a5040'
        ctx.lineWidth = 2
        ctx.strokeRect(slotX, slotsY, slotSize, slotSize)

        // Render ingredient if present
        if (i < ingredientEntries.length) {
            const [materialId, quantity] = ingredientEntries[i]
            const material = allMaterials.find((m) => m.id === materialId)

            if (material) {
                // Material icon
                const materialImage = props.images.materials[material.id]
                if (materialImage) {
                    const iconSize = slotSize * 0.6
                    ctx.drawImage(
                        materialImage,
                        slotX + slotSize / 2 - iconSize / 2,
                        slotsY + slotSize / 2 - iconSize / 2 - 5,
                        iconSize,
                        iconSize
                    )
                } else {
                    ctx.fillStyle = '#f0d090'
                    ctx.font = '32px Arial'
                    ctx.textAlign = 'center'
                    ctx.textBaseline = 'middle'
                    ctx.fillText(ICON_MAP[material.family] || '❓', slotX + slotSize / 2, slotsY + slotSize / 2 - 5)
                }

                // Quantity badge
                ctx.fillStyle = '#1a1a1a'
                ctx.fillRect(slotX + slotSize - 18, slotsY + slotSize - 14, 16, 12)
                ctx.fillStyle = '#facc15'
                ctx.font = 'bold 9px Arial'
                ctx.fillText(quantity.toString(), slotX + slotSize - 10, slotsY + slotSize - 6)

                // Show warning if insufficient
                const requiredQty = requiredMap[materialId] || 0
                if (quantity < requiredQty) {
                    ctx.fillStyle = 'rgba(255,0,0,0.6)'
                    ctx.fillRect(slotX, slotsY, slotSize, slotSize)
                    ctx.fillStyle = '#fff'
                    ctx.font = 'bold 12px Arial'
                    ctx.fillText(`${quantity}/${requiredQty}`, slotX + slotSize / 2, slotsY + slotSize / 2)
                }
            }
        } else {
            // Empty slot
            ctx.fillStyle = '#666'
            ctx.font = '24px Arial'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText('+', slotX + slotSize / 2, slotsY + slotSize / 2)
        }
    }
}

function renderRecipeList(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    props: AlchemyRendererProps
) {
    const { allRecipes, allMaterials, playerMaterials, selectedRecipeId, isBrewing } = props

    const recipeX = 40
    const recipeY = 120
    const recipeW = 220
    const recipeH = canvas.height - 160

    // Panel background
    ctx.fillStyle = '#3a2520'
    ctx.fillRect(recipeX, recipeY, recipeW, recipeH)
    ctx.strokeStyle = '#7a5040'
    ctx.lineWidth = 2
    ctx.strokeRect(recipeX, recipeY, recipeW, recipeH)

    // Title
    ctx.fillStyle = '#f0d090'
    ctx.font = 'bold 18px Arial'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillText('📜 레시피', recipeX + 10, recipeY + 10)

    // Dim entire list if brewing
    if (isBrewing) {
        ctx.globalAlpha = 0.4
    }

    const visibleRecipes = allRecipes.filter((r) => !r.is_hidden)
    const recipePadding = 5
    let currentY = recipeY + 40

    visibleRecipes.forEach((recipe) => {
        const itemHeight = 30 + (recipe.ingredients?.length || 0) * 15 + 10
        const isSelected = selectedRecipeId === recipe.id

        // Check if player has all materials
        const hasAllMaterials =
            recipe.ingredients?.every((ing) => (playerMaterials[ing.material_id] || 0) >= ing.quantity) ?? true

        // Dim if insufficient materials
        if (!hasAllMaterials) {
            ctx.globalAlpha = 0.3 // More dimmed
            ctx.fillStyle = '#2a201a' // Darker background
        } else {
            ctx.fillStyle = isSelected ? '#5a4030' : '#4a3020'
        }
        ctx.fillRect(recipeX + 5, currentY, recipeW - 10, itemHeight)

        // Selection border
        if (isSelected) {
            ctx.strokeStyle = '#facc15'
            ctx.lineWidth = 2
            ctx.strokeRect(recipeX + 5, currentY, recipeW - 10, itemHeight)
        }

        // Recipe name
        ctx.fillStyle = '#f0d090'
        ctx.font = 'bold 14px Arial'
        ctx.fillText(`${recipe.name} (${recipe.craft_time_sec}s)`, recipeX + 10, currentY + 8)

        // Required materials
        if (recipe.ingredients) {
            recipe.ingredients.forEach((ing, idx) => {
                const mat = allMaterials.find((m) => m.id === ing.material_id)
                const owned = playerMaterials[ing.material_id] || 0
                const hasEnough = owned >= ing.quantity
                const yPos = currentY + 28 + idx * 15

                ctx.fillStyle = hasEnough ? '#aaa' : '#ff6666'
                ctx.font = '11px Arial'
                ctx.fillText(`${mat?.name || ing.material_id} ${owned}/${ing.quantity}`, recipeX + 10, yPos, recipeW - 20)
            })
        }

        // Reset alpha (maintain brewing dimming)
        if (!isBrewing) {
            ctx.globalAlpha = 1.0
        }

        currentY += itemHeight + recipePadding
    })

    ctx.globalAlpha = 1.0
}

function renderMaterialGrid(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    props: AlchemyRendererProps
) {
    const {
        allMaterials,
        playerMaterials,
        selectedIngredients,
        isBrewing,
        materialScrollOffset,
        MATERIAL_CELL_SIZE: gridCellSize,
        MATERIAL_GRID_PADDING: gridPadding
    } = props

    const invX = canvas.width - 260
    const invY = 120
    const invW = 220
    const invH = canvas.height - 160

    // Panel background
    ctx.fillStyle = '#3a2520'
    ctx.fillRect(invX, invY, invW, invH)
    ctx.strokeStyle = '#7a5040'
    ctx.lineWidth = 2
    ctx.strokeRect(invX, invY, invW, invH)

    // Title
    ctx.fillStyle = '#f0d090'
    ctx.font = 'bold 18px Arial'
    ctx.textAlign = 'left'
    ctx.fillText('🎒 보유 재료', invX + 10, invY + 10)

    const gridCols = Math.floor(invW / (gridCellSize + gridPadding))

    // Dim if brewing
    if (isBrewing) {
        ctx.globalAlpha = 0.4
    }

    // Clip to panel area
    ctx.save()
    ctx.beginPath()
    ctx.rect(invX, invY, invW, invH)
    ctx.clip()

    // Render material grid
    let gridStartY = invY + 40 - materialScrollOffset
    // LAYOUT 상수에서 최대 행 수 가져오기
    const MAX_ROWS = LAYOUT.MAX_MATERIAL_ROWS
    allMaterials.forEach((material, index) => {
        const col = index % gridCols
        const row = Math.floor(index / gridCols)

        // 최대 4줄까지만 렌더링 (row는 0부터 시작하므로 row >= 4이면 스킵)
        if (row >= MAX_ROWS) return

        const cellX = invX + col * (gridCellSize + gridPadding) + gridPadding
        const cellY = gridStartY + row * (gridCellSize + gridPadding) + gridPadding

        // Skip if not visible
        if (cellY + gridCellSize < invY + 40 || cellY > invY + invH) return

        const count = playerMaterials[material.id] || 0
        const rarityColor = getRarityColor(material.rarity)

        // Dim if no stock
        ctx.globalAlpha = count > 0 ? 1 : 0.3

        // Cell background
        ctx.fillStyle = '#2a2520'
        ctx.fillRect(cellX, cellY, gridCellSize, gridCellSize)

        // Border (highlight if selected)
        const isSelected = selectedIngredients[material.id] > 0
        ctx.lineWidth = isSelected ? 4 : 2
        ctx.strokeStyle = isSelected ? '#fbbf24' : rarityColor
        ctx.strokeRect(cellX, cellY, gridCellSize, gridCellSize)

        // Material icon
        const materialImage = props.images.materials[material.id]
        if (materialImage) {
            const iconSize = gridCellSize * 0.6
            ctx.drawImage(
                materialImage,
                cellX + gridCellSize / 2 - iconSize / 2,
                cellY + gridCellSize / 2 - iconSize / 2 - 5,
                iconSize,
                iconSize
            )
        } else {
            ctx.fillStyle = '#f0d090'
            ctx.font = '24px Arial'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(ICON_MAP[material.family] || '❓', cellX + gridCellSize / 2, cellY + gridCellSize / 2 - 5)
        }

        // Quantity badge
        if (count > 0) {
            ctx.fillStyle = '#1a1a1a'
            ctx.fillRect(cellX + gridCellSize - 18, cellY + 2, 16, 12)

            ctx.fillStyle = '#facc15'
            ctx.font = 'bold 9px Arial'
            ctx.textAlign = 'center'
            ctx.fillText(count.toString(), cellX + gridCellSize - 10, cellY + 10)
        }

        // Material name
        ctx.fillStyle = '#f0d090'
        ctx.font = '9px Arial'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'bottom'
        const displayName = material.name.length > 8 ? material.name.substring(0, 7) + '...' : material.name
        ctx.fillText(displayName, cellX + gridCellSize / 2, cellY + gridCellSize - 2)

        // Reset alpha (maintain brewing dimming)
        ctx.globalAlpha = isBrewing ? 0.4 : 1
    })

    ctx.restore()
    ctx.globalAlpha = 1.0
}

function renderBrewButton(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    props: AlchemyRendererProps
) {
    const { allRecipes, playerMaterials, selectedRecipeId, selectedIngredients, isBrewing, brewProgress, playerAlchemy } = props

    const brewBtnW = 180
    const brewBtnH = 50
    const brewBtnX = canvas.width / 2 - brewBtnW / 2
    const brewBtnY = canvas.height - 140

    if (isBrewing) {
        // Progress bar
        ctx.fillStyle = '#3a2a20'
        ctx.fillRect(brewBtnX, brewBtnY, brewBtnW, brewBtnH)
        ctx.strokeStyle = '#7a5a40'
        ctx.lineWidth = 3
        ctx.strokeRect(brewBtnX, brewBtnY, brewBtnW, brewBtnH)

        // Use brewProgress from store (works for both recipe and free-form brewing)
        const progressW = (brewBtnW - 10) * brewProgress
        ctx.fillStyle = '#facc15'
        ctx.fillRect(brewBtnX + 5, brewBtnY + 5, progressW, brewBtnH - 10)

        ctx.fillStyle = '#fff'
        ctx.font = 'bold 18px Arial'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(`⚗️ 제조 중... ${Math.floor(brewProgress * 100)}%`, brewBtnX + brewBtnW / 2, brewBtnY + brewBtnH / 2)
    } else {
        // 자유 조합 모드 지원: 재료가 있으면 조합 가능
        const hasIngredients = Object.values(selectedIngredients).some(count => count > 0)
        const selectedRecipe = allRecipes.find((r) => r.id === selectedRecipeId)
        let hasMaterials = false
        let hasLevel = true // 자유 조합은 레벨 제한 없음

        // 레시피가 선택된 경우 기존 검증 로직 사용
        if (selectedRecipe && selectedRecipe.ingredients) {
            hasMaterials = selectedRecipe.ingredients.every((ing) => (playerMaterials[ing.material_id] || 0) >= ing.quantity)
            hasLevel = (playerAlchemy?.level || 1) >= selectedRecipe.required_alchemy_level
        }

        // 레시피 선택 OR 재료 추가 시 활성화
        const isEnabled = (selectedRecipe && hasMaterials && hasLevel) || (!selectedRecipe && hasIngredients)

        ctx.fillStyle = isEnabled ? '#5a3a20' : '#3a2520'
        ctx.fillRect(brewBtnX, brewBtnY, brewBtnW, brewBtnH)
        ctx.strokeStyle = isEnabled ? '#9a6a40' : '#5a4030'
        ctx.lineWidth = 3
        ctx.strokeRect(brewBtnX, brewBtnY, brewBtnW, brewBtnH)

        ctx.fillStyle = isEnabled ? '#f0d090' : '#666'
        ctx.font = 'bold 20px Arial'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        let btnText = '🧪 연금술 시작'
        if (selectedRecipe && !hasLevel) btnText = `Lv.${selectedRecipe.required_alchemy_level} 필요`
        else if (selectedRecipe && !hasMaterials) btnText = '재료 부족'
        else if (!selectedRecipe && !hasIngredients) btnText = '재료를 추가하세요'

        ctx.fillText(btnText, brewBtnX + brewBtnW / 2, brewBtnY + brewBtnH / 2)
    }
}

function renderXPBar(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, playerAlchemy: PlayerAlchemy | null) {
    if (!playerAlchemy) return

    const brewBtnY = canvas.height - 140
    const xpBarY = brewBtnY + 65
    const xpBarW = 300
    const xpBarH = 30
    const xpBarX = canvas.width / 2 - xpBarW / 2

    // Background
    ctx.fillStyle = '#2a1a10'
    ctx.fillRect(xpBarX, xpBarY, xpBarW, xpBarH)
    ctx.strokeStyle = '#6a4a30'
    ctx.lineWidth = 2
    ctx.strokeRect(xpBarX, xpBarY, xpBarW, xpBarH)

    // XP Progress
    const currentLevelExp = playerAlchemy.experience % ALCHEMY.XP_PER_LEVEL
    const expProgress = currentLevelExp / ALCHEMY.XP_PER_LEVEL
    const progressWidth = (xpBarW - 6) * expProgress

    ctx.fillStyle = '#facc15'
    ctx.fillRect(xpBarX + 3, xpBarY + 3, progressWidth, xpBarH - 6)

    // Text
    ctx.fillStyle = '#f0d090'
    ctx.font = 'bold 14px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(
        `연금술 Lv.${playerAlchemy.level} [${currentLevelExp}/${ALCHEMY.XP_PER_LEVEL} XP]`,
        xpBarX + xpBarW / 2,
        xpBarY + xpBarH / 2
    )
}

// ============================================
// 모바일 전용 렌더링 함수들
// ============================================
// 모바일 환경에서는 화면 크기가 제한적이므로:
// 1. 탭 UI로 레시피/재료를 분리하여 표시
// 2. 터치 친화적인 크기 사용 (셀 60px, 슬롯 50px)
// 3. 폰트 크기 축소 및 간격 조정
// 4. 레이아웃 파라미터는 responsiveUtils.ts에서 계산됨
// ============================================

/**
 * 모바일 탭 UI 렌더링
 * 
 * [모바일 탭 전환 메커니즘]
 * - 화면을 좌우 2개 탭으로 분할 (레시피 / 재료)
 * - activeTab 파라미터로 현재 활성 탭 표시
 * - 활성 탭: 밝은 배경 + 노란색 테두리 (강조)
 * - 비활성 탭: 어두운 배경 + 회색 텍스트
 * 
 * [탭 클릭 처리]
 * - 클릭 이벤트는 useCanvasClickHandler.ts에서 처리
 * - 탭 영역 클릭 시 mobileTab 상태 변경
 */
function renderMobileTabs(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, activeTab: 'recipes' | 'materials') {
    // LAYOUT 상수에서 탭 위치 가져오기 (중앙 집중식 관리)
    const tabY = LAYOUT.MOBILE_TAB_Y
    const tabHeight = LAYOUT.MOBILE_TAB_HEIGHT
    const tabW = canvas.width / 2 // 화면을 정확히 반으로 분할

    // ===== 레시피 탭 렌더링 =====
    // 활성 상태에 따라 배경색과 테두리 스타일 변경
    ctx.fillStyle = activeTab === 'recipes' ? '#5a4030' : '#3a2520'
    ctx.fillRect(0, tabY, tabW, tabHeight)
    ctx.strokeStyle = activeTab === 'recipes' ? '#facc15' : '#7a5040' // 활성: 노란색, 비활성: 갈색
    ctx.lineWidth = activeTab === 'recipes' ? 3 : 2
    ctx.strokeRect(0, tabY, tabW, tabHeight)

    ctx.fillStyle = activeTab === 'recipes' ? '#f0d090' : '#999' // 활성: 밝은색, 비활성: 회색
    ctx.font = 'bold 18px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('📜 레시피', tabW / 2, tabY + tabHeight / 2)

    // ===== 재료 탭 렌더링 =====
    ctx.fillStyle = activeTab === 'materials' ? '#5a4030' : '#3a2520'
    ctx.fillRect(tabW, tabY, tabW, tabHeight)
    ctx.strokeStyle = activeTab === 'materials' ? '#facc15' : '#7a5040'
    ctx.lineWidth = activeTab === 'materials' ? 3 : 2
    ctx.strokeRect(tabW, tabY, tabW, tabHeight)

    ctx.fillStyle = activeTab === 'materials' ? '#f0d090' : '#999'
    ctx.fillText('🎒 재료', tabW + tabW / 2, tabY + tabHeight / 2)
}

/**
 * 모바일용 가마솥 렌더링
 * 
 * [모바일 최적화]
 * - 크기: 120px (데스크톱 200px 대비 축소)
 * - 위치: 탭 아래, 화면 중앙 정렬
 * - 이미지 크기: 가마솥 크기의 65% (비율 유지)
 * - 레이아웃 파라미터는 responsiveUtils.ts에서 계산됨
 */
function renderCentralCauldronMobile(
    ctx: CanvasRenderingContext2D,
    _canvas: HTMLCanvasElement,
    images: CanvasImages,
    layout: AlchemyLayoutParams
) {
    // 레이아웃에서 계산된 가마솥 위치 및 크기 사용
    const { cauldronX, cauldronY, cauldronSize } = layout

    // 가마솥 원형 배경
    ctx.fillStyle = '#1a1410'
    ctx.beginPath()
    ctx.arc(cauldronX + cauldronSize / 2, cauldronY + cauldronSize / 2, cauldronSize / 2, 0, Math.PI * 2)
    ctx.fill()

    // 테두리 (모바일에서는 약간 얇게)
    ctx.strokeStyle = '#6a4020'
    ctx.lineWidth = 3
    ctx.stroke()

    // 가마솥 이미지 또는 이모지 렌더링
    if (images.cauldron_pixel) {
        // 이미지 크기를 가마솥 크기에 비례하여 조정
        const imgSize = cauldronSize * 0.65
        ctx.drawImage(
            images.cauldron_pixel,
            cauldronX + cauldronSize / 2 - imgSize / 2,
            cauldronY + cauldronSize / 2 - imgSize / 2,
            imgSize,
            imgSize
        )
    } else {
        // 폴백: 이모지 사용 (크기 동적 조정)
        ctx.font = `bold ${cauldronSize * 0.5}px Arial`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('🍯', cauldronX + cauldronSize / 2, cauldronY + cauldronSize / 2)
    }
}

/**
 * 모바일용 재료 슬롯 렌더링
 * 
 * [모바일 최적화]
 * - 슬롯 크기: 50px (데스크톱 60px 대비 축소)
 * - 간격: 8px (터치 오류 방지)
 * - 위치: 가마솥 바로 아래, 중앙 정렬
 * - 아이콘 크기: 슬롯의 60%
 * - 수량 배지: 작은 폰트 (8px)
 * 
 * [재료 부족 표시]
 * - 레시피 선택 시 필요 수량과 현재 수량 비교
 * - 부족한 경우 빨간색 오버레이 표시
 */
function renderIngredientSlotsMobile(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    props: AlchemyRendererProps,
    layout: any
) {
    const { allRecipes, allMaterials, selectedRecipeId, selectedIngredients, images } = props
    const { slotSize, slotGap, cauldronY, cauldronSize } = layout

    // 슬롯 전체 너비 계산 및 중앙 정렬
    const totalSlotsWidth = slotSize * ALCHEMY.MAX_INGREDIENT_SLOTS + slotGap * (ALCHEMY.MAX_INGREDIENT_SLOTS - 1)
    const slotsX = canvas.width / 2 - totalSlotsWidth / 2
    const slotsY = cauldronY + cauldronSize + 15 // 가마솥 아래 15px 간격

    // 선택된 레시피의 필요 재료 수량 맵 생성
    const selectedRecipe = allRecipes.find((r) => r.id === selectedRecipeId)
    const requiredMap: Record<string, number> = {}
    if (selectedRecipe && selectedRecipe.ingredients) {
        selectedRecipe.ingredients.forEach((ing) => {
            requiredMap[ing.material_id] = ing.quantity
        })
    }

    const ingredientEntries = Object.entries(selectedIngredients)

    // 최대 슬롯 개수만큼 렌더링 (ALCHEMY.MAX_INGREDIENT_SLOTS)
    for (let i = 0; i < ALCHEMY.MAX_INGREDIENT_SLOTS; i++) {
        const slotX = slotsX + i * (slotSize + slotGap)

        // 슬롯 배경 렌더링
        ctx.fillStyle = '#2a2520'
        ctx.fillRect(slotX, slotsY, slotSize, slotSize)
        ctx.strokeStyle = '#7a5040'
        ctx.lineWidth = 2
        ctx.strokeRect(slotX, slotsY, slotSize, slotSize)

        // 재료가 있는 경우 렌더링
        if (i < ingredientEntries.length) {
            const [materialId, quantity] = ingredientEntries[i]
            const material = allMaterials.find((m) => m.id === materialId)

            if (material) {
                // 재료 아이콘 렌더링 (이미지 또는 이모지)
                const materialImage = images.materials[material.id]
                if (materialImage) {
                    const iconSize = slotSize * 0.6
                    ctx.drawImage(
                        materialImage,
                        slotX + slotSize / 2 - iconSize / 2,
                        slotsY + slotSize / 2 - iconSize / 2 - 3,
                        iconSize,
                        iconSize
                    )
                } else {
                    // 폴백: 패밀리 이모지 사용
                    ctx.fillStyle = '#f0d090'
                    ctx.font = '28px Arial'
                    ctx.textAlign = 'center'
                    ctx.textBaseline = 'middle'
                    ctx.fillText(ICON_MAP[material.family] || '❓', slotX + slotSize / 2, slotsY + slotSize / 2 - 3)
                }

                // 수량 배지 (우측 하단)
                ctx.fillStyle = '#1a1a1a'
                ctx.fillRect(slotX + slotSize - 16, slotsY + slotSize - 12, 14, 10)
                ctx.fillStyle = '#facc15'
                ctx.font = 'bold 8px Arial'
                ctx.fillText(quantity.toString(), slotX + slotSize - 9, slotsY + slotSize - 5)

                // 재료 부족 경고 표시 (빨간색 오버레이)
                const requiredQty = requiredMap[materialId] || 0
                if (quantity < requiredQty) {
                    ctx.fillStyle = 'rgba(255,0,0,0.5)'
                    ctx.fillRect(slotX, slotsY, slotSize, slotSize)
                }
            }
        } else {
            // 빈 슬롯 표시
            ctx.fillStyle = '#666'
            ctx.font = '20px Arial'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText('+', slotX + slotSize / 2, slotsY + slotSize / 2)
        }
    }
}

/**
 * 모바일용 레시피 목록 렌더링
 * 
 * [모바일 레이아웃 특징]
 * - 위치: 탭 컨텐츠 영역 (레시피 탭 활성화 시 표시)
 * - 크기: 화면 너비 - 40px (좌우 20px 여백)
 * - 폰트: 13px (데스크톱 14px 대비 축소)
 * - 재료 정보 폰트: 10px (데스크톱 11px 대비 축소)
 * 
 * [스크롤 지원]
 * - 클리핑 영역 설정으로 패널 밖 내용 숨김
 * - 세로 스크롤은 useCanvasClickHandler.ts에서 처리
 * 
 * [상태 표시]
 * - 선택된 레시피: 밝은 배경 + 노란색 테두리
 * - 재료 부족: 어두운 배경 + 투명도 0.3
 * - 제조 중: 전체 목록 투명도 0.4
 */
function renderRecipeListMobile(
    ctx: CanvasRenderingContext2D,
    _canvas: HTMLCanvasElement,
    props: AlchemyRendererProps,
    layout: AlchemyLayoutParams
) {
    const { allRecipes, allMaterials, playerMaterials, selectedRecipeId, isBrewing } = props
    const { recipeX, recipeY, recipeW, recipeH } = layout

    // 패널 배경 렌더링
    ctx.fillStyle = '#3a2520'
    ctx.fillRect(recipeX, recipeY, recipeW, recipeH)
    ctx.strokeStyle = '#7a5040'
    ctx.lineWidth = 2
    ctx.strokeRect(recipeX, recipeY, recipeW, recipeH)

    // 제조 중일 때 전체 목록 흐리게 표시
    if (isBrewing) {
        ctx.globalAlpha = 0.4
    }

    const visibleRecipes = allRecipes.filter((r) => !r.is_hidden)
    const recipePadding = 5
    let currentY = recipeY + 10 // 상단 여백

    // 클리핑 영역 설정 (패널 밖 내용 숨김)
    ctx.save()
    ctx.beginPath()
    ctx.rect(recipeX, recipeY, recipeW, recipeH)
    ctx.clip()

    visibleRecipes.forEach((recipe) => {
        // 레시피 아이템 높이 계산 (재료 개수에 따라 동적)
        const itemHeight = 30 + (recipe.ingredients?.length || 0) * 15 + 10
        const isSelected = selectedRecipeId === recipe.id

        // 플레이어가 모든 재료를 보유하고 있는지 확인
        const hasAllMaterials =
            recipe.ingredients?.every((ing) => (playerMaterials[ing.material_id] || 0) >= ing.quantity) ?? true

        // 재료 부족 시 어둡게 표시
        if (!hasAllMaterials) {
            ctx.globalAlpha = 0.3
            ctx.fillStyle = '#2a201a'
        } else {
            ctx.fillStyle = isSelected ? '#5a4030' : '#4a3020'
        }
        ctx.fillRect(recipeX + 5, currentY, recipeW - 10, itemHeight)

        // 선택된 레시피 테두리 강조
        if (isSelected) {
            ctx.strokeStyle = '#facc15'
            ctx.lineWidth = 2
            ctx.strokeRect(recipeX + 5, currentY, recipeW - 10, itemHeight)
        }

        // 레시피 이름 및 제조 시간
        ctx.fillStyle = '#f0d090'
        ctx.font = 'bold 13px Arial' // 모바일용 작은 폰트
        ctx.textAlign = 'left'
        ctx.textBaseline = 'top'
        ctx.fillText(`${recipe.name} (${recipe.craft_time_sec}s)`, recipeX + 10, currentY + 8, recipeW - 20)

        // 필요 재료 목록 렌더링
        if (recipe.ingredients) {
            recipe.ingredients.forEach((ing, idx) => {
                const mat = allMaterials.find((m) => m.id === ing.material_id)
                const owned = playerMaterials[ing.material_id] || 0
                const hasEnough = owned >= ing.quantity
                const yPos = currentY + 28 + idx * 15

                // 재료 보유 여부에 따라 색상 변경
                ctx.fillStyle = hasEnough ? '#aaa' : '#ff6666'
                ctx.font = '10px Arial' // 재료 정보는 더 작은 폰트
                ctx.fillText(`${mat?.name || ing.material_id} ${owned}/${ing.quantity}`, recipeX + 10, yPos, recipeW - 20)
            })
        }

        // 투명도 복원 (제조 중 상태 유지)
        if (!isBrewing) {
            ctx.globalAlpha = 1.0
        }

        currentY += itemHeight + recipePadding
    })

    ctx.restore()
    ctx.globalAlpha = 1.0
}

/**
 * 모바일용 재료 그리드 렌더링
 * 
 * [모바일 레이아웃 특징]
 * - 위치: 탭 컨텐츠 영역 (재료 탭 활성화 시 표시)
 * - 셀 크기: 60px (데스크톱 50px 대비 확대 - 터치 친화적)
 * - 간격: 8px (터치 오류 방지)
 * - 폰트: 8px (재료명), 9px (수량)
 * 
 * [그리드 레이아웃]
 * - 열 개수: 패널 너비 / (셀 크기 + 간격)으로 동적 계산
 * - 스크롤: materialScrollOffset으로 세로 스크롤 구현
 * - 가시성 최적화: 화면 밖 셀은 렌더링 스킵
 * 
 * [상태 표시]
 * - 선택된 재료: 노란색 굵은 테두리 (4px)
 * - 재고 없음: 투명도 0.3
 * - 제조 중: 전체 그리드 투명도 0.4
 * - 희귀도: 테두리 색상으로 표시
 */
function renderMaterialGridMobile(
    ctx: CanvasRenderingContext2D,
    _canvas: HTMLCanvasElement,
    props: AlchemyRendererProps,
    layout: AlchemyLayoutParams
) {
    const {
        allMaterials,
        playerMaterials,
        selectedIngredients,
        isBrewing,
        materialScrollOffset,
        images
    } = props
    const { materialX, materialY, materialW, materialH, materialCellSize, materialGridPadding } = layout

    // 패널 배경 렌더링
    ctx.fillStyle = '#3a2520'
    ctx.fillRect(materialX, materialY, materialW, materialH)
    ctx.strokeStyle = '#7a5040'
    ctx.lineWidth = 2
    ctx.strokeRect(materialX, materialY, materialW, materialH)

    // 그리드 열 개수 계산 (패널 너비에 맞춰 동적 조정)
    const gridCols = Math.floor(materialW / (materialCellSize + materialGridPadding))

    // 제조 중일 때 전체 그리드 흐리게 표시
    if (isBrewing) {
        ctx.globalAlpha = 0.4
    }

    // 클리핑 영역 설정 (패널 밖 내용 숨김)
    ctx.save()
    ctx.beginPath()
    ctx.rect(materialX, materialY, materialW, materialH)
    ctx.clip()

    // 재료 그리드 렌더링 (스크롤 오프셋 적용)
    let gridStartY = materialY + 2 - materialScrollOffset
    // LAYOUT 상수에서 최대 행 수 가져오기
    const MAX_ROWS = LAYOUT.MAX_MATERIAL_ROWS
    allMaterials.forEach((material, index) => {
        // 그리드 위치 계산 (행/열)
        const col = index % gridCols
        const row = Math.floor(index / gridCols)

        // 최대 4줄까지만 렌더링 (row는 0부터 시작하므로 row >= 4이면 스킵)
        if (row >= MAX_ROWS) return

        const cellX = materialX + col * (materialCellSize + materialGridPadding) + materialGridPadding
        const cellY = gridStartY + row * (materialCellSize + materialGridPadding) + materialGridPadding

        // 가시성 최적화: 화면 밖 셀은 렌더링 스킵
        if (cellY + materialCellSize < materialY + 10 || cellY > materialY + materialH) return

        const count = playerMaterials[material.id] || 0
        const rarityColor = getRarityColor(material.rarity)

        // 재고 없는 재료는 흐리게 표시
        ctx.globalAlpha = count > 0 ? 1 : 0.3

        // 셀 배경
        ctx.fillStyle = '#2a2520'
        ctx.fillRect(cellX, cellY, materialCellSize, materialCellSize)

        // 테두리 (선택된 재료는 굵은 노란색 테두리)
        const isSelected = selectedIngredients[material.id] > 0
        ctx.lineWidth = isSelected ? 4 : 2
        ctx.strokeStyle = isSelected ? '#fbbf24' : rarityColor
        ctx.strokeRect(cellX, cellY, materialCellSize, materialCellSize)

        // 재료 아이콘 렌더링
        const materialImage = images.materials[material.id]
        if (materialImage) {
            const iconSize = materialCellSize * 0.55
            ctx.drawImage(
                materialImage,
                cellX + materialCellSize / 2 - iconSize / 2,
                cellY + materialCellSize / 2 - iconSize / 2 - 4,
                iconSize,
                iconSize
            )
        } else {
            // 폴백: 패밀리 이모지 사용
            ctx.fillStyle = '#f0d090'
            ctx.font = '26px Arial'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(ICON_MAP[material.family] || '❓', cellX + materialCellSize / 2, cellY + materialCellSize / 2 - 4)
        }

        // 수량 배지 (우측 상단)
        if (count > 0) {
            ctx.fillStyle = '#1a1a1a'
            ctx.fillRect(cellX + materialCellSize - 18, cellY + 2, 16, 12)

            ctx.fillStyle = '#facc15'
            ctx.font = 'bold 9px Arial'
            ctx.textAlign = 'center'
            ctx.fillText(count.toString(), cellX + materialCellSize - 10, cellY + 10)
        }

        // 재료명 (하단, 8자 초과 시 말줄임)
        ctx.fillStyle = '#f0d090'
        ctx.font = '8px Arial' // 모바일용 작은 폰트
        ctx.textAlign = 'center'
        ctx.textBaseline = 'bottom'
        const displayName = material.name.length > 8 ? material.name.substring(0, 7) + '...' : material.name
        ctx.fillText(displayName, cellX + materialCellSize / 2, cellY + materialCellSize - 2)

        // 투명도 복원 (제조 중 상태 유지)
        ctx.globalAlpha = isBrewing ? 0.4 : 1
    })

    ctx.restore()
    ctx.globalAlpha = 1.0
}

function renderBrewButtonMobile(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    props: AlchemyRendererProps,
    layout: any
) {
    const { allRecipes, playerMaterials, selectedRecipeId, selectedIngredients, isBrewing, brewProgress, playerAlchemy } = props
    const { brewButtonW, brewButtonH, brewButtonY } = layout
    const brewBtnX = canvas.width / 2 - brewButtonW / 2

    if (isBrewing) {
        // Progress bar
        ctx.fillStyle = '#3a2a20'
        ctx.fillRect(brewBtnX, brewButtonY, brewButtonW, brewButtonH)
        ctx.strokeStyle = '#7a5a40'
        ctx.lineWidth = 3
        ctx.strokeRect(brewBtnX, brewButtonY, brewButtonW, brewButtonH)

        const progressW = (brewButtonW - 10) * brewProgress
        ctx.fillStyle = '#facc15'
        ctx.fillRect(brewBtnX + 5, brewButtonY + 5, progressW, brewButtonH - 10)

        ctx.fillStyle = '#fff'
        ctx.font = 'bold 18px Arial'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(`⚗️ 제조 중... ${Math.floor(brewProgress * 100)}%`, brewBtnX + brewButtonW / 2, brewButtonY + brewButtonH / 2)
    } else {
        const hasIngredients = Object.values(selectedIngredients).some(count => count > 0)
        const selectedRecipe = allRecipes.find((r) => r.id === selectedRecipeId)
        let hasMaterials = false
        let hasLevel = true

        if (selectedRecipe && selectedRecipe.ingredients) {
            hasMaterials = selectedRecipe.ingredients.every((ing) => (playerMaterials[ing.material_id] || 0) >= ing.quantity)
            hasLevel = (playerAlchemy?.level || 1) >= selectedRecipe.required_alchemy_level
        }

        const isEnabled = (selectedRecipe && hasMaterials && hasLevel) || (!selectedRecipe && hasIngredients)

        ctx.fillStyle = isEnabled ? '#5a3a20' : '#3a2520'
        ctx.fillRect(brewBtnX, brewButtonY, brewButtonW, brewButtonH)
        ctx.strokeStyle = isEnabled ? '#9a6a40' : '#5a4030'
        ctx.lineWidth = 3
        ctx.strokeRect(brewBtnX, brewButtonY, brewButtonW, brewButtonH)

        ctx.fillStyle = isEnabled ? '#f0d090' : '#666'
        ctx.font = 'bold 19px Arial'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        let btnText = '🧪 연금술 시작'
        if (selectedRecipe && !hasLevel) btnText = `Lv.${selectedRecipe.required_alchemy_level} 필요`
        else if (selectedRecipe && !hasMaterials) btnText = '재료 부족'
        else if (!selectedRecipe && !hasIngredients) btnText = '재료를 추가하세요'

        ctx.fillText(btnText, brewBtnX + brewButtonW / 2, brewButtonY + brewButtonH / 2)
    }
}

function renderXPBarMobile(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    playerAlchemy: PlayerAlchemy | null,
    layout: any
) {
    if (!playerAlchemy) return

    const { xpBarW, xpBarH, xpBarY } = layout
    const xpBarX = canvas.width / 2 - xpBarW / 2

    // Background
    ctx.fillStyle = '#2a1a10'
    ctx.fillRect(xpBarX, xpBarY, xpBarW, xpBarH)
    ctx.strokeStyle = '#6a4a30'
    ctx.lineWidth = 2
    ctx.strokeRect(xpBarX, xpBarY, xpBarW, xpBarH)

    // XP Progress
    const currentLevelExp = playerAlchemy.experience % ALCHEMY.XP_PER_LEVEL
    const expProgress = currentLevelExp / ALCHEMY.XP_PER_LEVEL
    const progressWidth = (xpBarW - 6) * expProgress

    ctx.fillStyle = '#facc15'
    ctx.fillRect(xpBarX + 3, xpBarY + 3, progressWidth, xpBarH - 6)

    // Text
    ctx.fillStyle = '#f0d090'
    ctx.font = 'bold 13px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(
        `연금술 Lv.${playerAlchemy.level} [${currentLevelExp}/${ALCHEMY.XP_PER_LEVEL} XP]`,
        xpBarX + xpBarW / 2,
        xpBarY + xpBarH / 2
    )
}

