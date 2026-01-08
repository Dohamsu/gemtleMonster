/* eslint-disable no-console */
import { useCallback } from 'react'
import type { Material } from '../lib/alchemyApi'
import type { CanvasView } from '../store/useGameStore'

import { ALCHEMY } from '../constants/game'
import { getAlchemyLayout } from '../utils/responsiveUtils'
import type { AlchemyLayoutParams } from '../utils/responsiveUtils'

interface ClickHandlerProps {
    canvasView: CanvasView
    setCanvasView: (view: CanvasView) => void
    allMaterials: Material[]
    selectedIngredients: Record<string, number>
    isBrewing: boolean
    removeIngredient: (materialId: string, quantity: number) => void
    setDungeonModalOpen: (isOpen: boolean) => void
    onOpenMyPage: () => void
}

/**
 * Custom hook for handling canvas click events
 * Optimized with useCallback to prevent unnecessary re-creations
 */
export function useCanvasClickHandler(props: ClickHandlerProps) {
    const {
        canvasView,
        setCanvasView,
        allMaterials,
        selectedIngredients,
        isBrewing,
        removeIngredient,
        setDungeonModalOpen,
        onOpenMyPage
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
                handleMapClick(canvas, x, y, setCanvasView, setDungeonModalOpen, onOpenMyPage)
            } else if (canvasView === 'alchemy_workshop') {
                handleAlchemyWorkshopClick(
                    canvas,
                    x,
                    y,
                    allMaterials,
                    selectedIngredients,
                    isBrewing,
                    removeIngredient
                )
            }
        },
        [
            canvasView,
            setCanvasView,
            allMaterials,
            selectedIngredients,
            isBrewing,
            removeIngredient,
            setDungeonModalOpen,
            onOpenMyPage
        ]
    )
}

function handleMapClick(
    canvas: HTMLCanvasElement,
    x: number,
    y: number,
    setCanvasView: (view: CanvasView) => void,
    setDungeonModalOpen: (isOpen: boolean) => void,
    onOpenMyPage: () => void
) {
    const checkClick = (cxRatio: number, cyRatio: number, scale: number = 1.0) => {
        const cx = canvas.width * cxRatio
        const cy = canvas.height * cyRatio
        const halfSize = (128 * scale) / 2
        return x >= cx - halfSize && x <= cx + halfSize && y >= cy - halfSize && y <= cy + halfSize
    }

    // --- Hub Area ---

    // 0. My Home (Center Top) - 0.5, 0.20, scale 0.8
    if (checkClick(0.5, 0.20, 0.8)) {
        onOpenMyPage()
        return
    }

    // 1. Monster Farm (Center Middle) - 0.5, 0.45
    if (checkClick(0.5, 0.45)) {
        setCanvasView('monster_farm')
        return
    }

    // 2. Alchemy Workshop (Center Bottom Left) - 0.38, 0.75
    if (checkClick(0.38, 0.75)) {
        setCanvasView('alchemy_workshop')
        return
    }

    // 3. Shop (Center Bottom Right) - 0.62, 0.75
    if (checkClick(0.62, 0.75)) {
        setCanvasView('shop')
        return
    }

    // --- Adventure / Nature ---

    // 4. Dungeon Entrance (Far Left Bottom) - 0.15, 0.75
    if (checkClick(0.15, 0.75)) {
        setDungeonModalOpen(true)
        return
    }

    // 5. Dungeon Dispatch (Left Bottom) - 0.25, 0.60
    if (checkClick(0.25, 0.60)) {
        // Dispatch uses generic facility view or specific modal?
        // Using 'facility' view for now, similar to other facilities.
        // Or if it needs a modal, we might need a new state.
        // Assuming it's a facility page for upgrades/management.
        // Note: idleConst.json category is 'combat_auto' but treated as facility.
        setCanvasView('facility')
        return
    }

    // 6. Herb Farm (Left Middle) - 0.20, 0.40
    if (checkClick(0.20, 0.40)) {
        setCanvasView('facility')
        return
    }

    // 7. Spirit Sanctum (Left Top) - 0.20, 0.20
    if (checkClick(0.20, 0.20)) {
        setCanvasView('facility')
        return
    }

    // --- Industry ---

    // 8. Mine (Right Middle) - 0.80, 0.45
    if (checkClick(0.80, 0.45)) {
        setCanvasView('facility')
        return
    }

    // 9. Blacksmith (Right Top) - 0.80, 0.25
    if (checkClick(0.80, 0.25)) {
        setCanvasView('facility')
        return
    }
}

function handleAlchemyWorkshopClick(
    canvas: HTMLCanvasElement,
    x: number,
    y: number,
    allMaterials: Material[],
    selectedIngredients: Record<string, number>,
    isBrewing: boolean,
    removeIngredient: (materialId: string, quantity: number) => void
) {
    // Get layout parameters based on canvas size
    const layout = getAlchemyLayout(canvas.width, canvas.height)

    // Recipe List & Material Grid interactions are now handled by React (AlchemyWorkshopOverlay.tsx)
    // We strictly ignore clicks in these areas to prevent 'ghost clicks' or conflicts.
    // The Canvas only handles the central elements: Ingredient Slots.

    // Ingredient slot clicks (Always visible)
    const slotHandled = handleIngredientSlotClick(canvas, x, y, selectedIngredients, isBrewing, allMaterials, removeIngredient, layout)
    if (slotHandled) return
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
