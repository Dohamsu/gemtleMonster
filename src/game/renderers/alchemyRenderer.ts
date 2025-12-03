import type { CanvasImages } from '../../hooks/useCanvasImages'
import type { Recipe, Material, PlayerAlchemy } from '../../lib/alchemyApi'
import { ALCHEMY } from '../../constants/game'
import { getAlchemyLayout } from '../../utils/responsiveUtils'

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
 * Renders the alchemy workshop interior
 * Optimized for performance with modular rendering functions
 */
export function renderAlchemyWorkshop(props: AlchemyRendererProps) {
    const { ctx, canvas } = props
    const layout = getAlchemyLayout(canvas.width, canvas.height)

    // Background
    ctx.fillStyle = '#2a1810'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    if (layout.isMobile) {
        // 모바일 레이아웃
        renderBackButton(ctx)
        renderTitle(ctx, canvas)
        renderMobileTabs(ctx, canvas, props.mobileTab || 'recipes')
        renderCentralCauldronMobile(ctx, canvas, props.images, layout)
        renderIngredientSlotsMobile(ctx, canvas, props, layout)

        // 탭에 따라 레시피 또는 재료 표시
        if (props.mobileTab === 'materials') {
            renderMaterialGridMobile(ctx, canvas, props, layout)
        } else {
            renderRecipeListMobile(ctx, canvas, props, layout)
        }

        renderBrewButtonMobile(ctx, canvas, props, layout)
        renderXPBarMobile(ctx, canvas, props.playerAlchemy, layout)
    } else {
        // 데스크톱 레이아웃 (기존 방식)
        renderBackButton(ctx)
        renderTitle(ctx, canvas)
        renderCentralCauldron(ctx, canvas, props.images)
        renderIngredientSlots(ctx, canvas, props)
        renderRecipeList(ctx, canvas, props)
        renderMaterialGrid(ctx, canvas, props)
        renderBrewButton(ctx, canvas, props)
        renderXPBar(ctx, canvas, props.playerAlchemy)
    }

    // Reset text alignment for safety
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
    allMaterials.forEach((material, index) => {
        const col = index % gridCols
        const row = Math.floor(index / gridCols)

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

function renderMobileTabs(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, activeTab: 'recipes' | 'materials') {
    const tabY = 60
    const tabHeight = 50
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

function renderCentralCauldronMobile(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    images: CanvasImages,
    layout: any
) {
    const { cauldronX, cauldronY, cauldronSize } = layout

    // Cauldron circle background
    ctx.fillStyle = '#1a1410'
    ctx.beginPath()
    ctx.arc(cauldronX + cauldronSize / 2, cauldronY + cauldronSize / 2, cauldronSize / 2, 0, Math.PI * 2)
    ctx.fill()

    ctx.strokeStyle = '#6a4020'
    ctx.lineWidth = 3
    ctx.stroke()

    // Cauldron image or emoji
    if (images.cauldron_pixel) {
        const imgSize = cauldronSize * 0.65
        ctx.drawImage(
            images.cauldron_pixel,
            cauldronX + cauldronSize / 2 - imgSize / 2,
            cauldronY + cauldronSize / 2 - imgSize / 2,
            imgSize,
            imgSize
        )
    } else {
        ctx.font = `bold ${cauldronSize * 0.5}px Arial`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('🍯', cauldronX + cauldronSize / 2, cauldronY + cauldronSize / 2)
    }
}

function renderIngredientSlotsMobile(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    props: AlchemyRendererProps,
    layout: any
) {
    const { allRecipes, allMaterials, selectedRecipeId, selectedIngredients, images } = props
    const { slotSize, slotGap, cauldronY, cauldronSize } = layout

    const totalSlotsWidth = slotSize * ALCHEMY.MAX_INGREDIENT_SLOTS + slotGap * (ALCHEMY.MAX_INGREDIENT_SLOTS - 1)
    const slotsX = canvas.width / 2 - totalSlotsWidth / 2
    const slotsY = cauldronY + cauldronSize + 15

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
                    ctx.fillStyle = '#f0d090'
                    ctx.font = '28px Arial'
                    ctx.textAlign = 'center'
                    ctx.textBaseline = 'middle'
                    ctx.fillText(ICON_MAP[material.family] || '❓', slotX + slotSize / 2, slotsY + slotSize / 2 - 3)
                }

                // Quantity badge
                ctx.fillStyle = '#1a1a1a'
                ctx.fillRect(slotX + slotSize - 16, slotsY + slotSize - 12, 14, 10)
                ctx.fillStyle = '#facc15'
                ctx.font = 'bold 8px Arial'
                ctx.fillText(quantity.toString(), slotX + slotSize - 9, slotsY + slotSize - 5)

                // Show warning if insufficient
                const requiredQty = requiredMap[materialId] || 0
                if (quantity < requiredQty) {
                    ctx.fillStyle = 'rgba(255,0,0,0.5)'
                    ctx.fillRect(slotX, slotsY, slotSize, slotSize)
                }
            }
        } else {
            // Empty slot
            ctx.fillStyle = '#666'
            ctx.font = '20px Arial'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText('+', slotX + slotSize / 2, slotsY + slotSize / 2)
        }
    }
}

function renderRecipeListMobile(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    props: AlchemyRendererProps,
    layout: any
) {
    const { allRecipes, allMaterials, playerMaterials, selectedRecipeId, isBrewing, playerAlchemy } = props
    const { recipeX, recipeY, recipeW, recipeH } = layout

    // Panel background
    ctx.fillStyle = '#3a2520'
    ctx.fillRect(recipeX, recipeY, recipeW, recipeH)
    ctx.strokeStyle = '#7a5040'
    ctx.lineWidth = 2
    ctx.strokeRect(recipeX, recipeY, recipeW, recipeH)

    // Dim entire list if brewing
    if (isBrewing) {
        ctx.globalAlpha = 0.4
    }

    const visibleRecipes = allRecipes.filter((r) => !r.is_hidden)
    const recipePadding = 5
    let currentY = recipeY + 10

    // Clip to panel area
    ctx.save()
    ctx.beginPath()
    ctx.rect(recipeX, recipeY, recipeW, recipeH)
    ctx.clip()

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
        ctx.font = 'bold 13px Arial'
        ctx.textAlign = 'left'
        ctx.textBaseline = 'top'
        ctx.fillText(`${recipe.name} (${recipe.craft_time_sec}s)`, recipeX + 10, currentY + 8, recipeW - 20)

        // Required materials
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

        // Reset alpha (maintain brewing dimming)
        if (!isBrewing) {
            ctx.globalAlpha = 1.0
        }

        currentY += itemHeight + recipePadding
    })

    ctx.restore()
    ctx.globalAlpha = 1.0
}

function renderMaterialGridMobile(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    props: AlchemyRendererProps,
    layout: any
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

    // Dim if brewing
    if (isBrewing) {
        ctx.globalAlpha = 0.4
    }

    // Clip to panel area
    ctx.save()
    ctx.beginPath()
    ctx.rect(materialX, materialY, materialW, materialH)
    ctx.clip()

    // Render material grid
    let gridStartY = materialY + 10 - materialScrollOffset
    allMaterials.forEach((material, index) => {
        const col = index % gridCols
        const row = Math.floor(index / gridCols)

        const cellX = materialX + col * (materialCellSize + materialGridPadding) + materialGridPadding
        const cellY = gridStartY + row * (materialCellSize + materialGridPadding) + materialGridPadding

        // Skip if not visible
        if (cellY + materialCellSize < materialY + 10 || cellY > materialY + materialH) return

        const count = playerMaterials[material.id] || 0
        const rarityColor = getRarityColor(material.rarity)

        // Dim if no stock
        ctx.globalAlpha = count > 0 ? 1 : 0.3

        // Cell background
        ctx.fillStyle = '#2a2520'
        ctx.fillRect(cellX, cellY, materialCellSize, materialCellSize)

        // Border (highlight if selected)
        const isSelected = selectedIngredients[material.id] > 0
        ctx.lineWidth = isSelected ? 4 : 2
        ctx.strokeStyle = isSelected ? '#fbbf24' : rarityColor
        ctx.strokeRect(cellX, cellY, materialCellSize, materialCellSize)

        // Material icon
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

        // Quantity badge
        if (count > 0) {
            ctx.fillStyle = '#1a1a1a'
            ctx.fillRect(cellX + materialCellSize - 18, cellY + 2, 16, 12)

            ctx.fillStyle = '#facc15'
            ctx.font = 'bold 9px Arial'
            ctx.textAlign = 'center'
            ctx.fillText(count.toString(), cellX + materialCellSize - 10, cellY + 10)
        }

        // Material name
        ctx.fillStyle = '#f0d090'
        ctx.font = '8px Arial'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'bottom'
        const displayName = material.name.length > 8 ? material.name.substring(0, 7) + '...' : material.name
        ctx.fillText(displayName, cellX + materialCellSize / 2, cellY + materialCellSize - 2)

        // Reset alpha (maintain brewing dimming)
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

