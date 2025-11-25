import type { CanvasImages } from '../../hooks/useCanvasImages'
import type { Recipe, Material, PlayerAlchemy } from '../../lib/alchemyApi'
import { ALCHEMY } from '../../constants/game'

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
    playerAlchemy: PlayerAlchemy | null
    materialScrollOffset: number
    MATERIAL_CELL_SIZE: number
    MATERIAL_GRID_PADDING: number
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

    // Background
    ctx.fillStyle = '#2a1810'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Render UI components in order
    renderBackButton(ctx)
    renderTitle(ctx, canvas)
    renderCentralCauldron(ctx, canvas, props.images)
    renderIngredientSlots(ctx, canvas, props)
    renderRecipeList(ctx, canvas, props)
    renderMaterialGrid(ctx, canvas, props)
    renderBrewButton(ctx, canvas, props)
    renderXPBar(ctx, canvas, props.playerAlchemy)

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
                ctx.fillStyle = '#f0d090'
                ctx.font = '32px Arial'
                ctx.textAlign = 'center'
                ctx.textBaseline = 'middle'
                ctx.fillText(ICON_MAP[material.family] || '❓', slotX + slotSize / 2, slotsY + slotSize / 2 - 5)

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
            ctx.globalAlpha = 0.5
        }

        // Recipe item background
        ctx.fillStyle = isSelected ? '#5a4030' : '#4a3020'
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
        ctx.fillStyle = '#f0d090'
        ctx.font = '24px Arial'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(ICON_MAP[material.family] || '❓', cellX + gridCellSize / 2, cellY + gridCellSize / 2 - 5)

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
    const { allRecipes, playerMaterials, selectedRecipeId, isBrewing, brewStartTime, playerAlchemy } = props

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

        const selectedRecipe = allRecipes.find((r) => r.id === selectedRecipeId)
        if (selectedRecipe && brewStartTime) {
            const elapsed = Date.now() - brewStartTime
            const progress = Math.min(elapsed / (selectedRecipe.craft_time_sec * 1000), 1)

            const progressW = (brewBtnW - 10) * progress
            ctx.fillStyle = '#facc15'
            ctx.fillRect(brewBtnX + 5, brewBtnY + 5, progressW, brewBtnH - 10)

            ctx.fillStyle = '#fff'
            ctx.font = 'bold 18px Arial'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(`⚗️ 제조 중... ${Math.floor(progress * 100)}%`, brewBtnX + brewBtnW / 2, brewBtnY + brewBtnH / 2)
        }
    } else {
        const canBrew = selectedRecipeId !== null
        const selectedRecipe = allRecipes.find((r) => r.id === selectedRecipeId)
        let hasMaterials = false
        let hasLevel = false

        if (selectedRecipe && selectedRecipe.ingredients) {
            hasMaterials = selectedRecipe.ingredients.every((ing) => (playerMaterials[ing.material_id] || 0) >= ing.quantity)
            hasLevel = (playerAlchemy?.level || 1) >= selectedRecipe.required_alchemy_level
        }

        const isEnabled = canBrew && hasMaterials && hasLevel

        ctx.fillStyle = isEnabled ? '#5a3a20' : '#3a2520'
        ctx.fillRect(brewBtnX, brewBtnY, brewBtnW, brewBtnH)
        ctx.strokeStyle = isEnabled ? '#9a6a40' : '#5a4030'
        ctx.lineWidth = 3
        ctx.strokeRect(brewBtnX, brewBtnY, brewBtnW, brewBtnH)

        ctx.fillStyle = isEnabled ? '#f0d090' : '#666'
        ctx.font = 'bold 20px Arial'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        let btnText = '⚗️ 연금술 시작'
        if (selectedRecipe && !hasLevel) btnText = `Lv.${selectedRecipe.required_alchemy_level} 필요`
        else if (selectedRecipe && !hasMaterials) btnText = '재료 부족'

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
