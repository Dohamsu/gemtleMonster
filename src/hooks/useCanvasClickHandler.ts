import { useCallback } from 'react'
import type { Recipe, Material, PlayerAlchemy } from '../lib/alchemyApi'
import type { CanvasView } from '../store/useGameStore'

import { ALCHEMY } from '../constants/game'
import { getAlchemyLayout } from '../utils/responsiveUtils'
import type { AlchemyLayoutParams } from '../utils/responsiveUtils'

interface ClickHandlerProps {
    canvasView: CanvasView
    setCanvasView: (view: CanvasView) => void
    allRecipes: Recipe[]
    allMaterials: Material[]
    playerMaterials: Record<string, number>
    selectedRecipeId: string | null
    selectedIngredients: Record<string, number>
    isBrewing: boolean
    playerAlchemy: PlayerAlchemy | null
    materialScrollOffset: number
    selectRecipe: (recipeId: string | null) => void
    addIngredient: (materialId: string, quantity: number) => void
    removeIngredient: (materialId: string, quantity: number) => void
    startBrewing: (recipeId: string) => Promise<void>
    startFreeFormBrewing: () => Promise<void>
    completeBrewing: (success: boolean) => Promise<void>
    autoFillIngredients: (recipeId: string) => boolean
    setDungeonModalOpen: (isOpen: boolean) => void
    mobileTab?: 'recipes' | 'materials'
}

/**
 * Custom hook for handling canvas click events
 * Optimized with useCallback to prevent unnecessary re-creations
 */
export function useCanvasClickHandler(props: ClickHandlerProps) {
    const {
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
        autoFillIngredients,
        setDungeonModalOpen,
        mobileTab
    } = props

    return useCallback(
        (event: React.MouseEvent<HTMLCanvasElement>) => {
            const canvas = event.currentTarget
            const rect = canvas.getBoundingClientRect()
            const scaleX = canvas.width / rect.width
            const scaleY = canvas.height / rect.height
            const x = (event.clientX - rect.left) * scaleX
            const y = (event.clientY - rect.top) * scaleY

            if (canvasView === 'map') {
                handleMapClick(canvas, x, y, setCanvasView, setDungeonModalOpen)
            } else if (canvasView === 'alchemy_workshop') {
                handleAlchemyWorkshopClick(
                    canvas,
                    x,
                    y,
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
                    autoFillIngredients,
                    mobileTab
                )
            }
        },
        [
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
            completeBrewing,
            autoFillIngredients,
            autoFillIngredients,
            setDungeonModalOpen,
            mobileTab
        ]
    )
}

function handleMapClick(
    canvas: HTMLCanvasElement,
    x: number,
    y: number,
    setCanvasView: (view: CanvasView) => void,
    setDungeonModalOpen: (isOpen: boolean) => void
) {
    // Check if clicking on alchemy workshop
    const workshopX = canvas.width * 0.5 - 64
    const workshopY = canvas.height * 0.7 - 64

    if (x >= workshopX && x <= workshopX + 128 && y >= workshopY && y <= workshopY + 128) {
        setCanvasView('alchemy_workshop')
        return
    }

    // Check if clicking on shop
    const shopX = canvas.width * 0.8 - 64
    const shopY = canvas.height * 0.7 - 64

    if (x >= shopX && x <= shopX + 128 && y >= shopY && y <= shopY + 128) {
        setCanvasView('shop')
        return
    }

    // Check if clicking on slime dungeon
    const dungeonX = canvas.width * 0.15 - 64
    const dungeonY = canvas.height * 0.7 - 64

    if (x >= dungeonX && x <= dungeonX + 128 && y >= dungeonY && y <= dungeonY + 128) {
        setDungeonModalOpen(true)
        return
    }

    // Check if clicking on monster farm
    const farmX = canvas.width * 0.5 - 64
    const farmY = canvas.height * 0.4 - 64

    if (x >= farmX && x <= farmX + 128 && y >= farmY && y <= farmY + 128) {
        setCanvasView('monster_farm')
        return
    }
}

function handleAlchemyWorkshopClick(
    canvas: HTMLCanvasElement,
    x: number,
    y: number,
    setCanvasView: (view: CanvasView) => void,
    allRecipes: Recipe[],
    allMaterials: Material[],
    playerMaterials: Record<string, number>,
    selectedRecipeId: string | null,
    selectedIngredients: Record<string, number>,
    isBrewing: boolean,
    playerAlchemy: PlayerAlchemy | null,
    materialScrollOffset: number,
    selectRecipe: (recipeId: string | null) => void,
    addIngredient: (materialId: string, quantity: number) => void,
    removeIngredient: (materialId: string, quantity: number) => void,
    startBrewing: (recipeId: string) => Promise<void>,
    startFreeFormBrewing: () => Promise<void>,
    completeBrewing: (success: boolean) => Promise<void>,
    autoFillIngredients: (recipeId: string) => boolean,
    mobileTab?: 'recipes' | 'materials'
) {
    // Get layout parameters based on canvas size
    const layout = getAlchemyLayout(canvas.width, canvas.height)

    // Back button
    if (x >= 20 && x <= 120 && y >= 20 && y <= 60) {
        setCanvasView('map')
        return
    }

    // Mobile specific: Check tabs if in mobile view
    if (layout.isMobile && mobileTab) {
        // Only handle clicks for the active tab
        if (mobileTab === 'recipes') {
            const recipeHandled = handleRecipeListClick(
                canvas,
                x,
                y,
                allRecipes,
                allMaterials,
                playerMaterials,
                selectedRecipeId,
                isBrewing,
                selectRecipe,
                autoFillIngredients,
                layout
            )
            if (recipeHandled) return
        } else if (mobileTab === 'materials') {
            const materialHandled = handleMaterialGridClick(
                canvas,
                x,
                y,
                allMaterials,
                playerMaterials,
                selectedIngredients,
                isBrewing,
                materialScrollOffset,
                addIngredient,
                layout
            )
            if (materialHandled) return
        }
    } else {
        // Desktop: Handle both panels
        const recipeHandled = handleRecipeListClick(
            canvas,
            x,
            y,
            allRecipes,
            allMaterials,
            playerMaterials,
            selectedRecipeId,
            isBrewing,
            selectRecipe,
            autoFillIngredients,
            layout
        )
        if (recipeHandled) return

        const materialHandled = handleMaterialGridClick(
            canvas,
            x,
            y,
            allMaterials,
            playerMaterials,
            selectedIngredients,
            isBrewing,
            materialScrollOffset,
            addIngredient,
            layout
        )
        if (materialHandled) return
    }

    // Ingredient slot clicks (Always visible)
    const slotHandled = handleIngredientSlotClick(canvas, x, y, selectedIngredients, isBrewing, allMaterials, removeIngredient, layout)
    if (slotHandled) return

    // Brew button click (Always visible)
    handleBrewButtonClick(
        canvas,
        x,
        y,
        selectedRecipeId,
        selectedIngredients,
        isBrewing,
        allRecipes,
        playerMaterials,
        playerAlchemy,
        autoFillIngredients,
        startBrewing,
        startFreeFormBrewing,
        completeBrewing,
        layout
    )
}

function handleRecipeListClick(
    _canvas: HTMLCanvasElement,
    x: number,
    y: number,
    allRecipes: Recipe[],
    _allMaterials: Material[],
    playerMaterials: Record<string, number>,
    selectedRecipeId: string | null,
    isBrewing: boolean,
    selectRecipe: (recipeId: string | null) => void,
    autoFillIngredients: (recipeId: string) => boolean,
    layout: AlchemyLayoutParams
): boolean {
    const { recipeX, recipeY, recipeW, recipeH } = layout

    // Check if click is within recipe panel
    if (x < recipeX || x > recipeX + recipeW || y < recipeY || y > recipeY + recipeH) {
        return false
    }

    const visibleRecipes = allRecipes.filter((r) => !r.is_hidden)
    let currentY = recipeY + (layout.isMobile ? 10 : 40) // Adjust start Y based on layout
    const recipePadding = 5

    for (let i = 0; i < visibleRecipes.length; i++) {
        const recipe = visibleRecipes[i]
        const itemHeight = 30 + (recipe.ingredients?.length || 0) * 15 + 10

        if (x >= recipeX && x <= recipeX + recipeW && y >= currentY && y <= currentY + itemHeight) {
            if (isBrewing) {
                console.log('Cannot select recipe while brewing')
                return true
            }

            // Toggle selection if already selected
            if (selectedRecipeId === recipe.id) {
                selectRecipe(null)
                console.log('Deselected recipe:', recipe.name)
                return true
            }

            // Check if player has all materials
            const hasAllMaterials =
                recipe.ingredients?.every((ing) => (playerMaterials[ing.material_id] || 0) >= ing.quantity) ?? true

            if (!hasAllMaterials) {
                console.log('Cannot select recipe: insufficient materials')
                return true
            }

            selectRecipe(recipe.id)
            autoFillIngredients(recipe.id)
            console.log('Selected recipe:', recipe.name)
            return true
        }
        currentY += itemHeight + recipePadding
    }
    return false
}

function handleMaterialGridClick(
    _canvas: HTMLCanvasElement,
    x: number,
    y: number,
    allMaterials: Material[],
    playerMaterials: Record<string, number>,
    selectedIngredients: Record<string, number>,
    isBrewing: boolean,
    materialScrollOffset: number,
    addIngredient: (materialId: string, quantity: number) => void,
    layout: AlchemyLayoutParams
): boolean {
    const { materialX: gridX, materialY: gridY, materialW: gridW, materialH: gridH, materialCellSize: gridCellSize, materialGridPadding: gridPadding } = layout

    // Check if click is within material grid panel
    if (x < gridX || x > gridX + gridW || y < gridY || y > gridY + gridH) {
        return false
    }

    const contentStartY = gridY + 40
    const contentEndY = gridY + gridH

    if (y < contentStartY || y > contentEndY) {
        return false
    }

    if (isBrewing) {
        console.log('Cannot select materials while brewing')
        return true
    }

    const gridCols = Math.floor(gridW / (gridCellSize + gridPadding))
    const relX = x - gridX - (layout.isMobile ? 0 : 0) // Adjust if needed
    const relY = y - contentStartY + materialScrollOffset

    // Adjust for padding
    const col = Math.floor((relX - gridPadding) / (gridCellSize + gridPadding))
    const row = Math.floor((relY - gridPadding) / (gridCellSize + gridPadding))

    // Check if click is within a cell (accounting for padding)
    const cellRelX = (relX - gridPadding) % (gridCellSize + gridPadding)
    const cellRelY = (relY - gridPadding) % (gridCellSize + gridPadding)

    if (col < 0 || col >= gridCols || cellRelX > gridCellSize || cellRelY > gridCellSize) {
        return false // Clicked on padding or outside columns
    }

    const index = row * gridCols + col

    if (index >= 0 && index < allMaterials.length) {
        const material = allMaterials[index]

        // playerMaterials는 이미 useUnifiedInventory에서 병합된 materialCounts (Single Source of Truth)
        const available = playerMaterials[material.id] || 0
        const currentlySelected = selectedIngredients[material.id] || 0

        // 재고가 없으면 추가 불가
        if (available <= 0) {
            console.log('Cannot add material with zero stock:', material.name)
            return true
        }

        // 이미 보유한 만큼 다 선택했으면 추가 불가
        if (currentlySelected >= available) {
            console.log('Already selected all available:', material.name, `(${available}/${available})`)
            return true
        }

        // 슬롯당 최대 수량 체크
        if (currentlySelected >= ALCHEMY.MAX_QUANTITY_PER_SLOT) {
            console.log('Cannot add more:', material.name, `- maximum ${ALCHEMY.MAX_QUANTITY_PER_SLOT} per slot`)
            return true
        }

        // 슬롯 개수 제한 체크 (서로 다른 재료 종류)
        const uniqueIngredients = Object.keys(selectedIngredients).length
        const isNewIngredient = currentlySelected === 0

        if (isNewIngredient && uniqueIngredients >= ALCHEMY.MAX_INGREDIENT_SLOTS) {
            console.log('Cannot add new ingredient: maximum', ALCHEMY.MAX_INGREDIENT_SLOTS, 'ingredient types reached')
            return true
        }

        // 클릭할 때마다 +1 추가
        addIngredient(material.id, 1)
        console.log('Added ingredient:', material.name, `(${currentlySelected + 1}/${Math.min(available, ALCHEMY.MAX_QUANTITY_PER_SLOT)})`)
        return true
    }

    return false
}

function handleIngredientSlotClick(
    canvas: HTMLCanvasElement,
    x: number,
    y: number,
    selectedIngredients: Record<string, number>,
    isBrewing: boolean,
    allMaterials: Material[],
    removeIngredient: (materialId: string, quantity: number) => void,
    layout: AlchemyLayoutParams
): boolean {
    if (isBrewing) return false

    const { slotSize, slotGap, cauldronY, cauldronSize } = layout

    // Calculate slots position based on layout logic (same as renderer)
    // Mobile: cauldronY + cauldronSize + 15
    // Desktop: cauldronY + cauldronSize + 20
    const slotsY = cauldronY + cauldronSize + (layout.isMobile ? 15 : 20)

    const totalSlotsWidth = slotSize * ALCHEMY.MAX_INGREDIENT_SLOTS + slotGap * (ALCHEMY.MAX_INGREDIENT_SLOTS - 1)
    const slotsX = canvas.width / 2 - totalSlotsWidth / 2

    const ingredientEntries = Object.entries(selectedIngredients)

    for (let i = 0; i < ALCHEMY.MAX_INGREDIENT_SLOTS && i < ingredientEntries.length; i++) {
        const slotX = slotsX + i * (slotSize + slotGap)

        if (x >= slotX && x <= slotX + slotSize && y >= slotsY && y <= slotsY + slotSize) {
            const [materialId, quantity] = ingredientEntries[i]
            removeIngredient(materialId, quantity)
            const material = allMaterials.find((m) => m.id === materialId)
            console.log('Removed ingredient completely from slot:', material?.name || materialId)
            return true
        }
    }
    return false
}

function handleBrewButtonClick(
    canvas: HTMLCanvasElement,
    x: number,
    y: number,
    selectedRecipeId: string | null,
    selectedIngredients: Record<string, number>,
    isBrewing: boolean,
    allRecipes: Recipe[],
    playerMaterials: Record<string, number>,
    playerAlchemy: PlayerAlchemy | null,
    autoFillIngredients: (recipeId: string) => boolean,
    startBrewing: (recipeId: string) => Promise<void>,
    startFreeFormBrewing: () => Promise<void>,
    completeBrewing: (success: boolean) => Promise<void>,
    layout: AlchemyLayoutParams
) {
    if (isBrewing) return

    const { brewButtonW: brewBtnW, brewButtonH: brewBtnH, brewButtonY: brewBtnY } = layout
    const brewBtnX = canvas.width / 2 - brewBtnW / 2

    if (x >= brewBtnX && x <= brewBtnX + brewBtnW && y >= brewBtnY && y <= brewBtnY + brewBtnH) {
        if (selectedRecipeId) {
            // 레시피 기반 조합
            const recipe = allRecipes.find((r) => r.id === selectedRecipeId)
            if (recipe && recipe.ingredients) {
                const hasMaterials = recipe.ingredients.every((ing) => (playerMaterials[ing.material_id] || 0) >= ing.quantity)
                const hasLevel = (playerAlchemy?.level || 1) >= recipe.required_alchemy_level

                if (hasMaterials && hasLevel) {
                    autoFillIngredients(selectedRecipeId)
                    startBrewing(selectedRecipeId)
                    console.log('🧪 Brewing started!')

                    // Auto-complete after craftTime
                    setTimeout(() => {
                        const success = Math.random() * 100 < recipe.base_success_rate
                        completeBrewing(success)
                        console.log(success ? '✅ Brewing success!' : '❌ Brewing failed!')
                    }, recipe.craft_time_sec * 1000)
                } else {
                    if (!hasMaterials) console.log('❌ Not enough materials in inventory!')
                    if (!hasLevel) console.log(`❌ Alchemy level too low! Required: ${recipe.required_alchemy_level}`)
                }
            }
        } else {
            // 자유 조합 모드
            const hasIngredients = Object.values(selectedIngredients).some(count => count > 0)
            if (hasIngredients) {
                console.log('🧪 Free-form brewing started!')
                startFreeFormBrewing()
            } else {
                console.log('❌ Please add ingredients first!')
            }
        }
    }
}
