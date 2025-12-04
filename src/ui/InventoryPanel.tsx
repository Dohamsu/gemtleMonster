import React, { useState, useEffect } from 'react'
import { useAlchemyStore } from '../store/useAlchemyStore'
import { useGameStore } from '../store/useGameStore'
import { isMobileView } from '../utils/responsiveUtils'
import { getFamilyColor, getRarityColor } from '../utils/materialUtils'
import ResourceAnimation from './ResourceAnimation'
import ResourceIcon from './ResourceIcon'
import { useUnifiedInventory } from '../hooks/useUnifiedInventory'

export const InventoryPanel: React.FC = () => {
  const [isMobile, setIsMobile] = useState(isMobileView())
  const {
    allMaterials,
    addIngredient,
    removeIngredient,
    selectedIngredients
  } = useAlchemyStore()

  const { recentAdditions, removeRecentAddition } = useGameStore()
  const { materialCounts: playerMaterials } = useUnifiedInventory()

  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set())

  // 반응형 감지
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(isMobileView())
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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
      width: isMobile ? '100%' : '320px',
      height: isMobile ? '50%' : '100%',
      flex: isMobile ? 1 : 'none',
      minHeight: isMobile ? '50%' : 0,
      background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
      borderLeft: isMobile ? 'none' : '2px solid #4a5568',
      borderTop: isMobile ? '2px solid #4a5568' : 'none',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* 헤더 */}
      <div style={{
        padding: isMobile ? '12px' : '16px',
        borderBottom: '1px solid #4a5568',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <h2 style={{
          margin: 0,
          fontSize: isMobile ? '18px' : '20px',
          color: '#f0e68c'
        }}>
          인벤토리
        </h2>

        {/* View Mode Toggle */}
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
      </div>

      {/* 탭 */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #4a5568',
        background: '#0f172a'
      }}>
        <div
          style={{
            flex: 1,
            padding: '12px 8px',
            background: '#1e293b',
            color: '#f0e68c',
            borderBottom: '2px solid #f0e68c',
            fontSize: '13px',
            fontWeight: 'bold',
            textAlign: 'center'
          }}
        >
          재료
        </div>
      </div>

      {/* 컨텐츠 */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: isMobile ? '6px' : '8px',
        minHeight: 0
      }}>
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
      </div>

      {/* 안내 */}
      <div style={{
        padding: isMobile ? '10px' : '12px',
        borderTop: '1px solid #4a5568',
        background: '#0f172a',
        fontSize: isMobile ? '10px' : '11px',
        color: '#64748b',
        textAlign: 'center'
      }}>
        재료를 클릭하여 연금솥에 추가하세요
      </div>
    </div>
  )
}
