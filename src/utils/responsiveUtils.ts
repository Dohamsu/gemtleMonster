/**
 * 반응형 레이아웃 유틸리티
 * 모바일/데스크톱 환경에 따른 레이아웃 파라미터 제공
 */

export const BREAKPOINTS = {
    MOBILE: 768,
    TABLET: 1024,
    DESKTOP: 1440
} as const

/**
 * 현재 뷰포트가 모바일인지 확인
 */
export function isMobileView(width: number = window.innerWidth): boolean {
    return width <= BREAKPOINTS.MOBILE
}

/**
 * 현재 뷰포트가 태블릿인지 확인
 */
export function isTabletView(width: number = window.innerWidth): boolean {
    return width > BREAKPOINTS.MOBILE && width <= BREAKPOINTS.TABLET
}

/**
 * Canvas 크기에 따른 연금술 화면 레이아웃 파라미터 반환
 */
export interface AlchemyLayoutParams {
    isMobile: boolean

    // 가마솥
    cauldronSize: number
    cauldronX: number
    cauldronY: number

    // 재료 슬롯
    slotSize: number
    slotGap: number

    // 레시피 패널
    recipeX: number
    recipeY: number
    recipeW: number
    recipeH: number

    // 재료 그리드 패널
    materialX: number
    materialY: number
    materialW: number
    materialH: number

    // 버튼
    brewButtonW: number
    brewButtonH: number
    brewButtonY: number

    // XP 바
    xpBarW: number
    xpBarH: number
    xpBarY: number

    // 탭 (모바일 전용)
    tabHeight: number
    tabY: number

    // 재료 그리드 셀
    materialCellSize: number
    materialGridPadding: number
}

export function getAlchemyLayout(canvasWidth: number, canvasHeight: number): AlchemyLayoutParams {
    const isMobile = isMobileView(canvasWidth)

    if (isMobile) {
        // 모바일 레이아웃
        const tabHeight = 50
        const tabY = 60 // 타이틀 아래

        const cauldronSize = 120
        const cauldronX = canvasWidth / 2 - cauldronSize / 2
        const cauldronY = tabY + tabHeight + 20

        const slotSize = 50
        const slotGap = 8

        const contentY = cauldronY + cauldronSize + 80
        const contentH = canvasHeight - contentY - 150

        return {
            isMobile: true,

            cauldronSize,
            cauldronX,
            cauldronY,

            slotSize,
            slotGap,

            // 레시피 패널 (탭 전환 시 표시)
            recipeX: 20,
            recipeY: contentY,
            recipeW: canvasWidth - 40,
            recipeH: contentH,

            // 재료 그리드 패널 (탭 전환 시 표시)
            materialX: 20,
            materialY: contentY,
            materialW: canvasWidth - 40,
            materialH: contentH,

            // 버튼
            brewButtonW: Math.min(280, canvasWidth - 40),
            brewButtonH: 55,
            brewButtonY: canvasHeight - 130,

            // XP 바
            xpBarW: Math.min(300, canvasWidth - 40),
            xpBarH: 35,
            xpBarY: canvasHeight - 65,

            // 탭
            tabHeight,
            tabY,

            // 재료 그리드 셀 (터치 친화적 크기)
            materialCellSize: 60,
            materialGridPadding: 8
        }
    } else {
        // 데스크톱 레이아웃 (기존 방식)
        return {
            isMobile: false,

            cauldronSize: 200,
            cauldronX: canvasWidth / 2 - 100,
            cauldronY: canvasHeight / 2 - 100,

            slotSize: 60,
            slotGap: 10,

            recipeX: 40,
            recipeY: 120,
            recipeW: 220,
            recipeH: canvasHeight - 160,

            materialX: canvasWidth - 260,
            materialY: 120,
            materialW: 220,
            materialH: canvasHeight - 160,

            brewButtonW: 180,
            brewButtonH: 50,
            brewButtonY: canvasHeight - 140,

            xpBarW: 300,
            xpBarH: 30,
            xpBarY: canvasHeight - 75,

            tabHeight: 0,
            tabY: 0,

            materialCellSize: 50,
            materialGridPadding: 5
        }
    }
}

/**
 * UI Overlay 레이아웃 파라미터 반환
 */
export interface UIOverlayLayoutParams {
    isMobile: boolean
    isSlideUp: boolean // 모바일에서 슬라이드업 패널 사용 여부

    // 모바일 슬라이드업 패널
    handleHeight: number // 드래그 핸들 높이
    collapsedHeight: number // 접혔을 때 높이
    expandedHeight: string // 펼쳤을 때 높이 (%, vh 등)
}

export function getUIOverlayLayout(width: number = window.innerWidth): UIOverlayLayoutParams {
    const isMobile = isMobileView(width)

    return {
        isMobile,
        isSlideUp: isMobile,
        handleHeight: 60,
        collapsedHeight: 60,
        expandedHeight: '70%'
    }
}
