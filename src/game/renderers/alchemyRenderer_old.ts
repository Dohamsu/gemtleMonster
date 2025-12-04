/**
 * [DEPRECATED] 이전 Canvas 기반 렌더링 함수들
 *
 * React 컴포넌트로 전환되면서 사용하지 않게 된 함수들입니다.
 * - RecipeList.tsx로 전환: _renderRecipeList, _renderRecipeListMobile
 * - MaterialGrid.tsx로 전환: _renderMaterialGrid, _renderMaterialGridMobile
 * - AlchemyWorkshopOverlay.tsx로 전환: _renderMobileTabs
 *
 * 이 파일은 참고용으로만 보관됩니다.
 * Git 히스토리에서도 복구 가능하므로 필요 없다면 삭제해도 됩니다.
 */

import type { CanvasImages } from '../../hooks/useCanvasImages'
import type { Recipe, Material } from '../../lib/alchemyApi'
import { LAYOUT } from '../../constants/game'
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
    playerAlchemy: any
    materialScrollOffset: number
    MATERIAL_CELL_SIZE: number
    MATERIAL_GRID_PADDING: number
    mobileTab?: 'recipes' | 'materials'
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
 * [DEPRECATED] 데스크톱 레시피 목록 렌더링
 * → RecipeList.tsx로 전환됨
 */
export function renderRecipeList(
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
            ctx.globalAlpha = 0.3
            ctx.fillStyle = '#2a201a'
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

/**
 * [DEPRECATED] 데스크톱 재료 그리드 렌더링
 * → MaterialGrid.tsx로 전환됨
 */
export function renderMaterialGrid(
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
    const MAX_ROWS = LAYOUT.MAX_MATERIAL_ROWS
    allMaterials.forEach((material, index) => {
        const col = index % gridCols
        const row = Math.floor(index / gridCols)

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

/**
 * [DEPRECATED] 모바일 탭 UI 렌더링
 * → AlchemyWorkshopOverlay.tsx로 전환됨
 */
export function renderMobileTabs(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, activeTab: 'recipes' | 'materials') {
    const tabY = LAYOUT.MOBILE_TAB_Y
    const tabHeight = LAYOUT.MOBILE_TAB_HEIGHT
    const tabW = canvas.width / 2

    // 레시피 탭
    ctx.fillStyle = activeTab === 'recipes' ? '#5a4030' : '#3a2520'
    ctx.fillRect(0, tabY, tabW, tabHeight)
    ctx.strokeStyle = activeTab === 'recipes' ? '#facc15' : '#7a5040'
    ctx.lineWidth = activeTab === 'recipes' ? 3 : 2
    ctx.strokeRect(0, tabY, tabW, tabHeight)

    ctx.fillStyle = activeTab === 'recipes' ? '#f0d090' : '#999'
    ctx.font = 'bold 18px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('📜 레시피', tabW / 2, tabY + tabHeight / 2)

    // 재료 탭
    ctx.fillStyle = activeTab === 'materials' ? '#5a4030' : '#3a2520'
    ctx.fillRect(tabW, tabY, tabW, tabHeight)
    ctx.strokeStyle = activeTab === 'materials' ? '#facc15' : '#7a5040'
    ctx.lineWidth = activeTab === 'materials' ? 3 : 2
    ctx.strokeRect(tabW, tabY, tabW, tabHeight)

    ctx.fillStyle = activeTab === 'materials' ? '#f0d090' : '#999'
    ctx.fillText('🎒 재료', tabW + tabW / 2, tabY + tabHeight / 2)
}

/**
 * [DEPRECATED] 모바일 레시피 목록 렌더링
 * → RecipeList.tsx로 전환됨
 */
export function renderRecipeListMobile(
    ctx: CanvasRenderingContext2D,
    _canvas: HTMLCanvasElement,
    props: AlchemyRendererProps,
    layout: AlchemyLayoutParams
) {
    const { allRecipes, allMaterials, playerMaterials, selectedRecipeId, isBrewing } = props
    const { recipeX, recipeY, recipeW, recipeH } = layout

    // Panel background
    ctx.fillStyle = '#3a2520'
    ctx.fillRect(recipeX, recipeY, recipeW, recipeH)
    ctx.strokeStyle = '#7a5040'
    ctx.lineWidth = 2
    ctx.strokeRect(recipeX, recipeY, recipeW, recipeH)

    if (isBrewing) {
        ctx.globalAlpha = 0.4
    }

    const visibleRecipes = allRecipes.filter((r) => !r.is_hidden)
    const recipePadding = 5
    let currentY = recipeY + 10

    ctx.save()
    ctx.beginPath()
    ctx.rect(recipeX, recipeY, recipeW, recipeH)
    ctx.clip()

    visibleRecipes.forEach((recipe) => {
        const itemHeight = 30 + (recipe.ingredients?.length || 0) * 15 + 10
        const isSelected = selectedRecipeId === recipe.id

        const hasAllMaterials =
            recipe.ingredients?.every((ing) => (playerMaterials[ing.material_id] || 0) >= ing.quantity) ?? true

        if (!hasAllMaterials) {
            ctx.globalAlpha = 0.3
            ctx.fillStyle = '#2a201a'
        } else {
            ctx.fillStyle = isSelected ? '#5a4030' : '#4a3020'
        }
        ctx.fillRect(recipeX + 5, currentY, recipeW - 10, itemHeight)

        if (isSelected) {
            ctx.strokeStyle = '#facc15'
            ctx.lineWidth = 2
            ctx.strokeRect(recipeX + 5, currentY, recipeW - 10, itemHeight)
        }

        ctx.fillStyle = '#f0d090'
        ctx.font = 'bold 13px Arial'
        ctx.textAlign = 'left'
        ctx.textBaseline = 'top'
        ctx.fillText(`${recipe.name} (${recipe.craft_time_sec}s)`, recipeX + 10, currentY + 8, recipeW - 20)

        if (recipe.ingredients) {
            recipe.ingredients.forEach((ing, idx) => {
                const mat = allMaterials.find((m) => m.id === ing.material_id)
                const owned = playerMaterials[ing.material_id] || 0
                const hasEnough = owned >= ing.quantity
                const yPos = currentY + 28 + idx * 15

                ctx.fillStyle = hasEnough ? '#aaa' : '#ff6666'
                ctx.font = '10px Arial'
                ctx.fillText(`${mat?.name || ing.material_id} ${owned}/${ing.quantity}`, recipeX + 10, yPos, recipeW - 20)
            })
        }

        if (!isBrewing) {
            ctx.globalAlpha = 1.0
        }

        currentY += itemHeight + recipePadding
    })

    ctx.restore()
    ctx.globalAlpha = 1.0
}

/**
 * [DEPRECATED] 모바일 재료 그리드 렌더링
 * → MaterialGrid.tsx로 전환됨
 */
export function renderMaterialGridMobile(
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

    // Panel background
    ctx.fillStyle = '#3a2520'
    ctx.fillRect(materialX, materialY, materialW, materialH)
    ctx.strokeStyle = '#7a5040'
    ctx.lineWidth = 2
    ctx.strokeRect(materialX, materialY, materialW, materialH)

    const gridCols = Math.floor(materialW / (materialCellSize + materialGridPadding))

    if (isBrewing) {
        ctx.globalAlpha = 0.4
    }

    ctx.save()
    ctx.beginPath()
    ctx.rect(materialX, materialY, materialW, materialH)
    ctx.clip()

    let gridStartY = materialY + 2 - materialScrollOffset
    const MAX_ROWS = LAYOUT.MAX_MATERIAL_ROWS
    allMaterials.forEach((material, index) => {
        const col = index % gridCols
        const row = Math.floor(index / gridCols)

        if (row >= MAX_ROWS) return

        const cellX = materialX + col * (materialCellSize + materialGridPadding) + materialGridPadding
        const cellY = gridStartY + row * (materialCellSize + materialGridPadding) + materialGridPadding

        if (cellY + materialCellSize < materialY + 10 || cellY > materialY + materialH) return

        const count = playerMaterials[material.id] || 0
        const rarityColor = getRarityColor(material.rarity)

        ctx.globalAlpha = count > 0 ? 1 : 0.3

        ctx.fillStyle = '#2a2520'
        ctx.fillRect(cellX, cellY, materialCellSize, materialCellSize)

        const isSelected = selectedIngredients[material.id] > 0
        ctx.lineWidth = isSelected ? 4 : 2
        ctx.strokeStyle = isSelected ? '#fbbf24' : rarityColor
        ctx.strokeRect(cellX, cellY, materialCellSize, materialCellSize)

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
            ctx.fillStyle = '#f0d090'
            ctx.font = '26px Arial'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(ICON_MAP[material.family] || '❓', cellX + materialCellSize / 2, cellY + materialCellSize / 2 - 4)
        }

        if (count > 0) {
            ctx.fillStyle = '#1a1a1a'
            ctx.fillRect(cellX + materialCellSize - 18, cellY + 2, 16, 12)

            ctx.fillStyle = '#facc15'
            ctx.font = 'bold 9px Arial'
            ctx.textAlign = 'center'
            ctx.fillText(count.toString(), cellX + materialCellSize - 10, cellY + 10)
        }

        ctx.fillStyle = '#f0d090'
        ctx.font = '8px Arial'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'bottom'
        const displayName = material.name.length > 8 ? material.name.substring(0, 7) + '...' : material.name
        ctx.fillText(displayName, cellX + materialCellSize / 2, cellY + materialCellSize - 2)

        ctx.globalAlpha = isBrewing ? 0.4 : 1
    })

    ctx.restore()
    ctx.globalAlpha = 1.0
}
