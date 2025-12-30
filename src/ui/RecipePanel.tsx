import React from 'react'
import { useAlchemyStore } from '../store/useAlchemyStore'
import { useUnifiedInventory } from '../hooks/useUnifiedInventory'

export const RecipePanel: React.FC = () => {
  const {
    allRecipes,
    allMaterials,
    playerRecipes,
    playerAlchemy,
    selectedRecipeId,
    selectedTab,
    selectRecipe,
    setSelectedTab,
    autoFillIngredients,
    canCraftWithMaterials
  } = useAlchemyStore()
  const { materialCounts: playerMaterials } = useUnifiedInventory()

  // 탭별 레시피 필터링
  const getFilteredRecipes = () => {
    if (selectedTab === 'recipes') {
      // 발견된 레시피 또는 숨겨지지 않은 레시피
      return allRecipes.filter(r =>
        !r.isHidden || playerRecipes[r.id]?.is_discovered
      )
    } else if (selectedTab === 'codex') {
      // 발견한 레시피만
      return allRecipes.filter(r => playerRecipes[r.id]?.is_discovered)
    } else if (selectedTab === 'recommended') {
      // 보유 재료가 충분한 레시피
      return allRecipes.filter(r => canCraftWithMaterials(r.id))
    }
    return allRecipes
  }

  const filteredRecipes = getFilteredRecipes()

  // 재료 이름 가져오기
  const getMaterialName = (materialId: string) => {
    const material = allMaterials.find(m => m.id === materialId)
    return material?.name || materialId
  }

  const handleSelectRecipe = (recipeId: string) => {
    selectRecipe(recipeId)
    // 레시피 선택 시 자동으로 재료 배치
    autoFillIngredients(recipeId)
  }

  const handleAutoFill = (recipeId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const success = autoFillIngredients(recipeId)
    if (!success) {
      alert('재료가 부족합니다!')
    }
  }

  return (
    <div style={{
      width: '320px',
      height: '100%',
      background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
      borderRight: '2px solid #4a5568',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* 헤더 */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid #4a5568'
      }}>
        <h2 style={{
          margin: 0,
          fontSize: '20px',
          color: '#f0e68c',
          textAlign: 'center'
        }}>
          레시피 목록
        </h2>
      </div>

      {/* 탭 */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #4a5568',
        background: '#0f172a'
      }}>
        {(['recipes', 'codex', 'recommended'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            style={{
              flex: 1,
              padding: '12px 8px',
              background: selectedTab === tab ? '#1e293b' : 'transparent',
              color: selectedTab === tab ? '#f0e68c' : '#94a3b8',
              border: 'none',
              borderBottom: selectedTab === tab ? '2px solid #f0e68c' : 'none',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: selectedTab === tab ? 'bold' : 'normal',
              transition: 'all 0.2s'
            }}
          >
            {tab === 'recipes' && '전체'}
            {tab === 'codex' && '도감'}
            {tab === 'recommended' && '추천'}
          </button>
        ))}
      </div>

      {/* 레시피 리스트 */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '8px'
      }}>
        {filteredRecipes.length === 0 ? (
          <div style={{
            padding: '32px 16px',
            textAlign: 'center',
            color: '#94a3b8',
            fontSize: '14px'
          }}>
            {selectedTab === 'codex' && '아직 발견한 레시피가 없습니다.'}
            {selectedTab === 'recommended' && '제작 가능한 레시피가 없습니다.'}
            {selectedTab === 'recipes' && '레시피가 없습니다.'}
          </div>
        ) : (
          filteredRecipes.map(recipe => {
            const canCraftNow = canCraftWithMaterials(recipe.id)
            const isSelected = selectedRecipeId === recipe.id
            const playerRecipe = playerRecipes[recipe.id]

            return (
              <div
                key={recipe.id}
                onClick={() => handleSelectRecipe(recipe.id)}
                style={{
                  marginBottom: '8px',
                  padding: '12px',
                  background: isSelected ? '#1e40af' : '#1e293b',
                  border: isSelected ? '2px solid #3b82f6' : '1px solid #334155',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  transform: isSelected ? 'scale(1.02)' : 'scale(1)'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = '#334155'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = '#1e293b'
                  }
                }}
              >
                {/* 레시피 이름 */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '8px'
                }}>
                  <div style={{
                    fontSize: '15px',
                    fontWeight: 'bold',
                    color: '#f1f5f9'
                  }}>
                    {recipe.name}
                  </div>
                  <div style={{
                    fontSize: '11px',
                    padding: '2px 6px',
                    background: '#0f172a',
                    borderRadius: '4px',
                    color: '#94a3b8'
                  }}>
                    Lv.{recipe.requiredAlchemyLevel}
                  </div>
                </div>

                {/* 필요 재료 */}
                <div style={{
                  fontSize: '12px',
                  color: '#94a3b8',
                  marginBottom: '8px'
                }}>
                  {recipe.ingredients && recipe.ingredients.slice(0, 3).map((ing, idx) => {
                    const available = playerMaterials[ing.materialId] || 0
                    const isEnough = available >= ing.quantity
                    return (
                      <div key={idx} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        color: isEnough ? '#94a3b8' : '#ef4444'
                      }}>
                        <span>{getMaterialName(ing.materialId)}</span>
                        <span>{available} / {ing.quantity}</span>
                      </div>
                    )
                  })}
                </div>

                {/* 성공률 & 제작 횟수 */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '11px',
                  color: '#64748b'
                }}>
                  <span>성공률: {recipe.baseSuccessRate}%</span>
                  {playerRecipe && (
                    <span>제작: {playerRecipe.craft_count}회</span>
                  )}
                </div>

                {/* 버튼 */}
                <div style={{
                  display: 'flex',
                  gap: '6px',
                  marginTop: '8px'
                }}>
                  {canCraftNow && (
                    <button
                      onClick={(e) => handleAutoFill(recipe.id, e)}
                      style={{
                        flex: 1,
                        padding: '6px',
                        background: '#0ea5e9',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '11px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#0284c7'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#0ea5e9'
                      }}
                    >
                      자동 배치
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* 플레이어 정보 */}
      {playerAlchemy && (
        <div style={{
          padding: '12px 16px',
          borderTop: '1px solid #4a5568',
          background: '#0f172a',
          fontSize: '12px',
          color: '#94a3b8'
        }}>
          <div style={{ marginBottom: '4px' }}>
            연금술 레벨: <span style={{ color: '#f0e68c', fontWeight: 'bold' }}>{playerAlchemy.level}</span>
          </div>
          <div style={{
            width: '100%',
            height: '6px',
            background: '#1e293b',
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${(playerAlchemy.experience % 100)}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #f59e0b, #f0e68c)',
              transition: 'width 0.3s'
            }} />
          </div>
          <div style={{ fontSize: '10px', marginTop: '2px', textAlign: 'right' }}>
            EXP: {playerAlchemy.experience % 100} / 100
          </div>
        </div>
      )}
    </div>
  )
}
