/**
 * 반응형 레이아웃 유틸리티
 * 
 * [목적]
 * - 캔버스 크기에 따라 모바일/데스크톱 환경을 판별
 * - 각 환경에 최적화된 레이아웃 파라미터 제공
 * - 중앙 집중식 레이아웃 관리로 일관성 유지
 * 
 * [브레이크포인트 기준]
 * - MOBILE: 768px 이하 - 터치 친화적 UI, 탭 기반 레이아웃
 * - TABLET: 769px ~ 1024px - 중간 크기 레이아웃
 * - DESKTOP: 1025px 이상 - 전체 패널 표시, 큰 UI 요소
 */

import { LAYOUT } from '../constants/game'

// 반응형 브레이크포인트 정의
export const BREAKPOINTS = {
    MOBILE: 768,   // 모바일 최대 너비
    TABLET: 1024,  // 태블릿 최대 너비
    DESKTOP: 1440  // 데스크톱 기준 너비
} as const

/**
 * 현재 뷰포트가 모바일인지 확인
 * 
 * @param width - 확인할 너비 (기본값: window.innerWidth)
 * @returns 768px 이하면 true (모바일), 초과하면 false (데스크톱/태블릿)
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
 * 연금술 화면 레이아웃 파라미터 인터페이스
 * 
 * [구조]
 * - 모바일/데스크톱 환경에 따라 다른 값을 가짐
 * - 모든 UI 요소의 위치와 크기를 정의
 * - 렌더러에서 이 파라미터를 사용하여 일관된 레이아웃 구현
 * 
 * [모바일 vs 데스크톱 차이점]
 * - 모바일: 작은 가마솥(120px), 큰 재료 셀(60px), 탭 UI 사용
 * - 데스크톱: 큰 가마솥(200px), 작은 재료 셀(50px), 좌우 패널 레이아웃
 */
export interface AlchemyLayoutParams {
    isMobile: boolean  // 모바일 환경 여부

    // === 가마솥 (중앙 메인 요소) ===
    cauldronSize: number  // 가마솥 크기 (정사각형)
    cauldronX: number     // 가마솥 X 좌표 (좌측 상단)
    cauldronY: number     // 가마솥 Y 좌표 (좌측 상단)

    // === 재료 슬롯 (가마솥 아래 재료 추가 영역) ===
    slotSize: number  // 슬롯 크기 (정사각형)
    slotGap: number   // 슬롯 간 간격

    // === 레시피 패널 (왼쪽 또는 탭 컨텐츠) ===
    recipeX: number  // 레시피 패널 X 좌표
    recipeY: number  // 레시피 패널 Y 좌표
    recipeW: number  // 레시피 패널 너비
    recipeH: number  // 레시피 패널 높이

    // === 재료 그리드 패널 (오른쪽 또는 탭 컨텐츠) ===
    materialX: number  // 재료 그리드 X 좌표
    materialY: number  // 재료 그리드 Y 좌표
    materialW: number  // 재료 그리드 너비
    materialH: number  // 재료 그리드 높이

    // === 연금술 시작 버튼 ===
    brewButtonW: number  // 버튼 너비
    brewButtonH: number  // 버튼 높이
    brewButtonY: number  // 버튼 Y 좌표 (X는 중앙 정렬)

    // === 경험치 바 ===
    xpBarW: number  // XP 바 너비
    xpBarH: number  // XP 바 높이
    xpBarY: number  // XP 바 Y 좌표 (X는 중앙 정렬)

    // === 탭 UI (모바일 전용) ===
    tabHeight: number  // 탭 높이
    tabY: number       // 탭 Y 좌표

    // === 재료 그리드 셀 ===
    materialCellSize: number     // 재료 셀 크기 (정사각형)
    materialGridPadding: number  // 셀 간 간격
}

/**
 * 캔버스 크기에 따른 연금술 화면 레이아웃 파라미터 계산
 * 
 * [동작 방식]
 * 1. 캔버스 너비로 모바일/데스크톱 판별 (768px 기준)
 * 2. 각 환경에 최적화된 레이아웃 값 반환
 * 3. 모든 위치는 캔버스 크기에 비례하여 동적 계산
 * 
 * [모바일 레이아웃 특징]
 * - 세로 배치: 타이틀 → 탭 → 가마솥 → 슬롯 → 컨텐츠 → 버튼 → XP바
 * - 탭 전환: 레시피/재료 패널이 같은 위치에서 전환됨
 * - 터치 최적화: 큰 셀(60px), 적당한 간격(8px)
 * - 화면 여백: 좌우 20px
 * 
 * [데스크톱 레이아웃 특징]
 * - 좌우 배치: 레시피(왼쪽) - 가마솥(중앙) - 재료(오른쪽)
 * - 고정 패널: 모든 정보가 동시에 표시됨
 * - 중앙 정렬: 가마솥과 버튼이 화면 중앙에 위치
 * 
 * @param canvasWidth - 캔버스 너비
 * @param canvasHeight - 캔버스 높이
 * @returns 계산된 레이아웃 파라미터
 */
export function getAlchemyLayout(canvasWidth: number, canvasHeight: number): AlchemyLayoutParams {
    const isMobile = isMobileView(canvasWidth)

    if (isMobile) {
        // ===== 모바일 레이아웃 =====
        // 화면 크기가 제한적이므로 세로 배치 및 탭 전환 사용

        // LAYOUT 상수에서 가져온 값 사용
        const tabHeight = LAYOUT.MOBILE_TAB_HEIGHT
        const tabY = LAYOUT.MOBILE_TAB_Y

        // 가마솥: 탭 아래 중앙 정렬, LAYOUT 상수에서 크기 가져오기
        const cauldronSize = LAYOUT.MOBILE_CAULDRON_SIZE
        const cauldronX = canvasWidth / 2 - cauldronSize / 2
        const cauldronY = tabY + tabHeight + 10 // 간격 축소: 20 → 10

        // 재료 슬롯: 터치 친화적 크기(50px), 좁은 간격(8px)
        const slotSize = 50
        const slotGap = 8

        // 탭 컨텐츠 영역: 가마솥 + 슬롯 아래부터 버튼 위까지
        const contentY = cauldronY + cauldronSize + 20  // 가마솥 + 슬롯 영역 (간격 축소: 100 → 20)
        const contentH = canvasHeight - contentY - 100  // 버튼 + XP바 공간 확보

        return {
            isMobile: true,

            cauldronSize,
            cauldronX,
            cauldronY,

            slotSize,
            slotGap,

            // 레시피 패널: 탭 전환 시 표시 (레시피 탭 활성화 시)
            // 좌우 20px 여백, 전체 너비 사용
            recipeX: 20,
            recipeY: contentY,
            recipeW: canvasWidth - 40,
            recipeH: contentH,

            // 재료 그리드 패널: 탭 전환 시 표시 (재료 탭 활성화 시)
            // 레시피 패널과 같은 위치 (탭으로 전환)
            materialX: 20,
            materialY: contentY,
            materialW: canvasWidth - 40,
            materialH: contentH,

            // 연금술 시작 버튼: 하단 고정, 화면 너비에 맞춰 조정
            brewButtonW: Math.min(280, canvasWidth - 40),  // 최대 280px, 작은 화면은 여백 고려
            brewButtonH: 55,
            brewButtonY: canvasHeight - 130,

            // XP 바: 버튼 아래, 화면 너비에 맞춰 조정
            xpBarW: Math.min(300, canvasWidth - 40),
            xpBarH: 35,
            xpBarY: canvasHeight - 65,

            // 탭 UI
            tabHeight,
            tabY,

            // 재료 그리드 셀: 터치 친화적 크기
            materialCellSize: 60,      // 데스크톱(50px)보다 큼
            materialGridPadding: 8     // 터치 오류 방지를 위한 간격
        }
    } else {
        // ===== 데스크톱 레이아웃 =====
        // 화면이 넓으므로 모든 패널을 동시에 표시하는 전통적인 레이아웃

        return {
            isMobile: false,

            // 가마솥: 화면 중앙 약간 위로, LAYOUT 상수에서 크기 가져오기
            cauldronSize: LAYOUT.DESKTOP_CAULDRON_SIZE,
            cauldronX: canvasWidth / 2 - LAYOUT.DESKTOP_CAULDRON_SIZE / 2,
            cauldronY: canvasHeight / 2 - LAYOUT.DESKTOP_CAULDRON_SIZE / 2 - 30, // 30px 위로 이동

            // 재료 슬롯: 적당한 크기(60px), 넓은 간격(10px)
            slotSize: 60,
            slotGap: 10,

            // 레시피 패널: 왼쪽 고정 위치 (Y 좌표 상향 조정)
            recipeX: 40,
            recipeY: 90,  // 타이틀 아래 (120 → 90으로 30px 상향)
            recipeW: 220,
            recipeH: canvasHeight - 130,  // 높이 증가 (160 → 130으로 30px 증가)

            // 재료 그리드 패널: 오른쪽 고정 위치 (Y 좌표 상향 조정)
            materialX: canvasWidth - 260,  // 우측 정렬 (너비 220 + 여백 40)
            materialY: 90,  // 120 → 90으로 30px 상향
            materialW: 220,
            materialH: canvasHeight - 130,  // 높이 증가 (160 → 130으로 30px 증가)

            // 연금술 시작 버튼: 중앙 하단
            brewButtonW: 180,
            brewButtonH: 50,
            brewButtonY: canvasHeight - 140,

            // XP 바: 버튼 아래 중앙
            xpBarW: 300,
            xpBarH: 30,
            xpBarY: canvasHeight - 75,

            // 탭: 데스크톱에서는 사용하지 않음 (0으로 설정)
            tabHeight: 0,
            tabY: 0,

            // 재료 그리드 셀: 작은 크기로 더 많은 재료 표시
            materialCellSize: 50,
            materialGridPadding: 5
        }
    }
}

