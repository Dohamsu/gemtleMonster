import { create } from 'zustand'
import type { Material, Recipe, PlayerRecipe, PlayerAlchemy } from '../lib/alchemyApi'
import * as alchemyApi from '../lib/alchemyApi'
import { ALCHEMY } from '../constants/game'

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
  startBrewing: (recipeId: string) => Promise<void>
  updateBrewProgress: (progress: number) => void
  completeBrewing: (success: boolean) => Promise<void>

  // Actions - 테스트용
  addTestMaterials: (userId: string) => Promise<void>
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
    const currentAmount = selectedIngredients[materialId] || 0
    const availableAmount = playerMaterials[materialId] || 0
    const newAmount = Math.min(currentAmount + quantity, availableAmount)

    set({
      selectedIngredients: {
        ...selectedIngredients,
        [materialId]: newAmount
      }
    })
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
    const recipe = allRecipes.find(r => r.id === recipeId)
    if (!recipe || !recipe.ingredients) {
      console.log('❌ 레시피를 찾을 수 없음:', recipeId)
      return false
    }

    console.log('🔄 자동 배치 시도:', recipe.name)
    console.log('📦 현재 보유 재료:', playerMaterials)

    const newIngredients: Record<string, number> = {}

    for (const ing of recipe.ingredients) {
      const available = playerMaterials[ing.material_id] || 0
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

  startBrewing: async (recipeId) => {
    const { allRecipes, canCraft } = get()
    const recipe = allRecipes.find(r => r.id === recipeId)

    if (!recipe) {
      console.error('레시피를 찾을 수 없습니다')
      return
    }

    const craftCheck = canCraft(recipeId)
    if (!craftCheck.can) {
      console.error('조합 불가:', craftCheck.missingMaterials)
      return
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

  completeBrewing: async (success) => {
    const { userId, selectedRecipeId, allRecipes, selectedIngredients, playerMaterials, playerAlchemy } = get()

    if (!selectedRecipeId || !userId) return

    const recipe = allRecipes.find(r => r.id === selectedRecipeId)
    if (!recipe) return

    // 재료 소모
    const newPlayerMaterials = { ...playerMaterials }
    const materialsUsed: Record<string, number> = {}

    if (recipe.ingredients) {
      for (const ing of recipe.ingredients) {
        const used = selectedIngredients[ing.material_id] || ing.quantity
        newPlayerMaterials[ing.material_id] = Math.max(0, (newPlayerMaterials[ing.material_id] || 0) - used)
        materialsUsed[ing.material_id] = used
      }
    }

    // 결과 설정
    const brewResult = success
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

    // 서버에 데이터 저장
    try {
      // 1. 조합 기록 저장
      await alchemyApi.recordAlchemyHistory(
        userId,
        selectedRecipeId,
        success,
        recipe.base_success_rate,
        materialsUsed,
        success ? recipe.result_monster_id : undefined
      )

      // 2. 레시피 카운트 업데이트
      await alchemyApi.updateRecipeCraftCount(userId, selectedRecipeId, success)

      // 3. 성공 시 추가 처리
      if (success) {
        // 경험치 추가
        await alchemyApi.addAlchemyExperience(userId, recipe.exp_gain)

        // 몬스터 인벤토리에 추가
        for (let i = 0; i < recipe.result_count; i++) {
          await alchemyApi.addMonsterToPlayer(userId, recipe.result_monster_id)
        }

        // 로컬 상태 업데이트 (XP)
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

        console.log(`✅ 연금술 성공! +${recipe.exp_gain} XP`)
      }

      // 4. 재료 소모 DB 반영
      await alchemyApi.consumeMaterials(userId, materialsUsed)

      // 5. 성공 시 몬스터 목록 새로고침
      if (success) {
        await get().loadPlayerMonsters(userId)
      }
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
  }
}))
