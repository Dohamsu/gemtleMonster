import { useCallback } from 'react'
import type { Recipe, Material, PlayerAlchemy } from '../lib/alchemyApi'
import type { CanvasView } from '../store/useGameStore'

import { ALCHEMY, UI } from '../constants/game'

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
            setDungeonModalOpen
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
) {
    // Back button
    if (x >= 20 && x <= 120 && y >= 20 && y <= 60) {
        setCanvasView('map')
        return
    }

    // Recipe list clicks
    handleRecipeListClick(
        canvas,
        x,
        y,
        allRecipes,
        allMaterials,
        playerMaterials,
        selectedRecipeId,
        isBrewing,
        selectRecipe,
        autoFillIngredients
    )

    // Material grid clicks
    handleMaterialGridClick(
        canvas,
        x,
        y,
        allMaterials,
        playerMaterials,
        selectedIngredients,
        isBrewing,
        materialScrollOffset,
        addIngredient
    )

    // Ingredient slot clicks
    handleIngredientSlotClick(canvas, x, y, selectedIngredients, isBrewing, allMaterials, removeIngredient)

    // Brew button click
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
        completeBrewing
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
    autoFillIngredients: (recipeId: string) => boolean
) {
    const recipeX = 40
    const recipeY = 120
    const recipeW = 220

    const visibleRecipes = allRecipes.filter((r) => !r.is_hidden)
    let currentY = recipeY + 40
    const recipePadding = 5

    for (let i = 0; i < visibleRecipes.length; i++) {
        const recipe = visibleRecipes[i]
        const itemHeight = 30 + (recipe.ingredients?.length || 0) * 15 + 10

        if (x >= recipeX && x <= recipeX + recipeW && y >= currentY && y <= currentY + itemHeight) {
            if (isBrewing) {
                console.log('Cannot select recipe while brewing')
                return
            }

            // Toggle selection if already selected
            if (selectedRecipeId === recipe.id) {
                selectRecipe(null)
                // Optional: Clear ingredients when deselecting?
                // Based on user request: "레시피 선택 상태를 해제시켜줘" implies just clearing the selection state.
                // However, usually deselecting a recipe might imply clearing the board.
                // Let's check the user request again: "레시피를 선택한 채로 다른 재료를 넣거나... 레시피 선택 상태를 해제시켜줘"
                // It doesn't explicitly say "clear ingredients".
                // But `selectRecipe` in store clears ingredients:
                // selectRecipe: (recipeId) => { set({ selectedRecipeId: recipeId, selectedIngredients: {}, ... }) }
                // So calling selectRecipe(null) will clear ingredients too, which is likely desired behavior for "deselecting".
                console.log('Deselected recipe:', recipe.name)
                return
            }

            // Check if player has all materials
            // playerMaterials는 이미 useUnifiedInventory에서 병합된 materialCounts (Single Source of Truth)
            const hasAllMaterials =
                recipe.ingredients?.every((ing) => (playerMaterials[ing.material_id] || 0) >= ing.quantity) ?? true

            if (!hasAllMaterials) {
                console.log('Cannot select recipe: insufficient materials')
                return
            }

            selectRecipe(recipe.id)
            autoFillIngredients(recipe.id)
            console.log('Selected recipe:', recipe.name)
            return
        }
        currentY += itemHeight + recipePadding
    }
}

function handleMaterialGridClick(
    canvas: HTMLCanvasElement,
    x: number,
    y: number,
    allMaterials: Material[],
    playerMaterials: Record<string, number>,
    selectedIngredients: Record<string, number>,
    isBrewing: boolean,
    materialScrollOffset: number,
    addIngredient: (materialId: string, quantity: number) => void
) {
    const gridX = canvas.width - 260
    const gridY = 120
    const gridW = 220
    const gridCellSize = UI.MATERIAL_CELL_SIZE
    const gridPadding = UI.MATERIAL_GRID_PADDING
    const gridCols = Math.floor(gridW / (gridCellSize + gridPadding))

    if (x >= gridX && x <= gridX + gridW && y >= gridY + 40 && y <= gridY + canvas.height - 160) {
        if (isBrewing) {
            console.log('Cannot select materials while brewing')
            return
        }

        const relX = x - gridX
        const relY = y - (gridY + 40) + materialScrollOffset

        const col = Math.floor(relX / (gridCellSize + gridPadding))
        const row = Math.floor(relY / (gridCellSize + gridPadding))
        const index = row * gridCols + col

        if (index >= 0 && index < allMaterials.length) {
            const material = allMaterials[index]

            // playerMaterials는 이미 useUnifiedInventory에서 병합된 materialCounts (Single Source of Truth)
            const available = playerMaterials[material.id] || 0
            const currentlySelected = selectedIngredients[material.id] || 0

            // 재고가 없으면 추가 불가
            if (available <= 0) {
                console.log('Cannot add material with zero stock:', material.name)
                return
            }

            // 이미 보유한 만큼 다 선택했으면 추가 불가
            if (currentlySelected >= available) {
                console.log('Already selected all available:', material.name, `(${available}/${available})`)
                return
            }

            // 슬롯당 최대 수량 체크
            if (currentlySelected >= ALCHEMY.MAX_QUANTITY_PER_SLOT) {
                console.log('Cannot add more:', material.name, `- maximum ${ALCHEMY.MAX_QUANTITY_PER_SLOT} per slot`)
                return
            }

            // 슬롯 개수 제한 체크 (서로 다른 재료 종류)
            const uniqueIngredients = Object.keys(selectedIngredients).length
            const isNewIngredient = currentlySelected === 0

            if (isNewIngredient && uniqueIngredients >= ALCHEMY.MAX_INGREDIENT_SLOTS) {
                console.log('Cannot add new ingredient: maximum', ALCHEMY.MAX_INGREDIENT_SLOTS, 'ingredient types reached')
                return
            }

            // 클릭할 때마다 +1 추가
            addIngredient(material.id, 1)
            console.log('Added ingredient:', material.name, `(${currentlySelected + 1}/${Math.min(available, ALCHEMY.MAX_QUANTITY_PER_SLOT)})`)

        }
    }
}

function handleIngredientSlotClick(
    canvas: HTMLCanvasElement,
    x: number,
    y: number,
    selectedIngredients: Record<string, number>,
    isBrewing: boolean,
    allMaterials: Material[],
    removeIngredient: (materialId: string, quantity: number) => void
) {
    if (isBrewing) return

    const cauldronSize = 200
    const cauldronY = canvas.height / 2 - 100
    const slotSize = 60
    const slotGap = 10
    const totalSlotsWidth = slotSize * ALCHEMY.MAX_INGREDIENT_SLOTS + slotGap * (ALCHEMY.MAX_INGREDIENT_SLOTS - 1)
    const slotsX = canvas.width / 2 - totalSlotsWidth / 2
    const slotsY = cauldronY + cauldronSize + 20

    const ingredientEntries = Object.entries(selectedIngredients)

    for (let i = 0; i < ALCHEMY.MAX_INGREDIENT_SLOTS && i < ingredientEntries.length; i++) {
        const slotX = slotsX + i * (slotSize + slotGap)

        if (x >= slotX && x <= slotX + slotSize && y >= slotsY && y <= slotsY + slotSize) {
            const [materialId, quantity] = ingredientEntries[i]
            removeIngredient(materialId, quantity)
            const material = allMaterials.find((m) => m.id === materialId)
            console.log('Removed ingredient completely from slot:', material?.name || materialId)
            return
        }
    }
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
    completeBrewing: (success: boolean) => Promise<void>
) {
    if (isBrewing) return

    const brewBtnW = 180
    const brewBtnH = 50
    const brewBtnX = canvas.width / 2 - brewBtnW / 2
    const brewBtnY = canvas.height - 140

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
