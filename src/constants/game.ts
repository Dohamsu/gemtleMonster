/**
 * Game Constants
 * Central location for all magic numbers and configuration values
 */

// Alchemy Constants
export const ALCHEMY = {
  /** Maximum number of ingredient slots in alchemy UI */
  MAX_INGREDIENT_SLOTS: 4,
  /** Maximum quantity per ingredient slot */
  MAX_QUANTITY_PER_SLOT: 10,
  /** Experience points required per level */
  XP_PER_LEVEL: 100,
  /** Animation duration for resource additions (milliseconds) */
  RESOURCE_ANIMATION_DURATION: 2000,
  /** Failure experience multiplier (30% of total) */
  FAILURE_EXP_MULTIPLIER: 0.3,
  /** Default craft time for failed recipes (milliseconds) */
  DEFAULT_CRAFT_TIME_MS: 3000,
  /** Progress update interval during brewing (milliseconds) */
  BREW_UPDATE_INTERVAL_MS: 50,
} as const

// Experience by Rarity
export const RARITY_EXP = {
  N: 10,
  R: 20,
  SR: 30,
  SSR: 50,
} as const

// Canvas Rendering Constants
export const CANVAS = {
  /** Default canvas width */
  DEFAULT_WIDTH: 800,
  /** Default canvas height */
  DEFAULT_HEIGHT: 600,
} as const

// UI Constants
export const UI = {
  /** Scroll wheel sensitivity for material grid */
  SCROLL_SENSITIVITY: 0.5,
  /** Material grid cell size in pixels */
  MATERIAL_CELL_SIZE: 50,
  /** Material grid padding in pixels */
  MATERIAL_GRID_PADDING: 5,
} as const

// Layout Constants (연금술 화면 레이아웃)
export const LAYOUT = {
  /** 모바일 탭 Y 좌표 (타이틀 아래 위치) */
  MOBILE_TAB_Y: 120,
  /** 모바일 탭 높이 */
  MOBILE_TAB_HEIGHT: 50,
  /** 모바일 가마솥 크기 */
  MOBILE_CAULDRON_SIZE: 120,
  /** 데스크톱 가마솥 크기 */
  DESKTOP_CAULDRON_SIZE: 200,
  /** 재료 그리드 최대 표시 줄 수 */
  MAX_MATERIAL_ROWS: 5,
} as const

// Progress Update Constants
export const PROGRESS = {
  /** Update interval for collection progress animation (milliseconds) */
  UPDATE_INTERVAL: 50,
  /** Step size for brew progress bar */
  BREW_PROGRESS_STEP_INTERVAL: 50,
} as const

// Animation Timing Constants
export const ANIMATION = {
  /** Fade in delay for collection animation */
  COLLECTION_FADE_IN_DELAY: 50,
  /** Fade out delay for collection animation */
  COLLECTION_FADE_OUT_DELAY: 800,
  /** Complete animation delay for collection */
  COLLECTION_COMPLETE_DELAY: 1000,
  /** Resource animation visibility delay */
  RESOURCE_FADE_IN_DELAY: 10,
  /** Resource animation fade out delay */
  RESOURCE_FADE_OUT_DELAY: 1200,
  /** Resource animation complete delay */
  RESOURCE_COMPLETE_DELAY: 1500,
} as const
