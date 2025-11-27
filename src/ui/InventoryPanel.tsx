import React, { useEffect, useState } from 'react'
import { useAlchemyStore } from '../store/useAlchemyStore'
import { useAuth } from '../hooks/useAuth'
import { getMonsterData } from '../data/monsterData'
import { useGameStore } from '../store/useGameStore'
import ResourceAnimation from './ResourceAnimation'
import ResourceIcon from './ResourceIcon'
import { useUnifiedInventory } from '../hooks/useUnifiedInventory'

export const InventoryPanel: React.FC = () => {
  const { user } = useAuth()
  const {
    allMaterials,
    playerMonsters,
    inventoryTab,
    setInventoryTab,
    addIngredient,
    removeIngredient,
    selectedIngredients,
    loadPlayerMonsters
  } = useAlchemyStore()

  const { recentAdditions, removeRecentAddition } = useGameStore()
  const { materialCounts: playerMaterials } = useUnifiedInventory()

  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set())

  // Load monsters when switching to monsters tab or on mount
  useEffect(() => {
    if (user && inventoryTab === 'monsters') {
      loadPlayerMonsters(user.id)
    }
  }, [user?.id, inventoryTab])
  // Note: Removed loadPlayerMonsters from deps to prevent infinite re-renders
  // Store updates from completeBrewing will trigger UI refresh automatically

  // Show all materials
  const ownedMaterials = allMaterials

  // 계열별로 그룹화
  const groupedMaterials = ownedMaterials.reduce((acc, material) => {
    if (!acc[material.family]) {
      acc[material.family] = []
    }
    acc[material.family].push(material)
    return acc
  }, {} as Record<string, typeof allMaterials>)

  // 등급별 색상
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'COMMON': return '#9ca3af'
      case 'UNCOMMON': return '#22c55e'
      case 'RARE': return '#3b82f6'
      case 'EPIC': return '#a855f7'
      case 'LEGENDARY': return '#f59e0b'
      default: return '#fff'
    }
  }

  // 계열별 배경색
  const getFamilyColor = (family: string) => {
    switch (family) {
      case 'PLANT': return '#10b981'
      case 'MINERAL': return '#6366f1'
      case 'BEAST': return '#f59e0b'
      case 'SLIME': return '#8b5cf6'
      case 'SPIRIT': return '#ec4899'
      default: return '#64748b'
    }
  }

  const toggleCategory = (family: string) => {
    setCollapsedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(family)) {
        newSet.delete(family)
      } else {
        newSet.add(family)
      }
      return newSet
    })
  }

  const handleAddToSlot = (materialId: string) => {
    const currentQty = selectedIngredients[materialId] || 0
    if (currentQty > 0) {
      removeIngredient(materialId, currentQty)
    } else {
      addIngredient(materialId, 1)
    }
  }

  return (
    <div style={{
      width: '320px',
      height: '100%',
      background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
      borderLeft: '2px solid #4a5568',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* 헤더 */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid #4a5568',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <h2 style={{
          margin: 0,
          fontSize: '20px',
          color: '#f0e68c'
        }}>
          인벤토리
        </h2>

        {/* View Mode Toggle */}
        {(inventoryTab === 'materials' || inventoryTab === 'monsters') && (
          <div style={{
            display: 'flex',
            gap: '4px',
            background: '#0f172a',
            borderRadius: '6px',
            padding: '4px'
          }}>
            <button
              onClick={() => setViewMode('list')}
              style={{
                width: '32px',
                height: '32px',
                background: viewMode === 'list' ? '#334155' : 'transparent',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                color: viewMode === 'list' ? '#facc15' : '#64748b',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              title="리스트 뷰"
            >
              ☰
            </button>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                width: '32px',
                height: '32px',
                background: viewMode === 'grid' ? '#334155' : 'transparent',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                color: viewMode === 'grid' ? '#facc15' : '#64748b',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              title="썸네일 뷰"
            >
              ⊞
            </button>
          </div>
        )}
      </div>

      {/* 탭 */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #4a5568',
        background: '#0f172a'
      }}>
        {(['materials', 'monsters'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setInventoryTab(tab)}
            style={{
              flex: 1,
              padding: '12px 8px',
              background: inventoryTab === tab ? '#1e293b' : 'transparent',
              color: inventoryTab === tab ? '#f0e68c' : '#94a3b8',
              border: 'none',
              borderBottom: inventoryTab === tab ? '2px solid #f0e68c' : 'none',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: inventoryTab === tab ? 'bold' : 'normal',
              transition: 'all 0.2s'
            }}
          >
            {tab === 'materials' && '재료'}
            {tab === 'monsters' && '몬스터'}
          </button>
        ))}
      </div>

      {/* 컨텐츠 */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '8px'
      }}>
        {inventoryTab === 'materials' && (
          <>
            {ownedMaterials.length === 0 ? (
              <div style={{
                padding: '32px 16px',
                textAlign: 'center',
                color: '#94a3b8',
                fontSize: '14px'
              }}>
                보유한 재료가 없습니다.
              </div>
            ) : viewMode === 'grid' ? (
              // Grid View
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                gap: '8px'
              }}>
                {ownedMaterials.map(material => {
                  const quantity = playerMaterials[material.id] || 0
                  return (
                    <div
                      key={material.id}
                      onClick={() => handleAddToSlot(material.id)}
                      style={{
                        padding: '12px 8px',
                        background: '#1e293b',
                        border: selectedIngredients[material.id] ? '2px solid #ffd700' : `2px solid ${getRarityColor(material.rarity)}40`,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '6px',
                        position: 'relative'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#334155'
                        e.currentTarget.style.transform = 'scale(1.05)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#1e293b'
                        e.currentTarget.style.transform = 'scale(1)'
                      }}
                    >
                      {/* Material Icon */}
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: getFamilyColor(material.family),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden'
                      }}>
                        <ResourceIcon resourceId={material.id} size={32} />
                      </div>
                      <div style={{
                        fontSize: '11px',
                        fontWeight: 'bold',
                        color: getRarityColor(material.rarity),
                        textAlign: 'center',
                        lineHeight: '1.2'
                      }}>
                        {material.name}
                      </div>
                      <div style={{
                        fontSize: '13px',
                        fontWeight: 'bold',
                        color: '#f0e68c',
                        marginRight: '8px',
                        display: 'inline-block'
                      }}>
                        ×{quantity}
                      </div>
                      {material.is_special && (
                        <div style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          fontSize: '8px',
                          padding: '2px 4px',
                          background: '#7c3aed',
                          color: 'white',
                          borderRadius: '3px',
                          fontWeight: 'bold'
                        }}>
                          특수
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              // List View (original)
              Object.entries(groupedMaterials).map(([family, materials]) => (
                <div key={family} style={{ marginBottom: '16px' }}>
                  {/* 계열 헤더 - Clickable */}
                  <div
                    onClick={() => toggleCategory(family)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '8px',
                      paddingLeft: '4px',
                      cursor: 'pointer',
                      userSelect: 'none',
                      padding: '6px',
                      borderRadius: '4px',
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#1e293b' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                  >
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                      {collapsedCategories.has(family) ? '▶' : '▼'}
                    </span>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: getFamilyColor(family)
                    }} />
                    <span style={{
                      fontSize: '13px',
                      fontWeight: 'bold',
                      color: '#f1f5f9'
                    }}>
                      {family}
                    </span>
                  </div>

                  {/* 재료 카드 */}
                  {!collapsedCategories.has(family) && materials.map(material => {
                    const quantity = playerMaterials[material.id] || 0
                    return (
                      <div
                        key={material.id}
                        onClick={() => handleAddToSlot(material.id)}
                        style={{
                          marginBottom: '6px',
                          padding: '10px',
                          background: '#1e293b',
                          border: selectedIngredients[material.id] ? '2px solid #ffd700' : `1px solid ${getRarityColor(material.rarity)}40`,
                          borderRadius: '6px',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                          position: 'relative'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#334155'
                          e.currentTarget.style.transform = 'translateX(4px)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#1e293b'
                          e.currentTarget.style.transform = 'translateX(0)'
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div>
                            <div style={{
                              fontSize: '14px',
                              fontWeight: 'bold',
                              color: getRarityColor(material.rarity),
                              marginBottom: '2px'
                            }}>
                              {material.name}
                            </div>
                            {material.description && (
                              <div style={{
                                fontSize: '11px',
                                color: '#94a3b8'
                              }}>
                                {material.description}
                              </div>
                            )}
                          </div>
                          <div style={{
                            fontSize: '16px',
                            fontWeight: 'bold',
                            color: '#f0e68c',
                            minWidth: '60px',
                            textAlign: 'right',
                            position: 'relative',
                            marginRight: '8px',
                            display: 'inline-block'
                          }}>
                            ×{quantity}
                          </div>
                          {(() => {
                            const additions = recentAdditions.filter(a => a.resourceId === material.id)
                            if (additions.length === 0) return null
                            const totalAmount = additions.reduce((sum, a) => sum + a.amount, 0)
                            const firstId = additions[0].id
                            return (
                              <div style={{
                                position: 'absolute',
                                top: '-20px',
                                right: 0,
                                pointerEvents: 'none'
                              }}>
                                <ResourceAnimation
                                  key={firstId}
                                  amount={totalAmount}
                                  onComplete={() => {
                                    additions.forEach(a => removeRecentAddition(a.id))
                                  }}
                                />
                              </div>
                            )
                          })()}
                        </div>

                        {/* 특수 재료 표시 */}
                        {material.is_special && (
                          <div style={{
                            position: 'absolute',
                            top: '6px',
                            right: '6px',
                            fontSize: '10px',
                            padding: '2px 6px',
                            background: '#7c3aed',
                            color: 'white',
                            borderRadius: '4px',
                            fontWeight: 'bold'
                          }}>
                            특수
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))
            )}
          </>
        )}

        {inventoryTab === 'monsters' && (
          <>
            {playerMonsters.length === 0 ? (
              <div style={{
                padding: '32px 16px',
                textAlign: 'center',
                color: '#94a3b8',
                fontSize: '14px'
              }}>
                제작한 몬스터가 없습니다.
              </div>
            ) : viewMode === 'grid' ? (
              // Grid View
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
                gap: '8px'
              }}>
                {playerMonsters.map((monster) => {
                  const monsterData = getMonsterData(monster.monster_id)
                  return (
                    <div
                      key={monster.id}
                      style={{
                        padding: '12px 8px',
                        background: '#1e293b',
                        border: '1px solid #facc1540',
                        borderRadius: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#334155'
                        e.currentTarget.style.transform = 'scale(1.05)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#1e293b'
                        e.currentTarget.style.transform = 'scale(1)'
                      }}
                    >
                      {/* Monster Image */}
                      <div style={{
                        width: '56px',
                        height: '56px',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden'
                      }}>
                        {monsterData?.iconUrl ? (
                          <img
                            src={monsterData.iconUrl}
                            alt={monsterData.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <span style={{ fontSize: '36px' }}>{monsterData?.emoji || '👾'}</span>
                        )}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color: '#facc15',
                        textAlign: 'center',
                        lineHeight: '1.2'
                      }}>
                        {monsterData?.name || monster.monster_id}
                      </div>
                      <div style={{
                        fontSize: '10px',
                        padding: '2px 6px',
                        background: '#334155',
                        borderRadius: '4px',
                        color: '#cbd5e1'
                      }}>
                        Lv.{monster.level}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              // List View (original)
              playerMonsters.map((monster) => {
                const monsterData = getMonsterData(monster.monster_id)
                return (
                  <div
                    key={monster.id}
                    style={{
                      marginBottom: '8px',
                      padding: '12px',
                      background: '#1e293b',
                      border: '1px solid #facc1540',
                      borderRadius: '6px',
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'center'
                    }}
                  >
                    {/* Monster Image */}
                    <div style={{
                      width: '48px',
                      height: '48px',
                      background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden'
                    }}>
                      {monsterData?.iconUrl ? (
                        <img
                          src={monsterData.iconUrl}
                          alt={monsterData.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <span style={{ fontSize: '28px' }}>{monsterData?.emoji || '👾'}</span>
                      )}
                    </div>

                    {/* Monster Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '4px'
                      }}>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: 'bold',
                          color: '#facc15'
                        }}>
                          {monsterData?.name || monster.monster_id}
                        </div>
                        <div style={{
                          fontSize: '11px',
                          padding: '2px 6px',
                          background: '#334155',
                          borderRadius: '4px',
                          color: '#cbd5e1'
                        }}>
                          {monsterData?.role || '?'}
                        </div>
                      </div>
                      <div style={{
                        display: 'flex',
                        gap: '8px',
                        fontSize: '11px',
                        color: '#94a3b8'
                      }}>
                        <span>Lv.{monster.level}</span>
                        <span>•</span>
                        <span>EXP: {monster.exp}</span>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </>
        )}
      </div>

      {/* 안내 */}
      <div style={{
        padding: '12px',
        borderTop: '1px solid #4a5568',
        background: '#0f172a',
        fontSize: '11px',
        color: '#64748b',
        textAlign: 'center'
      }}>
        {inventoryTab === 'materials' && '재료를 클릭하여 연금솥에 추가하세요'}
        {inventoryTab === 'monsters' && '제작한 몬스터가 여기에 표시됩니다'}
      </div>
    </div>
  )
}
