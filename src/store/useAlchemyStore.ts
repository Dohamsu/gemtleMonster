import { create } from 'zustand'
import type { Material, Recipe, PlayerRecipe, PlayerAlchemy } from '../lib/alchemyApi'
import type { AlchemyContext } from '../types/alchemy'
import * as alchemyApi from '../lib/alchemyApi'
import { isRecipeValid, findMatchingRecipe } from '../lib/alchemyLogic'
import { ALCHEMY } from '../constants/game'
import { useGameStore } from './useGameStore'

interface AlchemyState {
  // 마스터 데이터
  allMaterials: Material[]
  allRecipes: Recipe[]

  // 플레이어 데이터
  userId: string | null
  playerMaterials: Record<string, number> // materialId -> quantity
  playerRecipes: Record<string, PlayerRecipe> // recipeId -> PlayerRecipe
  playerAlchemy: PlayerAlchemy | null
  playerMonsters: Array<{
    id: string
    monster_id: string
    level: number
    exp: number
    created_at: string
  }>

  // UI 상태
  selectedRecipeId: string | null
  selectedIngredients: Record<string, number> // materialId -> quantity
  selectedTab: 'recipes' | 'codex' | 'recommended'
  inventoryTab: 'materials' | 'monsters' | 'factory'

  // 조합 진행 상태
  isBrewing: boolean
  brewStartTime: number | null
  brewProgress: number // 0~1
  brewResult: {
    type: 'idle' | 'success' | 'fail'
    monsterId?: string
    count?: number
    lostMaterials?: Record<string, number>
  }

  // 로딩 상태
  isLoading: boolean
  error: string | null

  // Actions - 데이터 로딩
  loadAllData: (userId: string) => Promise<void>
  loadMaterials: () => Promise<void>
  loadRecipes: () => Promise<void>
  loadPlayerData: (userId: string) => Promise<void>
  loadPlayerMonsters: (userId: string) => Promise<void>

  // Actions - 레시피 선택
  selectRecipe: (recipeId: string | null) => void
  setSelectedTab: (tab: 'recipes' | 'codex' | 'recommended') => void
  setInventoryTab: (tab: 'materials' | 'monsters' | 'factory') => void

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
  startBrewing: (recipeId: string) => Promise<void>
  updateBrewProgress: (progress: number) => void
  completeBrewing: (success: boolean, matchedRecipe?: Recipe | null) => Promise<void>

  // Actions - 테스트용
  addTestMaterials: (userId: string) => Promise<void>

  // Actions - 상점
  sellMaterial: (materialId: string, quantity: number) => Promise<boolean>

  // Actions - 시설 생산
  addMaterial: (materialId: string, quantity: number) => Promise<void>

  // Actions - Advanced Alchemy Context
  alchemyContext: AlchemyContext | null
  setAlchemyContext: (context: AlchemyContext) => void
}

export const useAlchemyStore = create<AlchemyState>((set, get) => ({
  // 초기 상태
  allMaterials: [],
  allRecipes: [],
  playerMaterials: {},
  playerRecipes: {},
  playerAlchemy: null,
  playerMonsters: [],
  selectedRecipeId: null,
  selectedIngredients: {},
  selectedTab: 'recipes',
  inventoryTab: 'materials',
  isBrewing: false,
  brewStartTime: null,
  brewProgress: 0,
  brewResult: { type: 'idle' },
  isLoading: false,
  error: null,
  userId: null, // Initialize userId

  // ============================================
  // 데이터 로딩
  // ============================================

  loadAllData: async (userId: string) => {
    set({ userId, isLoading: true, error: null }) // Set userId here
    try {
      await get().loadMaterials()
      await get().loadRecipes()
      await get().loadPlayerData(userId)
    } catch (error) {
      console.error('데이터 로딩 실패:', error)
      set({ error: '데이터를 불러오는데 실패했습니다.' })
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
    try {
      // 플레이어 재료
      const playerMats = await alchemyApi.getPlayerMaterials(userId)
      const materialsMap: Record<string, number> = {}
      playerMats.forEach(m => {
        materialsMap[m.material_id] = m.quantity
      })

      // 플레이어 레시피
      const playerRecs = await alchemyApi.getPlayerRecipes(userId)
      const recipesMap: Record<string, PlayerRecipe> = {}
      playerRecs.forEach(r => {
        recipesMap[r.recipe_id] = r
      })

      // 플레이어 연금술 정보
      const alchemyInfo = await alchemyApi.getPlayerAlchemy(userId)

      set({
        playerMaterials: materialsMap,
        playerRecipes: recipesMap,
        playerAlchemy: alchemyInfo
      })

      // gameStore의 resources도 동기화
      const gameStore = useGameStore.getState()
      gameStore.setResources({ ...gameStore.resources, ...materialsMap })
    } catch (error) {
      console.error('플레이어 데이터 로딩 실패:', error)
      throw error
    }
  },

  loadPlayerMonsters: async (userId: string) => {
    try {
      const monsters = await alchemyApi.getPlayerMonsters(userId)
      set({ playerMonsters: monsters })
    } catch (error) {
      console.error('몬스터 목록 로딩 실패:', error)
      throw error
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

  setSelectedTab: (tab) => set({ selectedTab: tab }),
  setInventoryTab: (tab) => set({ inventoryTab: tab }),

  // ============================================
  // 재료 관리
  // ============================================

  addIngredient: (materialId, quantity) => {
    const { selectedIngredients, playerMaterials } = get()
    const gameStore = useGameStore.getState()

    // 두 스토어의 재료 병합 (gameStore.resources + alchemyStore.playerMaterials)
    const mergedMaterials = { ...playerMaterials, ...gameStore.resources }

    const currentAmount = selectedIngredients[materialId] || 0
    const availableAmount = mergedMaterials[materialId] || 0
    const newAmount = Math.min(currentAmount + quantity, availableAmount)

    console.log(`🔵 재료 추가: ${materialId}, 보유: ${availableAmount}, 현재: ${currentAmount}, 새로운: ${newAmount}`)

    // 값이 0이면 키를 추가하지 않음
    if (newAmount === 0) {
      console.log(`⚠️ 재료 추가 실패: ${materialId} - 보유량 부족`)
      return
    }

    const newIngredients = {
      ...selectedIngredients,
      [materialId]: newAmount
    }

    console.log(`✅ 재료 추가 완료. 현재 슬롯:`, newIngredients)

    set({ selectedIngredients: newIngredients })
  },

  removeIngredient: (materialId, quantity) => {
    const { selectedIngredients } = get()
    const currentAmount = selectedIngredients[materialId] || 0
    const newAmount = Math.max(0, currentAmount - quantity)

    if (newAmount === 0) {
      const newIngredients = { ...selectedIngredients }
      delete newIngredients[materialId]
      set({ selectedIngredients: newIngredients })
    } else {
      set({
        selectedIngredients: {
          ...selectedIngredients,
          [materialId]: newAmount
        }
      })
    }
  },

  clearIngredients: () => set({ selectedIngredients: {} }),

  autoFillIngredients: (recipeId) => {
    const { allRecipes, playerMaterials } = get()
    const gameStore = useGameStore.getState()
    const mergedMaterials = { ...playerMaterials, ...gameStore.resources }

    const recipe = allRecipes.find(r => r.id === recipeId)
    if (!recipe || !recipe.ingredients) {
      console.log('❌ 레시피를 찾을 수 없음:', recipeId)
      return false
    }

    console.log('🔄 자동 배치 시도:', recipe.name)
    console.log('📦 현재 보유 재료:', mergedMaterials)

    const newIngredients: Record<string, number> = {}

    for (const ing of recipe.ingredients) {
      const available = mergedMaterials[ing.material_id] || 0
      console.log(`  - ${ing.material_id}: ${available} / ${ing.quantity} 필요`)
      if (available < ing.quantity) {
        // 재료 부족
        console.log(`❌ 재료 부족: ${ing.material_id}`)
        return false
      }
      newIngredients[ing.material_id] = ing.quantity
    }

    set({ selectedIngredients: newIngredients })
    console.log('✅ 자동 배치 완료:', newIngredients)
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
    const gameStore = useGameStore.getState()
    const mergedMaterials = { ...playerMaterials, ...gameStore.resources }

    const recipe = allRecipes.find(r => r.id === recipeId)

    if (!recipe) return false

    // 연금술 레벨 체크
    if (playerAlchemy && playerAlchemy.level < recipe.required_alchemy_level) {
      return false
    }

    // 보유 재료가 충분한지 체크
    if (recipe.ingredients) {
      for (const ing of recipe.ingredients) {
        const available = mergedMaterials[ing.material_id] || 0
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
    console.log(`🔍 조합 가능 여부 체크: ${validIngredients.length}개 재료`, selectedIngredients)
    return validIngredients.length > 0
  },

  startFreeFormBrewing: async () => {
    const { selectedIngredients, allRecipes, alchemyContext } = get()

    if (Object.keys(selectedIngredients).length === 0) {
      console.error('재료를 먼저 추가해주세요')
      return
    }

    // 재료 조합으로 레시피 찾기
    const matchedRecipe = alchemyContext
      ? findMatchingRecipe(selectedIngredients, alchemyContext, allRecipes)
      : null

    const duration = matchedRecipe ? matchedRecipe.craft_time_sec * 1000 : 3000 // 실패시 3초

    console.log('🧪 자유 조합 시작:', {
      재료: selectedIngredients,
      매칭된레시피: matchedRecipe?.name || '없음',
      소요시간: duration / 1000 + '초'
    })

    set({
      isBrewing: true,
      brewStartTime: Date.now(),
      brewProgress: 0,
      brewResult: { type: 'idle' },
      selectedRecipeId: matchedRecipe?.id || null // 매칭된 레시피 설정
    })

    // 진행 바 시뮬레이션
    const interval = 50
    const step = interval / duration

    let timer: NodeJS.Timeout | null = null
    timer = setInterval(() => {
      const state = get()
      if (!state.isBrewing) {
        if (timer) clearInterval(timer)
        return
      }

      const newProgress = Math.min(1, state.brewProgress + step)
      set({ brewProgress: newProgress })

      if (newProgress >= 1) {
        if (timer) clearInterval(timer)
        // 조합 완료
        if (matchedRecipe) {
          const success = Math.random() * 100 < matchedRecipe.base_success_rate
          get().completeBrewing(success, matchedRecipe)
        } else {
          // 레시피 없으면 실패
          get().completeBrewing(false, null)
        }
      }
    }, interval)
  },

  startBrewing: async (recipeId) => {
    const { allRecipes, canCraft, alchemyContext } = get()
    const recipe = allRecipes.find(r => r.id === recipeId)

    if (!recipe) {
      console.error('레시피를 찾을 수 없습니다')
      return
    }

    // 1. Check material and level requirements
    const craftCheck = canCraft(recipeId)
    if (!craftCheck.can) {
      console.error('조합 불가:', craftCheck.missingMaterials)
      return
    }

    // 2. Check context-based conditions
    if (alchemyContext && recipe.conditions && recipe.conditions.length > 0) {
      if (!isRecipeValid(recipe, alchemyContext)) {
        console.error('⚠️ 조합 조건이 충족되지 않았습니다.')
        console.log('현재 컨텍스트:', alchemyContext)
        console.log('필요 조건:', recipe.conditions)
        return
      }
    }

    set({
      isBrewing: true,
      brewStartTime: Date.now(),
      brewProgress: 0,
      brewResult: { type: 'idle' }
    })

    // 진행 바 시뮬레이션
    const duration = recipe.craft_time_sec * 1000
    const interval = 50
    const step = interval / duration

    let timer: NodeJS.Timeout | null = null
    timer = setInterval(() => {
      const state = get()
      if (!state.isBrewing) {
        if (timer) clearInterval(timer)
        return
      }

      const newProgress = Math.min(1, state.brewProgress + step)
      set({ brewProgress: newProgress })

      if (newProgress >= 1) {
        if (timer) clearInterval(timer)
      }
    }, interval)

    // Store timer reference for cleanup if needed
    // Note: In real implementation, you might want to track this in state
    // and clear it when component unmounts or brewing is cancelled
  },

  updateBrewProgress: (progress) => set({ brewProgress: progress }),

  completeBrewing: async (success, matchedRecipe) => {
    const { userId, selectedRecipeId, allRecipes, selectedIngredients, playerMaterials, playerAlchemy } = get()
    const gameStore = useGameStore.getState()

    if (!userId) return

    // 매칭된 레시피 또는 선택된 레시피 사용
    const recipe = matchedRecipe || (selectedRecipeId ? allRecipes.find(r => r.id === selectedRecipeId) : null)

    // 두 스토어 모두에서 재료 소모 (성공/실패 관계없이 소모)
    const newPlayerMaterials = { ...playerMaterials }
    const newGameResources = { ...gameStore.resources }
    const materialsUsed: Record<string, number> = {}

    // 실제 사용한 재료 소모
    for (const [materialId, count] of Object.entries(selectedIngredients)) {
      // alchemyStore에서 소모
      newPlayerMaterials[materialId] = Math.max(0, (newPlayerMaterials[materialId] || 0) - count)
      // gameStore에서도 소모
      newGameResources[materialId] = Math.max(0, (newGameResources[materialId] || 0) - count)
      materialsUsed[materialId] = count
    }

    // 결과 설정
    const brewResult = recipe && success
      ? { type: 'success' as const, monsterId: recipe.result_monster_id, count: recipe.result_count }
      : { type: 'fail' as const, lostMaterials: materialsUsed }

    set({
      isBrewing: false,
      brewStartTime: null,
      brewProgress: 0,
      brewResult,
      playerMaterials: newPlayerMaterials,
      selectedIngredients: {}
    })

    // gameStore의 resources도 업데이트
    gameStore.setResources(newGameResources)

    console.log(recipe && success ? `✅ 연금술 성공! ${recipe.name} 획득!` : '❌ 연금술 실패... 재료를 잃었습니다.')

    // 서버에 데이터 저장
    try {
      // 재료 소모 DB 반영 (항상 실행)
      await alchemyApi.consumeMaterials(userId, materialsUsed)

      if (recipe && success) {
        // 1. 조합 기록 저장
        await alchemyApi.recordAlchemyHistory(
          userId,
          recipe.id,
          success,
          recipe.base_success_rate,
          materialsUsed,
          recipe.result_monster_id
        )

        // 2. 레시피 카운트 업데이트
        await alchemyApi.updateRecipeCraftCount(userId, recipe.id, success)

        // 3. 경험치 추가
        await alchemyApi.addAlchemyExperience(userId, recipe.exp_gain)

        // 4. 몬스터 인벤토리에 추가
        for (let i = 0; i < recipe.result_count; i++) {
          await alchemyApi.addMonsterToPlayer(userId, recipe.result_monster_id)
        }

        // 5. 로컬 상태 업데이트 (XP)
        if (playerAlchemy) {
          const newExp = playerAlchemy.experience + recipe.exp_gain
          const newLevel = Math.floor(newExp / ALCHEMY.XP_PER_LEVEL) + 1
          set({
            playerAlchemy: {
              ...playerAlchemy,
              experience: newExp,
              level: newLevel
            }
          })
        }

        // 6. 몬스터 목록 새로고침
        await get().loadPlayerMonsters(userId)

        console.log(`✅ 연금술 성공! +${recipe.exp_gain} XP`)
      } else if (recipe) {
        // 실패했지만 레시피는 있는 경우 (조합 실패)
        await alchemyApi.recordAlchemyHistory(
          userId,
          recipe.id,
          false,
          recipe.base_success_rate,
          materialsUsed,
          undefined
        )
        await alchemyApi.updateRecipeCraftCount(userId, recipe.id, false)
      }
      // recipe가 null인 경우 = 잘못된 조합 (DB 기록 안함)
    } catch (error) {
      console.error('연금술 결과 저장 실패:', error)
    }
  },

  // ============================================
  // 테스트용
  // ============================================

  addTestMaterials: async (userId: string) => {
    try {
      // 기본 재료들 추가
      console.log('🔧 테스트 재료 추가 시작...')
      await alchemyApi.addMaterialToPlayer(userId, 'herb_common', 20)
      await alchemyApi.addMaterialToPlayer(userId, 'slime_core', 10)
      await alchemyApi.addMaterialToPlayer(userId, 'fang_beast', 8)
      await alchemyApi.addMaterialToPlayer(userId, 'ore_iron', 10)
      await alchemyApi.addMaterialToPlayer(userId, 'crystal_mana', 5)
      await alchemyApi.addMaterialToPlayer(userId, 'spirit_dust', 6)
      await alchemyApi.addMaterialToPlayer(userId, 'mushroom_blue', 4)

      // 데이터 새로고침
      await get().loadPlayerData(userId)

      const { playerMaterials } = get()
      console.log('✅ 테스트 재료 추가 완료')
      console.log('📦 보유 재료:', playerMaterials)
    } catch (error) {
      console.error('❌ 테스트 재료 추가 실패:', error)
    }
  },

  // ============================================
  // 상점 관련
  // ============================================

  sellMaterial: async (materialId, quantity) => {
    const { userId, playerMaterials } = get()
    if (!userId) {
      console.error('로그인이 필요합니다.')
      return false
    }

    const currentAmount = playerMaterials[materialId] || 0
    if (currentAmount < quantity) {
      console.error('재료가 부족합니다.')
      return false
    }

    try {
      // DB 업데이트
      const success = await alchemyApi.consumeMaterials(userId, { [materialId]: quantity })

      if (success) {
        // 로컬 상태 업데이트
        const newPlayerMaterials = {
          ...playerMaterials,
          [materialId]: currentAmount - quantity
        }

        set({ playerMaterials: newPlayerMaterials })

        // gameStore의 resources도 동기화
        const gameStore = useGameStore.getState()
        gameStore.setResources({ ...gameStore.resources, ...newPlayerMaterials })

        return true
      }
      return false
    } catch (error) {
      console.error('재료 판매 실패:', error)
      return false
    }
  },

  // ============================================
  // 시설 생산 관련
  // ============================================

  addMaterial: async (materialId, quantity) => {
    const { userId, playerMaterials } = get()
    if (!userId) return

    try {
      // DB 업데이트
      await alchemyApi.addMaterialToPlayer(userId, materialId, quantity)

      // 로컬 상태 업데이트
      const currentAmount = playerMaterials[materialId] || 0
      const newPlayerMaterials = {
        ...playerMaterials,
        [materialId]: currentAmount + quantity
      }

      set({ playerMaterials: newPlayerMaterials })

      // gameStore의 resources도 동기화
      const gameStore = useGameStore.getState()
      gameStore.setResources({ ...gameStore.resources, ...newPlayerMaterials })
    } catch (error) {
      console.error('재료 획득 실패:', error)
    }
  },

  // ============================================
  // Advanced Alchemy Context
  // ============================================

  alchemyContext: null,

  setAlchemyContext: (context) => set({ alchemyContext: context })
}))
