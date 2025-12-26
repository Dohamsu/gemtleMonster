/* eslint-disable no-console, @typescript-eslint/no-explicit-any */
import { create } from 'zustand'
import type {
  Material,
  Recipe,
  PlayerRecipe,
  PlayerAlchemy,
  AlchemyContext,
  PlayerMonster
} from '../types'
import * as alchemyApi from '../lib/alchemyApi'
import type { AlchemyResult } from '../lib/alchemyApi'
import { isRecipeValid, findMatchingRecipe } from '../lib/alchemyLogic'
import { supabase } from '../lib/supabase'
import { getMonsterName } from '../data/monsterData'

const consoleLogNoop = (..._args: any[]) => { }


interface AlchemyState {
  // 마스터 데이터
  allMaterials: Material[]
  allRecipes: Recipe[]

  // 플레이어 데이터
  userId: string | null
  playerMaterials: Record<string, number> // materialId -> quantity
  playerRecipes: Record<string, PlayerRecipe> // recipeId -> PlayerRecipe
  playerAlchemy: PlayerAlchemy | null
  playerMonsters: PlayerMonster[]

  // UI 상태
  alchemyMode: 'MONSTER' | 'ITEM'
  selectedRecipeId: string | null
  selectedIngredients: Record<string, number> // materialId -> quantity
  selectedTab: 'recipes' | 'codex' | 'recommended'
  inventoryTab: 'materials' | 'monsters' | 'factory'

  // 조합 진행 상태
  isBrewing: boolean
  brewStartTime: number | null
  brewProgress: number // 0~1
  brewDuration: number // 조합 시간 (밀리초)
  brewResult: {
    type: 'idle' | 'success' | 'fail'
    monsterId?: string
    itemId?: string // New field
    count?: number
    craftQuantity?: number // 대용량 제작 수량
    lostMaterials?: Record<string, number>
    hint?: {
      type: 'INGREDIENT_REVEAL' | 'NEAR_MISS' | 'CONDITION_MISMATCH'
      monsterName?: string
      materialName?: string
      recipeId?: string
      element?: string
      message?: string
    }
    expGain?: number
  }

  // 로딩 상태
  isLoading: boolean
  error: string | null

  // Favorites
  favoriteRecipes: Set<string>
  favoriteMaterials: Set<string>
  toggleFavoriteRecipe: (id: string) => void
  toggleFavoriteMaterial: (id: string) => void
  loadFavorites: () => void

  // Actions - 데이터 로딩
  loadAllData: (userId: string) => Promise<void>
  loadMaterials: () => Promise<void>
  loadRecipes: () => Promise<void>
  loadPlayerData: (userId: string) => Promise<void>
  loadPlayerMonsters: (userId: string) => Promise<void>

  // Actions - 레시피 선택
  setAlchemyMode: (mode: 'MONSTER' | 'ITEM') => void
  selectRecipe: (recipeId: string | null) => void
  setSelectedTab: (tab: 'recipes' | 'codex' | 'recommended') => void
  setInventoryTab: (tab: 'materials' | 'monsters' | 'factory') => void

  // 대용량 제작 수량
  craftQuantity: number
  setCraftQuantity: (quantity: number) => void

  // Actions - 재료 관리
  addIngredient: (materialId: string, quantity: number) => void
  removeIngredient: (materialId: string, quantity: number) => void
  clearIngredients: () => void
  autoFillIngredients: (recipeId: string) => boolean

  // Actions - 조합
  canCraft: (recipeId: string) => { can: boolean; missingMaterials: string[] }
  canCraftWithMaterials: (recipeId: string) => boolean
  canStartBrewing: () => boolean
  startFreeFormBrewing: () => Promise<void>
  startBrewing: (recipeId: string, quantity?: number) => Promise<void>
  updateBrewProgress: (progress: number) => void
  completeBrewing: (result: AlchemyResult, matchedRecipe?: Recipe | null) => Promise<void>
  resetBrewResult: () => void

  // Actions - 테스트용
  addTestMaterials: (userId: string) => Promise<void>

  // Actions - 상점
  sellMaterial: (materialId: string, quantity: number) => Promise<boolean>

  // Actions - 시설 생산
  addMaterial: (materialId: string, quantity: number) => Promise<void>
  addMaterials: (materials: Record<string, number>) => Promise<void> // Bulk add
  consumeMaterials: (materials: Record<string, number>) => Promise<boolean>
  batchSyncCallback: ((materialId: string, quantity: number) => void) | null
  forceSyncCallback: (() => Promise<void>) | null
  setBatchSyncCallback: (callback: ((materialId: string, quantity: number) => void) | null) => void
  setForceSyncCallback: (callback: (() => Promise<void>) | null) => void

  // Actions - Advanced Alchemy Context
  alchemyContext: AlchemyContext | null
  setAlchemyContext: (context: AlchemyContext) => void

  // Actions - Monster Decompose
  decomposeMonsters: (monsterIds: string[]) => Promise<{
    success: boolean
    deleted_count: number
    rewards: Record<string, number>
    error?: string
  }>
  toggleMonsterLock: (monsterId: string, isLocked: boolean) => Promise<void>
  feedMonster: (monsterId: string, potionId: string, quantity: number) => Promise<{ success: boolean; message: string }>
  feedMonsterBulk: (monsterId: string, potions: Record<string, number>) => Promise<{ success: boolean; message: string }>
  updatePlayerMonster: (monsterId: string, updates: Partial<PlayerMonster>) => void


  // Actions - Error Handling
  resetError: () => void

  reset: () => void
}

export const useAlchemyStore = create<AlchemyState>((set, get) => ({
  // 초기 상태
  allMaterials: [],
  allRecipes: [],
  playerMaterials: {},
  playerRecipes: {},
  playerAlchemy: null,
  playerMonsters: [],
  alchemyMode: 'MONSTER',
  selectedRecipeId: null,
  selectedIngredients: {},
  selectedTab: 'recipes',
  inventoryTab: 'materials',
  craftQuantity: 1, // 대용량 제작 수량 (기본 1)
  isBrewing: false,
  brewStartTime: null,
  brewProgress: 0,
  brewDuration: 3000,
  brewResult: { type: 'idle' },
  isLoading: false,
  error: null,
  userId: null, // Initialize userId

  // 배치 동기화 콜백 (useBatchMaterialSync에서 설정)
  batchSyncCallback: null as ((materialId: string, quantity: number) => void) | null,
  forceSyncCallback: null as (() => Promise<void>) | null,

  resetError: () => set({ error: null }),

  reset: () => set({
    // Keep Master Data (allMaterials, allRecipes) to avoid re-fetching on next login
    playerMaterials: {},
    playerRecipes: {},
    playerAlchemy: null,
    playerMonsters: [],
    alchemyMode: 'MONSTER',
    selectedRecipeId: null,
    selectedIngredients: {},
    selectedTab: 'recipes',
    inventoryTab: 'materials',
    craftQuantity: 1,
    isBrewing: false,
    brewStartTime: null,
    brewProgress: 0,
    brewResult: { type: 'idle' },
    error: null,
    isLoading: false,
    userId: null,
    batchSyncCallback: null,
    forceSyncCallback: null,
    alchemyContext: null,
    // Keep favorites on reset? Usually yes, as they are device preferences
  }),

  // Favorites
  favoriteRecipes: new Set(),
  favoriteMaterials: new Set(),

  toggleFavoriteRecipe: (id) => set(state => {
    const newFavorites = new Set(state.favoriteRecipes)
    if (newFavorites.has(id)) {
      newFavorites.delete(id)
    } else {
      newFavorites.add(id)
    }
    localStorage.setItem('favoriteRecipes', JSON.stringify(Array.from(newFavorites)))
    return { favoriteRecipes: newFavorites }
  }),

  toggleFavoriteMaterial: (id) => set(state => {
    const newFavorites = new Set(state.favoriteMaterials)
    if (newFavorites.has(id)) {
      newFavorites.delete(id)
    } else {
      newFavorites.add(id)
    }
    localStorage.setItem('favoriteMaterials', JSON.stringify(Array.from(newFavorites)))
    return { favoriteMaterials: newFavorites }
  }),

  loadFavorites: () => {
    try {
      const storedRecipes = localStorage.getItem('favoriteRecipes')
      const storedMaterials = localStorage.getItem('favoriteMaterials')
      set({
        favoriteRecipes: storedRecipes ? new Set(JSON.parse(storedRecipes)) : new Set(),
        favoriteMaterials: storedMaterials ? new Set(JSON.parse(storedMaterials)) : new Set()
      })
    } catch (e) {
      console.error('Failed to load favorites', e)
    }
  },

  // ============================================
  // 데이터 로딩
  // ============================================

  loadAllData: async (userId: string) => {
    // consoleLogNoop(`🔄 [AlchemyStore] loadAllData 시작:`, userId)
    set({ isLoading: true, error: null, userId })
    try {
      await Promise.all([
        get().loadMaterials(),
        get().loadRecipes(),
        get().loadPlayerData(userId),
        get().loadPlayerMonsters(userId),
        // Favorites are local, but good to init here
      ])
      get().loadFavorites()
      // consoleLogNoop(`✅ [AlchemyStore] loadAllData 완료`)
      // consoleLogNoop(`📦 playerMaterials:`, get().playerMaterials)
    } catch (error) {
      console.error(`❌ [AlchemyStore] loadAllData 실패:`, error)
      set({ error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      set({ isLoading: false })
    }
  },

  loadMaterials: async () => {
    try {
      const materials = await alchemyApi.getAllMaterials()
      set({ allMaterials: materials })
    } catch (error) {
      console.error('재료 목록 로딩 실패:', error)
      throw error
    }
  },

  loadRecipes: async () => {
    try {
      const recipes = await alchemyApi.getAllRecipes()
      set({ allRecipes: recipes })
    } catch (error) {
      console.error('레시피 목록 로딩 실패:', error)
      throw error
    }
  },

  loadPlayerData: async (userId: string) => {
    consoleLogNoop(`🔄 [AlchemyStore] loadPlayerData 시작:`, userId)
    try {
      // 1. 플레이어 재료 로드
      const playerMats = await alchemyApi.getPlayerMaterials(userId)
      consoleLogNoop(`📦 [AlchemyStore] DB에서 로드한 재료:`, playerMats.length, '개')
      consoleLogNoop(`📦 [AlchemyStore] 서버 응답 (ore 관련):`, playerMats.filter(m => m.material_id.includes('ore')))

      const materialsMap: Record<string, number> = {}
      playerMats.forEach(m => {
        materialsMap[m.material_id] = m.quantity
      })

      // 2. 골드 로드 (player_resource 테이블에서)
      const { data: goldData } = await supabase
        .from('player_resource')
        .select('amount')
        .eq('user_id', userId)
        .eq('resource_id', 'gold')
        .single()

      const goldAmount = goldData?.amount || 0
      materialsMap['gold'] = goldAmount
      // consoleLogNoop(`💰 골드 로드:`, goldAmount)

      // 3. 누락된 재료 0으로 채우기 (클라이언트 잔존 데이터 제거용)
      // MATERIALS 상수를 참조하여 모든 재료 키에 대해 값 설정
      const { MATERIALS } = await import('../data/alchemyData')
      Object.keys(MATERIALS).forEach(id => {
        if (materialsMap[id] === undefined) {
          materialsMap[id] = 0
        }
      })

      // 4. 플레이어 레시피 로드
      const playerRecs = await alchemyApi.getPlayerRecipes(userId)
      const recipesMap: Record<string, PlayerRecipe> = {}
      playerRecs.forEach(r => {
        recipesMap[r.recipe_id] = r
      })

      // 5. 플레이어 연금술 정보 로드
      const alchemyInfo = await alchemyApi.getPlayerAlchemy(userId)

      // 6. 스토어 상태 업데이트
      set({
        playerMaterials: materialsMap,
        playerRecipes: recipesMap,
        playerAlchemy: alchemyInfo
      })

      // 7. gameStore.resources 동기화 (UI용) - REMOVED during unification
      // const gameStore = useGameStore.getState()
      // const currentResources = gameStore.resources
      // gameStore.setResources({ ...currentResources, ...materialsMap })
      // consoleLogNoop(`✅ [AlchemyStore] resources 캐시 동기화 완료`)

    } catch (error) {
      console.error('❌ [AlchemyStore] 플레이어 데이터 로딩 실패:', error)
      throw error
    }
  },

  loadPlayerMonsters: async (userId: string) => {
    try {
      set({ error: null }) // Clear previous errors
      const monsters = await alchemyApi.getPlayerMonsters(userId)
      set({ playerMonsters: monsters })
    } catch (error: any) {
      console.error('몬스터 목록 로딩 실패:', error)
      set({ error: error.message || '몬스터 목록을 불러오는 중 오류가 발생했습니다.' })
      // Don't throw, just handle it in UI
    }
  },

  // ============================================
  // UI 상태 관리
  // ============================================

  selectRecipe: (recipeId) => {
    set({
      selectedRecipeId: recipeId,
      selectedIngredients: {},
      brewResult: { type: 'idle' }
    })
  },

  setAlchemyMode: (mode) => set({ alchemyMode: mode, selectedRecipeId: null }),

  setSelectedTab: (tab) => set({ selectedTab: tab }),
  setInventoryTab: (tab) => set({ inventoryTab: tab }),
  setCraftQuantity: (quantity) => set({ craftQuantity: quantity }),

  // ============================================
  // 재료 관리
  // ============================================

  addIngredient: (materialId, quantity) => {
    const { selectedIngredients, playerMaterials } = get()

    const currentAmount = selectedIngredients[materialId] || 0
    const availableAmount = playerMaterials[materialId] || 0
    const newAmount = Math.min(currentAmount + quantity, availableAmount)

    // consoleLogNoop(`🔵 재료 추가: ${materialId}, 보유: ${availableAmount}, 현재: ${currentAmount}, 새로운: ${newAmount}`)

    // 값이 0이면 키를 추가하지 않음
    if (newAmount === 0) {
      return
    }

    const newIngredients = {
      ...selectedIngredients,
      [materialId]: newAmount
    }

    // consoleLogNoop(`✅ 재료 추가 완료. 현재 슬롯:`, newIngredients)

    set({ selectedIngredients: newIngredients, selectedRecipeId: null })
  },

  removeIngredient: (materialId, quantity) => {
    const { selectedIngredients } = get()
    const currentAmount = selectedIngredients[materialId] || 0
    const newAmount = Math.max(0, currentAmount - quantity)

    if (newAmount === 0) {
      const newIngredients = { ...selectedIngredients }
      delete newIngredients[materialId]
      set({ selectedIngredients: newIngredients, selectedRecipeId: null })
    } else {
      set({
        selectedIngredients: {
          ...selectedIngredients,
          [materialId]: newAmount
        },
        selectedRecipeId: null
      })
    }
  },

  clearIngredients: () => set({ selectedIngredients: {} }),

  autoFillIngredients: (recipeId) => {
    const { allRecipes, playerMaterials } = get()

    consoleLogNoop('🔄 [autoFillIngredients] 시작:', recipeId)
    consoleLogNoop('📦 [autoFillIngredients] 전체 레시피 수:', allRecipes.length)

    const recipe = allRecipes.find(r => r.id === recipeId)
    if (!recipe) {
      consoleLogNoop('❌ [autoFillIngredients] 레시피를 찾을 수 없음:', recipeId)
      return false
    }

    consoleLogNoop('📜 [autoFillIngredients] 레시피 정보:', recipe.name, recipe)
    consoleLogNoop('🧪 [autoFillIngredients] ingredients:', recipe.ingredients)

    if (!recipe.ingredients || recipe.ingredients.length === 0) {
      consoleLogNoop('❌ [autoFillIngredients] 레시피에 재료 정보가 없음')
      return false
    }

    consoleLogNoop('📦 [autoFillIngredients] 현재 보유 재료:', playerMaterials)

    const newIngredients: Record<string, number> = {}

    for (const ing of recipe.ingredients) {
      const available = playerMaterials[ing.material_id] || 0
      consoleLogNoop(`  - ${ing.material_id}: 보유 ${available} / 필요 ${ing.quantity}`)
      if (available < ing.quantity) {
        // 재료 부족
        consoleLogNoop(`❌ 재료 부족: ${ing.material_id}`)
        return false
      }
      newIngredients[ing.material_id] = ing.quantity
    }

    consoleLogNoop('✅ [autoFillIngredients] 자동 배치 완료:', newIngredients)
    set({ selectedIngredients: newIngredients })
    return true
  },

  // ============================================
  // 조합 로직
  // ============================================

  canCraft: (recipeId) => {
    const { allRecipes, selectedIngredients, playerAlchemy } = get()
    const recipe = allRecipes.find(r => r.id === recipeId)

    if (!recipe) {
      return { can: false, missingMaterials: ['레시피를 찾을 수 없습니다'] }
    }

    // 연금술 레벨 체크
    if (playerAlchemy && playerAlchemy.level < recipe.required_alchemy_level) {
      return {
        can: false,
        missingMaterials: [`연금술 레벨 ${recipe.required_alchemy_level} 필요`]
      }
    }

    // 선택된 재료가 충분한지 체크
    const missingMaterials: string[] = []
    if (recipe.ingredients) {
      for (const ing of recipe.ingredients) {
        const selected = selectedIngredients[ing.material_id] || 0
        if (selected < ing.quantity) {
          missingMaterials.push(`${ing.material_id} ${ing.quantity - selected}개 부족`)
        }
      }
    }

    return {
      can: missingMaterials.length === 0,
      missingMaterials
    }
  },

  canCraftWithMaterials: (recipeId) => {
    const { allRecipes, playerMaterials, playerAlchemy } = get()

    const recipe = allRecipes.find(r => r.id === recipeId)

    if (!recipe) return false

    // 연금술 레벨 체크
    if (playerAlchemy && playerAlchemy.level < recipe.required_alchemy_level) {
      return false
    }

    // 보유 재료가 충분한지 체크
    if (recipe.ingredients) {
      for (const ing of recipe.ingredients) {
        const available = playerMaterials[ing.material_id] || 0
        if (available < ing.quantity) {
          return false
        }
      }
    }

    return true
  },

  canStartBrewing: () => {
    const { selectedIngredients } = get()
    // 값이 0보다 큰 재료가 1개 이상 있으면 조합 시작 가능
    const validIngredients = Object.entries(selectedIngredients).filter(([_, count]) => count > 0)
    // consoleLogNoop(`🔍 조합 가능 여부 체크: ${validIngredients.length}개 재료`, selectedIngredients)
    return validIngredients.length > 0
  },

  startFreeFormBrewing: async () => {
    const { selectedIngredients, allRecipes, alchemyContext, forceSyncCallback } = get()

    if (Object.keys(selectedIngredients).length === 0) {
      console.error('재료를 먼저 추가해주세요')
      return
    }

    // Phase 2: 조합 전 배치된 변경사항 먼저 동기화
    if (forceSyncCallback) {
      consoleLogNoop('⚡ [startFreeFormBrewing] 배치 동기화 먼저 실행...')
      await forceSyncCallback()
    }

    // 재료 조합으로 레시피 찾기
    const matchedRecipe = findMatchingRecipe(selectedIngredients, alchemyContext || null, allRecipes)

    if (!matchedRecipe) {
      consoleLogNoop('⚠️ [startFreeFormBrewing] 일치하는 레시피 없음 - 실험 모드(실패)로 진행')
      // 레시피가 없어도 진행 (실패 처리 및 힌트 제공을 위해)
    }

    const duration = matchedRecipe ? matchedRecipe.craft_time_sec * 1000 : 3000 // 기본 3초

    consoleLogNoop('🧪 자유 조합 시작:', {
      재료: selectedIngredients,
      매칭된레시피: matchedRecipe ? matchedRecipe.name : '없음 (실험)',
      소요시간: duration / 1000 + '초'
    })

    // 조합에 필요한 정보를 미리 캡처 (프로그레스 완료 후 API 호출 시 사용)
    const { userId } = get()
    const capturedIngredients = { ...selectedIngredients }
    const capturedRecipeId = matchedRecipe ? matchedRecipe.id : null
    const capturedSuccessRate = matchedRecipe ? matchedRecipe.base_success_rate : 0

    set({
      isBrewing: true,
      brewStartTime: Date.now(),
      brewProgress: 0,
      brewDuration: duration,
      brewResult: { type: 'idle' },
      selectedRecipeId: matchedRecipe ? matchedRecipe.id : null
    })

    // CSS 애니메이션을 위해 다음 프레임에서 프로그레스를 1로 설정 (100%까지 진행)
    requestAnimationFrame(() => {
      set({ brewProgress: 1 })
    })

    // 프로그레스 바가 완료된 후 (duration 시간 후) API 호출
    setTimeout(async () => {
      const state = get()
      if (!state.isBrewing) return // 이미 취소된 경우

      if (userId) {
        try {
          consoleLogNoop('🌐 [startFreeFormBrewing] 프로그레스 완료, API 호출 시작...')
          const result = await alchemyApi.performAlchemy(
            userId,
            capturedRecipeId,
            capturedIngredients,
            capturedSuccessRate
          )
          await get().completeBrewing(result, matchedRecipe)
        } catch (e: any) {
          console.error('Alchemy RPC failed', e)
          const errorMessage = e.message || 'Unknown network error'
          set({
            isBrewing: false,
            error: `서버 통신 오류: ${errorMessage}. 잠시 후 다시 시도해주세요.`
          })
        }
      } else {
        // userId 없는 경우 (테스트)
        set({ isBrewing: false })
      }
    }, duration)
  },

  startBrewing: async (recipeId, quantity = 1) => {
    const { allRecipes, canCraft, alchemyContext, forceSyncCallback, playerMaterials } = get()
    const recipe = allRecipes.find(r => r.id === recipeId)

    if (!recipe) {
      console.error('레시피를 찾을 수 없습니다')
      return
    }

    // Phase 2: 조합 전 배치된 변경사항 먼저 동기화
    if (forceSyncCallback) {
      consoleLogNoop('⚡ [startBrewing] 배치 동기화 먼저 실행...')
      await forceSyncCallback()
    }

    // 1. Check material and level requirements (단일 제작 기준)
    const craftCheck = canCraft(recipeId)
    if (!craftCheck.can) {
      console.error('조합 불가:', craftCheck.missingMaterials)
      return
    }

    // 2. Check context-based conditions
    if (alchemyContext && recipe.conditions && recipe.conditions.length > 0) {
      if (!isRecipeValid(recipe, alchemyContext)) {
        console.error('⚠️ 조합 조건이 충족되지 않았습니다.')
        consoleLogNoop('현재 컨텍스트:', alchemyContext)
        consoleLogNoop('필요 조건:', recipe.conditions)
        return
      }
    }

    // 3. 대용량 제작 시 재료 체크
    if (quantity > 1 && recipe.ingredients) {
      for (const ing of recipe.ingredients) {
        const owned = playerMaterials[ing.material_id] || 0
        if (owned < ing.quantity * quantity) {
          console.error(`재료 부족: ${ing.material_id} 필요 ${ing.quantity * quantity}, 보유 ${owned}`)
          return
        }
      }
    }

    const isItemRecipe = recipe.type === 'ITEM'

    // 소모품(ITEM)의 경우 즉시 완료 처리
    if (isItemRecipe) {
      const { userId } = get()

      // 재료 계산 (단일 제작 기준 - 서버에서 수량 곱셈 처리)
      const capturedIngredients: Record<string, number> = {}
      if (recipe.ingredients) {
        for (const ing of recipe.ingredients) {
          capturedIngredients[ing.material_id] = ing.quantity
        }
      }

      // 프로그레스 바 애니메이션을 위해 먼저 0으로 설정
      // 레시피의 craft_time_sec를 사용 (밀리초로 변환)
      const brewAnimationDuration = recipe.craft_time_sec * 1000
      set({
        isBrewing: true,
        brewStartTime: Date.now(),
        brewProgress: 0,
        brewDuration: brewAnimationDuration,
        brewResult: { type: 'idle' },
        error: null
      })

      // 짧은 딜레이 후 프로그레스 1로 변경 (CSS transition 트리거)
      setTimeout(() => {
        set({ brewProgress: 1 })
      }, 50)

      if (userId) {
        try {
          consoleLogNoop(`🌐 [startBrewing] 소모품 제작 x${quantity} (1번 API 호출)`)

          // API 호출과 프로그레스 바 애니메이션을 동시에 진행
          const apiPromise = alchemyApi.performAlchemy(
            userId,
            recipeId,
            capturedIngredients,
            100,
            quantity // 서버에서 수량 처리
          )

          // 프로그레스 바 애니메이션 완료 대기 Promise
          const animationPromise = new Promise<void>(resolve => {
            setTimeout(resolve, brewAnimationDuration + 100) // 약간의 여유 추가
          })

          // API 응답과 애니메이션 모두 완료될 때까지 대기
          const [result] = await Promise.all([apiPromise, animationPromise])

          if (result) {
            const enhancedResult = {
              ...result,
              craft_quantity: result.quantity || quantity
            }
            await get().completeBrewing(enhancedResult, recipe)
          }
        } catch (e: any) {
          console.error('Alchemy RPC failed', e)
          const errorMessage = e.message || 'Unknown network error'
          set({
            isBrewing: false,
            error: `서버 통신 오류: ${errorMessage}. 잠시 후 다시 시도해주세요.`
          })
        }
      } else {
        set({ isBrewing: false })
      }
      return
    }

    // 몬스터 레시피는 기존 로직 유지 (프로그레스 바 + 제작 시간)
    const duration = recipe.craft_time_sec * 1000

    // 조합에 필요한 정보를 미리 캡처 (프로그레스 완료 후 API 호출 시 사용)
    const { userId, selectedIngredients } = get()
    const capturedIngredients = { ...selectedIngredients }

    set({
      isBrewing: true,
      brewStartTime: Date.now(),
      brewProgress: 0,
      brewDuration: duration,
      brewResult: { type: 'idle' },
      error: null // Clear previous errors
    })

    // CSS 애니메이션을 위해 다음 프레임에서 프로그레스를 1로 설정 (100%까지 진행)
    requestAnimationFrame(() => {
      set({ brewProgress: 1 })
    })

    // 프로그레스 바가 완료된 후 (duration 시간 후) API 호출
    setTimeout(async () => {
      const state = get()
      if (!state.isBrewing) return // 이미 취소된 경우

      if (userId) {
        try {
          consoleLogNoop('🌐 [startBrewing] 프로그레스 완료, API 호출 시작...')
          // 레시피를 선택해서 조합하는 경우 실패 확률 제거 (100% 성공)
          const result = await alchemyApi.performAlchemy(userId, recipeId, capturedIngredients, 100)
          await get().completeBrewing(result, recipe)
        } catch (e: any) {
          console.error('Alchemy RPC failed', e)
          const errorMessage = e.message || 'Unknown network error'
          set({
            isBrewing: false,
            error: `서버 통신 오류: ${errorMessage}. 잠시 후 다시 시도해주세요.`
          })
        }
      } else {
        // userId 없는 경우 (테스트)
        set({ isBrewing: false })
      }
    }, duration)
  },

  updateBrewProgress: (progress) => set({ brewProgress: progress }),

  completeBrewing: async (result, matchedRecipe) => {
    const { userId, selectedRecipeId, allRecipes, selectedIngredients, playerMaterials, playerAlchemy, allMaterials, playerRecipes } = get()

    if (!userId) return

    // 매칭된 레시피 또는 선택된 레시피 사용
    const recipe = matchedRecipe || (selectedRecipeId ? allRecipes.find(r => r.id === selectedRecipeId) : null)

    // 1. 재료 소모 (서버 결과 반영)
    // 서버에서는 이미 차감되었으므로 로컬 상태만 동기화
    // (exact sync would require re-fetching, but for performance we replicate the deduction logic or use result data if widely available)
    // 여기서는 selectedIngredients만큼 차감 (서버 로직과 동일하다고 가정)

    const newPlayerMaterials = { ...playerMaterials }
    const materialsUsed: Record<string, number> = {}

    for (const [materialId, count] of Object.entries(selectedIngredients)) {
      newPlayerMaterials[materialId] = Math.max(0, (newPlayerMaterials[materialId] || 0) - count)

      materialsUsed[materialId] = count
    }

    // hint 객체 생성
    let hint: {
      type: 'INGREDIENT_REVEAL' | 'NEAR_MISS' | 'CONDITION_MISMATCH',
      monsterName?: string,
      materialName?: string,
      recipeId?: string,
      element?: string,
      message?: string
    } | undefined

    // 2. 힌트 시스템 처리 (실패 시에만)
    if (result.success) {
      // 성공 시에는 별도 힌트 처리 없음 (서버에서 이미 failCount 리셋됨)
      consoleLogNoop(`✅ 연금술 성공! +${result.exp_gain} XP`)
    } else {
      consoleLogNoop('Alchemy Failed Debug:', result) // DEBUG
      if (result.error) console.error('Alchemy Error:', result.error)

      // Fallback XP Logic
      if (!result.exp_gain || result.exp_gain === 0) {
        const fallbackExp = recipe ? Math.max(Math.floor(recipe.exp_gain * 0.1), 1) : 5
        consoleLogNoop(`⚠️ 서버 XP 0 감지. 클라이언트 보정: +${fallbackExp} XP`)

        // DB 동기화 (비동기)
        alchemyApi.addAlchemyExperience(userId, fallbackExp).catch(console.error)

        // 결과 객체 보정
        result.exp_gain = fallbackExp

        // 로컬 상태 보정
        if (playerAlchemy) {
          result.new_total_exp = playerAlchemy.experience + fallbackExp
          // 레벨 재계산 (간단식)
          result.new_level = Math.floor(result.new_total_exp / 100) + 1
        }
      }

      let failCount = result.fail_count

      // Fallback: If RPC returned undefined/null (older DB function), fetch manually
      if (failCount === undefined || failCount === null) {
        try {
          failCount = await alchemyApi.getConsecutiveFailures(userId)
        } catch (e) {
          failCount = 0
        }
      }

      consoleLogNoop(`💔 연속 실패 ${failCount}회`)

      // --- Enhanced Hint Logic ---
      // (기존 로직 유지)

      const discoveredRecipeIds = Object.keys(get().playerRecipes).filter(id => get().playerRecipes[id].is_discovered)
      const hintCandidates = allRecipes.filter(r => r.is_hidden && !discoveredRecipeIds.includes(r.id))
      const usedMaterialIds = Object.keys(materialsUsed).sort()

      const nearMissRecipe = hintCandidates.find(r => {
        if (!r.ingredients) return false
        const recipeMaterialIds = r.ingredients.map(i => i.material_id).sort()
        return JSON.stringify(usedMaterialIds) === JSON.stringify(recipeMaterialIds)
      })

      if (nearMissRecipe) {
        hint = { type: 'NEAR_MISS', recipeId: nearMissRecipe.id }
      } else {
        const conditionMissRecipe = hintCandidates.find(r => {
          if (!r.ingredients) return false
          const isMatch = r.ingredients.every(ing => materialsUsed[ing.material_id] === ing.quantity) &&
            Object.keys(materialsUsed).length === r.ingredients.length
          return isMatch
        })

        if (conditionMissRecipe) {
          hint = { type: 'CONDITION_MISMATCH', recipeId: conditionMissRecipe.id }
        }
      }

      // 3. Ingredient Reveal (Fallback / Progressive)
      if (!hint && failCount >= 3) {
        const shuffledRecipes = [...hintCandidates].sort(() => 0.5 - Math.random())

        for (const undiscoveredRecipe of shuffledRecipes) {
          const matchingIngredient = undiscoveredRecipe.ingredients?.find(ing => {
            // 1. 이번 조합에 사용된 재료여야 함
            if (!usedMaterialIds.includes(ing.material_id)) return false

            // 2. 이미 해당 레시피의 재료로 밝혀진 경우 제외 (중복 힌트 방지)
            const knownIngredients = playerRecipes[undiscoveredRecipe.id]?.discovered_ingredients || []
            if (knownIngredients.includes(ing.material_id)) return false

            return true
          })

          if (matchingIngredient) {
            const materialDef = allMaterials.find(m => m.id === matchingIngredient.material_id)
            const materialName = materialDef?.name || matchingIngredient.material_id

            // 몬스터 이름 조회 (레시피 이름 대신 실제 몬스터 이름 사용)
            let baseName = (undiscoveredRecipe.result_monster_id ? getMonsterName(undiscoveredRecipe.result_monster_id) : undefined) || undiscoveredRecipe.name

            // Fallback cleanup if name still contains "recipe"
            baseName = baseName.replace(/ 레시피| 조합법/g, '').trim()
            if (!baseName) baseName = '알 수 없는 몬스터'

            consoleLogNoop('💡 힌트 생성:', {
              recipe: undiscoveredRecipe.name,
              target: baseName,
              material: materialName
            })

            hint = {
              type: 'INGREDIENT_REVEAL',
              monsterName: baseName,
              materialName: materialName,
              recipeId: undiscoveredRecipe.id
            }

            // DB 발견 정보 저장 (클라이언트 편의상 유지, 서버와 중복될 수 있으나 안전함)
            await alchemyApi.discoverRecipeIngredient(userId, undiscoveredRecipe.id, matchingIngredient.material_id)
            break
          }
        }
      }

    }

    // 결과 설정
    // result.craft_quantity는 대용량 제작 시 startBrewing에서 전달됨
    const craftQty = (result as any).craft_quantity || 1
    const brewResult = result.success
      ? {
        type: 'success' as const,
        monsterId: result.result_monster_id || (recipe?.type === 'MONSTER' ? recipe?.result_monster_id : undefined),
        itemId: recipe?.type === 'ITEM' ? recipe?.result_item_id : undefined,
        count: recipe?.result_count || 1,
        craftQuantity: craftQty,
        expGain: result.exp_gain
      }
      : { type: 'fail' as const, lostMaterials: materialsUsed, hint, expGain: result.exp_gain }

    // 3. 로컬 상태 업데이트
    set({
      isBrewing: false,
      brewStartTime: null,
      brewProgress: 0,
      brewResult,
      playerMaterials: newPlayerMaterials,
      selectedIngredients: {},
      selectedRecipeId: null,
      playerAlchemy: playerAlchemy ? {
        ...playerAlchemy,
        experience: result.new_total_exp, // 서버 값 사용
        level: result.new_level // 서버 값 사용
      } : null
    })

    // gameStore 동기화 (REMOVED)
    // gameStore.setResources(newGameResources)

    // 4. 데이터 리로드 (결과 반영 보장을 위해)
    if (result.success) {
      if (result.result_monster_id) {
        await get().loadPlayerMonsters(userId)
      }
      // If it's an item, we updated local state (playerMaterials/resources), and DB sync happens via RPC or implicit logic.
      // For robustness, we could reload materials, but local update should be enough for fluid UI.
      // Actually, performAlchemy RPC updates the DB. loadPlayerData will sync counts.
      await get().loadPlayerData(userId)
    } else {
      // Even on fail, materials are consumed
      await get().loadPlayerData(userId)
    }
  },

  resetBrewResult: () => {
    consoleLogNoop('🔄 [AlchemyStore] resetBrewResult called')
    set({ brewResult: { type: 'idle' } })
  },

  // ============================================
  // 테스트용
  // ============================================

  addTestMaterials: async (userId: string) => {
    try {
      // 기본 재료들 추가
      consoleLogNoop('🔧 테스트 재료 추가 시작...')
      await alchemyApi.addMaterialToPlayer(userId, 'herb_common', 20)
      await alchemyApi.addMaterialToPlayer(userId, 'slime_core', 10)
      await alchemyApi.addMaterialToPlayer(userId, 'ore_iron', 10)
      await alchemyApi.addMaterialToPlayer(userId, 'crystal_mana', 5)
      await alchemyApi.addMaterialToPlayer(userId, 'spirit_dust', 6)
      await alchemyApi.addMaterialToPlayer(userId, 'mushroom_blue', 4)

      // 데이터 새로고침
      await get().loadPlayerData(userId)

      const { playerMaterials } = get()
      consoleLogNoop('✅ 테스트 재료 추가 완료')
      consoleLogNoop('📦 보유 재료:', playerMaterials)
    } catch (error) {
      console.error('❌ 테스트 재료 추가 실패:', error)
    }
  },

  // ============================================
  // 상점 관련
  // ============================================

  sellMaterial: async (materialId, quantity) => {
    const { userId, playerMaterials, forceSyncCallback } = get()

    // consoleLogNoop(`[Store Debug] sellMaterial called:`, { materialId, quantity, userId })

    if (!userId) {
      console.error('[Store Debug] 로그인이 필요합니다.')
      return false
    }

    // Phase 2: 판매 전 배치된 변경사항 먼저 동기화
    if (forceSyncCallback) {
      consoleLogNoop('⚡ [sellMaterial] 배치 동기화 먼저 실행...')
      await forceSyncCallback()
    }

    const currentAmount = playerMaterials[materialId] || 0
    if (currentAmount < quantity) {
      console.error(`[Store Debug] 재료 부족: 보유(${currentAmount}) < 판매(${quantity})`)
      return false
    }

    try {
      // DB 업데이트
      // consoleLogNoop(`[Store Debug] DB 업데이트 시도...`)
      const success = await alchemyApi.consumeMaterials(userId, { [materialId]: quantity })
      // consoleLogNoop(`[Store Debug] DB 업데이트 결과:`, success)

      if (success) {
        // 골드 지급 (DB)
        // 주의: sellMaterial은 현재 ShopPage에서 사용되지 않고 있음. ShopPage는 handleBulkSell 자체 로직 사용.
        // 하지만 다른 곳에서 사용될 경우를 위해 골드 추가 로직이 필요하다면 가격 정보가 필요함.
        // 일단은 로컬 업데이트만 유지하거나, 정확한 가격 산정 로직이 필요.
        // 이번 요청에서는 ShopPage 수정이 주 목적이므로 여기서는 주석 처리 또는 안전한 기본값 처리.
        // await alchemyApi.addGold(userId, totalGain) 

        // 로컬 상태 업데이트
        const newPlayerMaterials = {
          ...playerMaterials,
          [materialId]: Math.max(0, currentAmount - quantity)
        }

        set({ playerMaterials: newPlayerMaterials })

        // gameStore.resources를 읽기 전용 캐시로 동기화 (UI 애니메이션용)
        // 3. UI 동기화 (REMOVED)
        // const gameStore = useGameStore.getState()
        // gameStore.setResources({
        //     ...gameStore.resources,
        //     [materialId]: (gameStore.resources[materialId] || 0) + quantity
        // })

        // consoleLogNoop(`[Store Debug] 로컬 상태 업데이트 완료`)
        return true
      } else {
        console.error(`[Store Debug] DB 업데이트 실패 - 재료가 DB에 없을 수 있습니다.`)
        return false
      }
    } catch (error) {
      console.error('[Store Debug] 재료 판매 실패 (Exception):', error)
      return false
    }
  },

  // ============================================
  // 시설 생산 관련
  // ============================================

  addMaterial: async (materialId, quantity) => {
    const { userId, playerMaterials, batchSyncCallback } = get()
    if (!userId || materialId === 'empty') return

    // 로컬 상태 먼저 업데이트 (즉시 반영)
    const currentAmount = playerMaterials[materialId] || 0
    const newPlayerMaterials = {
      ...playerMaterials,
      [materialId]: currentAmount + quantity
    }

    set({ playerMaterials: newPlayerMaterials })

    // gameStore.resources를 읽기 전용 캐시로 동기화 (REMOVED - UI 애니메이션용은 recentAdditions만 사용)
    // const gameStore = useGameStore.getState()
    // const currentResources = gameStore.resources
    // gameStore.setResources({
    //   ...currentResources,
    //   [materialId]: (currentResources[materialId] || 0) + quantity
    // })

    // consoleLogNoop(`✅ 재료 추가 완료 (로컬): ${materialId} +${quantity}`)

    // 배치 동기화 콜백이 있으면 큐에 추가 (Phase 1)
    if (batchSyncCallback) {
      batchSyncCallback(materialId, quantity)
    } else {
      // 배치 시스템이 없으면 기존 방식으로 즉시 저장 (하위 호환성)
      try {
        await alchemyApi.addMaterialToPlayer(userId, materialId, quantity)
        // consoleLogNoop(`✅ 재료 추가 완료 (DB - 즉시): ${materialId} +${quantity}`)
      } catch (error) {
        console.error(`❌ 재료 DB 저장 실패 (로컬은 유지):`, materialId, error)
      }
    }
  },

  addMaterials: async (materials) => {
    const { playerMaterials, batchSyncCallback, forceSyncCallback } = get()

    // 1. Optimistic Update
    const newMaterials = { ...playerMaterials }
    Object.entries(materials).forEach(([id, qty]) => {
      if (qty === 0) return
      newMaterials[id] = (newMaterials[id] || 0) + qty

      // Call batch sync for each (or we could optimize this later to a bulk sync callback)
      if (batchSyncCallback) {
        batchSyncCallback(id, qty)
      }
    })

    set({ playerMaterials: newMaterials })

    // 2. Server Sync (using existing batch mechanism or force sync if needed)
    // For now, relying on the existing batchSyncCallback which queues updates is correct.
    // If urgent save is needed (forceSync), it should be called by the caller or configured.
    if (forceSyncCallback) {
      // Optional: Auto-trigger force sync for large batches? 
      // For now, let's stick to the queue pattern unless specified.
    }
  },

  consumeMaterials: async (materials) => {
    const { userId, playerMaterials, batchSyncCallback } = get()
    if (!userId) return false

    // Phase 2: 소비 전 배치된 변경사항 먼저 동기화 (중요: 소비는 즉시성이 중요함)
    // 하지만 배치 시스템이 단순히 delta를 관리한다면, 마이너스 delta를 추가하는 것이 더 효율적일 수 있음.
    // 여기서는 안전을 위해 기존 consumeMaterials(즉시 DB 위임) 방식을 따르되, 배치 콜백을 우선 사용가능한지 확인.

    // Check sufficiency locally first
    consoleLogNoop(`💰 [AlchemyStore] consumeMaterials 호출됨. 요청:`, materials)
    consoleLogNoop(`💰 [AlchemyStore] 현재 playerMaterials 상태:`,
      Object.fromEntries(
        Object.entries(materials).map(([id]) => [id, playerMaterials[id] || 0])
      )
    )

    for (const [id, amount] of Object.entries(materials)) {
      const current = playerMaterials[id] || 0
      if (current < amount) {
        console.error(`❌ [AlchemyStore] 재료 부족: ${id} (보유: ${current}, 필요: ${amount})`)
        return false
      }
      consoleLogNoop(`✅ [AlchemyStore] 재료 충분: ${id} (보유: ${current}, 필요: ${amount})`)
    }

    // 로컬 상태 업데이트
    const newPlayerMaterials = { ...playerMaterials }
    // const gameStore = useGameStore.getState() // REMOVED
    // const newGameResources = { ...gameStore.resources } // REMOVED

    Object.entries(materials).forEach(([id, amount]) => {
      const after = Math.max(0, (newPlayerMaterials[id] || 0) - amount)
      newPlayerMaterials[id] = after
      // newGameResources[id] = after // REMOVED
    })

    set({ playerMaterials: newPlayerMaterials })
    // gameStore.setResources(newGameResources) // REMOVED

    // 배치 콜백이 있으면 음수 수량으로 처리
    if (batchSyncCallback) {
      Object.entries(materials).forEach(([id, amount]) => {
        batchSyncCallback(id, -amount)
      })
      return true
    } else {
      // 배치 시스템이 없으면 즉시 DB 처리
      try {
        const success = await alchemyApi.consumeMaterials(userId, materials)
        if (!success) {
          // 롤백? (복잡함, 여기서는 실패 로그만)
          console.error(`❌ 재료 소비 DB 반영 실패 (로컬은 이미 차감됨)`)
          return false
        }
        return true
      } catch (e) {
        console.error(e)
        return false
      }
    }
  },

  setBatchSyncCallback: (callback) => {
    set({ batchSyncCallback: callback })
    // consoleLogNoop(`🔗 [AlchemyStore] 배치 동기화 콜백 ${callback ? '설정' : '해제'}`)
  },

  setForceSyncCallback: (callback) => {
    set({ forceSyncCallback: callback })
    // consoleLogNoop(`🔗 [AlchemyStore] 즉시 동기화 콜백 ${callback ? '설정' : '해제'}`)
  },

  // ============================================
  // Advanced Alchemy Context
  // ============================================

  alchemyContext: null,

  setAlchemyContext: (context) => set({ alchemyContext: context }),

  // ============================================
  // Monster Decompose
  // ============================================

  decomposeMonsters: async (monsterIds) => {
    const { userId } = get()
    if (!userId) {
      console.error('사용자가 로그인하지 않았습니다')
      return { success: false, deleted_count: 0, rewards: {}, error: 'User not logged in' }
    }

    try {
      const result = await alchemyApi.decomposeMonsters(userId, monsterIds)

      if (result.success) {
        // Update playerMonsters by removing decomposed monsters
        const currentMonsters = get().playerMonsters
        const updatedMonsters = currentMonsters.filter(
          m => !monsterIds.includes(m.id)
        )
        set({ playerMonsters: updatedMonsters })

        // Update playerMaterials with rewards
        const currentMaterials = get().playerMaterials
        const updatedMaterials = { ...currentMaterials }

        Object.entries(result.rewards).forEach(([materialId, amount]) => {
          updatedMaterials[materialId] = (updatedMaterials[materialId] || 0) + amount
        })

        set({ playerMaterials: updatedMaterials })

        // Sync to gameStore resources
        // 3. UI 동기화 (REMOVED: gameStore.setResources)
        // useGameStore.getState().setResources({
        //   ...useGameStore.getState().resources,
        //   gold: newGold
        // })

        // consoleLogNoop(`✅ [addGold] ${quantity} 골드 지급 완료 (현재: ${newGold})`)
        consoleLogNoop(`✅ 몬스터 분해 완료: ${result.deleted_count}마리`)
      }

      return result
    } catch (error: any) {
      console.error('몬스터 분해 실패:', error)
      return { success: false, deleted_count: 0, rewards: {}, error: error.message || 'Unknown error' }
    }
  },

  updatePlayerMonster: (monsterId, updates) => set(state => ({
    playerMonsters: state.playerMonsters.map(m =>
      m.id === monsterId ? { ...m, ...updates } : m
    )
  })),

  toggleMonsterLock: async (monsterId, isLocked) => {
    const { userId } = get()
    if (!userId) {
      console.error('사용자가 로그인하지 않았습니다')
      return
    }

    try {
      await alchemyApi.toggleMonsterLock(userId, monsterId, isLocked)

      // Update local state
      const currentMonsters = get().playerMonsters
      const updatedMonsters = currentMonsters.map(m =>
        m.id === monsterId ? { ...m, is_locked: isLocked } : m
      )
      set({ playerMonsters: updatedMonsters })

      consoleLogNoop(`✅ 몬스터 잠금 상태 변경: ${monsterId} -> ${isLocked}`)
    } catch (error) {
      console.error('몬스터 잠금 상태 변경 실패:', error)
      throw error
    }
  },

  feedMonster: async (monsterId, potionId, quantity) => {
    // Wrapper for single potion usage
    return get().feedMonsterBulk(monsterId, { [potionId]: quantity })
  },

  feedMonsterBulk: async (monsterId, potions) => {
    const { userId, playerMaterials, playerMonsters } = get()
    if (!userId) return { success: false, message: '로그인이 필요합니다.' }
    if (Object.keys(potions).length === 0) return { success: false, message: '사용할 포션이 없습니다.' }

    // 1. Validation & Calculation
    let totalXp = 0
    // Dynamic import to avoid circular dep if needed, though usually constants are safe
    const { CONSUMABLE_EFFECTS } = await import('../data/alchemyData')

    for (const [potionId, quantity] of Object.entries(potions)) {
      if (quantity <= 0) continue

      const currentPotion = playerMaterials[potionId] || 0
      if (currentPotion < quantity) {
        return { success: false, message: `포션이 부족합니다. (${potionId})` }
      }

      const effect = CONSUMABLE_EFFECTS[potionId]
      if (!effect || effect.type !== 'GRANT_XP') {
        return { success: false, message: '경험치 포션이 아닙니다.' }
      }
      totalXp += effect.value * quantity
    }

    const monster = playerMonsters.find(m => m.id === monsterId)
    if (!monster) {
      return { success: false, message: '몬스터를 찾을 수 없습니다.' }
    }

    // API 호출
    try {
      const result = await alchemyApi.feedMonster(userId, monsterId, potions, totalXp)

      if (!result.success) {
        return { success: false, message: result.error || '알 수 없는 오류' }
      }

      // 2. gameStore.resources 동기화 (REMOVED)
      // 2. Update Local State
      const newMaterials = { ...playerMaterials }

      // Deduct materials
      Object.entries(potions).forEach(([id, qty]) => {
        newMaterials[id] = Math.max(0, (newMaterials[id] || 0) - qty)
      })

      // Update Monster
      const newMonsters = playerMonsters.map(m => {
        if (m.id === monsterId) {
          return { ...m, level: result.newLevel, exp: result.newExp }
        }
        return m
      })

      // Sync with GameStore resources
      // const gameStore = useGameStore.getState() // REMOVED
      // const newGameResources = { ...gameStore.resources } // REMOVED
      // Object.entries(potions).forEach(([id, _qty]) => { // REMOVED
      //   newGameResources[id] = newMaterials[id] // REMOVED
      // }) // REMOVED
      // gameStore.setResources(newGameResources) // REMOVED

      set({
        playerMaterials: newMaterials,
        playerMonsters: newMonsters
      })

      return {
        success: true,
        message: result.leveledUp
          ? `성장 완료! 레벨이 ${result.newLevel}로 상승했습니다.`
          : `경험치를 획득했습니다. (현재: ${result.newExp})`
      }

    } catch (e: any) {
      console.error('Monster feeding failed:', e)
      return { success: false, message: e.message }
    }
  }
}))

