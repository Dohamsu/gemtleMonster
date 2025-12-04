/**
 * 연금술 공방 렌더러 - 반응형 구현 + React 통합
 *
 * [Canvas + React 하이브리드 접근]
 * - Canvas: 중앙 가마솥, 재료 슬롯, 양조 버튼 (게임 느낌 유지)
 * - React: 레시피 리스트, 재료 그리드 (반응형, 접근성, 생산성)
 *
 * [이전 Canvas 구현]
 * - 이전 Canvas 전용 렌더링 함수들은 alchemyRenderer_old.ts로 이동
 * - Git 히스토리에서도 복구 가능
 */

import type { CanvasImages } from '../../hooks/useCanvasImages'
import type { Recipe, Material, PlayerAlchemy } from '../../lib/alchemyApi'
import { ALCHEMY } from '../../constants/game'
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

// Icon mapping for material families (재료 슬롯 렌더링용)
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

    // React가 레시피 리스트와 재료 그리드를 처리하므로,
    // Canvas는 중앙 요소(가마솥, 슬롯, 버튼)만 렌더링

    renderBackButton(ctx)
    renderTitle(ctx, canvas)

    if (layout.isMobile) {
        // 모바일: 작은 가마솥과 슬롯
        renderCentralCauldronMobile(ctx, canvas, props.images, layout)
        renderIngredientSlotsMobile(ctx, canvas, props, layout)
        renderBrewButtonMobile(ctx, canvas, props, layout)
        renderXPBarMobile(ctx, canvas, props.playerAlchemy, layout)
    } else {
        // 데스크톱: 큰 가마솥과 슬롯
        renderCentralCauldron(ctx, canvas, props.images)
        renderIngredientSlots(ctx, canvas, props)
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

// Canvas 전용 함수들은 alchemyRenderer_old.ts로 이동됨

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
// 1. 탭 UI로 레시피/재료를 분리하여 표시 (React로 전환됨)
// 2. 터치 친화적인 크기 사용 (셀 60px, 슬롯 50px)
// 3. 폰트 크기 축소 및 간격 조정
// 4. 레이아웃 파라미터는 responsiveUtils.ts에서 계산됨
// ============================================

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

// 모바일 레시피/재료 렌더링 함수들은 alchemyRenderer_old.ts로 이동됨
// React 컴포넌트(RecipeList.tsx, MaterialGrid.tsx)로 대체되었습니다

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

