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
    // 0. My Home (Top Center)
    const homeX = canvas.width * 0.5 - 48
    const homeY = canvas.height * 0.25 - 48
    if (x >= homeX && x <= homeX + 96 && y >= homeY && y <= homeY + 96) {
        onOpenMyPage()
        return
    }

    // 1. Alchemy Workshop (Central Bottom)
    const workshopX = canvas.width * 0.5 - 64
    const workshopY = canvas.height * 0.7 - 64

    if (x >= workshopX && x <= workshopX + 128 && y >= workshopY && y <= workshopY + 128) {
        setCanvasView('alchemy_workshop')
        return
    }

    // 2. Shop (Right Bottom)
    const shopX = canvas.width * 0.8 - 64
    const shopY = canvas.height * 0.7 - 64

    if (x >= shopX && x <= shopX + 128 && y >= shopY && y <= shopY + 128) {
        setCanvasView('shop')
        return
    }

    // 3. Slime Dungeon (Left Bottom)
    const dungeonX = canvas.width * 0.15 - 64
    const dungeonY = canvas.height * 0.7 - 64

    if (x >= dungeonX && x <= dungeonX + 128 && y >= dungeonY && y <= dungeonY + 128) {
        setDungeonModalOpen(true)
        return
    }

    // 4. Monster Farm (Central Middle) - 몬스터 농장 전용 뷰로 이동
    const farmX = canvas.width * 0.5 - 64
    const farmY = canvas.height * 0.4 - 64

    if (x >= farmX && x <= farmX + 128 && y >= farmY && y <= farmY + 128) {
        setCanvasView('monster_farm')
        return
    }

    // 5. Facilities (Managed via FacilityPage)
    // Herb Farm (Left Middle)
    const herbX = canvas.width * 0.3 - 64
    const herbY = canvas.height * 0.4 - 64
    if (x >= herbX && x <= herbX + 128 && y >= herbY && y <= herbY + 128) {
        setCanvasView('facility')
        return
    }

    // Mine (Right Middle)
    const mineX = canvas.width * 0.7 - 64
    const mineY = canvas.height * 0.4 - 64
    if (x >= mineX && x <= mineX + 128 && y >= mineY && y <= mineY + 128) {
        setCanvasView('facility')
        return
    }

    // Blacksmith (Right Top)
    const blacksmithX = canvas.width * 0.8 - 64
    const blacksmithY = canvas.height * 0.25 - 64
    if (x >= blacksmithX && x <= blacksmithX + 128 && y >= blacksmithY && y <= blacksmithY + 128) {
        setCanvasView('facility')
        return
    }

    // Spirit Sanctum (Left Top)
    const sanctumX = canvas.width * 0.2 - 64
    const sanctumY = canvas.height * 0.2 - 64
    if (x >= sanctumX && x <= sanctumX + 128 && y >= sanctumY && y <= sanctumY + 128) {
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
